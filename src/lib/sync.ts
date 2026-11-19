import { storeRepas, storeReglages, storeRepos, storeSeanceEnCours, storeSeances } from './donnees'
import { VERSION_DONNEES, stockageLocalFiable, surEtatStockageLocal } from './stockage'
import type { Reglages, Repas, SeanceLog } from './types'

/**
 * Sauvegarde durable, tolérante au réseau.
 *
 * L'app lit et écrit toujours d'abord dans le localStorage : elle marche donc avec ou sans
 * connexion. Quand la page tourne dans un artefact claude.ai, elle recopie en plus ses données
 * dans la base de l'artefact (capacité « db »), dans le sous-arbre privé du compte qui regarde.
 * Réseau coupé : rien n'est perdu côté app, les modifications sont comptées « en attente » et
 * partent toutes seules au retour du réseau.
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
  /** Le navigateur se sait connecté (indice : « faux » est fiable, « vrai » ne l'est pas). */
  enLigne: boolean
  /** Éléments modifiés ici et pas encore envoyés dans la base en ligne. */
  enAttente: number
  /** Pas de base en ligne possible : app ouverte seule (installée ou fichier), hors artefact. */
  autonome: boolean
}

const enLigneNavigateur = () => typeof navigator === 'undefined' || navigator.onLine !== false

let etat: EtatSauvegarde = {
  mode: 'inconnu',
  phase: 'demarrage',
  enEcriture: false,
  localFiable: stockageLocalFiable(),
  enLigne: enLigneNavigateur(),
  enAttente: 0,
  autonome: false,
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

/** Une requête qui ne répond pas ne doit pas bloquer la file d'écritures : réseau coupé ou très lent. */
function avecDelai<T>(promesse: Promise<T>, ms = 12000): Promise<T> {
  return new Promise<T>((resoudre, rejeter) => {
    const minuteur = window.setTimeout(() => rejeter({ code: 'timeout' }), ms)
    promesse.then(
      (v) => {
        window.clearTimeout(minuteur)
        resoudre(v)
      },
      (e) => {
        window.clearTimeout(minuteur)
        rejeter(e)
      },
    )
  })
}

const codeErreur = (e: unknown): string | undefined => (e as { code?: string } | null)?.code
const erreurReseau = (e: unknown) => ['timeout', 'unavailable'].includes(codeErreur(e) ?? '')

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

function signatureGenerale(): string {
  return JSON.stringify({
    repos: storeRepos.get(),
    reglages: storeReglages.get(),
    seanceEnCours: storeSeanceEnCours.get(),
  })
}

function compterEnAttente(): number {
  if (!pret) return 0
  let n = signatureGenerale() !== distantGeneral ? 1 : 0
  const compter = (elements: { id: string }[], signatures: Map<string, string>) => {
    const ids = new Set(elements.map((e) => e.id))
    n += elements.filter((e) => signatures.get(e.id) !== signatureDe(e)).length
    n += [...signatures.keys()].filter((id) => !ids.has(id)).length
  }
  compter(storeSeances.get(), distantSeances)
  compter(storeRepas.get(), distantRepas)
  return n
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
  const racine = db.doc(`data/users/${uid}/antho-fit`)

  const [general, seancesSnap, repasSnap] = await avecDelai(
    Promise.all([racine.get(), racine.collection('seances').get(), racine.collection('repas').get()]),
    15000,
  )

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
  base = racine
  pret = true
  majEtat({ mode: 'cloud', phase: 'pret', message: undefined, autonome: false, enAttente: compterEnAttente() })

  // Ce qui n'existait qu'en local (créé hors ligne, par exemple) part aussitôt vers la base.
  planifierEcriture()
}

/* --- Écritures : une à la fois, groupées après une courte pause --- */

let minuteur: number | null = null
let enCours: Promise<void> = Promise.resolve()

function planifierEcriture(delai = 400) {
  if (!pret || !base) return
  majEtat({ enAttente: compterEnAttente() })
  if (minuteur !== null) window.clearTimeout(minuteur)
  minuteur = window.setTimeout(() => {
    minuteur = null
    enCours = enCours.then(ecrireDifferences).catch(() => undefined)
  }, delai)
}

async function ecrireDifferences() {
  if (!base) return
  // Réseau coupé : inutile d'essayer, on garde tout en attente et on reprend au retour.
  if (!enLigneNavigateur()) {
    majEtat({ enLigne: false, enAttente: compterEnAttente() })
    return
  }
  const racine = base
  majEtat({ enLigne: true, enEcriture: true })
  let erreur: unknown

  try {
    const signature = signatureGenerale()
    if (signature !== distantGeneral) {
      await avecDelai(
        racine.set({
          version: VERSION_DONNEES,
          majLe: maintenant(),
          repos: storeRepos.get(),
          reglages: storeReglages.get(),
          seanceEnCours: storeSeanceEnCours.get(),
        }),
      )
      distantGeneral = signature
    }

    erreur = await synchroniserCollection(
      racine.collection('seances'),
      storeSeances.get(),
      distantSeances,
      (s) => s,
    )

    if (!erreur || !erreurReseau(erreur)) {
      const erreurRepas = await synchroniserCollection(
        racine.collection('repas'),
        storeRepas.get(),
        distantRepas,
        (r) => r,
        // Si la base refuse la photo (place prise), on enregistre le repas sans elle.
        (r) => ({ ...r, photo: undefined }),
      )
      erreur = erreur ?? erreurRepas
    }
  } catch (e) {
    erreur = e
  }

  // Une panne de réseau n'est pas une erreur de sauvegarde : c'est « hors ligne, en attente ».
  const coupure = erreur !== undefined && erreurReseau(erreur) && !enLigneNavigateur()
  majEtat({
    enEcriture: false,
    enLigne: enLigneNavigateur(),
    enAttente: compterEnAttente(),
    derniereEcriture: erreur ? etat.derniereEcriture : maintenant(),
    phase: erreur && !coupure ? 'erreur' : 'pret',
    message: erreur && !coupure ? messageErreur(erreur) : undefined,
  })
}

async function synchroniserCollection<T extends { id: string }>(
  collection: CollRef,
  elements: T[],
  signatures: Map<string, string>,
  corps: (element: T) => Record<string, unknown>,
  secours?: (element: T) => Record<string, unknown>,
): Promise<unknown> {
  let erreur: unknown
  const vus = new Set<string>()

  for (const element of elements) {
    vus.add(element.id)
    const signature = signatureDe(element)
    if (signatures.get(element.id) === signature) continue
    try {
      await avecDelai(collection.doc(element.id).set({ ...corps(element), majLe: maintenant() }))
      signatures.set(element.id, signature)
    } catch (e) {
      if (erreurReseau(e)) return e // réseau absent : on s'arrête là, on réessaiera
      if (secours) {
        try {
          await avecDelai(collection.doc(element.id).set({ ...secours(element), majLe: maintenant() }))
          signatures.set(element.id, signature)
          continue
        } catch {
          /* on remonte l'erreur d'origine */
        }
      }
      erreur = e
    }
  }

  for (const id of [...signatures.keys()]) {
    if (vus.has(id)) continue
    try {
      await avecDelai(collection.doc(id).delete())
      signatures.delete(id)
    } catch (e) {
      if (erreurReseau(e)) return e
      erreur = erreur ?? e
    }
  }

  return erreur
}

function messageErreur(e: unknown): string {
  switch (codeErreur(e)) {
    case 'quota_exceeded':
      return 'Espace de sauvegarde plein. Exporte puis supprime d’anciens repas avec photo.'
    case 'resource_exhausted':
      return 'Trop d’écritures d’un coup. La sauvegarde reprend dans un instant.'
    case 'revoked':
    case 'not_granted':
      return 'Sauvegarde en ligne refusée pour cette page. Pense à exporter tes données.'
    case 'invalid_argument':
      return 'Sauvegarde en ligne impossible avec ce compte (droits en lecture seule).'
    case 'timeout':
      return 'Réseau trop lent : la sauvegarde reprend toute seule.'
    default:
      return 'Sauvegarde en ligne indisponible pour le moment. Elle reprend toute seule.'
  }
}

/* --- Démarrage et reprise --- */

let initEnCours = false

async function tenterInit() {
  if (pret || initEnCours) return
  const claude = typeof window !== 'undefined' ? window.claude : undefined

  // Pas de base en ligne possible (app installée ou fichier ouvert seul) : mode local, c'est normal.
  if (!claude?.use) {
    majEtat({ mode: 'local', phase: 'pret', autonome: true, message: undefined })
    return
  }

  initEnCours = true
  if (etat.phase === 'demarrage') majEtat({ phase: 'chargement' })
  try {
    const [db, utilisateur] = (await avecDelai(
      Promise.all([claude.use('db'), claude.use('user')]),
      15000,
    )) as [Db | null, Utilisateur | null]
    const uid = utilisateur ? await avecDelai(utilisateur.id(), 8000) : null
    if (!db || !uid) {
      majEtat({
        mode: 'local',
        phase: 'pret',
        autonome: false,
        message: enLigneNavigateur()
          ? 'Connecte-toi à claude.ai pour que tes données soient enregistrées en ligne.'
          : undefined,
      })
      return
    }
    await charger(db, uid)
  } catch (e) {
    // Hors ligne au démarrage : l'app marche sur ses données locales, on réessaiera au retour du réseau.
    const hors = !enLigneNavigateur()
    majEtat({
      mode: 'local',
      phase: hors ? 'pret' : 'erreur',
      autonome: false,
      message: hors ? undefined : messageErreur(e),
    })
  } finally {
    initEnCours = false
  }
}

/** Au retour du réseau, au retour au premier plan, et toutes les 20 s : reprendre ce qui attend. */
function reprendre() {
  majEtat({ enLigne: enLigneNavigateur() })
  if (!enLigneNavigateur()) return
  if (!pret) {
    if (etat.mode !== 'inconnu' && !etat.autonome) void tenterInit()
    return
  }
  if (compterEnAttente() > 0 && !etat.enEcriture) planifierEcriture(0)
}

let ecouteursPoses = false

function poserEcouteurs() {
  if (ecouteursPoses) return
  ecouteursPoses = true

  // Toute modification d'un store part ensuite vers la base (sans effet tant qu'elle n'est pas prête).
  for (const store of [storeSeances, storeRepas, storeRepos, storeReglages, storeSeanceEnCours]) {
    store.subscribe(() => planifierEcriture())
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
    else reprendre()
  })
  window.addEventListener('pagehide', vider)
  window.addEventListener('blur', vider)
  window.addEventListener('online', reprendre)
  window.addEventListener('offline', () => majEtat({ enLigne: false, enAttente: compterEnAttente() }))
  window.setInterval(() => {
    if (document.visibilityState === 'visible') reprendre()
  }, 20000)
}

/** À appeler une fois au démarrage de l'app. */
export async function demarrerSauvegarde() {
  poserEcouteurs()
  await tenterInit()
}

/** Force une écriture immédiate (bouton « Enregistrer maintenant »). */
export async function sauvegarderMaintenant() {
  if (!pret || !base) return
  if (minuteur !== null) {
    window.clearTimeout(minuteur)
    minuteur = null
  }
  enCours = enCours.then(ecrireDifferences)
  await enCours
}
