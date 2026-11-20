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
 * La semaine va du lundi au dimanche (c'est l'ordre d'affichage) : 3 séances de salle (jambes le
 * mardi, haut du corps le samedi, full body avec abdos le dimanche), 2 courses faciles (jeudi et
 * dimanche matin) et 3 jours de repos (lundi, mercredi, vendredi).
 *
 * `id` est l'identité STABLE d'une séance : les temps de repos personnalisés (clé « id:exercice »),
 * la séance en cours et les exceptions datées s'y rattachent. `jour` est le jour où elle a lieu.
 * Les deux ne coïncident plus, volontairement : la séance « lundi » (Pecs · Dos · Biceps) se fait
 * le samedi. Les jours de repos et la course du jeudi ont leur propre identifiant, et les séances
 * supprimées (Street, haut du corps du jeudi) n'en ont plus : leurs réglages ne s'affichent plus.
 * On déplace les séances d'un jour à l'autre sans renommer leurs identifiants.
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
    id: 'repos-mercredi',
    jour: 'Mercredi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Récupération',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : le milieu de semaine sert à récupérer entre les jambes de mardi et le petit footing de jeudi.'
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
    id: 'vendredi',
    jour: 'Vendredi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Aucune séance',
    court: 'repos',
    blocs: [],
    note: 'Repos complet. Exception unique : le vendredi 20 novembre 2026, tu fais la séance Pecs · Dos · Biceps (habituellement le samedi). Le vendredi suivant redevient un jour de repos.',
  },
  {
    id: 'lundi',
    jour: 'Samedi',
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
    id: 'dimanche',
    jour: 'Dimanche',
    titre: 'Course · Full body',
    type: 'seance',
    resume: 'Footing le matin, full body le soir',
    court: 'full body',
    note: 'Matin : footing dehors. Soir, vers 16-17 h : séance full body courte à la salle (jambes, haut du corps, abdos).',
    duree: '25 min + 45 min',
    blocs: [
      {
        titre: 'Matin · Course',
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
      {
        titre: 'Soir · Full body',
        exercices: [
          {
            exerciceId: 'squat-ou-presse',
            series: 3,
            reps: '10-12',
            reposSecondes: 120,
            note: 'presse conseillée : les jambes lourdes sont mardi',
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
        titre: 'Enchaînement 1 · Jambes et épaules',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          { exerciceId: 'leg-curl', series: 3, reps: '10-12', reposSecondes: 0 },
          { exerciceId: 'elevations-laterales', series: 3, reps: '12-15', reposSecondes: 75 },
        ],
      },
      {
        titre: 'Enchaînement 2 · Abdos',
        enchainement: true,
        note: '0 s entre les deux exercices, 60 s après la paire.',
        exercices: [
          { exerciceId: 'releves-jambes-suspendu', series: 3, reps: '12', reposSecondes: 0 },
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
    texte: 'Exceptionnellement, le vendredi 20 novembre, tu fais la séance Pecs · Dos · Biceps.',
  },
]

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
