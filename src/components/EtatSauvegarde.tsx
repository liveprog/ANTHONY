import { useSyncExternalStore } from 'react'
import { etatSauvegarde, surEtatSauvegarde, type EtatSauvegarde } from '../lib/sync'
import { Carte } from './Ui'

export function useEtatSauvegarde(): EtatSauvegarde {
  return useSyncExternalStore(surEtatSauvegarde, etatSauvegarde, etatSauvegarde)
}

export function texteSauvegarde(etat: EtatSauvegarde): string {
  if (etat.phase === 'chargement' || etat.phase === 'demarrage') {
    return 'Chargement de tes données…'
  }
  if (etat.phase === 'erreur') {
    return etat.message ?? 'La sauvegarde en ligne a échoué.'
  }
  if (etat.mode === 'cloud') {
    return etat.enEcriture
      ? 'Enregistrement en cours…'
      : 'Enregistré en ligne sur ton compte Claude : tes données reviennent même si tu fermes la page ou changes d’appareil.'
  }
  if (!etat.localFiable) {
    return 'Ce navigateur refuse d’enregistrer : tes données ne survivront pas à la fermeture de la page. Exporte-les depuis Progrès.'
  }
  return (
    etat.message ??
    'Enregistré dans ce navigateur uniquement. Ouvre l’app depuis ton compte Claude pour une sauvegarde en ligne, ou exporte tes données depuis Progrès.'
  )
}

/** Avertissement visible quand rien ne garantit la conservation des données. */
export default function BandeauSauvegarde() {
  const etat = useEtatSauvegarde()
  const fragile = etat.mode === 'local' || etat.phase === 'erreur' || !etat.localFiable
  if (!fragile || etat.phase === 'chargement' || etat.phase === 'demarrage') return null

  const grave = !etat.localFiable || etat.phase === 'erreur'

  return (
    <Carte
      className={`p-3.5 ${grave ? 'border-red-500/40 bg-red-500/[0.07]' : 'border-amber-400/30 bg-amber-400/[0.06]'}`}
    >
      <div className="flex gap-2.5">
        <span className="shrink-0 text-base leading-none mt-0.5">{grave ? '⚠️' : 'ℹ️'}</span>
        <p className={`text-[12.5px] leading-relaxed ${grave ? 'text-red-100/90' : 'text-amber-100/85'}`}>
          {texteSauvegarde(etat)}
        </p>
      </div>
    </Carte>
  )
}
