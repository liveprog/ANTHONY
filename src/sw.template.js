/* Service worker d'Antho Fit : toute l'app est mise en cache à l'installation,
   elle s'ouvre ensuite sans connexion. La version et la liste des fichiers ci-dessous
   sont écrites à chaque build par vite.config.ts. */
const CACHE = 'antho-fit-__VERSION__'
const FICHIERS = __FICHIERS__

self.addEventListener('install', (evenement) => {
  evenement.waitUntil(
    caches
      .open(CACHE)
      // « reload » : on récupère les fichiers frais du serveur, pas une copie du cache HTTP.
      .then((cache) => cache.addAll(FICHIERS.map((f) => new Request(f, { cache: 'reload' })))),
  )
  // Pas de skipWaiting : une nouvelle version attend que l'app soit fermée, pour ne jamais
  // mélanger l'ancien code et les nouveaux fichiers (les noms de fichiers sont stables).
})

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    caches
      .keys()
      .then((cles) =>
        Promise.all(cles.filter((c) => c.startsWith('antho-fit-') && c !== CACHE).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  )
})

// Les serveurs ajoutent souvent « Vary: Origin » ou « Vary: Accept-Encoding » : le cache comparerait
// alors des en-têtes de requête qui diffèrent entre la mise en cache et le chargement d'un module,
// et ne trouverait rien. Tous les fichiers sont à nous et versionnés : on ignore Vary.
const OPTIONS_CACHE = { ignoreSearch: true, ignoreVary: true }

self.addEventListener('fetch', (evenement) => {
  const requete = evenement.request
  if (requete.method !== 'GET') return
  const url = new URL(requete.url)
  if (url.origin !== self.location.origin) return

  // Ouverture de la page : toujours la coque de l'app, depuis le cache.
  if (requete.mode === 'navigate') {
    evenement.respondWith(
      caches.match('./index.html', OPTIONS_CACHE).then((reponse) => reponse || fetch(requete)),
    )
    return
  }

  evenement.respondWith(
    caches.match(requete, OPTIONS_CACHE).then(
      (reponse) =>
        reponse ||
        fetch(requete).then((reseau) => {
          if (reseau.ok) {
            const copie = reseau.clone()
            caches.open(CACHE).then((cache) => cache.put(requete, copie))
          }
          return reseau
        }),
    ),
  )
})
