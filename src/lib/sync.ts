import { storeRepas, storeReglages, storeRepos, storeSeanceEnCours, storeSeances } from './donnees'
import { VERSION_DONNEES, stockageLocalFiable, surEtatStockageLocal } from './stockage'
import type { Reglages, Repas, SeanceLog } from './types'

/**
 * Sauvegarde durable.
 *
 * Le localStorage ne suffit pas : dans une page publiée, il peut être cloisonné
 * ou vidé en quittant la page, et l'écriture échoue en silence. Quand la page
 * tourne dans un artefact claude.ai, on écrit donc dans la base de l'artefact
 * (capacité « db »), dans le sous-arbre privé du compte qui regarde la page.
 * Le localStorage ne sert plus que de cache immédiat et de secours hors ligne.
 */

export type ModeSauvegarde = 'inconnu' | 'cloud' | 'local'
export type PhaseSauvegarde = 'demarrage' | 'chargement' | 'pret' | 'erreur'

export type EtatSauvegarde = {
  mode: ModeSauvegarde
  phase: PhaseSauvegarde
  message?: string
  derniereEcriture?: number
  enEcriture: boolean
  localFiable: boolean
}

let etat: EtatSauvegarde = {
  mode: 'inconnu',
  phase: 'demarrage',
  enEcriture: false,
  localFiable: stockageLocalFiable(),
}

const abonnes = new Set<() => void>()

export function etatSauvegarde(): EtatSauvegarde {
  return etat
}

export function surEtatSauvegarde(fn: () => void): () => void {
  abonnes.add(fn)
  return () => abonnes.delete(fn)
}

function majEtat(patch: Partial<EtatSauvegarde>) {
  etat = { ...etat, ...patch }
  abonnes.forEach((fn) => fn())
}

surEtatStockageLocal(() => majEtat({ localFiable: stockageLocalFiable() }))

/* --- Types minimaux de la capacité « db » (contrat 0.2.94) --- */

type Snapshot = { id: string; exists: boolean; data(): Record<string, unknown> | undefined }
type QuerySnapshot = { docs: Snapshot[] }
type DocRef = {
  get(): Promise<Snapshot>
  set(data: Record<string, unknown>): Promise<void>
  delete(): Promise<void>
  collection(path: string): CollRef
}
type CollRef = { doc(id?: string): DocRef; get(): Promise<QuerySnapshot> }
type Db = { doc(path: string): DocRef; collection(path: string): CollRef }
type Utilisateur = { id(): Promise<string | null> }
type Claude = { use(nom: string): Promise<unknown> }

declare global {
  interface Window {
    claude?: Claude
  }
}

type Enveloppe<T> = T & { majLe: number }

let base: DocRef | null = null
let pret = false

/** Dernier état connu côté serveur, pour n'écrire que ce qui a changé. */
let distantSeances = new Map<string, string>()
let distantRepas = new Map<string, string>()
let distantGeneral = ''

const maintenant = () => Date.now()

/** Empreinte courte d'un élément, pour n'écrire que ce qui a changé. */
function signatureDe(valeur: unknown): string {
  const texte = JSON.stringify(valeur) ?? ''
  let h = 0x811c9dc5
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return `${texte.length}:${(h >>> 0).toString(36)}`
}

function fusionnerParId<T extends { id: string }>(
  locaux: T[],
  distants: Enveloppe<T>[],
): { fusion: T[]; signatures: Map<string, string> } {
  const signatures = new Map<string, string>()
  const parId = new Map<string, T>()

  for (const d of distants) {
    const { majLe: _majLe, ...reste } = d
    const element = reste as unknown as T
    parId.set(d.id, element)
    signatures.set(d.id, signatureDe(element))
  }
  // Un élément présent seulement en local (créé hors ligne) est conservé.
  for (const l of locaux) {
    if (!parId.has(l.id)) parId.set(l.id, l)
  }
  return { fusion: [...parId.values()], signatures }
}

async function charger(db: Db, uid: string) {
  base = db.doc(`data/users/${uid}/antho-fit`)
  majEtat({ mode: 'cloud', phase: 'chargement' })

  const [general, seancesSnap, repasSnap] = await Promise.all([
    base.get(),
    base.collection('seances').get(),
    base.collection('repas').get(),
  ])

  if (general.exists) {
    const corps = general.data() ?? {}
    const repos = corps.repos as Record<string, number> | undefined
    const reglages = corps.reglages as Reglages | undefined
    const seanceEnCours = corps.seanceEnCours as SeanceLog | null | undefined
    if (repos && typeof repos === 'object') {
      storeRepos.set({ ...repos, ...storeRepos.get() })
    }
    if (reglages && typeof reglages === 'object') {
      storeReglages.set({ ...reglages, ...storeReglages.get() })
    }
    // Une séance commencée sur cet appareil prime sur celle de la base.
    if (seanceEnCours && storeSeanceEnCours.get() === null) {
      storeSeanceEnCours.set(seanceEnCours)
    }
  }

  const seancesDistantes = seancesSnap.docs
    .map((d) => d.data() as unknown as Enveloppe<SeanceLog> | undefined)
    .filter((d): d is Enveloppe<SeanceLog> => !!d && typeof d.id === 'string')
  const repasDistants = repasSnap.docs
    .map((d) => d.data() as unknown as Enveloppe<Repas> | undefined)
    .filter((d): d is Enveloppe<Repas> => !!d && typeof d.id === 'string')

  const s = fusionnerParId(storeSeances.get(), seancesDistantes)
  const r = fusionnerParId(storeRepas.get(), repasDistants)
  distantSeances = s.signatures
  distantRepas = r.signatures
  storeSeances.set(s.fusion)
  storeRepas.set(r.fusion)

  distantGeneral = signatureGenerale()
  pret = true
  majEtat({ phase: 'pret', message: undefined })

  // Ce qui n'existait qu'en local part aussitôt vers la base.
  planifierEcriture()
}

function signatureGenerale(): string {
  return JSON.stringify({
    repos: storeRepos.get(),
    reglages: storeReglages.get(),
    seanceEnCours: storeSeanceEnCours.get(),
  })
}

/* --- Écritures : une à la fois, groupées après une pause --- */

let minuteur: number | null = null
let enCours: Promise<void> = Promise.resolve()

function planifierEcriture() {
  if (!pret || !base) return
  if (minuteur !== null) window.clearTimeout(minuteur)
  minuteur = window.setTimeout(() => {
    minuteur = null
    enCours = enCours.then(ecrireDifferences).catch(() => undefined)
  }, 400)
}

async function ecrireDifferences() {
  if (!base) return
  const racine = base
  majEtat({ enEcriture: true })
  let erreur: string | undefined

  try {
    const signature = signatureGenerale()
    if (signature !== distantGeneral) {
      await racine.set({
        version: VERSION_DONNEES,
        majLe: maintenant(),
        repos: storeRepos.get(),
        reglages: storeReglages.get(),
        seanceEnCours: storeSeanceEnCours.get(),
      })
      distantGeneral = signature
    }

    erreur = await synchroniserCollection(
      racine.collection('seances'),
      storeSeances.get(),
      distantSeances,
      (s) => s,
    )

    const erreurRepas = await synchroniserCollection(
      racine.collection('repas'),
      storeRepas.get(),
      distantRepas,
      (r) => r,
      // Si la base refuse la photo (place prise), on enregistre le repas sans elle.
      (r) => ({ ...r, photo: undefined }),
    )
    erreur = erreur ?? erreurRepas
  } catch (e) {
    erreur = messageErreur(e)
  }

  majEtat({
    enEcriture: false,
    derniereEcriture: erreur ? etat.derniereEcriture : maintenant(),
    phase: erreur ? 'erreur' : 'pret',
    message: erreur,
  })
}

async function synchroniserCollection<T extends { id: string }>(
  collection: CollRef,
  elements: T[],
  signatures: Map<string, string>,
  corps: (element: T) => Record<string, unknown>,
  secours?: (element: T) => Record<string, unknown>,
): Promise<string | undefined> {
  let erreur: string | undefined
  const vus = new Set<string>()

  for (const element of elements) {
    vus.add(element.id)
    const signature = signatureDe(element)
    if (signatures.get(element.id) === signature) continue
    try {
      await collection.doc(element.id).set({ ...corps(element), majLe: maintenant() })
      signatures.set(element.id, signature)
    } catch (e) {
      if (secours) {
        try {
          await collection.doc(element.id).set({ ...secours(element), majLe: maintenant() })
          signatures.set(element.id, signature)
          continue
        } catch {
          /* on remonte l'erreur d'origine */
        }
      }
      erreur = messageErreur(e)
    }
  }

  for (const id of [...signatures.keys()]) {
    if (vus.has(id)) continue
    try {
      await collection.doc(id).delete()
      signatures.delete(id)
    } catch (e) {
      erreur = erreur ?? messageErreur(e)
    }
  }

  return erreur
}

function messageErreur(e: unknown): string {
  const code = (e as { code?: string } | null)?.code
  switch (code) {
    case 'quota_exceeded':
      return 'Espace de sauvegarde plein. Exporte puis supprime d’anciens repas avec photo.'
    case 'resource_exhausted':
      return 'Trop d’écritures d’un coup. La sauvegarde reprend dans un instant.'
    case 'revoked':
    case 'not_granted':
      return 'Sauvegarde en ligne refusée pour cette page. Pense à exporter tes données.'
    case 'invalid_argument':
      return 'Sauvegarde en ligne impossible avec ce compte (droits en lecture seule).'
    default:
      return 'Sauvegarde en ligne indisponible pour le moment.'
  }
}

/** À appeler une fois au démarrage de l'app. */
export async function demarrerSauvegarde() {
  if (etat.phase !== 'demarrage') return

  const claude = typeof window !== 'undefined' ? window.claude : undefined
  if (!claude?.use) {
    majEtat({ mode: 'local', phase: 'pret' })
    return
  }

  majEtat({ phase: 'chargement' })
  try {
    const [db, utilisateur] = (await Promise.all([claude.use('db'), claude.use('user')])) as [
      Db | null,
      Utilisateur | null,
    ]
    const uid = utilisateur ? await utilisateur.id() : null
    if (!db || !uid) {
      majEtat({
        mode: 'local',
        phase: 'pret',
        message: 'Connecte-toi à claude.ai pour que tes données soient enregistrées en ligne.',
      })
      return
    }
    await charger(db, uid)
  } catch (e) {
    majEtat({ mode: 'local', phase: 'erreur', message: messageErreur(e) })
  }

  // Toute modification d'un store part ensuite vers la base.
  for (const store of [storeSeances, storeRepas, storeRepos, storeReglages, storeSeanceEnCours]) {
    store.subscribe(planifierEcriture)
  }

  // Quitter la page ou basculer vers une autre app déclenche l'écriture tout de suite,
  // sans attendre la temporisation : c'est le moment où une séance se perdait.
  const vider = () => {
    if (minuteur === null) return
    window.clearTimeout(minuteur)
    minuteur = null
    enCours = enCours.then(ecrireDifferences).catch(() => undefined)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') vider()
  })
  window.addEventListener('pagehide', vider)
  window.addEventListener('blur', vider)
}

/** Force une écriture immédiate (bouton « sauvegarder maintenant »). */
export async function sauvegarderMaintenant() {
  if (!pret || !base) return
  if (minuteur !== null) {
    window.clearTimeout(minuteur)
    minuteur = null
  }
  enCours = enCours.then(ecrireDifferences)
  await enCours
}
