import { formaterDuree } from '../lib/format'

/** « derniere » : seule la dernière série va à l'échec. « toutes » : chaque série. */
export type Echec = 'derniere' | 'toutes'

export type Prescription = {
  exerciceId: string
  series: number
  reps: string
  /** Repos après cette série, en secondes. 0 = enchaîné avec l'exercice suivant. */
  reposSecondes: number
  echec?: Echec
  note?: string
}

export type Bloc = {
  titre?: string
  tours?: number
  /** Les exercices du bloc s'enchaînent sans repos entre eux. */
  enchainement?: boolean
  note?: string
  exercices: Prescription[]
}

export type TypeJour = 'seance' | 'repos' | 'libre'

export type Jour = {
  id: string
  jour: string
  titre: string
  type: TypeJour
  resume: string
  /** Étiquette courte, pour les puces de choix du jour. */
  court: string
  duree?: string
  blocs: Bloc[]
  note?: string
}

/** La semaine va du lundi au dimanche. */
export const SEMAINE: Jour[] = [
  {
    id: 'lundi',
    jour: 'Lundi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Cours, révisions, sommeil',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : cours, révisions, sommeil. Aucune séance — c’est pendant ces jours-là que le travail du week-end se transforme en muscle.',
  },
  {
    id: 'mardi',
    jour: 'Mardi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Cours, révisions, sommeil',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : cours, révisions, sommeil. Aucune séance.',
  },
  {
    id: 'mercredi',
    jour: 'Mercredi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Cours, révisions, sommeil',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : cours, révisions, sommeil. Aucune séance.',
  },
  {
    id: 'jeudi',
    jour: 'Jeudi',
    titre: 'Course · Street',
    type: 'seance',
    resume: 'Footing et poids du corps',
    court: 'course',
    duree: '≈ 50 min',
    blocs: [
      {
        titre: 'Course',
        exercices: [
          {
            exerciceId: 'footing',
            series: 1,
            reps: '20 min',
            reposSecondes: 0,
            note: 'allure facile, tu peux parler en courant',
          },
        ],
      },
      {
        titre: 'Street',
        exercices: [
          {
            exerciceId: 'tractions',
            series: 4,
            reps: 'max',
            reposSecondes: 120,
            echec: 'toutes',
          },
          {
            exerciceId: 'pompes',
            series: 3,
            reps: '15-20',
            reposSecondes: 90,
            echec: 'derniere',
          },
          {
            exerciceId: 'pompes-serrees',
            series: 2,
            reps: 'max',
            reposSecondes: 90,
            echec: 'toutes',
          },
        ],
      },
      {
        titre: 'Gainage',
        exercices: [{ exerciceId: 'planche', series: 3, reps: '45 s', reposSecondes: 60 }],
      },
    ],
  },
  {
    id: 'vendredi',
    jour: 'Vendredi',
    titre: 'Jambes',
    type: 'seance',
    resume: 'Bas du corps',
    court: 'jambes',
    duree: '≈ 1 h',
    blocs: [
      {
        exercices: [
          { exerciceId: 'squat-ou-presse', series: 4, reps: '6-8', reposSecondes: 180 },
          { exerciceId: 'souleve-de-terre-roumain', series: 3, reps: '8-10', reposSecondes: 150 },
          {
            exerciceId: 'fentes-marchees',
            series: 3,
            reps: '10',
            reposSecondes: 120,
            note: 'par jambe',
          },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 90 s après la paire.',
        exercices: [
          {
            exerciceId: 'leg-curl',
            series: 3,
            reps: '10-12',
            reposSecondes: 0,
            echec: 'derniere',
          },
          {
            exerciceId: 'mollets-debout',
            series: 4,
            reps: '12-15',
            reposSecondes: 90,
            echec: 'toutes',
          },
        ],
      },
      {
        exercices: [{ exerciceId: 'ab-wheel-rollout', series: 3, reps: '10', reposSecondes: 60 }],
      },
    ],
  },
  {
    id: 'samedi',
    jour: 'Samedi',
    titre: 'Haut du corps A',
    type: 'seance',
    resume: 'Pecs et dos',
    court: 'pecs · dos',
    duree: '≈ 1 h',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-couche-barre', series: 4, reps: '6-8', reposSecondes: 180 },
          { exerciceId: 'tirage-vertical', series: 4, reps: '8-10', reposSecondes: 120 },
          {
            exerciceId: 'chest-press-incline-machine',
            series: 3,
            reps: '8-12',
            reposSecondes: 120,
            echec: 'derniere',
          },
          {
            exerciceId: 'rowing-haltere-un-bras',
            series: 3,
            reps: '8-10',
            reposSecondes: 120,
            note: 'par bras',
          },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 90 s après la paire.',
        exercices: [
          { exerciceId: 'elevations-laterales', series: 3, reps: '12-15', reposSecondes: 0 },
          { exerciceId: 'extensions-triceps', series: 3, reps: '10-12', reposSecondes: 90 },
        ],
      },
    ],
  },
  {
    id: 'dimanche',
    jour: 'Dimanche',
    titre: 'Haut du corps B',
    type: 'seance',
    resume: 'Épaules, dos et bras',
    court: 'épaules',
    duree: '≈ 1 h',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-militaire-halteres', series: 4, reps: '8-10', reposSecondes: 150 },
          { exerciceId: 'tirage-horizontal', series: 4, reps: '8-10', reposSecondes: 120 },
          {
            exerciceId: 'dips',
            series: 3,
            reps: '8-12',
            reposSecondes: 120,
            echec: 'derniere',
          },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 90 s après la paire.',
        exercices: [
          { exerciceId: 'face-pull', series: 3, reps: '15', reposSecondes: 0 },
          {
            exerciceId: 'curl-biceps-barre',
            series: 3,
            reps: '10-12',
            reposSecondes: 90,
            echec: 'derniere',
          },
        ],
      },
      {
        exercices: [
          {
            exerciceId: 'elevations-laterales',
            series: 3,
            reps: '12-15',
            reposSecondes: 60,
            echec: 'derniere',
          },
        ],
      },
    ],
  },
]

export const JOURS_PAR_ID: Record<string, Jour> = Object.fromEntries(SEMAINE.map((j) => [j.id, j]))

/** Index JS getDay() (0 = dimanche) -> id du jour du programme. */
const PAR_INDEX_JS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export function jourDuJour(date = new Date()): Jour {
  return JOURS_PAR_ID[PAR_INDEX_JS[date.getDay()]]
}

export function toutesLesPrescriptions(jour: Jour): Prescription[] {
  return jour.blocs.flatMap((b) => b.exercices)
}

export function prescriptionDe(jourId: string, exerciceId: string): Prescription | undefined {
  const jour = JOURS_PAR_ID[jourId]
  if (!jour) return undefined
  return toutesLesPrescriptions(jour).find((p) => p.exerciceId === exerciceId)
}

/** Jours du programme où l'exercice apparaît, avec sa prescription. */
export function joursAvecExercice(exerciceId: string): { jour: Jour; prescription: Prescription }[] {
  return SEMAINE.flatMap((jour) =>
    toutesLesPrescriptions(jour)
      .filter((p) => p.exerciceId === exerciceId)
      .map((prescription) => ({ jour, prescription })),
  )
}

/** Exercice enchaîné juste après celui-ci, dans le même bloc. */
export function exerciceEnchaineApres(jourId: string, exerciceId: string): string | null {
  const jour = JOURS_PAR_ID[jourId]
  if (!jour) return null
  for (const bloc of jour.blocs) {
    if (!bloc.enchainement) continue
    const i = bloc.exercices.findIndex((p) => p.exerciceId === exerciceId)
    if (i === -1) continue
    const suivant = bloc.exercices[i + 1] ?? bloc.exercices[0]
    return suivant.exerciceId === exerciceId ? null : suivant.exerciceId
  }
  return null
}

export const REGLES = [
  {
    titre: 'Jusqu’à l’échec',
    texte: 'Tu t’arrêtes quand tu ne peux plus faire une répétition propre.',
  },
  {
    titre: 'Les gros exercices',
    texte:
      'Sur le squat, le développé couché, le développé militaire et le soulevé de terre roumain, tu t’arrêtes 1 à 2 répétitions avant l’échec.',
  },
  {
    titre: 'Enchaînement',
    texte:
      'Une série du premier exercice, puis une série du second sans repos, et seulement ensuite le repos indiqué, avant de recommencer.',
  },
]

/** Vrai si l'exercice fait partie d'un bloc enchaîné ce jour-là. */
export function estEnchaine(jourId: string, exerciceId: string): boolean {
  const jour = JOURS_PAR_ID[jourId]
  if (!jour) return false
  return jour.blocs.some(
    (bloc) => bloc.enchainement && bloc.exercices.some((p) => p.exerciceId === exerciceId),
  )
}

/** Libellé du repos affiché à côté d'un exercice. */
export function libelleRepos(secondes: number, enchaine: boolean): string {
  if (secondes > 0) return formaterDuree(secondes)
  return enchaine ? 'Enchaîné — pas de repos' : 'Pas de repos'
}
