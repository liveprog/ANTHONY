import { CLES, creerStore, useStore } from './stockage'
import type { ExportDonnees, Reglages, Repas, SeanceLog, SerieLog } from './types'
import { EXERCICES, REPOS_PAR_DEFAUT, exercice } from '../data/exercices'

const REGLAGES_DEFAUT: Reglages = {
  objectifKcal: 2600,
  objectifProt: 170,
  sonRepos: true,
  vibrationRepos: true,
  poidsCorps: null,
}

export const storeRepos = creerStore<Record<string, number>>(CLES.repos, {})
export const storeSeances = creerStore<SeanceLog[]>(CLES.seances, [])
export const storeSeanceEnCours = creerStore<SeanceLog | null>(CLES.seanceEnCours, null)
export const storeRepas = creerStore<Repas[]>(CLES.repas, [])
export const storeReglages = creerStore<Reglages>(CLES.reglages, REGLAGES_DEFAUT)

export const useRepos = () => useStore(storeRepos)
export const useSeances = () => useStore(storeSeances)
export const useSeanceEnCours = () => useStore(storeSeanceEnCours)
export const useRepas = () => useStore(storeRepas)
export const useReglages = () => ({ ...REGLAGES_DEFAUT, ...useStore(storeReglages) })

/** Temps de repos effectif d'un exercice : réglage perso sinon valeur par défaut de sa catégorie. */
export function reposDe(exerciceId: string, repos: Record<string, number>): number {
  const perso = repos[exerciceId]
  if (typeof perso === 'number' && Number.isFinite(perso)) return perso
  return REPOS_PAR_DEFAUT[exercice(exerciceId).categorie]
}

export function changerRepos(exerciceId: string, delta: number) {
  storeRepos.set((precedent) => {
    const actuel = reposDe(exerciceId, precedent)
    const suivant = Math.min(300, Math.max(15, actuel + delta))
    return { ...precedent, [exerciceId]: suivant }
  })
}

export function reinitialiserRepos(exerciceId: string) {
  storeRepos.set((precedent) => {
    const copie = { ...precedent }
    delete copie[exerciceId]
    return copie
  })
}

export function identifiant(prefixe = 'id'): string {
  return `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function dateDuJour(d = new Date()): string {
  const mois = `${d.getMonth() + 1}`.padStart(2, '0')
  const jour = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

export function volumeSerie(s: SerieLog): number {
  return (s.poids || 0) * (s.reps || 0)
}

export function volumeSeance(seance: SeanceLog): number {
  return seance.exercices.reduce(
    (total, ex) =>
      total + ex.series.filter((s) => s.validee).reduce((t, s) => t + volumeSerie(s), 0),
    0,
  )
}

export function seriesValidees(seance: SeanceLog): number {
  return seance.exercices.reduce((n, ex) => n + ex.series.filter((s) => s.validee).length, 0)
}

export type PerfExercice = {
  date: string
  poidsMax: number
  volume: number
  repsMax: number
  meilleureSerie: SerieLog | null
  secondesMax: number
}

/** Historique d'un exercice, de la séance la plus récente à la plus ancienne. */
export function historiqueExercice(exerciceId: string, seances: SeanceLog[]): PerfExercice[] {
  return seances
    .filter((s) => s.terminee)
    .map((s): PerfExercice | null => {
      const ex = s.exercices.find((e) => e.exerciceId === exerciceId)
      if (!ex) return null
      const validees = ex.series.filter((v) => v.validee)
      if (validees.length === 0) return null
      const poidsMax = Math.max(...validees.map((v) => v.poids || 0))
      const repsMax = Math.max(...validees.map((v) => v.reps || 0))
      const secondesMax = Math.max(...validees.map((v) => v.secondes || 0))
      const volume = validees.reduce((t, v) => t + volumeSerie(v), 0)
      const meilleureSerie =
        validees.slice().sort((a, b) => volumeSerie(b) - volumeSerie(a))[0] ?? null
      return { date: s.date, poidsMax, volume, repsMax, meilleureSerie, secondesMax }
    })
    .filter((p): p is PerfExercice => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** Dernières séries enregistrées pour un exercice (pour le préremplissage). */
export function dernieresSeries(exerciceId: string, seances: SeanceLog[]): SerieLog[] | null {
  const terminees = seances
    .filter((s) => s.terminee)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  for (const s of terminees) {
    const ex = s.exercices.find((e) => e.exerciceId === exerciceId)
    const validees = ex?.series.filter((v) => v.validee) ?? []
    if (validees.length > 0) return validees
  }
  return null
}

export type Record1 = {
  exerciceId: string
  poidsMax: number
  volumeMax: number
  repsMax: number
  secondesMax: number
  date: string
}

export function records(seances: SeanceLog[]): Record1[] {
  return EXERCICES.map((ex) => {
    const histo = historiqueExercice(ex.id, seances)
    if (histo.length === 0) return null
    const poidsMax = Math.max(...histo.map((h) => h.poidsMax))
    const volumeMax = Math.max(...histo.map((h) => h.volume))
    const repsMax = Math.max(...histo.map((h) => h.repsMax))
    const secondesMax = Math.max(...histo.map((h) => h.secondesMax))
    const date = histo.find((h) => h.poidsMax === poidsMax)?.date ?? histo[0].date
    return { exerciceId: ex.id, poidsMax, volumeMax, repsMax, secondesMax, date }
  }).filter((r): r is Record1 => r !== null)
}

/** Records battus pendant une séance, comparés aux séances terminées précédentes. */
export function recordsBattus(
  seance: SeanceLog,
  seances: SeanceLog[],
): { exerciceId: string; type: 'poids' | 'reps' | 'volume' | 'temps'; avant: number; apres: number }[] {
  const precedentes = seances.filter((s) => s.terminee && s.id !== seance.id)
  const battus: {
    exerciceId: string
    type: 'poids' | 'reps' | 'volume' | 'temps'
    avant: number
    apres: number
  }[] = []

  for (const ex of seance.exercices) {
    const validees = ex.series.filter((s) => s.validee)
    if (validees.length === 0) continue
    const histo = historiqueExercice(ex.exerciceId, precedentes)
    const type = exercice(ex.exerciceId).saisie

    if (type === 'charge') {
      const avant = histo.length ? Math.max(...histo.map((h) => h.poidsMax)) : 0
      const apres = Math.max(...validees.map((s) => s.poids || 0))
      if (apres > avant && apres > 0) battus.push({ exerciceId: ex.exerciceId, type: 'poids', avant, apres })
      const avantVol = histo.length ? Math.max(...histo.map((h) => h.volume)) : 0
      const apresVol = validees.reduce((t, s) => t + volumeSerie(s), 0)
      if (apresVol > avantVol && apresVol > 0)
        battus.push({ exerciceId: ex.exerciceId, type: 'volume', avant: avantVol, apres: apresVol })
    } else if (type === 'reps') {
      const avant = histo.length ? Math.max(...histo.map((h) => h.repsMax)) : 0
      const apres = Math.max(...validees.map((s) => s.reps || 0))
      if (apres > avant && apres > 0) battus.push({ exerciceId: ex.exerciceId, type: 'reps', avant, apres })
    } else {
      const avant = histo.length ? Math.max(...histo.map((h) => h.secondesMax)) : 0
      const apres = Math.max(...validees.map((s) => s.secondes || 0))
      if (apres > avant && apres > 0) battus.push({ exerciceId: ex.exerciceId, type: 'temps', avant, apres })
    }
  }
  return battus
}

export function exporterDonnees(): ExportDonnees {
  return {
    app: 'antho-fit',
    version: 1,
    exporteLe: new Date().toISOString(),
    repos: storeRepos.get(),
    seances: storeSeances.get(),
    repas: storeRepas.get(),
    reglages: { ...REGLAGES_DEFAUT, ...storeReglages.get() },
  }
}

export function importerDonnees(brut: string): { ok: true; seances: number; repas: number } | { ok: false; erreur: string } {
  let data: unknown
  try {
    data = JSON.parse(brut)
  } catch {
    return { ok: false, erreur: 'Fichier illisible : ce n’est pas du JSON valide.' }
  }
  if (typeof data !== 'object' || data === null) {
    return { ok: false, erreur: 'Fichier invalide.' }
  }
  const d = data as Partial<ExportDonnees>
  if (d.app !== 'antho-fit') {
    return { ok: false, erreur: 'Ce fichier ne vient pas d’Antho Fit.' }
  }
  if (d.repos && typeof d.repos === 'object') storeRepos.set(d.repos)
  if (Array.isArray(d.seances)) storeSeances.set(d.seances)
  if (Array.isArray(d.repas)) storeRepas.set(d.repas)
  if (d.reglages && typeof d.reglages === 'object')
    storeReglages.set({ ...REGLAGES_DEFAUT, ...d.reglages })
  return { ok: true, seances: d.seances?.length ?? 0, repas: d.repas?.length ?? 0 }
}

export function effacerTout() {
  storeRepos.set({})
  storeSeances.set([])
  storeSeanceEnCours.set(null)
  storeRepas.set([])
  storeReglages.set(REGLAGES_DEFAUT)
}

export { REGLAGES_DEFAUT }
