import { useMemo, useState } from 'react'
import { Bouton, Carte, Etiquette, Titre } from './Ui'
import { ALIMENTS, LIBELLE_CATEGORIE_ALIMENT, chercherAliments } from '../data/aliments'
import { LIBELLE_TEINTE, alternativesPour, ligneDepuisAliment, recalculerLigne, type Analyse } from '../lib/bouchee'
import type { Aliment, LigneRepas, MomentRepas } from '../lib/types'
import { nombre } from '../lib/format'

export const MOMENTS: { id: MomentRepas; libelle: string }[] = [
  { id: 'petit-dejeuner', libelle: 'Petit-déj' },
  { id: 'dejeuner', libelle: 'Déjeuner' },
  { id: 'collation', libelle: 'Collation' },
  { id: 'diner', libelle: 'Dîner' },
]

export function totaux(lignes: LigneRepas[]) {
  return lignes.reduce(
    (t, l) => ({
      kcal: t.kcal + l.kcal,
      prot: Math.round((t.prot + l.prot) * 10) / 10,
      gluc: Math.round((t.gluc + l.gluc) * 10) / 10,
      lip: Math.round((t.lip + l.lip) * 10) / 10,
    }),
    { kcal: 0, prot: 0, gluc: 0, lip: 0 },
  )
}

function Recherche({ onChoisir }: { onChoisir: (a: Aliment) => void }) {
  const [requete, setRequete] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const resultats = useMemo(() => chercherAliments(requete, 8), [requete])

  return (
    <div className="relative">
      <input
        type="search"
        value={requete}
        onChange={(e) => {
          setRequete(e.target.value)
          setOuvert(true)
        }}
        onFocus={() => setOuvert(true)}
        placeholder="Ajouter un aliment (poulet, riz, banane…)"
        className="w-full h-12 px-3.5 rounded-xl bg-ink-900 border border-white/10 text-[14px] placeholder:text-white/30 focus:outline-none focus:border-lime-500/60"
      />
      {ouvert && (
        <ul className="mt-2 space-y-1 max-h-[232px] overflow-y-auto sans-scrollbar">
          {resultats.length === 0 && (
            <li className="text-[12.5px] text-white/35 px-1 py-2">
              Aucun aliment trouvé dans la base ({ALIMENTS.length} aliments).
            </li>
          )}
          {resultats.map((a) => (
            <li key={a.nom}>
              <button
                type="button"
                onClick={() => {
                  onChoisir(a)
                  setRequete('')
                  setOuvert(false)
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-ink-900/70 border border-white/5 active:bg-ink-800 flex items-center justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-[13.5px] truncate">{a.nom}</span>
                  <span className="block text-[11.5px] text-white/35">
                    {LIBELLE_CATEGORIE_ALIMENT[a.categorie]} · {a.kcal} kcal/100 {a.unite.startsWith('ml') ? 'ml' : 'g'}
                  </span>
                </span>
                <span className="text-lime-500 font-bold text-[12px] shrink-0">
                  + {a.portion} {a.unite.split(' ')[0]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function EditeurRepas({
  photo,
  analyse,
  lignesInitiales,
  momentInitial,
  onAnnuler,
  onEnregistrer,
}: {
  photo?: string
  analyse?: Analyse | null
  lignesInitiales: LigneRepas[]
  momentInitial: MomentRepas
  onAnnuler: () => void
  onEnregistrer: (lignes: LigneRepas[], moment: MomentRepas, note: string) => void
}) {
  const [lignes, setLignes] = useState<LigneRepas[]>(lignesInitiales)
  const [moment, setMoment] = useState<MomentRepas>(momentInitial)
  const [note, setNote] = useState('')
  const [remplaceId, setRemplaceId] = useState<string | null>(null)
  const t = totaux(lignes)

  function majGrammes(id: string, grammes: number) {
    setLignes((p) => p.map((l) => (l.id === id ? recalculerLigne(l, Math.max(0, grammes)) : l)))
  }

  return (
    <div className="absolute inset-0 z-40 bg-ink-950/95 backdrop-blur-sm flex items-end anim-apparait">
      <div className="w-full max-h-full overflow-y-auto sans-scrollbar rounded-t-3xl bg-ink-900 border-t border-white/10 p-4 pb-6">
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-4" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">{photo ? 'Repas analysé' : 'Nouveau repas'}</h2>
            <p className="text-[12.5px] text-white/40">
              {t.kcal} kcal · {t.prot} g de protéines
            </p>
          </div>
          {photo && (
            <img
              src={photo}
              alt="Photo du repas"
              className="w-16 h-16 rounded-xl object-cover border border-white/10"
            />
          )}
        </div>

        {analyse && (
          <Carte className="p-3.5 mt-3 border-lime-500/20">
            <div className="flex items-center gap-2 flex-wrap">
              <Etiquette ton="lime">Bouchée · estimation</Etiquette>
              <Etiquette ton={analyse.fiabilite === 'moyenne' ? 'neutre' : 'alerte'}>
                fiabilité {analyse.fiabilite}
              </Etiquette>
            </div>
            <p className="text-[12.5px] text-white/55 mt-2 leading-snug">{analyse.message}</p>
            {analyse.parts.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {analyse.parts.map((p) => (
                  <div key={p.teinte} className="flex items-center gap-2">
                    <span className="text-[11.5px] text-white/45 w-[118px] shrink-0 truncate">
                      {LIBELLE_TEINTE[p.teinte]}
                    </span>
                    <span className="h-1.5 flex-1 rounded-full bg-ink-800 overflow-hidden">
                      <span
                        className="block h-full bg-lime-500"
                        style={{ width: `${Math.round(p.proportion * 100)}%` }}
                      />
                    </span>
                    <span className="text-[11px] font-bold tabular-nums w-9 text-right">
                      {Math.round(p.proportion * 100)} %
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Carte>
        )}

        <div className="mt-4">
          <Titre>Moment</Titre>
          <div className="flex gap-1.5 flex-wrap">
            {MOMENTS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMoment(m.id)}
                className={`px-3 min-h-[42px] rounded-xl text-[13px] font-bold border ${
                  moment === m.id
                    ? 'bg-lime-500 text-ink-950 border-lime-500'
                    : 'bg-ink-850 text-white/55 border-white/5'
                }`}
              >
                {m.libelle}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Titre>Aliments</Titre>
          <ul className="space-y-2">
            {lignes.map((l) => (
              <li key={l.id}>
                <Carte className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-[14px] truncate">{l.nom}</p>
                      <p className="text-[11.5px] text-white/40">
                        {l.kcal} kcal · P {l.prot} / G {l.gluc} / L {l.lip}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLignes((p) => p.filter((x) => x.id !== l.id))}
                      aria-label={`Retirer ${l.nom}`}
                      className="w-9 h-9 shrink-0 rounded-lg bg-ink-800 text-white/50 active:bg-ink-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button
                      type="button"
                      onClick={() => majGrammes(l.id, l.grammes - 10)}
                      className="w-10 h-10 rounded-lg bg-ink-800 font-bold active:bg-ink-700"
                      aria-label="Moins 10 grammes"
                    >
                      −
                    </button>
                    <label className="relative">
                      <span className="sr-only">Quantité en grammes pour {l.nom}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={l.grammes === 0 ? '' : l.grammes}
                        onChange={(e) => majGrammes(l.id, Number(e.target.value) || 0)}
                        className="w-[72px] h-10 rounded-lg bg-ink-900 border border-white/10 text-center font-bold tabular-nums focus:outline-none focus:border-lime-500/60"
                      />
                      <span className="absolute right-2 bottom-0.5 text-[9px] text-white/30 font-semibold pointer-events-none">
                        g
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => majGrammes(l.id, l.grammes + 10)}
                      className="w-10 h-10 rounded-lg bg-ink-800 font-bold active:bg-ink-700"
                      aria-label="Plus 10 grammes"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemplaceId(remplaceId === l.id ? null : l.id)}
                      className="ml-auto text-[12px] font-semibold text-lime-500 px-2 min-h-[40px]"
                    >
                      Remplacer
                    </button>
                  </div>

                  {remplaceId === l.id && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/5">
                      <Recherche
                        onChoisir={(a) => {
                          setLignes((p) =>
                            p.map((x) =>
                              x.id === l.id ? { ...ligneDepuisAliment(a, a.portion), id: x.id } : x,
                            ),
                          )
                          setRemplaceId(null)
                        }}
                      />
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {alternativesPour(
                          ALIMENTS.find((a) => a.nom === l.nom)?.categorie ?? 'proteine',
                        )
                          .slice(0, 6)
                          .map((a) => (
                            <button
                              key={a.nom}
                              type="button"
                              onClick={() => {
                                setLignes((p) =>
                                  p.map((x) =>
                                    x.id === l.id
                                      ? { ...ligneDepuisAliment(a, l.grammes), id: x.id }
                                      : x,
                                  ),
                                )
                                setRemplaceId(null)
                              }}
                              className="px-2.5 py-2 rounded-lg bg-ink-800 text-[12px] font-semibold active:bg-ink-700"
                            >
                              {a.nom}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </Carte>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <Recherche
              onChoisir={(a) => setLignes((p) => [...p, ligneDepuisAliment(a, a.portion)])}
            />
          </div>
        </div>

        <div className="mt-4">
          <Titre>Note</Titre>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optionnel : « au resto », « post-séance »…"
            className="w-full h-12 px-3.5 rounded-xl bg-ink-900 border border-white/10 text-[14px] placeholder:text-white/30 focus:outline-none focus:border-lime-500/60"
          />
        </div>

        <Carte className="p-3.5 mt-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-extrabold leading-none">{nombre(t.kcal)}</p>
              <p className="text-[10.5px] text-white/40 mt-0.5">kcal</p>
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none text-lime-400">{t.prot}</p>
              <p className="text-[10.5px] text-white/40 mt-0.5">prot. (g)</p>
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none">{t.gluc}</p>
              <p className="text-[10.5px] text-white/40 mt-0.5">gluc. (g)</p>
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none">{t.lip}</p>
              <p className="text-[10.5px] text-white/40 mt-0.5">lip. (g)</p>
            </div>
          </div>
        </Carte>

        <div className="flex gap-2 mt-4">
          <Bouton variante="fantome" className="flex-1" onClick={onAnnuler}>
            Annuler
          </Bouton>
          <Bouton
            className="flex-1"
            disabled={lignes.length === 0}
            onClick={() => onEnregistrer(lignes, moment, note)}
          >
            Enregistrer
          </Bouton>
        </div>
      </div>
    </div>
  )
}
