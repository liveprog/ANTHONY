import { useSyncExternalStore } from 'react'

export const VERSION_DONNEES = 1
const PREFIXE = `anthofit.v${VERSION_DONNEES}`

export const CLES = {
  repos: `${PREFIXE}.repos`,
  seances: `${PREFIXE}.seances`,
  seanceEnCours: `${PREFIXE}.seanceEnCours`,
  repas: `${PREFIXE}.repas`,
  reglages: `${PREFIXE}.reglages`,
} as const

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle)
    if (!brut) return defaut
    return JSON.parse(brut) as T
  } catch {
    return defaut
  }
}

/** Vrai dès qu'une écriture locale a échoué : le navigateur ne garde rien. */
let stockageLocalCasse = false
const temoinsStockage = new Set<(casse: boolean) => void>()

export function stockageLocalFiable(): boolean {
  return !stockageLocalCasse
}

export function surEtatStockageLocal(fn: (casse: boolean) => void): () => void {
  temoinsStockage.add(fn)
  return () => temoinsStockage.delete(fn)
}

function signalerEchecLocal() {
  if (stockageLocalCasse) return
  stockageLocalCasse = true
  temoinsStockage.forEach((fn) => fn(true))
}

function ecrire(cle: string, valeur: unknown) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    // Quota plein, stockage bloqué ou iframe cloisonnée : rien n'est gardé ici.
    // On le signale au lieu de laisser croire que c'est enregistré.
    signalerEchecLocal()
  }
}

export type Store<T> = {
  readonly cle: string
  get(): T
  set(maj: T | ((precedent: T) => T)): void
  subscribe(ecouteur: () => void): () => void
}

export function creerStore<T>(cle: string, defaut: T): Store<T> {
  let valeur = lire<T>(cle, defaut)
  const abonnes = new Set<() => void>()
  return {
    cle,
    get: () => valeur,
    set(maj) {
      const suivante =
        typeof maj === 'function' ? (maj as (p: T) => T)(valeur) : maj
      if (suivante === valeur) return
      valeur = suivante
      ecrire(cle, valeur)
      abonnes.forEach((fn) => fn())
    },
    subscribe(ecouteur) {
      abonnes.add(ecouteur)
      return () => abonnes.delete(ecouteur)
    },
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

/** Recharge un store depuis le localStorage (après un import JSON). */
export function rechargerStore<T>(store: Store<T>, valeur: T) {
  store.set(valeur)
}
