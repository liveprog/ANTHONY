/**
 * Mise en cache de l'app pour l'ouvrir sans connexion (service worker).
 *
 * Désactivée dans l'artefact claude.ai : la page y est servie dans un cadre et se republie à
 * chaque version, un cache permanent y afficherait d'anciennes versions. Elle ne s'active que
 * quand l'app est ouverte seule : hébergée en https (ou localhost) et installée sur l'écran
 * d'accueil. Un fichier ouvert depuis le disque n'en a pas besoin : tout est déjà dedans.
 */
export function enregistrerHorsLigne() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  if (window.self !== window.top) return
  if ((window as Window & { claude?: unknown }).claude) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* contexte non sécurisé ou service worker bloqué : l'app marche quand même en ligne */
    })
  })
}
