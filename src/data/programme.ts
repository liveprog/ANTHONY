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

export type TypeJour = 'seance' | 'repos' | 'libre' | 'course'

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

/**
 * La semaine va du lundi au dimanche (c'est l'ordre d'affichage) : 4 séances de salle (haut du corps
 * le mardi, bas du corps le mercredi, tractions · dips · abdos le vendredi, petit full body le
 * samedi), 2 courses faciles (jeudi et dimanche) et 1 jour de repos (lundi).
 *
 * `id` est l'identité STABLE d'une séance : les temps de repos personnalisés (clé « id:exercice »),
 * la séance en cours et les exceptions datées s'y rattachent. `jour` est le jour où elle a lieu.
 * Les deux ne coïncident plus, volontairement : la séance « lundi » est le haut du corps (mardi),
 * « mardi » le bas du corps (mercredi), « dimanche » le full body (samedi). Les jours de repos, les
 * courses et la séance du vendredi ont leur propre identifiant. On déplace les séances d'un jour à
 * l'autre sans renommer leurs identifiants, pour que rien ne soit orphelin.
 * Ne pas « corriger » les identifiants.
 */
export const SEMAINE: Jour[] = [
  {
    id: 'repos-lundi',
    jour: 'Lundi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Récupération après le dimanche',
    court: 'repos',
    blocs: [],
    note: 'Repos complet. Après la course et la séance full body du dimanche, c’est le jour où tu récupères : les jambes sont reposées pour mardi.'
  },
  {
    id: 'lundi',
    jour: 'Mardi',
    titre: 'Haut du corps',
    type: 'seance',
    resume: 'Épaules, dos, pecs, biceps, triceps',
    court: 'haut du corps',
    duree: '≈ 55 min',
    blocs: [
      {
        exercices: [
          { exerciceId: 'developpe-militaire-halteres', series: 4, reps: '8-10', reposSecondes: 120 },
          { exerciceId: 'developpe-couche-barre', series: 3, reps: '10-12', reposSecondes: 150 },
          { exerciceId: 'tirage-vertical', series: 3, reps: '8-10', reposSecondes: 120 },
          { exerciceId: 'tirage-horizontal', series: 3, reps: '8-10', reposSecondes: 120 },
        ],
      },
      {
        titre: 'Enchaînement 1 · Dos et biceps',
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
        titre: 'Enchaînement 2 · Épaules et triceps',
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
    jour: 'Mercredi',
    titre: 'Bas du corps',
    type: 'seance',
    resume: 'Jambes uniquement',
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
    id: 'course-jeudi',
    jour: 'Jeudi',
    titre: 'Petit footing',
    type: 'course',
    resume: 'Course facile, récupération active',
    court: 'course',
    duree: '≈ 20 min',
    note: 'Footing court et facile, dehors. Il compte comme de la récupération active, pas comme une séance : pas de haut du corps ce jour-là.',
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
    ],
  },
  {
    id: 'tractions-vendredi',
    jour: 'Vendredi',
    titre: 'Tractions · Dips · Abdos',
    type: 'seance',
    resume: 'Tractions, dips, épaules, biceps, abdos',
    court: 'tractions',
    duree: '≈ 55 min',
    note: 'Ta séance pour progresser aux tractions et aux dips (avec de l’aide, puis les descentes lentes), tout en travaillant épaules, biceps et abdos.',
    blocs: [
      {
        titre: 'Tractions et dips',
        exercices: [
          {
            exerciceId: 'tractions-assistees',
            series: 4,
            reps: '6-10',
            reposSecondes: 120,
            note: 'paume vers toi — à 3 × 10, baisse l’aide de 5 kg',
          },
          { exerciceId: 'dips-assistes', series: 4, reps: '6-10', reposSecondes: 120 },
        ],
      },
      {
        titre: 'Enchaînement 1 · Descentes lentes',
        enchainement: true,
        note: '0 s entre les deux exercices, 120 s après la paire.',
        exercices: [
          {
            exerciceId: 'negatives-tractions',
            series: 3,
            reps: '3-5',
            reposSecondes: 0,
            note: 'descente en 5 s',
          },
          {
            exerciceId: 'negatives-dips',
            series: 3,
            reps: '3-5',
            reposSecondes: 120,
            note: 'descente en 5 s',
          },
        ],
      },
      {
        titre: 'Enchaînement 2 · Épaules et biceps',
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
        titre: 'Enchaînement 3 · Abdos',
        enchainement: true,
        note: '0 s entre les deux exercices, 60 s après la paire.',
        exercices: [
          { exerciceId: 'releves-jambes-suspendu', series: 3, reps: '12', reposSecondes: 0 },
          { exerciceId: 'crunch-poulie-haute', series: 3, reps: '15', reposSecondes: 60 },
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
    id: 'dimanche',
    jour: 'Samedi',
    titre: 'Full body',
    type: 'seance',
    resume: 'Jambes, haut du corps, abdos',
    court: 'full body',
    duree: '≈ 30 min',
    note: 'Séance courte : les gros mouvements de tout le corps. Les abdos de la veille (relevés, crunch) laissent la place à la planche, pour ne pas refaire les mêmes.',
    blocs: [
      {
        exercices: [
          {
            exerciceId: 'squat-ou-presse',
            series: 3,
            reps: '10-12',
            reposSecondes: 120,
            note: 'presse conseillée : les jambes lourdes sont mercredi',
          },
          {
            exerciceId: 'chest-press-incline-machine',
            series: 3,
            reps: '10-12',
            reposSecondes: 90,
          },
          { exerciceId: 'tirage-horizontal', series: 3, reps: '10-12', reposSecondes: 90 },
        ],
      },
      {
        titre: 'Abdos',
        exercices: [{ exerciceId: 'planche', series: 3, reps: '45 s', reposSecondes: 60 }],
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
    id: 'course-dimanche',
    jour: 'Dimanche',
    titre: 'Course',
    type: 'course',
    resume: 'Footing à allure facile',
    court: 'course',
    duree: '≈ 25 min',
    note: 'Footing dehors, allure facile. Il compte comme de la récupération active, pas comme une séance.',
    blocs: [
      {
        titre: 'Course',
        exercices: [
          {
            exerciceId: 'footing',
            series: 1,
            reps: '25 min',
            reposSecondes: 0,
            note: 'dehors, allure facile, tu peux parler en courant',
          },
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

export const EXCEPTIONS: Exception[] = []

function cleDate(d: Date): string {
  const mois = `${d.getMonth() + 1}`.padStart(2, '0')
  const jour = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

/** Exceptions d'aujourd'hui ou à venir : une exception passée ne doit plus s'afficher. */
export function exceptionsAVenir(date = new Date()): Exception[] {
  const aujourdhui = cleDate(date)
  return EXCEPTIONS.filter((e) => e.date >= aujourdhui)
}

export function exceptionPour(date = new Date()): Exception | undefined {
  return EXCEPTIONS.find((e) => e.date === cleDate(date))
}

export const JOURS_PAR_ID: Record<string, Jour> = Object.fromEntries(SEMAINE.map((j) => [j.id, j]))

/** Index JS getDay() (0 = dimanche) -> nom du jour, tel qu'écrit dans `jour`. */
const NOMS_JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

/** Nom du vrai jour de la semaine (pas celui de la séance : le vendredi d'une exception, c'est « Vendredi »). */
export function nomDuJour(date = new Date()): string {
  return NOMS_JOURS[date.getDay()]
}

export function jourDuJour(date = new Date()): Jour {
  const exception = exceptionPour(date)
  if (exception && JOURS_PAR_ID[exception.jourId]) return JOURS_PAR_ID[exception.jourId]
  const nom = NOMS_JOURS[date.getDay()]
  return SEMAINE.find((j) => j.jour === nom) ?? SEMAINE[0]
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

/** Clés « jour:exercice » de repos personnalisés qui correspondent encore à un exercice du programme. */
export function reposPersonnalisesActifs(repos: Record<string, number>): string[] {
  return Object.keys(repos).filter((cle) => {
    const [jourId, exerciceId] = cle.split(':')
    return !!jourId && !!exerciceId && !!prescriptionDe(jourId, exerciceId)
  })
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
