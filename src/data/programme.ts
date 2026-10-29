export type Prescription = {
  exerciceId: string
  series: number
  reps: string
  note?: string
}

export type Bloc = {
  titre?: string
  tours?: number
  exercices: Prescription[]
}

export type TypeJour = 'seance' | 'repos' | 'libre'

export type Jour = {
  id: string
  jour: string
  titre: string
  type: TypeJour
  resume: string
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
    resume: '7 exercices · haut du corps',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-couche-barre', series: 4, reps: '6-8' },
          { exerciceId: 'rowing-haltere-un-bras', series: 3, reps: '8-10', note: 'par bras' },
          { exerciceId: 'developpe-militaire-halteres', series: 4, reps: '8' },
          { exerciceId: 'chest-press-incline-machine', series: 3, reps: '10' },
          { exerciceId: 'elevations-laterales', series: 3, reps: '15' },
          { exerciceId: 'curl-biceps-barre', series: 3, reps: '12' },
          { exerciceId: 'crunch-poulie-haute', series: 3, reps: '15' },
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
    resume: '6 exercices · bas du corps',
    blocs: [
      {
        exercices: [
          { exerciceId: 'squat-ou-presse', series: 4, reps: '6-8' },
          { exerciceId: 'souleve-de-terre-roumain', series: 3, reps: '8-10' },
          { exerciceId: 'fentes-marchees', series: 3, reps: '10', note: 'par jambe' },
          { exerciceId: 'leg-curl', series: 3, reps: '12' },
          { exerciceId: 'mollets-debout', series: 4, reps: '15' },
          { exerciceId: 'ab-wheel-rollout', series: 3, reps: '10-12' },
        ],
      },
    ],
  },
  {
    id: 'mardi',
    jour: 'Mardi',
    titre: 'Jour libre',
    type: 'libre',
    resume: 'Marche inclinée optionnelle',
    blocs: [
      {
        titre: 'Optionnel',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '25-30 min',
            note: 'inclinaison 10-12 %, 5-6 km/h',
          },
        ],
      },
    ],
    note: 'Jour libre. Si tu bouges, reste sur de la marche inclinée : 10-12 % d’inclinaison, 5-6 km/h, 25-30 min.',
  },
  {
    id: 'mercredi',
    jour: 'Mercredi',
    titre: 'Jour libre',
    type: 'libre',
    resume: 'Marche inclinée optionnelle',
    blocs: [
      {
        titre: 'Optionnel',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '25-30 min',
            note: 'inclinaison 10-12 %, 5-6 km/h',
          },
        ],
      },
    ],
    note: 'Jour libre. Si tu bouges, reste sur de la marche inclinée : 10-12 % d’inclinaison, 5-6 km/h, 25-30 min.',
  },
  {
    id: 'jeudi',
    jour: 'Jeudi',
    titre: 'Sprint + street',
    type: 'seance',
    resume: 'Sprints, circuits au poids du corps',
    blocs: [
      {
        titre: 'Préparation',
        exercices: [{ exerciceId: 'echauffement', series: 1, reps: '10 min' }],
      },
      {
        titre: 'Sprints',
        exercices: [
          { exerciceId: 'sprints-60m', series: 8, reps: '60 m', note: 'à 90 % — récup 2-3 min' },
        ],
      },
      {
        titre: 'Circuit 1',
        tours: 4,
        exercices: [{ exerciceId: 'tractions', series: 4, reps: 'max' }],
      },
      {
        titre: 'Circuit 2',
        tours: 4,
        exercices: [
          { exerciceId: 'dips', series: 4, reps: 'max' },
          { exerciceId: 'pompes', series: 4, reps: '15' },
          { exerciceId: 'squats-sautes', series: 4, reps: '10' },
        ],
      },
      {
        titre: 'Gainage',
        exercices: [{ exerciceId: 'planche', series: 3, reps: '45 s' }],
      },
    ],
    note: 'Les circuits s’enchaînent : 4 tours, repos entre les tours seulement.',
  },
  {
    id: 'vendredi',
    jour: 'Vendredi',
    titre: 'Full body',
    type: 'seance',
    resume: '6 exercices · corps entier',
    blocs: [
      {
        exercices: [
          { exerciceId: 'squat-ou-presse', series: 3, reps: '8' },
          { exerciceId: 'developpe-couche-barre', series: 3, reps: '8' },
          { exerciceId: 'tirage-vertical', series: 3, reps: '8-10' },
          { exerciceId: 'developpe-militaire-halteres', series: 3, reps: '8-10' },
          { exerciceId: 'elevations-laterales', series: 3, reps: '15' },
          { exerciceId: 'releves-jambes-suspendu', series: 3, reps: '12' },
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
