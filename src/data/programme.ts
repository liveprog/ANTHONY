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
    titre: 'Pecs · Dos · Biceps',
    type: 'seance',
    resume: 'Haut du corps',
    court: 'pecs · dos',
    duree: '≈ 55 min',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-couche-barre', series: 3, reps: '10-12', reposSecondes: 150 },
          { exerciceId: 'tirage-vertical', series: 3, reps: '8-10', reposSecondes: 120 },
          {
            exerciceId: 'chest-press-incline-machine',
            series: 3,
            reps: '8-12',
            reposSecondes: 90,
            echec: 'derniere',
          },
          {
            exerciceId: 'rowing-haltere-un-bras',
            series: 3,
            reps: '8-10',
            reposSecondes: 90,
            note: 'par bras',
          },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          { exerciceId: 'elevations-laterales', series: 3, reps: '12-15', reposSecondes: 0 },
          {
            exerciceId: 'curl-biceps-barre',
            series: 3,
            reps: '10-12',
            reposSecondes: 75,
            echec: 'derniere',
          },
        ],
      },
      {
        titre: 'Fin de séance',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '15-30 min',
            reposSecondes: 0,
            note: 'pente 6 %, 4,5 km/h',
          },
        ],
      },
    ],
  },
  {
    id: 'mardi',
    jour: 'Mardi',
    titre: 'Jambes lourdes',
    type: 'seance',
    resume: 'Bas du corps',
    court: 'jambes',
    duree: '≈ 50 min',
    blocs: [
      {
        exercices: [
          { exerciceId: 'squat-ou-presse', series: 3, reps: '10-12', reposSecondes: 150 },
          { exerciceId: 'souleve-de-terre-roumain', series: 3, reps: '8-10', reposSecondes: 120 },
          {
            exerciceId: 'fentes-marchees',
            series: 3,
            reps: '10',
            reposSecondes: 90,
            note: 'par jambe',
          },
        ],
      },
      {
        titre: 'Enchaînement',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          {
            exerciceId: 'leg-curl',
            series: 3,
            reps: '10-12',
            reposSecondes: 0,
            echec: 'derniere',
          },
          { exerciceId: 'mollets-debout', series: 3, reps: '12-15', reposSecondes: 75 },
        ],
      },
      {
        titre: 'Fin de séance',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '15-30 min',
            reposSecondes: 0,
            note: 'pente 6 %, 4,5 km/h',
          },
        ],
      },
    ],
  },
  {
    id: 'mercredi',
    jour: 'Mercredi',
    titre: 'Abdos',
    type: 'seance',
    resume: 'À la maison ou à la salle',
    court: 'abdos',
    duree: '≈ 25 min',
    blocs: [
      {
        exercices: [
          {
            exerciceId: 'crunch-poulie-haute',
            series: 3,
            reps: '15',
            reposSecondes: 60,
            note: 'à la maison : crunch, haltère de 2 kg sur la poitrine',
          },
          {
            exerciceId: 'releves-jambes-suspendu',
            series: 3,
            reps: '12',
            reposSecondes: 60,
            note: 'à la maison : au sol',
          },
          {
            exerciceId: 'ab-wheel-rollout',
            series: 3,
            reps: '10',
            reposSecondes: 60,
            note: 'à la maison : dead bug',
          },
          { exerciceId: 'planche', series: 3, reps: '45 s', reposSecondes: 45 },
        ],
      },
      {
        titre: 'Fin de séance',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '30 min',
            reposSecondes: 0,
            note: 'marche rapide ou marche inclinée',
          },
        ],
      },
    ],
  },
  {
    id: 'jeudi',
    jour: 'Jeudi',
    titre: 'Épaules · Pecs · Dos · Bras',
    type: 'seance',
    resume: 'Haut du corps',
    court: 'épaules',
    duree: '≈ 55 min',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-militaire-halteres', series: 4, reps: '8-10', reposSecondes: 120 },
          { exerciceId: 'developpe-couche-barre', series: 3, reps: '10-12', reposSecondes: 120 },
          { exerciceId: 'tirage-horizontal', series: 4, reps: '8-10', reposSecondes: 120 },
        ],
      },
      {
        titre: 'Enchaînement 1',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          { exerciceId: 'face-pull', series: 3, reps: '15', reposSecondes: 0 },
          {
            exerciceId: 'curl-halteres-alternes',
            series: 3,
            reps: '10-12',
            reposSecondes: 75,
            echec: 'derniere',
          },
        ],
      },
      {
        titre: 'Enchaînement 2',
        enchainement: true,
        note: '0 s entre les deux exercices, 60 s après la paire.',
        exercices: [
          {
            exerciceId: 'elevations-laterales',
            series: 3,
            reps: '12-15',
            reposSecondes: 0,
            echec: 'derniere',
          },
          { exerciceId: 'extensions-triceps', series: 3, reps: '10-12', reposSecondes: 60 },
        ],
      },
      {
        titre: 'Fin de séance',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '30 min',
            reposSecondes: 0,
            note: 'pente 6 %, 4,5 km/h',
          },
        ],
      },
    ],
  },
  {
    id: 'vendredi',
    jour: 'Vendredi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Aucune séance',
    court: 'repos',
    blocs: [],
    note: 'Repos complet. Exception unique : le vendredi 20 novembre 2026, tu fais la séance du lundi (pecs, dos, biceps). Le vendredi suivant redevient un jour de repos.',
  },
  {
    id: 'samedi',
    jour: 'Samedi',
    titre: 'Street · Jambes',
    type: 'seance',
    resume: 'Barre, dips et jambes',
    court: 'street',
    duree: '≈ 55 min',
    blocs: [
      {
        titre: 'Barre',
        exercices: [
          { exerciceId: 'suspension-barre', series: 3, reps: '20-30 s', reposSecondes: 60 },
          {
            exerciceId: 'tractions-assistees',
            series: 4,
            reps: '6-10',
            reposSecondes: 120,
            note: 'paume vers toi — à 3 × 10, baisse l’aide de 5 kg',
          },
          {
            exerciceId: 'negatives-tractions',
            series: 3,
            reps: '3-5',
            reposSecondes: 120,
            note: 'descente en 5 s',
          },
        ],
      },
      {
        titre: 'Dips',
        exercices: [
          { exerciceId: 'dips-assistes', series: 4, reps: '6-10', reposSecondes: 120 },
          {
            exerciceId: 'negatives-dips',
            series: 3,
            reps: '3-5',
            reposSecondes: 90,
            note: 'descente en 5 s',
          },
        ],
      },
      {
        titre: 'Jambes',
        exercices: [
          {
            exerciceId: 'squat-ou-presse',
            series: 3,
            reps: '10-12',
            reposSecondes: 90,
            note: 'presse à cuisses',
          },
          { exerciceId: 'mollets-debout', series: 3, reps: '15-20', reposSecondes: 60 },
        ],
      },
      {
        titre: 'Fin de séance',
        exercices: [
          {
            exerciceId: 'marche-inclinee',
            series: 1,
            reps: '30 min',
            reposSecondes: 0,
            note: 'pente 6 %, 4,5 km/h',
          },
        ],
      },
    ],
  },
  {
    id: 'dimanche',
    jour: 'Dimanche',
    titre: 'Course · Abdos',
    type: 'seance',
    resume: 'Footing et gainage',
    court: 'course',
    duree: '≈ 35 min',
    blocs: [
      {
        titre: 'Course',
        exercices: [
          {
            exerciceId: 'footing',
            series: 1,
            reps: '25 min',
            reposSecondes: 0,
            note: 'allure facile, tu peux parler en courant',
          },
        ],
      },
      {
        titre: 'Abdos',
        exercices: [
          { exerciceId: 'releves-jambes-suspendu', series: 3, reps: '12', reposSecondes: 60 },
          { exerciceId: 'crunch-poulie-haute', series: 3, reps: '15', reposSecondes: 60 },
        ],
      },
    ],
  },
]

/** Jours où le programme habituel est remplacé, à une date précise. */
export type Exception = {
  date: string
  jourId: string
  texte: string
}

export const EXCEPTIONS: Exception[] = [
  {
    date: '2026-11-20',
    jourId: 'lundi',
    texte: 'Exception unique : ce vendredi, tu fais la séance du lundi (pecs, dos, biceps).',
  },
]

function cleDate(d: Date): string {
  const mois = `${d.getMonth() + 1}`.padStart(2, '0')
  const jour = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

export function exceptionPour(date = new Date()): Exception | undefined {
  return EXCEPTIONS.find((e) => e.date === cleDate(date))
}

export const JOURS_PAR_ID: Record<string, Jour> = Object.fromEntries(SEMAINE.map((j) => [j.id, j]))

/** Index JS getDay() (0 = dimanche) -> id du jour du programme. */
const PAR_INDEX_JS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export function jourDuJour(date = new Date()): Jour {
  const exception = exceptionPour(date)
  if (exception && JOURS_PAR_ID[exception.jourId]) return JOURS_PAR_ID[exception.jourId]
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
      'Tu t’arrêtes quand tu ne peux plus faire une répétition propre. Sur les gros exercices (développé couché, squat, développé militaire, soulevé de terre roumain), tu t’arrêtes 1 à 2 répétitions avant l’échec.',
  },
  {
    titre: 'Enchaînement',
    texte:
      'Une série du premier exercice, puis une série du second sans repos, et seulement ensuite le repos indiqué, avant de recommencer.',
  },
  {
    titre: 'Progression',
    texte:
      'Quand tu fais le haut de la fourchette de répétitions sur toutes les séries, tu augmentes le poids à la séance suivante.',
  },
  {
    titre: 'Marche inclinée',
    texte:
      'En fin de séance : pente 6 %, vitesse 4,5 km/h, 30 minutes — 15 minutes les soirs d’école.',
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
