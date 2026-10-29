import { useState } from 'react'
import type { Navigation } from '../App'
import { EntetePage } from '../components/Entete'
import { Bouton, Carte, Compteur, Titre } from '../components/Ui'
import { exercice } from '../data/exercices'
import { JOURS_PAR_ID, REGLES } from '../data/programme'
import { bip } from '../lib/chrono'
import { effacerTout, reinitialiserRepos, storeReglages, useReglages, useRepos } from '../lib/donnees'
import { formaterDuree } from '../lib/format'
import { VERSION_DONNEES } from '../lib/stockage'

function Interrupteur({
  actif,
  onChange,
  libelle,
  description,
}: {
  actif: boolean
  onChange: (v: boolean) => void
  libelle: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="min-w-0">
        <p className="font-semibold text-[14px]">{libelle}</p>
        <p className="text-[12px] text-white/40 leading-snug">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={libelle}
        onClick={() => onChange(!actif)}
        className={`shrink-0 w-[52px] h-[32px] rounded-full p-[3px] transition ${
          actif ? 'bg-lime-500' : 'bg-ink-700'
        }`}
      >
        <span
          className={`block w-[26px] h-[26px] rounded-full bg-white transition-transform ${
            actif ? 'translate-x-[20px]' : ''
          }`}
        />
      </button>
    </div>
  )
}

export default function Reglages({ nav }: { nav: Navigation }) {
  const reglages = useReglages()
  const repos = useRepos()
  const [confirmation, setConfirmation] = useState(false)
  const persos = Object.keys(repos)

  return (
    <div className="pb-6">
      <EntetePage titre="Réglages" sous={`Antho Fit · données v${VERSION_DONNEES}`} onRetour={nav.fermer} />

      <div className="px-4 pt-4 space-y-5">
        <section>
          <Titre>Objectifs du jour</Titre>
          <Carte className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[14px]">Calories</p>
                <p className="text-[12px] text-white/40">Objectif quotidien</p>
              </div>
              <Compteur
                valeur={reglages.objectifKcal}
                pas={50}
                min={1200}
                max={5000}
                suffixe="kcal"
                onChange={(v) => storeReglages.set((p) => ({ ...p, objectifKcal: v }))}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[14px]">Protéines</p>
                <p className="text-[12px] text-white/40">Environ 1,6 à 2,2 g par kg de poids</p>
              </div>
              <Compteur
                valeur={reglages.objectifProt}
                pas={5}
                min={60}
                max={300}
                suffixe="g"
                onChange={(v) => storeReglages.set((p) => ({ ...p, objectifProt: v }))}
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
              <div>
                <p className="font-semibold text-[14px]">Poids de corps</p>
                <p className="text-[12px] text-white/40">Sert de repère pour les protéines</p>
              </div>
              <Compteur
                valeur={reglages.poidsCorps ?? 75}
                pas={1}
                min={35}
                max={200}
                suffixe="kg"
                onChange={(v) => storeReglages.set((p) => ({ ...p, poidsCorps: v }))}
              />
            </div>
          </Carte>
        </section>

        <section>
          <Titre>Chronomètre de repos</Titre>
          <Carte className="p-4 space-y-3">
            <Interrupteur
              actif={reglages.sonRepos}
              onChange={(v) => storeReglages.set((p) => ({ ...p, sonRepos: v }))}
              libelle="Bip de fin de repos"
              description="Trois bips courts quand le repos est écoulé."
            />
            <Interrupteur
              actif={reglages.vibrationRepos}
              onChange={(v) => storeReglages.set((p) => ({ ...p, vibrationRepos: v }))}
              libelle="Vibration"
              description="Si le téléphone le permet (Android, navigateurs compatibles)."
            />
            <Bouton variante="secondaire" className="w-full" onClick={bip}>
              Tester le signal
            </Bouton>
          </Carte>
        </section>

        <section>
          <Titre>Les règles</Titre>
          <Carte className="p-4 space-y-2.5">
            {REGLES.map((regle) => (
              <p key={regle.titre} className="text-[12.5px] leading-relaxed text-white/60">
                <span className="font-bold text-lime-400">{regle.titre}.</span> {regle.texte}
              </p>
            ))}
          </Carte>
        </section>

        {persos.length > 0 && (
          <section>
            <Titre>Repos personnalisés ({persos.length})</Titre>
            <Carte className="divide-y divide-white/5">
              {persos.map((cle) => {
                const [jourId, exerciceId] = cle.split(':')
                const jour = JOURS_PAR_ID[jourId]
                if (!jour || !exerciceId) return null
                return (
                  <div key={cle} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] truncate">{exercice(exerciceId).nom}</p>
                      <p className="text-[11.5px] text-white/35">{jour.jour}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold tabular-nums text-[13.5px]">
                        {formaterDuree(repos[cle])}
                      </span>
                      <button
                        type="button"
                        onClick={() => reinitialiserRepos(jourId, exerciceId)}
                        className="text-[12px] text-lime-500 font-semibold"
                      >
                        programme
                      </button>
                    </div>
                  </div>
                )
              })}
            </Carte>
          </section>
        )}

        <section>
          <Titre>Zone à risque</Titre>
          <Carte className="p-4">
            {confirmation ? (
              <div className="space-y-3">
                <p className="text-[13px] text-white/70 leading-relaxed">
                  Tout effacer : séances, records, repas, objectifs et temps de repos personnalisés.
                  C’est définitif. Pense à exporter depuis l’onglet Progrès avant.
                </p>
                <div className="flex gap-2">
                  <Bouton variante="fantome" className="flex-1" onClick={() => setConfirmation(false)}>
                    Annuler
                  </Bouton>
                  <Bouton
                    variante="danger"
                    className="flex-1"
                    onClick={() => {
                      effacerTout()
                      setConfirmation(false)
                      nav.fermer()
                    }}
                  >
                    Effacer
                  </Bouton>
                </div>
              </div>
            ) : (
              <Bouton variante="danger" className="w-full" onClick={() => setConfirmation(true)}>
                Effacer toutes mes données
              </Bouton>
            )}
          </Carte>
        </section>
      </div>
    </div>
  )
}
