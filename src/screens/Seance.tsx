import { useEffect, useMemo, useState } from 'react'
import type { Navigation } from '../App'
import { EnteteOnglet } from '../components/Entete'
import BandeauSauvegarde, { useEtatSauvegarde } from '../components/EtatSauvegarde'
import { Bouton, Carte, Etiquette, Stat, Titre, Vide } from '../components/Ui'
import {
  JOURS_PAR_ID,
  SEMAINE,
  exerciceEnchaineApres,
  jourDuJour,
  toutesLesPrescriptions,
  type Prescription,
} from '../data/programme'
import { exercice } from '../data/exercices'
import { lancerChrono } from '../lib/chrono'
import {
  dateDuJour,
  dernieresSeries,
  identifiant,
  recordsBattus,
  reposDe,
  seriesValidees,
  storeSeanceEnCours,
  storeSeances,
  useRepos,
  useSeanceEnCours,
  useSeances,
  volumeSeance,
} from '../lib/donnees'
import { formaterDuree, nombre } from '../lib/format'
import { EtiquetteEchec } from './JourDetail'
import type { SeanceLog, SerieLog } from '../lib/types'

/** « 6-8 » -> 6 ; « max » -> 0 ; « 45 s » -> 0 rep et 45 s. */
function ciblesDepuisReps(reps: string): { reps: number; secondes: number } {
  const minutes = reps.match(/(\d+)(?:\s*-\s*(\d+))?\s*min/)
  if (minutes) return { reps: 0, secondes: Number(minutes[1]) * 60 }
  const sec = reps.match(/(\d+)\s*s\b/)
  if (sec) return { reps: 0, secondes: Number(sec[1]) }
  const n = reps.match(/\d+/)
  return { reps: n ? Number(n[0]) : 0, secondes: 0 }
}

function creerSeance(jourId: string, seancesPassees: SeanceLog[]): SeanceLog {
  const jour = JOURS_PAR_ID[jourId]
  const exercices = toutesLesPrescriptions(jour).map((p: Prescription) => {
    const derniere = dernieresSeries(p.exerciceId, seancesPassees)
    const cible = ciblesDepuisReps(p.reps)
    const series: SerieLog[] = Array.from({ length: p.series }, (_, i) => {
      const ref = derniere?.[i] ?? derniere?.[derniere.length - 1]
      return {
        poids: ref?.poids ?? 0,
        reps: ref?.reps ?? cible.reps,
        secondes: ref?.secondes ?? cible.secondes,
        validee: false,
      }
    })
    return { exerciceId: p.exerciceId, series }
  })
  return {
    id: identifiant('seance'),
    jourId,
    date: dateDuJour(),
    exercices,
    terminee: false,
  }
}

function ChampNombre({
  valeur,
  onChange,
  suffixe,
  pas,
  aria,
}: {
  valeur: number
  onChange: (v: number) => void
  suffixe: string
  pas: number
  aria: string
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`${aria} moins ${pas}`}
        onClick={() => onChange(Math.max(0, Math.round((valeur - pas) * 100) / 100))}
        className="w-9 h-11 rounded-lg bg-ink-800 text-base font-bold active:bg-ink-700"
      >
        −
      </button>
      <label className="relative">
        <span className="sr-only">{aria}</span>
        <input
          type="number"
          inputMode="decimal"
          step={pas}
          value={valeur === 0 ? '' : valeur}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-[62px] h-11 rounded-lg bg-ink-900 border border-white/10 text-center font-bold tabular-nums focus:outline-none focus:border-lime-500/60"
        />
        <span className="absolute right-1.5 bottom-0.5 text-[9px] text-white/30 font-semibold pointer-events-none">
          {suffixe}
        </span>
      </label>
      <button
        type="button"
        aria-label={`${aria} plus ${pas}`}
        onClick={() => onChange(Math.round((valeur + pas) * 100) / 100)}
        className="w-9 h-11 rounded-lg bg-ink-800 text-base font-bold active:bg-ink-700"
      >
        +
      </button>
    </div>
  )
}

export default function Seance({
  nav,
  jourChoisi,
  setJourChoisi,
}: {
  nav: Navigation
  jourChoisi: string | null
  setJourChoisi: (id: string) => void
}) {
  const seances = useSeances()
  const enCours = useSeanceEnCours()
  const repos = useRepos()
  const [resume, setResume] = useState<SeanceLog | null>(null)
  const sauvegarde = useEtatSauvegarde()

  const jourId = jourChoisi ?? jourDuJour().id
  const jour = JOURS_PAR_ID[jourId]

  // Reprend la séance en cours si elle correspond, sinon en prépare une nouvelle.
  useEffect(() => {
    if (jour.type === 'repos') return
    if (enCours && enCours.jourId === jourId && enCours.date === dateDuJour()) return
    if (enCours && (enCours.jourId !== jourId || enCours.date !== dateDuJour())) {
      if (seriesValidees(enCours) > 0 && enCours.date === dateDuJour()) return
    }
    storeSeanceEnCours.set(creerSeance(jourId, seances))
    // seances n'est lu qu'au moment du préremplissage : pas besoin de recréer la séance s'il change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jourId, jour.type])

  const seance = enCours && enCours.jourId === jourId ? enCours : null
  const prescriptions = useMemo(() => toutesLesPrescriptions(jour), [jour])
  const volume = seance ? volumeSeance(seance) : 0
  const validees = seance ? seriesValidees(seance) : 0
  const total = seance ? seance.exercices.reduce((n, e) => n + e.series.length, 0) : 0

  function majSerie(exerciceId: string, index: number, patch: Partial<SerieLog>) {
    storeSeanceEnCours.set((p) => {
      if (!p) return p
      return {
        ...p,
        exercices: p.exercices.map((ex) =>
          ex.exerciceId !== exerciceId
            ? ex
            : {
                ...ex,
                series: ex.series.map((s, i) => (i === index ? { ...s, ...patch } : s)),
              },
        ),
      }
    })
  }

  function validerSerie(exerciceId: string, index: number) {
    const ex = exercice(exerciceId)
    majSerie(exerciceId, index, { validee: true })
    const secondes = reposDe(jourId, exerciceId, repos)
    // Repos à 0 : l'exercice est enchaîné, on ne lance pas le chrono.
    if (secondes > 0) {
      lancerChrono(secondes, exerciceId, `${ex.nom} · série ${index + 1}`)
    }
  }

  function ajouterSerie(exerciceId: string) {
    storeSeanceEnCours.set((p) => {
      if (!p) return p
      return {
        ...p,
        exercices: p.exercices.map((ex) => {
          if (ex.exerciceId !== exerciceId) return ex
          const derniere = ex.series[ex.series.length - 1]
          return {
            ...ex,
            series: [...ex.series, { ...(derniere ?? { poids: 0, reps: 0, secondes: 0 }), validee: false }],
          }
        }),
      }
    })
  }

  function retirerSerie(exerciceId: string, index: number) {
    storeSeanceEnCours.set((p) => {
      if (!p) return p
      return {
        ...p,
        exercices: p.exercices.map((ex) =>
          ex.exerciceId !== exerciceId
            ? ex
            : { ...ex, series: ex.series.filter((_, i) => i !== index) },
        ),
      }
    })
  }

  function terminer() {
    if (!seance) return
    const finale: SeanceLog = { ...seance, terminee: true }
    storeSeances.set((p) => [...p.filter((s) => s.id !== finale.id), finale])
    storeSeanceEnCours.set(null)
    setResume(finale)
  }

  if (jour.type === 'repos') {
    return (
      <div className="pb-6">
        <EnteteOnglet titre="Séance" sous={`${jour.jour} · repos complet`} />
        <div className="px-4 space-y-4">
          <Carte className="p-6 text-center">
            <div className="text-4xl">😴</div>
            <p className="font-extrabold mt-2">Aujourd’hui, c’est repos</p>
            <p className="text-[13px] text-white/40 mt-1">
              Choisis un autre jour si tu veux t’entraîner quand même.
            </p>
          </Carte>
          <ChoixJour jourId={jourId} setJourChoisi={setJourChoisi} />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <EnteteOnglet
        titre={jour.titre}
        sous={`${jour.jour}${jour.duree ? ` · ${jour.duree}` : ''} · ${validees}/${total} séries validées`}
      />

      <div className="px-4 space-y-4">
        <ChoixJour jourId={jourId} setJourChoisi={setJourChoisi} />

        <BandeauSauvegarde />

        <div className="grid grid-cols-3 gap-2">
          <Stat valeur={validees} libelle="Séries validées" />
          <Stat valeur={nombre(Math.round(volume))} unite="kg" libelle="Volume soulevé" />
          <Stat valeur={`${Math.round((validees / Math.max(1, total)) * 100)}`} unite="%" libelle="Avancement" />
        </div>

        <Carte className="p-3.5 border-lime-500/20">
          <p className="text-[12.5px] leading-relaxed text-white/70">
            <span className="font-bold text-lime-400">Rappel.</span> Si la dernière rep ne ressemble
            plus à la première, c’est trop lourd : baisse la charge.
          </p>
        </Carte>

        {seance === null ? (
          <Vide titre="Préparation…" texte="La séance se construit à partir du programme du jour." />
        ) : (
          <ul className="space-y-3">
            {seance.exercices.map((exLog) => {
              const ex = exercice(exLog.exerciceId)
              const presc = prescriptions.find((p) => p.exerciceId === exLog.exerciceId)
              const histo = dernieresSeries(exLog.exerciceId, seances)
              const suivantEnchaine = exerciceEnchaineApres(jourId, exLog.exerciceId)
              return (
                <li key={exLog.exerciceId}>
                  <Carte className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => nav.ouvrir({ type: 'exercice', id: ex.id })}
                        className="text-left min-w-0"
                      >
                        <h3 className="font-bold leading-tight">{ex.nom}</h3>
                        <p className="text-[12.5px] text-lime-400 font-semibold">
                          {presc ? `${presc.series} × ${presc.reps}` : ''}
                          {presc?.note ? (
                            <span className="text-white/35 font-normal"> · {presc.note}</span>
                          ) : null}
                          <span className="text-white/35 font-normal">
                            {' '}
                            ·{' '}
                            {reposDe(jourId, ex.id, repos) === 0
                              ? 'enchaîné'
                              : `repos ${formaterDuree(reposDe(jourId, ex.id, repos))}`}
                          </span>
                        </p>
                      </button>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Etiquette ton={exLog.series.every((s) => s.validee) ? 'lime' : 'neutre'}>
                          {exLog.series.filter((s) => s.validee).length}/{exLog.series.length}
                        </Etiquette>
                        <EtiquetteEchec echec={presc?.echec} />
                      </div>
                    </div>

                    {histo && (
                      <p className="text-[11.5px] text-white/35 mt-1.5">
                        Dernière fois :{' '}
                        {histo
                          .map((s) =>
                            ex.saisie === 'charge'
                              ? `${s.poids || 0}×${s.reps || 0}`
                              : ex.saisie === 'temps'
                                ? `${s.secondes || 0}s`
                                : `${s.reps || 0}`,
                          )
                          .join(' · ')}
                      </p>
                    )}

                    <ul className="mt-3 space-y-2">
                      {exLog.series.map((serie, i) => (
                        <li
                          key={i}
                          className={`rounded-xl border px-2.5 py-2 flex items-center gap-2 ${
                            serie.validee
                              ? 'bg-lime-500/10 border-lime-500/30'
                              : 'bg-ink-900/60 border-white/5'
                          }`}
                        >
                          <span className="w-6 shrink-0 text-center text-[12px] font-bold text-white/35 tabular-nums">
                            {i + 1}
                          </span>

                          <div className="flex-1 flex items-center gap-2 flex-wrap">
                            {ex.saisie === 'charge' && (
                              <>
                                <ChampNombre
                                  valeur={serie.poids}
                                  onChange={(v) => majSerie(ex.id, i, { poids: v })}
                                  suffixe="kg"
                                  pas={2.5}
                                  aria={`Poids série ${i + 1}`}
                                />
                                <ChampNombre
                                  valeur={serie.reps}
                                  onChange={(v) => majSerie(ex.id, i, { reps: v })}
                                  suffixe="rep"
                                  pas={1}
                                  aria={`Répétitions série ${i + 1}`}
                                />
                              </>
                            )}
                            {ex.saisie === 'reps' && (
                              <>
                                <ChampNombre
                                  valeur={serie.reps}
                                  onChange={(v) => majSerie(ex.id, i, { reps: v })}
                                  suffixe="rep"
                                  pas={1}
                                  aria={`Répétitions série ${i + 1}`}
                                />
                                <ChampNombre
                                  valeur={serie.poids}
                                  onChange={(v) => majSerie(ex.id, i, { poids: v })}
                                  suffixe="kg+"
                                  pas={2.5}
                                  aria={`Lest série ${i + 1}`}
                                />
                              </>
                            )}
                            {ex.saisie === 'temps' && (
                              <ChampNombre
                                valeur={serie.secondes}
                                onChange={(v) => majSerie(ex.id, i, { secondes: v })}
                                suffixe="s"
                                pas={serie.secondes >= 120 ? 30 : 5}
                                aria={`Durée série ${i + 1}`}
                              />
                            )}
                          </div>

                          {serie.validee ? (
                            <button
                              type="button"
                              onClick={() => majSerie(ex.id, i, { validee: false })}
                              className="w-11 h-11 shrink-0 rounded-lg bg-lime-500 text-ink-950 grid place-items-center font-extrabold"
                              aria-label={`Annuler la validation de la série ${i + 1}`}
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => validerSerie(ex.id, i)}
                              className="h-11 px-3 shrink-0 rounded-lg bg-ink-700 text-[12px] font-bold active:bg-lime-500 active:text-ink-950"
                            >
                              Valider
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    {suivantEnchaine && (
                      <p className="text-[11.5px] text-lime-400/90 font-semibold mt-2">
                        ↓ enchaîne tout de suite avec {exercice(suivantEnchaine).nom}, puis repose-toi
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => ajouterSerie(ex.id)}
                        className="text-[12px] font-semibold text-lime-500 min-h-[36px] px-2"
                      >
                        + Ajouter une série
                      </button>
                      {exLog.series.length > 1 && (
                        <button
                          type="button"
                          onClick={() => retirerSerie(ex.id, exLog.series.length - 1)}
                          className="text-[12px] font-semibold text-white/35 min-h-[36px] px-2"
                        >
                          − Retirer la dernière
                        </button>
                      )}
                    </div>
                  </Carte>
                </li>
              )
            })}
          </ul>
        )}

        <Bouton className="w-full" onClick={terminer} disabled={!seance || validees === 0}>
          Terminer la séance
        </Bouton>
        <p className="text-[11.5px] text-white/30 text-center">
          {sauvegarde.mode === 'cloud'
            ? 'Chaque série validée part dans ta sauvegarde en ligne.'
            : 'Séance enregistrée dans ce navigateur. Exporte tes données depuis Progrès.'}
        </p>
      </div>

      {resume && <ResumeSeance seance={resume} seances={seances} onFermer={() => setResume(null)} nav={nav} />}
    </div>
  )
}

function ChoixJour({
  jourId,
  setJourChoisi,
}: {
  jourId: string
  setJourChoisi: (id: string) => void
}) {
  return (
    <div className="-mx-4 px-4 overflow-x-auto sans-scrollbar">
      <div className="flex gap-2 w-max pb-1">
        {SEMAINE.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => setJourChoisi(j.id)}
            className={`px-3 min-h-[44px] rounded-xl text-[12.5px] font-bold border transition ${
              j.id === jourId
                ? 'bg-lime-500 text-ink-950 border-lime-500'
                : 'bg-ink-850 text-white/55 border-white/5 active:bg-ink-800'
            }`}
          >
            {j.jour.slice(0, 3)}
            <span className="block text-[10px] font-semibold opacity-70">
              {j.type === 'repos' ? 'repos' : j.type === 'libre' ? 'libre' : j.titre.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ResumeSeance({
  seance,
  seances,
  onFermer,
  nav,
}: {
  seance: SeanceLog
  seances: SeanceLog[]
  onFermer: () => void
  nav: Navigation
}) {
  const volume = volumeSeance(seance)
  const prs = useMemo(() => recordsBattus(seance, seances), [seance, seances])
  const jour = JOURS_PAR_ID[seance.jourId]

  return (
    <div className="absolute inset-0 z-40 bg-ink-950/95 backdrop-blur-sm flex items-end anim-apparait">
      <div className="w-full max-h-full overflow-y-auto sans-scrollbar rounded-t-3xl bg-ink-900 border-t border-white/10 p-4 pb-6">
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold">Séance terminée</h2>
        <p className="text-[13px] text-white/40 mt-0.5">
          {jour.jour} · {jour.titre}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat valeur={nombre(Math.round(volume))} unite="kg" libelle="Volume total" />
          <Stat valeur={seriesValidees(seance)} libelle="Séries validées" />
          <Stat valeur={prs.length} libelle="Records battus" />
        </div>

        <div className="mt-5">
          <Titre>Records</Titre>
          {prs.length === 0 ? (
            <Carte className="p-4">
              <p className="text-[13px] text-white/50 leading-relaxed">
                Pas de record cette fois. Ce n’est pas un problème : la régularité passe avant le
                record, et un entraînement propre vaut mieux qu’un kilo de plus mal fait.
              </p>
            </Carte>
          ) : (
            <ul className="space-y-2">
              {prs.map((pr, i) => (
                <li key={i}>
                  <Carte className="p-3.5 flex items-center justify-between gap-3 border-lime-500/25">
                    <div className="min-w-0">
                      <p className="font-bold text-[14px] truncate">{exercice(pr.exerciceId).nom}</p>
                      <p className="text-[12px] text-white/40">
                        {pr.type === 'poids'
                          ? 'Charge max'
                          : pr.type === 'volume'
                            ? 'Volume'
                            : pr.type === 'reps'
                              ? 'Répétitions'
                              : 'Durée'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-lime-400">
                        {nombre(Math.round(pr.apres * 10) / 10, pr.apres % 1 ? 1 : 0)}
                        <span className="text-[11px] ml-0.5">
                          {pr.type === 'poids' ? 'kg' : pr.type === 'volume' ? 'kg' : pr.type === 'temps' ? 's' : 'reps'}
                        </span>
                      </p>
                      {pr.avant > 0 && (
                        <p className="text-[11px] text-white/35">avant {nombre(Math.round(pr.avant))}</p>
                      )}
                    </div>
                  </Carte>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <Bouton variante="fantome" className="flex-1" onClick={() => { onFermer(); nav.allerA('progres') }}>
            Voir mes progrès
          </Bouton>
          <Bouton className="flex-1" onClick={onFermer}>
            Terminé
          </Bouton>
        </div>
      </div>
    </div>
  )
}
