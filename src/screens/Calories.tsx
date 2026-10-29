import { useEffect, useMemo, useRef, useState } from 'react'
import { EnteteOnglet } from '../components/Entete'
import { Bouton, Carte, Etiquette, Titre, Vide } from '../components/Ui'
import EditeurRepas, { MOMENTS, totaux } from '../components/EditeurRepas'
import { alimentParNom } from '../data/aliments'
import {
  ASSIETTES_TYPES,
  analyserImage,
  compresserImage,
  ligneDepuisAliment,
  type Analyse,
} from '../lib/bouchee'
import { dateDuJour, identifiant, storeRepas, useRepas, useReglages } from '../lib/donnees'
import { formaterDateLongue, nombre } from '../lib/format'
import type { LigneRepas, MomentRepas, Repas } from '../lib/types'

const JOUR_MS = 86_400_000

function decalerDate(iso: string, jours: number): string {
  const [a, m, j] = iso.split('-').map(Number)
  const d = new Date(a, m - 1, j)
  return dateDuJour(new Date(d.getTime() + jours * JOUR_MS))
}

function Anneau({ valeur, objectif }: { valeur: number; objectif: number }) {
  const part = objectif > 0 ? Math.min(1.35, valeur / objectif) : 0
  const rayon = 52
  const perimetre = 2 * Math.PI * rayon
  const depasse = valeur > objectif
  return (
    <div className="relative w-[128px] h-[128px] shrink-0">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={rayon} fill="none" stroke="#1b2128" strokeWidth="11" />
        <circle
          cx="64"
          cy="64"
          r={rayon}
          fill="none"
          stroke={depasse ? '#f59e0b' : '#c6f948'}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={perimetre}
          strokeDashoffset={perimetre * (1 - Math.min(1, part))}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[26px] font-extrabold leading-none tabular-nums">{nombre(valeur)}</p>
          <p className="text-[11px] text-white/40 mt-0.5">/ {nombre(objectif)} kcal</p>
        </div>
      </div>
    </div>
  )
}

function BarreMacro({
  libelle,
  valeur,
  objectif,
  unite = 'g',
}: {
  libelle: string
  valeur: number
  objectif?: number
  unite?: string
}) {
  const part = objectif && objectif > 0 ? Math.min(1, valeur / objectif) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11.5px] text-white/45 font-semibold">{libelle}</span>
        <span className="text-[12px] font-bold tabular-nums">
          {nombre(Math.round(valeur))}
          {objectif ? <span className="text-white/35"> / {nombre(objectif)}</span> : null}
          <span className="text-white/30 text-[10px] ml-0.5">{unite}</span>
        </span>
      </div>
      <span className="mt-1 block h-1.5 rounded-full bg-ink-800 overflow-hidden">
        <span className="block h-full bg-lime-500" style={{ width: `${part * 100}%` }} />
      </span>
    </div>
  )
}

export default function Calories() {
  const repas = useRepas()
  const reglages = useReglages()
  const [date, setDate] = useState(() => dateDuJour())
  const [editeur, setEditeur] = useState<
    | null
    | {
        photo?: string
        analyse?: Analyse | null
        lignes: LigneRepas[]
        moment: MomentRepas
      }
  >(null)
  const [etatPhoto, setEtatPhoto] = useState<'attente' | 'analyse' | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const champPhoto = useRef<HTMLInputElement>(null)

  // Les photos des repas anciens sont retirées pour ne pas saturer le stockage local.
  useEffect(() => {
    const limite = Date.now() - 21 * JOUR_MS
    if (!repas.some((r) => r.photo && r.horodatage < limite)) return
    storeRepas.set((p) =>
      p.map((r) => (r.photo && r.horodatage < limite ? { ...r, photo: undefined } : r)),
    )
  }, [repas])

  const duJour = useMemo(
    () => repas.filter((r) => r.date === date).sort((a, b) => a.horodatage - b.horodatage),
    [repas, date],
  )
  const t = useMemo(() => totaux(duJour.flatMap((r) => r.lignes)), [duJour])
  const estAujourdhui = date === dateDuJour()

  const joursAvecRepas = useMemo(() => {
    const parDate = new Map<string, number>()
    for (const r of repas) {
      parDate.set(r.date, (parDate.get(r.date) ?? 0) + r.lignes.reduce((s, l) => s + l.kcal, 0))
    }
    return [...parDate.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 7)
  }, [repas])

  async function surPhoto(fichier: File) {
    setErreur(null)
    setEtatPhoto('analyse')
    try {
      const photo = await compresserImage(fichier)
      const analyse = await analyserImage(photo)
      setEditeur({
        photo,
        analyse,
        lignes: analyse.lignes,
        moment: momentProbable(),
      })
    } catch {
      setErreur('Impossible de lire cette photo. Essaie une autre image, ou saisis le repas à la main.')
    } finally {
      setEtatPhoto(null)
      if (champPhoto.current) champPhoto.current.value = ''
    }
  }

  function enregistrer(lignes: LigneRepas[], moment: MomentRepas, note: string) {
    if (!editeur) return
    const nouveau: Repas = {
      id: identifiant('repas'),
      date,
      horodatage: Date.now(),
      moment,
      photo: editeur.photo,
      lignes,
      note: note.trim() || undefined,
      source: editeur.photo ? 'photo' : 'manuel',
    }
    storeRepas.set((p) => [...p, nouveau])
    setEditeur(null)
  }

  return (
    <div className="pb-6">
      <EnteteOnglet
        titre="Calories"
        sous={estAujourdhui ? 'Aujourd’hui' : formaterDateLongue(date)}
        action={
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setDate((d) => decalerDate(d, -1))}
              aria-label="Jour précédent"
              className="w-10 h-10 rounded-xl bg-ink-800 grid place-items-center active:bg-ink-700"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setDate((d) => (d === dateDuJour() ? d : decalerDate(d, 1)))}
              disabled={estAujourdhui}
              aria-label="Jour suivant"
              className="w-10 h-10 rounded-xl bg-ink-800 grid place-items-center active:bg-ink-700 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-4">
        <Carte className="p-4">
          <div className="flex items-center gap-4">
            <Anneau valeur={t.kcal} objectif={reglages.objectifKcal} />
            <div className="flex-1 min-w-0 space-y-2.5">
              <BarreMacro libelle="Protéines" valeur={t.prot} objectif={reglages.objectifProt} />
              <BarreMacro libelle="Glucides" valeur={t.gluc} />
              <BarreMacro libelle="Lipides" valeur={t.lip} />
            </div>
          </div>
          <p className="text-[12px] text-white/40 mt-3 pt-3 border-t border-white/5">
            {t.kcal === 0
              ? 'Rien d’enregistré pour cette journée.'
              : t.kcal > reglages.objectifKcal
                ? `${nombre(t.kcal - reglages.objectifKcal)} kcal au-dessus de l’objectif.`
                : `${nombre(reglages.objectifKcal - t.kcal)} kcal restantes.`}
          </p>
        </Carte>

        <div className="grid grid-cols-2 gap-2">
          <input
            ref={champPhoto}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void surPhoto(f)
            }}
          />
          <Bouton
            onClick={() => champPhoto.current?.click()}
            disabled={etatPhoto === 'analyse'}
            className="flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.1-1.8h6.4L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
              <circle cx="12" cy="12.3" r="3.3" />
            </svg>
            {etatPhoto === 'analyse' ? 'Analyse…' : 'Photo du repas'}
          </Bouton>
          <Bouton
            variante="secondaire"
            onClick={() => setEditeur({ lignes: [], moment: momentProbable(), analyse: null })}
          >
            Saisie manuelle
          </Bouton>
        </div>

        {erreur && (
          <Carte className="p-3.5 border-red-500/30 bg-red-500/5">
            <p className="text-[13px] text-red-200">{erreur}</p>
          </Carte>
        )}

        <Carte className="p-3.5">
          <p className="text-[12px] text-white/50 leading-relaxed">
            <span className="font-bold text-lime-400">Bouchée.</span> La photo est analysée sur ton
            téléphone (couleurs et proportions de l’assiette) pour proposer une composition de départ
            — c’est une estimation, pas une pesée. Corrige les grammages, les totaux suivent.
          </p>
        </Carte>

        <section>
          <Titre
            action={
              duJour.length > 0 ? (
                <span className="text-[12px] text-white/35">
                  {duJour.length} repas · {nombre(t.kcal)} kcal
                </span>
              ) : undefined
            }
          >
            Repas de la journée
          </Titre>
          {duJour.length === 0 ? (
            <Vide
              titre="Journée vide"
              texte="Prends une photo de ton assiette, ou choisis une assiette type ci-dessous."
            />
          ) : (
            <ul className="space-y-2">
              {duJour.map((r) => {
                const tr = totaux(r.lignes)
                return (
                  <li key={r.id}>
                    <Carte className="p-3">
                      <div className="flex gap-3">
                        {r.photo ? (
                          <img
                            src={r.photo}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-ink-800 grid place-items-center shrink-0 text-xl">
                            🍽️
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Etiquette ton="lime">
                              {MOMENTS.find((m) => m.id === r.moment)?.libelle ?? r.moment}
                            </Etiquette>
                            <span className="text-[12px] font-bold">{nombre(tr.kcal)} kcal</span>
                          </div>
                          <p className="text-[12.5px] text-white/50 mt-1 line-clamp-2">
                            {r.lignes.map((l) => `${l.nom} ${l.grammes} g`).join(' · ')}
                          </p>
                          <p className="text-[11px] text-white/30 mt-0.5">
                            P {tr.prot} / G {tr.gluc} / L {tr.lip}
                            {r.note ? ` · ${r.note}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => storeRepas.set((p) => p.filter((x) => x.id !== r.id))}
                          aria-label="Supprimer ce repas"
                          className="w-9 h-9 shrink-0 rounded-lg bg-ink-800 text-white/40 active:bg-ink-700"
                        >
                          ✕
                        </button>
                      </div>
                    </Carte>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section>
          <Titre>Assiettes types</Titre>
          <ul className="space-y-2">
            {ASSIETTES_TYPES.map((a) => {
              const lignes = a.lignes
                .map((l) => {
                  const aliment = alimentParNom(l.aliment)
                  return aliment ? ligneDepuisAliment(aliment, l.grammes) : null
                })
                .filter((l): l is LigneRepas => l !== null)
              const tk = lignes.reduce((s, l) => s + l.kcal, 0)
              return (
                <li key={a.nom}>
                  <Carte
                    onClick={() => setEditeur({ lignes, moment: momentProbable(), analyse: null })}
                    className="p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[14px]">{a.nom}</p>
                      <p className="text-[12px] text-white/40 truncate">{a.description}</p>
                    </div>
                    <span className="text-[12px] font-bold text-lime-400 shrink-0">
                      {nombre(tk)} kcal
                    </span>
                  </Carte>
                </li>
              )
            })}
          </ul>
        </section>

        {joursAvecRepas.length > 1 && (
          <section>
            <Titre>7 derniers jours enregistrés</Titre>
            <Carte className="divide-y divide-white/5">
              {joursAvecRepas.map(([j, kcal]) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setDate(j)}
                  className="w-full px-4 py-3 flex items-center justify-between active:bg-white/5"
                >
                  <span className="text-[13px] text-white/55 first-letter:uppercase">{formaterDateLongue(j)}</span>
                  <span
                    className={`text-[13px] font-bold ${
                      kcal > reglages.objectifKcal ? 'text-amber-400' : 'text-lime-400'
                    }`}
                  >
                    {nombre(kcal)} kcal
                  </span>
                </button>
              ))}
            </Carte>
          </section>
        )}
      </div>

      {editeur && (
        <EditeurRepas
          photo={editeur.photo}
          analyse={editeur.analyse}
          lignesInitiales={editeur.lignes}
          momentInitial={editeur.moment}
          onAnnuler={() => setEditeur(null)}
          onEnregistrer={enregistrer}
        />
      )}
    </div>
  )
}

function momentProbable(): MomentRepas {
  const h = new Date().getHours()
  if (h < 10) return 'petit-dejeuner'
  if (h < 15) return 'dejeuner'
  if (h < 18) return 'collation'
  return 'diner'
}
