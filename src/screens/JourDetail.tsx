import type { Navigation } from '../App'
import { JOURS_PAR_ID, type Prescription } from '../data/programme'
import { LIBELLE_CATEGORIE, exercice } from '../data/exercices'
import { EntetePage } from '../components/Entete'
import { Bouton, Carte, Compteur, Etiquette, Titre } from '../components/Ui'
import {
  estReposPersonnalise,
  definirRepos,
  reinitialiserRepos,
  reposDe,
  useRepos,
} from '../lib/donnees'
import { formaterDuree } from '../lib/format'

export function EtiquetteEchec({ echec }: { echec: Prescription['echec'] }) {
  if (!echec) return null
  return (
    <Etiquette ton="alerte">
      {echec === 'toutes' ? 'À l’échec' : 'Dernière série à l’échec'}
    </Etiquette>
  )
}

export default function JourDetail({ jourId, nav }: { jourId: string; nav: Navigation }) {
  const jour = JOURS_PAR_ID[jourId]
  const repos = useRepos()

  if (!jour) return null

  return (
    <div className="pb-6">
      <EntetePage
        titre={jour.titre}
        sous={jour.duree ? `${jour.jour} · ${jour.duree}` : jour.jour}
        onRetour={nav.fermer}
      />

      <div className="px-4 pt-4">
        {jour.note && (
          <Carte className="p-3.5 mb-4">
            <p className="text-[13px] leading-relaxed text-white/60">{jour.note}</p>
          </Carte>
        )}

        {jour.type === 'repos' ? (
          <Carte className="p-6 text-center">
            <div className="text-4xl">😴</div>
            <p className="font-extrabold mt-2">Repos complet</p>
            <p className="text-[13px] text-white/40 mt-1">
              Dors, mange, récupère. C’est aussi de l’entraînement.
            </p>
          </Carte>
        ) : (
          jour.blocs.map((bloc, i) => (
            <section key={i} className="mb-5">
              {(bloc.titre || bloc.tours) && (
                <Titre
                  action={
                    bloc.tours ? <Etiquette ton="lime">{bloc.tours} tours</Etiquette> : undefined
                  }
                >
                  {bloc.titre ?? 'Bloc'}
                </Titre>
              )}
              {bloc.note && (
                <p className="text-[12px] text-white/40 -mt-1 mb-2 leading-snug">{bloc.note}</p>
              )}

              <ul
                className={
                  bloc.enchainement
                    ? 'space-y-2 rounded-2xl border border-lime-500/20 bg-lime-500/[0.04] p-2'
                    : 'space-y-2'
                }
              >
                {bloc.exercices.map((p, idx) => {
                  const ex = exercice(p.exerciceId)
                  const secondes = reposDe(jour.id, ex.id, repos)
                  const perso = estReposPersonnalise(jour.id, ex.id, repos)
                  const enchaine = bloc.enchainement && idx < bloc.exercices.length - 1
                  return (
                    <li key={`${p.exerciceId}-${idx}`}>
                      <Carte className="p-3.5">
                        <button
                          type="button"
                          onClick={() => nav.ouvrir({ type: 'exercice', id: ex.id, jourId: jour.id })}
                          className="w-full text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold leading-tight">{ex.nom}</h3>
                              <p className="text-[13px] text-lime-400 font-semibold mt-0.5">
                                {p.series} × {p.reps}
                                {p.note && <span className="text-white/35 font-normal"> · {p.note}</span>}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <Etiquette ton="sombre">{LIBELLE_CATEGORIE[ex.categorie]}</Etiquette>
                                <EtiquetteEchec echec={p.echec} />
                              </div>
                            </div>
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/25 mt-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9.5 5 16 12l-6.5 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>

                        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5">
                          <div className="text-[12px] text-white/45 min-w-0">
                            {secondes === 0 ? (
                              <span className="text-lime-400 font-semibold">
                                Enchaîné — pas de repos
                              </span>
                            ) : (
                              <>Repos {formaterDuree(secondes)}</>
                            )}
                            {perso && (
                              <button
                                type="button"
                                onClick={() => reinitialiserRepos(jour.id, ex.id)}
                                className="ml-2 text-lime-500 font-semibold underline underline-offset-2"
                              >
                                réinitialiser
                              </button>
                            )}
                          </div>
                          <Compteur
                            valeur={secondes}
                            min={0}
                            onChange={(v) => definirRepos(jour.id, ex.id, v)}
                          />
                        </div>

                        {enchaine && (
                          <p className="text-[11.5px] text-lime-400/80 mt-2 font-semibold">
                            ↓ enchaîne avec {exercice(bloc.exercices[idx + 1].exerciceId).nom}
                          </p>
                        )}
                      </Carte>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}

        {jour.type !== 'repos' && (
          <Bouton className="w-full" onClick={() => nav.demarrerJour(jour.id)}>
            Démarrer cette séance
          </Bouton>
        )}
      </div>
    </div>
  )
}
