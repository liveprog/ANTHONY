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
 * La semaine va du lundi au dimanche (c'est l'ordre d'affichage). La salle n'est possible que du
 * jeudi au dimanche : 4 séances de salle, deux d'entre elles précédées d'un footing facile (jeudi
 * et dimanche), puis 3 jours de repos (lundi, mardi, mercredi).
 *
 * Ordre choisi : haut du corps (jeudi), bas du corps (vendredi), tractions · dips · abdos (samedi),
 * full body (dimanche). Il alterne haut et bas : les jambes ne tombent jamais deux jours de suite et
 * les deux séances lourdes de haut du corps sont séparées de 48 h.
 *
 * `id` est l'identité STABLE d'une séance : les temps de repos personnalisés (clé « id:exercice »),
 * la séance en cours et les exceptions datées s'y rattachent. `jour` est le jour où elle a lieu.
 * Les deux ne coïncident plus toujours, volontairement : la séance « lundi » est le haut du corps
 * (jeudi), « mardi » le bas du corps (vendredi), « tractions-vendredi » se fait le samedi. On déplace
 * les séances d'un jour à l'autre sans renommer leurs identifiants, pour que rien ne soit orphelin.
 * Ne pas « corriger » les identifiants.
 */
export const SEMAINE: Jour[] = [
  {
    id: 'repos-lundi',
    jour: 'Lundi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Récupération',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : pas de salle en début de semaine. Tes quatre séances sont concentrées du jeudi au dimanche, et la récupération de ces trois jours fait partie du programme.'
  },
  {
    id: 'repos-mardi',
    jour: 'Mardi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Récupération',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : pas de salle en début de semaine. Ces trois jours de récupération préparent la semaine de jeudi à dimanche.'
  },
  {
    id: 'repos-mercredi',
    jour: 'Mercredi',
    titre: 'Repos complet',
    type: 'repos',
    resume: 'Récupération',
    court: 'repos',
    blocs: [],
    note: 'Repos complet : pas de salle en début de semaine. Ces trois jours de récupération préparent la semaine de jeudi à dimanche.'
  },
  {
    id: 'lundi',
    jour: 'Jeudi',
    titre: 'Course · Haut du corps',
    type: 'seance',
    resume: 'Footing, puis épaules, dos, pecs, bras',
    court: 'haut du corps',
    duree: '20 min + 30-35 min',
    note: 'Footing court dehors, puis la séance. Presque autant de séries qu’une séance complète (24), en deux fois moins de temps : les exercices sont enchaînés par paires, donc le repos est partagé. Charge lourde ; dernière série à l’échec sur les tirages et l’isolation ; sur le développé couché et le militaire, tu gardes 1 à 2 répétitions en réserve. Une série d’échauffement légère avant le premier gros exercice.',
    blocs: [
      {
        titre: 'Matin · Course',
        exercices: [
          {
            exerciceId: 'footing',
            series: 1,
            reps: '20 min',
            reposSecondes: 0,
            note: 'dehors, allure facile, tu peux parler en courant',
          },
        ],
      },
      {
        titre: 'Enchaînement 1 · Épaules et dos',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          { exerciceId: 'developpe-militaire-halteres', series: 3, reps: '6-8', reposSecondes: 0 },
          {
            exerciceId: 'tirage-vertical',
            series: 3,
            reps: '8-10',
            reposSecondes: 75,
            echec: 'derniere',
          },
        ],
      },
      {
        titre: 'Enchaînement 2 · Pecs et dos',
        enchainement: true,
        note: '0 s entre les deux exercices, 75 s après la paire.',
        exercices: [
          { exerciceId: 'developpe-couche-barre', series: 3, reps: '6-8', reposSecondes: 0 },
          {
            exerciceId: 'tirage-horizontal',
            series: 3,
            reps: '8-10',
            reposSecondes: 75,
            echec: 'derniere',
          },
        ],
      },
      {
        titre: 'Enchaînement 3 · Épaules et dos (finition)',
        enchainement: true,
        note: '0 s entre les deux exercices, 45 s après la paire.',
        exercices: [
          {
            exerciceId: 'elevations-laterales',
            series: 3,
            reps: '12-15',
            reposSecondes: 0,
            echec: 'derniere',
          },
          { exerciceId: 'face-pull', series: 3, reps: '15', reposSecondes: 45 },
        ],
      },
      {
        titre: 'Enchaînement 4 · Bras',
        enchainement: true,
        note: '0 s entre les deux exercices, 60 s après la paire.',
        exercices: [
          {
            exerciceId: 'curl-halteres-alternes',
            series: 3,
            reps: '10-12',
            reposSecondes: 0,
            echec: 'derniere',
          },
          {
            exerciceId: 'extensions-triceps',
            series: 3,
            reps: '10-12',
            reposSecondes: 60,
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
    jour: 'Vendredi',
    titre: 'Bas du corps',
    type: 'seance',
    resume: 'Jambes uniquement',
    court: 'jambes',
    duree: '≈ 30-35 min',
    note: 'Les mêmes 15 séries qu’une séance complète, en moins de temps : le squat est enchaîné aux mollets et les fentes au curl des ischios, donc le repos est partagé. Tu gardes 1 à 2 répétitions en réserve sur le squat et le soulevé de terre roumain ; dernière série à l’échec sur les mollets et le curl des ischios. Une série d’échauffement légère avant le squat.',
    blocs: [
      {
        titre: 'Enchaînement 1 · Squat et mollets',
        enchainement: true,
        note: '0 s entre les deux exercices, 120 s après la paire.',
        exercices: [
          { exerciceId: 'squat-ou-presse', series: 3, reps: '6-8', reposSecondes: 0 },
          {
            exerciceId: 'mollets-debout',
            series: 3,
            reps: '12-15',
            reposSecondes: 120,
            echec: 'derniere',
          },
        ],
      },
      {
        exercices: [
          { exerciceId: 'souleve-de-terre-roumain', series: 3, reps: '8-10', reposSecondes: 120 },
        ],
      },
      {
        titre: 'Enchaînement 2 · Fentes et ischios',
        enchainement: true,
        note: '0 s entre les deux exercices, 90 s après la paire.',
        exercices: [
          {
            exerciceId: 'fentes-marchees',
            series: 3,
            reps: '10',
            reposSecondes: 0,
            note: 'par jambe',
          },
          {
            exerciceId: 'leg-curl',
            series: 3,
            reps: '10-12',
            reposSecondes: 90,
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
    id: 'tractions-vendredi',
    jour: 'Samedi',
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
    jour: 'Dimanche',
    titre: 'Course · Full body',
    type: 'seance',
    resume: 'Footing + jambes, haut du corps, abdos',
    court: 'full body',
    duree: '25 min + 30 min',
    note: 'Footing le matin, puis une séance courte : les gros mouvements de tout le corps. Les abdos de la veille (relevés, crunch) laissent la place à la planche, pour ne pas refaire les mêmes.',
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
        exercices: [
          {
            exerciceId: 'squat-ou-presse',
            series: 3,
            reps: '10-12',
            reposSecondes: 120,
            note: 'presse conseillée : les jambes lourdes sont vendredi',
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
