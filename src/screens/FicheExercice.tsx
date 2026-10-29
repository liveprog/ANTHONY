import { useMemo, useState } from 'react'
import type { Navigation } from '../App'
import BonhommeMuscles, { musclesHorsVue, type Vue } from '../components/BonhommeMuscles'
import { EntetePage } from '../components/Entete'
import { Carte, Compteur, Etiquette, Titre, Vide } from '../components/Ui'
import { LIBELLE_CATEGORIE, exercice } from '../data/exercices'
import { MUSCLES } from '../data/muscles'
import { historiqueExercice, reposDe, storeRepos, useRepos, useSeances } from '../lib/donnees'
import { formaterDateCourte, nombre } from '../lib/format'

function Legende() {
  const items: { couleur: string; libelle: string }[] = [
    { couleur: '#c6f948', libelle: 'Muscle principal' },
    { couleur: '#6f8f41', libelle: 'Secondaire' },
    { couleur: '#232a32', libelle: 'Non sollicité' },
  ]
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {items.map((i) => (
        <span key={i.libelle} className="inline-flex items-center gap-1.5 text-[11.5px] text-white/50">
          <span
            className="w-3 h-3 rounded-[4px] border border-white/10"
            style={{ background: i.couleur }}
          />
          {i.libelle}
        </span>
      ))}
    </div>
  )
}

export default function FicheExercice({ exerciceId, nav }: { exerciceId: string; nav: Navigation }) {
  const ex = exercice(exerciceId)
  const [vue, setVue] = useState<Vue>('face')
  const repos = useRepos()
  const seances = useSeances()
  const histo = useMemo(() => historiqueExercice(ex.id, seances).slice(0, 6), [ex.id, seances])
  const manquants = musclesHorsVue(vue, [...ex.principaux, ...ex.secondaires])

  return (
    <div className="pb-6">
      <EntetePage
        titre={ex.nom}
        sous={LIBELLE_CATEGORIE[ex.categorie]}
        onRetour={nav.fermer}
      />

      <div className="px-4 pt-4 space-y-5">
        <Carte className="p-3">
          <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-ink-900 border border-white/5">
            {(['face', 'dos'] as Vue[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVue(v)}
                className={`flex-1 min-h-[42px] rounded-lg text-sm font-bold transition ${
                  vue === v ? 'bg-lime-500 text-ink-950' : 'text-white/50 active:bg-white/5'
                }`}
              >
                Vue de {v === 'face' ? 'face' : 'dos'}
              </button>
            ))}
          </div>

          <div className="mt-2 flex justify-center">
            <BonhommeMuscles
              vue={vue}
              principaux={ex.principaux}
              secondaires={ex.secondaires}
              className="h-[330px] w-auto"
            />
          </div>

          <Legende />

          {manquants.length > 0 && (
            <p className="text-[11.5px] text-white/35 text-center mt-2">
              Aussi sollicité, visible de {vue === 'face' ? 'dos' : 'face'} :{' '}
              {manquants.map((m) => MUSCLES[m].court).join(', ')}.
            </p>
          )}
        </Carte>

        <section>
          <Titre>Muscles travaillés</Titre>
          <Carte className="p-4 space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-lime-400 mb-1.5">
                Principaux
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ex.principaux.map((m) => (
                  <Etiquette key={m} ton="lime">
                    {MUSCLES[m].label}
                  </Etiquette>
                ))}
              </div>
            </div>
            {ex.secondaires.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">
                  Secondaires
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ex.secondaires.map((m) => (
                    <Etiquette key={m}>{MUSCLES[m].label}</Etiquette>
                  ))}
                </div>
              </div>
            )}
          </Carte>
        </section>

        <section>
          <Titre>Technique</Titre>
          <Carte className="p-4">
            <ol className="space-y-2.5">
              {ex.conseils.map((c, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/75">
                  <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-lime-500/15 text-lime-400 text-[11px] font-bold grid place-items-center">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </Carte>
        </section>

        <section>
          <Titre>L’erreur classique</Titre>
          <Carte className="p-4 border-amber-400/25 bg-amber-400/5">
            <p className="text-[13.5px] leading-relaxed text-amber-100/90">
              <span className="font-bold">À éviter : </span>
              {ex.erreur}
            </p>
          </Carte>
        </section>

        <section>
          <Titre>Temps de repos</Titre>
          <Carte className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold">{reposDe(ex.id, repos)} secondes</p>
                <p className="text-[12px] text-white/40">
                  {repos[ex.id] !== undefined ? 'Valeur personnalisée' : `Défaut ${LIBELLE_CATEGORIE[ex.categorie].toLowerCase()}`}
                </p>
              </div>
              <Compteur
                valeur={reposDe(ex.id, repos)}
                onChange={(v) => storeRepos.set((p) => ({ ...p, [ex.id]: v }))}
              />
            </div>
            {repos[ex.id] !== undefined && (
              <button
                type="button"
                onClick={() =>
                  storeRepos.set((p) => {
                    const copie = { ...p }
                    delete copie[ex.id]
                    return copie
                  })
                }
                className="mt-3 text-[12px] text-lime-500 font-semibold underline underline-offset-2"
              >
                Revenir à la valeur par défaut
              </button>
            )}
          </Carte>
        </section>

        <section>
          <Titre>Dernières performances</Titre>
          {histo.length === 0 ? (
            <Vide
              titre="Rien d’enregistré"
              texte="Fais cet exercice dans l’onglet Séance : l’historique et les records se rempliront tout seuls."
            />
          ) : (
            <Carte className="divide-y divide-white/5">
              {histo.map((h, i) => (
                <div key={`${h.date}-${i}`} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="text-[13px] text-white/50 first-letter:uppercase">{formaterDateCourte(h.date)}</div>
                  <div className="text-right">
                    {ex.saisie === 'charge' && (
                      <>
                        <p className="font-bold text-[14px]">
                          {nombre(h.poidsMax, h.poidsMax % 1 ? 1 : 0)} kg{' '}
                          <span className="text-white/35 font-semibold">× {h.repsMax}</span>
                        </p>
                        <p className="text-[11.5px] text-white/35">
                          volume {nombre(Math.round(h.volume))} kg
                        </p>
                      </>
                    )}
                    {ex.saisie === 'reps' && (
                      <p className="font-bold text-[14px]">
                        {h.repsMax} reps{' '}
                        <span className="text-white/35 font-semibold">au mieux</span>
                      </p>
                    )}
                    {ex.saisie === 'temps' && (
                      <p className="font-bold text-[14px]">{h.secondesMax} s</p>
                    )}
                  </div>
                </div>
              ))}
            </Carte>
          )}
        </section>
      </div>
    </div>
  )
}
