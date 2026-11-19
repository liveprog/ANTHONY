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
  if (!etat.localFiable) {
    return 'Ce navigateur refuse d’enregistrer : tes données ne survivront pas à la fermeture de la page. Exporte-les depuis Progrès.'
  }
  if (etat.phase === 'erreur') {
    return etat.message ?? 'La sauvegarde en ligne a échoué.'
  }

  if (!etat.enLigne) {
    const debut = 'Hors ligne : l’app fonctionne normalement.'
    if (etat.mode === 'cloud') {
      return etat.enAttente > 0
        ? `${debut} Tes dernières modifications sont gardées ici et partiront toutes seules au retour du réseau. Ne vide pas le navigateur d’ici là.`
        : `${debut} Tout est déjà enregistré en ligne.`
    }
    return `${debut} Tes données sont enregistrées sur cet appareil. Exporte-les régulièrement depuis Progrès.`
  }

  if (etat.mode === 'cloud') {
    if (etat.enEcriture) return 'Enregistrement en cours…'
    if (etat.enAttente > 0) return 'En attente d’envoi vers ta sauvegarde en ligne…'
    return 'Enregistré en ligne sur ton compte Claude : tes données reviennent même si tu fermes la page ou changes d’appareil.'
  }

  if (etat.autonome) {
    return 'Mode hors ligne : tes données sont enregistrées sur cet appareil. Exporte-les régulièrement depuis Progrès pour en garder une copie.'
  }
  return (
    etat.message ??
    'Enregistré dans ce navigateur uniquement. Ouvre l’app depuis ton compte Claude pour une sauvegarde en ligne, ou exporte tes données depuis Progrès.'
  )
}

/** Libellé court : où sont les données en ce moment. */
export function libelleMode(etat: EtatSauvegarde): string {
  if (!etat.enLigne) return 'Hors ligne'
  return etat.mode === 'cloud' ? 'En ligne' : 'Local'
}

/** Avertissement visible quand rien ne garantit la conservation des données, ou qu'on est hors ligne. */
export default function BandeauSauvegarde() {
  const etat = useEtatSauvegarde()
  if (etat.phase === 'chargement' || etat.phase === 'demarrage') return null

  const grave = !etat.localFiable || etat.phase === 'erreur'
  const horsLigneRassurant = !etat.enLigne && etat.mode === 'cloud' && etat.enAttente === 0
  const fragile = grave || etat.mode === 'local' || !etat.enLigne || etat.enAttente > 0
  if (!fragile) return null

  const teinte = grave
    ? 'border-red-500/40 bg-red-500/[0.07]'
    : horsLigneRassurant
      ? 'border-white/10 bg-white/[0.03]'
      : 'border-amber-400/30 bg-amber-400/[0.06]'
  const texte = grave ? 'text-red-100/90' : horsLigneRassurant ? 'text-white/60' : 'text-amber-100/85'

  return (
    <Carte className={`p-3.5 ${teinte}`}>
      <div className="flex gap-2.5">
        <span className="shrink-0 text-base leading-none mt-0.5">
          {grave ? '⚠️' : !etat.enLigne ? '📡' : 'ℹ️'}
        </span>
        <p className={`text-[12.5px] leading-relaxed ${texte}`}>{texteSauvegarde(etat)}</p>
      </div>
    </Carte>
  )
}
