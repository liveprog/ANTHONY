export type SerieLog = {
  poids: number
  reps: number
  secondes: number
  validee: boolean
}

export type ExerciceLog = {
  exerciceId: string
  series: SerieLog[]
}

export type SeanceLog = {
  id: string
  jourId: string
  date: string
  exercices: ExerciceLog[]
  terminee: boolean
  dureeSecondes?: number
}

export type Aliment = {
  nom: string
  kcal: number
  prot: number
  gluc: number
  lip: number
  portion: number
  unite: string
  categorie: CategorieAliment
}

export type CategorieAliment =
  | 'proteine'
  | 'feculent'
  | 'legume'
  | 'fruit'
  | 'laitier'
  | 'matiere-grasse'
  | 'sucre'
  | 'boisson'

export type LigneRepas = {
  id: string
  nom: string
  grammes: number
  kcal: number
  prot: number
  gluc: number
  lip: number
}

export type Repas = {
  id: string
  date: string
  horodatage: number
  moment: MomentRepas
  photo?: string
  lignes: LigneRepas[]
  note?: string
  source: 'photo' | 'manuel'
}

export type MomentRepas = 'petit-dejeuner' | 'dejeuner' | 'collation' | 'diner'

export type Reglages = {
  objectifKcal: number
  objectifProt: number
  sonRepos: boolean
  vibrationRepos: boolean
  poidsCorps: number | null
}

export type ExportDonnees = {
  app: 'antho-fit'
  version: number
  exporteLe: string
  repos: Record<string, number>
  seances: SeanceLog[]
  repas: Repas[]
  reglages: Reglages
}
