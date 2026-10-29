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
  duree?: string
  blocs: Bloc[]
  note?: string
}

/** La semaine commence le samedi, comme le programme. */
export const SEMAINE: Jour[] = [
  {
    id: 'samedi',
    jour: 'Samedi',
    titre: 'Pecs · Épaules · Bras',
    type: 'seance',
    resume: 'Haut du corps',
    duree: '≈ 1 h',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-couche-barre', series: 4, reps: '6-8', reposSecondes: 180 },
          {
            exerciceId: 'chest-press-incline-machine',
            series: 3,
            reps: '8-12',
            reposSecondes: 120,
            echec: 'derniere',
          },
          { exerciceId: 'developpe-militaire-halteres', series: 3, reps: '8-10', reposSecondes: 150 },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 90 s après la paire.',
        exercices: [
          {
            exerciceId: 'elevations-laterales',
            series: 4,
            reps: '12-15',
            reposSecondes: 0,
            echec: 'derniere',
          },
          { exerciceId: 'extensions-triceps', series: 3, reps: '10-12', reposSecondes: 90 },
        ],
      },
      {
        exercices: [
          {
            exerciceId: 'curl-biceps-barre',
            series: 3,
            reps: '10-12',
            reposSecondes: 90,
            echec: 'derniere',
          },
        ],
      },
    ],
  },
  {
    id: 'dimanche',
    jour: 'Dimanche',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Aucune séance',
    blocs: [],
    note: 'Repos complet : pas de salle, pas de cardio. C’est le jour où le muscle construit ce que tu as gagné samedi.',
  },
  {
    id: 'lundi',
    jour: 'Lundi',
    titre: 'Jambes',
    type: 'seance',
    resume: 'Bas du corps',
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
    id: 'mardi',
    jour: 'Mardi',
    titre: 'Marche inclinée',
    type: 'libre',
    resume: 'Facultatif · 25 min',
    duree: '25 min',
    blocs: [
      {
        titre: 'Facultatif',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '25 min',
            reposSecondes: 0,
            note: 'pente 10-12 %, 5-6 km/h',
          },
        ],
      },
    ],
    note: 'Marche inclinée facultative : 25 min, pente 10 à 12 %, vitesse 5 à 6 km/h. C’est de la récupération active, pas une séance.',
  },
  {
    id: 'mercredi',
    jour: 'Mercredi',
    titre: 'Dos · Biceps',
    type: 'seance',
    resume: 'Tirages et bras',
    duree: '≈ 1 h',
    blocs: [
      {
        exercices: [
          { exerciceId: 'tirage-vertical', series: 4, reps: '8-10', reposSecondes: 120 },
          {
            exerciceId: 'rowing-haltere-un-bras',
            series: 3,
            reps: '8-10',
            reposSecondes: 120,
            note: 'par bras',
          },
          {
            exerciceId: 'tirage-horizontal',
            series: 3,
            reps: '10-12',
            reposSecondes: 120,
            echec: 'derniere',
          },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          { exerciceId: 'face-pull', series: 3, reps: '15', reposSecondes: 0 },
          {
            exerciceId: 'curl-marteau',
            series: 3,
            reps: '10-12',
            reposSecondes: 75,
            echec: 'toutes',
          },
        ],
      },
    ],
  },
  {
    id: 'jeudi',
    jour: 'Jeudi',
    titre: 'Sprint · Street',
    type: 'seance',
    resume: 'Sprints et poids du corps',
    duree: '≈ 50 min',
    blocs: [
      {
        titre: 'Préparation',
        exercices: [{ exerciceId: 'echauffement', series: 1, reps: '10 min', reposSecondes: 0 }],
      },
      {
        titre: 'Sprints',
        exercices: [
          {
            exerciceId: 'sprints-60m',
            series: 6,
            reps: '60 m',
            reposSecondes: 120,
            note: 'à 90 % — retour en marchant',
          },
        ],
      },
      {
        titre: 'Tractions',
        tours: 4,
        exercices: [
          { exerciceId: 'tractions', series: 4, reps: 'max', reposSecondes: 120, echec: 'toutes' },
        ],
      },
      {
        titre: 'Circuit',
        tours: 3,
        enchainement: true,
        note: '0 s entre les exercices, 90 s entre les tours.',
        exercices: [
          { exerciceId: 'dips', series: 3, reps: 'max', reposSecondes: 0 },
          { exerciceId: 'pompes', series: 3, reps: '15', reposSecondes: 0 },
          { exerciceId: 'squats-sautes', series: 3, reps: '10', reposSecondes: 90 },
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
    titre: 'Corps entier',
    type: 'seance',
    resume: 'Full body',
    duree: '≈ 1 h',
    blocs: [
      {
        exercices: [
          { exerciceId: 'squat-ou-presse', series: 3, reps: '8', reposSecondes: 180 },
          { exerciceId: 'developpe-couche-barre', series: 3, reps: '8', reposSecondes: 180 },
          { exerciceId: 'tirage-vertical', series: 3, reps: '8-10', reposSecondes: 120 },
          { exerciceId: 'developpe-militaire-halteres', series: 2, reps: '8-10', reposSecondes: 150 },
          {
            exerciceId: 'elevations-laterales',
            series: 4,
            reps: '12-15',
            reposSecondes: 60,
            echec: 'derniere',
          },
          { exerciceId: 'releves-jambes-suspendu', series: 3, reps: '12', reposSecondes: 90 },
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
    texte:
      'Tu t’arrêtes quand tu ne peux plus faire une répétition propre. Sur les gros exercices lourds, tu t’arrêtes 1 à 2 répétitions avant l’échec.',
  },
  {
    titre: 'Enchaînement',
    texte:
      'Une série du premier exercice, puis une série du second sans repos, et seulement ensuite le repos indiqué.',
  },
  {
    titre: 'La charge',
    texte:
      'Si la dernière rep ne ressemble plus à la première, c’est trop lourd : tu baisses la charge et tu gardes la forme propre.',
  },
]
