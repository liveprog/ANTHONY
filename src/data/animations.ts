/**
 * Animations de démonstration : un mannequin articulé en SVG passe d'une pose
 * clé à la suivante, en boucle. Chaque phase porte un nom, affiché sous la
 * figure et aligné avec les étapes d'exécution de l'exercice.
 *
 * Convention d'angles (en degrés) : 0 = segment dirigé vers le bas,
 * 90 = vers la droite (+x), 180 = vers le haut, -90 = vers la gauche.
 * `torse` est mesuré depuis la verticale : 0 = debout, positif = penché vers
 * l'avant (droite), -90 = allongé sur le dos, tête à gauche.
 */

export type Pose = {
  hanche: [number, number]
  torse: number
  brasHaut: number
  brasBas: number
  /** Bras éloigné : par défaut identique au bras proche. */
  brasHautLoin?: number
  brasBasLoin?: number
  cuisse: number
  tibia: number
  pied?: number
  cuisseLoin?: number
  tibiaLoin?: number
  piedLoin?: number
  /** Inclinaison de la tête par rapport au torse. */
  tete?: number
}

export type Materiel =
  | 'sol'
  | 'barre'
  | 'halteres'
  | 'haltere-une-main'
  | 'banc'
  | 'banc-incline'
  | 'machine'
  | 'barre-fixe'
  | 'poulie-haute'
  | 'corde'
  | 'barres-paralleles'
  | 'roue'
  | 'rampe'
  | 'piste'

export type Phase = {
  nom: string
  /** Durée de la transition vers la pose suivante, en millisecondes. */
  duree: number
  pose: Pose
}

export type Animation = {
  vue: 'cote' | 'face'
  materiel: Materiel[]
  /** Recadrage de la scène entière, pour les exercices au sol ou suspendus. */
  decalage?: [number, number]
  phases: Phase[]
}

const debout = (p: Partial<Pose> = {}): Pose => ({
  hanche: [100, 100],
  torse: 0,
  brasHaut: 6,
  brasBas: 6,
  cuisse: 2,
  tibia: -2,
  pied: 90,
  ...p,
})

export const ANIMATIONS: Record<string, Animation> = {
  'developpe-couche-barre': {
    vue: 'cote',
    materiel: ['sol', 'banc', 'barre'],
    phases: [
      {
        nom: 'Bras tendus',
        duree: 900,
        pose: {
          hanche: [116, 116],
          torse: -90,
          brasHaut: 152,
          brasBas: 172,
          cuisse: 48,
          tibia: -4,
          pied: 90,
          cuisseLoin: 42,
          tibiaLoin: -2,
        },
      },
      {
        nom: 'Descente contrôlée',
        duree: 1200,
        pose: {
          hanche: [116, 116],
          torse: -90,
          brasHaut: 62,
          brasBas: 186,
          cuisse: 48,
          tibia: -4,
          pied: 90,
          cuisseLoin: 42,
          tibiaLoin: -2,
        },
      },
      {
        nom: 'Poussée',
        duree: 800,
        pose: {
          hanche: [116, 116],
          torse: -90,
          brasHaut: 152,
          brasBas: 172,
          cuisse: 48,
          tibia: -4,
          pied: 90,
          cuisseLoin: 42,
          tibiaLoin: -2,
        },
      },
    ],
  },

  'chest-press-incline-machine': {
    vue: 'cote',
    materiel: ['sol', 'banc-incline', 'machine'],
    phases: [
      {
        nom: 'Dos calé',
        duree: 900,
        pose: {
          hanche: [112, 126],
          torse: -58,
          brasHaut: 108,
          brasBas: 150,
          cuisse: 52,
          tibia: 8,
          pied: 90,
          cuisseLoin: 46,
          tibiaLoin: 10,
        },
      },
      {
        nom: 'Poussée',
        duree: 900,
        pose: {
          hanche: [112, 126],
          torse: -58,
          brasHaut: 128,
          brasBas: 132,
          cuisse: 52,
          tibia: 8,
          pied: 90,
          cuisseLoin: 46,
          tibiaLoin: 10,
        },
      },
      {
        nom: 'Retour lent',
        duree: 1300,
        pose: {
          hanche: [112, 126],
          torse: -58,
          brasHaut: 74,
          brasBas: 158,
          cuisse: 52,
          tibia: 8,
          pied: 90,
          cuisseLoin: 46,
          tibiaLoin: 10,
        },
      },
    ],
  },

  'rowing-haltere-un-bras': {
    vue: 'cote',
    materiel: ['sol', 'banc', 'haltere-une-main'],
    phases: [
      {
        nom: 'Bras tendu',
        duree: 900,
        pose: {
          hanche: [120, 96],
          torse: 72,
          brasHaut: 8,
          brasBas: 6,
          brasHautLoin: 72,
          brasBasLoin: 24,
          cuisse: 6,
          tibia: -6,
          pied: 90,
          cuisseLoin: 24,
          tibiaLoin: -10,
        },
      },
      {
        nom: 'Coude vers la hanche',
        duree: 900,
        pose: {
          hanche: [120, 96],
          torse: 72,
          brasHaut: -42,
          brasBas: 28,
          brasHautLoin: 72,
          brasBasLoin: 24,
          cuisse: 6,
          tibia: -6,
          pied: 90,
          cuisseLoin: 24,
          tibiaLoin: -10,
        },
      },
      {
        nom: 'Retour en étirement',
        duree: 1100,
        pose: {
          hanche: [120, 96],
          torse: 72,
          brasHaut: 8,
          brasBas: 6,
          brasHautLoin: 72,
          brasBasLoin: 24,
          cuisse: 6,
          tibia: -6,
          pied: 90,
          cuisseLoin: 24,
          tibiaLoin: -10,
        },
      },
    ],
  },

  'developpe-militaire-halteres': {
    vue: 'face',
    materiel: ['halteres'],
    phases: [
      {
        nom: 'Haltères aux oreilles',
        duree: 900,
        pose: debout({ brasHaut: 118, brasBas: 168, cuisse: 4, tibia: -4 }),
      },
      {
        nom: 'Poussée verticale',
        duree: 900,
        pose: debout({ brasHaut: 168, brasBas: 176, cuisse: 4, tibia: -4 }),
      },
      {
        nom: 'Descente contrôlée',
        duree: 1200,
        pose: debout({ brasHaut: 118, brasBas: 168, cuisse: 4, tibia: -4 }),
      },
    ],
  },

  'elevations-laterales': {
    vue: 'face',
    materiel: ['halteres'],
    phases: [
      {
        nom: 'Bras le long du corps',
        duree: 800,
        pose: debout({ torse: 6, brasHaut: 12, brasBas: 14 }),
      },
      {
        nom: 'Montée à l’horizontale',
        duree: 900,
        pose: debout({ torse: 6, brasHaut: 86, brasBas: 92 }),
      },
      {
        nom: 'Descente freinée',
        duree: 1400,
        pose: debout({ torse: 6, brasHaut: 12, brasBas: 14 }),
      },
    ],
  },

  'curl-biceps-barre': {
    vue: 'face',
    materiel: ['barre'],
    phases: [
      {
        nom: 'Bras déroulés',
        duree: 900,
        pose: debout({ brasHaut: 10, brasBas: 12 }),
      },
      {
        nom: 'Flexion, coudes fixes',
        duree: 900,
        pose: debout({ brasHaut: 16, brasBas: 164 }),
      },
      {
        nom: 'Descente contrôlée',
        duree: 1200,
        pose: debout({ brasHaut: 10, brasBas: 12 }),
      },
    ],
  },

  'crunch-poulie-haute': {
    vue: 'cote',
    materiel: ['sol', 'corde'],
    phases: [
      {
        nom: 'À genoux, dos droit',
        duree: 800,
        pose: {
          hanche: [100, 138],
          torse: 8,
          brasHaut: 166,
          brasBas: 188,
          cuisse: 6,
          tibia: -86,
          pied: -92,
          cuisseLoin: 8,
          tibiaLoin: -84,
          piedLoin: -92,
        },
      },
      {
        nom: 'Enroulement des côtes',
        duree: 900,
        pose: {
          hanche: [100, 138],
          torse: 58,
          brasHaut: 136,
          brasBas: 176,
          cuisse: 6,
          tibia: -86,
          pied: -92,
          cuisseLoin: 8,
          tibiaLoin: -84,
          piedLoin: -92,
        },
      },
      {
        nom: 'Remontée en tension',
        duree: 1200,
        pose: {
          hanche: [100, 138],
          torse: 8,
          brasHaut: 166,
          brasBas: 188,
          cuisse: 6,
          tibia: -86,
          pied: -92,
          cuisseLoin: 8,
          tibiaLoin: -84,
          piedLoin: -92,
        },
      },
    ],
  },

  'squat-ou-presse': {
    vue: 'cote',
    materiel: ['sol', 'barre'],
    phases: [
      {
        nom: 'Debout, gainé',
        duree: 900,
        pose: {
          hanche: [100, 96],
          torse: 6,
          brasHaut: -20,
          brasBas: -150,
          cuisse: 2,
          tibia: -2,
          pied: 90,
          cuisseLoin: 4,
          tibiaLoin: -4,
        },
      },
      {
        nom: 'Descente, cuisses parallèles',
        duree: 1200,
        pose: {
          hanche: [88, 128],
          torse: 34,
          brasHaut: 8,
          brasBas: -140,
          cuisse: 62,
          tibia: -24,
          pied: 90,
          cuisseLoin: 64,
          tibiaLoin: -26,
        },
      },
      {
        nom: 'Remontée',
        duree: 900,
        pose: {
          hanche: [100, 96],
          torse: 6,
          brasHaut: -20,
          brasBas: -150,
          cuisse: 2,
          tibia: -2,
          pied: 90,
          cuisseLoin: 4,
          tibiaLoin: -4,
        },
      },
    ],
  },

  'souleve-de-terre-roumain': {
    vue: 'cote',
    materiel: ['sol', 'barre'],
    phases: [
      {
        nom: 'Debout, barre aux cuisses',
        duree: 900,
        pose: {
          hanche: [100, 96],
          torse: 4,
          brasHaut: 8,
          brasBas: 6,
          cuisse: 2,
          tibia: -2,
          pied: 90,
          cuisseLoin: 4,
          tibiaLoin: -4,
        },
      },
      {
        nom: 'Bascule des hanches',
        duree: 1200,
        pose: {
          hanche: [112, 100],
          torse: 76,
          brasHaut: 2,
          brasBas: 0,
          cuisse: -8,
          tibia: 6,
          pied: 90,
          cuisseLoin: -6,
          tibiaLoin: 6,
        },
      },
      {
        nom: 'Remontée, fessiers serrés',
        duree: 900,
        pose: {
          hanche: [100, 96],
          torse: 4,
          brasHaut: 8,
          brasBas: 6,
          cuisse: 2,
          tibia: -2,
          pied: 90,
          cuisseLoin: 4,
          tibiaLoin: -4,
        },
      },
    ],
  },

  'fentes-marchees': {
    vue: 'cote',
    materiel: ['sol', 'halteres'],
    phases: [
      {
        nom: 'Grand pas en avant',
        duree: 900,
        pose: {
          hanche: [96, 104],
          torse: 4,
          brasHaut: 8,
          brasBas: 8,
          cuisse: 34,
          tibia: -32,
          pied: 90,
          cuisseLoin: -14,
          tibiaLoin: -62,
          piedLoin: 30,
        },
      },
      {
        nom: 'Genou arrière vers le sol',
        duree: 1000,
        pose: {
          hanche: [96, 124],
          torse: 6,
          brasHaut: 8,
          brasBas: 8,
          cuisse: 52,
          tibia: -46,
          pied: 90,
          cuisseLoin: -22,
          tibiaLoin: -100,
          piedLoin: 40,
        },
      },
      {
        nom: 'Poussée sur le talon avant',
        duree: 900,
        pose: {
          hanche: [96, 104],
          torse: 4,
          brasHaut: 8,
          brasBas: 8,
          cuisse: 34,
          tibia: -32,
          pied: 90,
          cuisseLoin: -14,
          tibiaLoin: -62,
          piedLoin: 30,
        },
      },
    ],
  },

  'leg-curl': {
    vue: 'cote',
    materiel: ['machine', 'banc'],
    phases: [
      {
        nom: 'Allongé, jambes tendues',
        duree: 900,
        pose: {
          hanche: [104, 124],
          torse: -88,
          brasHaut: 96,
          brasBas: 94,
          cuisse: 92,
          tibia: 92,
          pied: 150,
          cuisseLoin: 92,
          tibiaLoin: 92,
        },
      },
      {
        nom: 'Flexion des genoux',
        duree: 900,
        pose: {
          hanche: [104, 124],
          torse: -88,
          brasHaut: 96,
          brasBas: 94,
          cuisse: 92,
          tibia: 186,
          pied: 206,
          cuisseLoin: 92,
          tibiaLoin: 184,
        },
      },
      {
        nom: 'Retour lent',
        duree: 1300,
        pose: {
          hanche: [104, 124],
          torse: -88,
          brasHaut: 96,
          brasBas: 94,
          cuisse: 92,
          tibia: 92,
          pied: 150,
          cuisseLoin: 92,
          tibiaLoin: 92,
        },
      },
    ],
  },

  'mollets-debout': {
    vue: 'cote',
    materiel: ['sol'],
    phases: [
      {
        nom: 'Talons bas, étirement',
        duree: 1000,
        pose: debout({ hanche: [100, 108], brasHaut: 8, brasBas: 8, pied: 58 }),
      },
      {
        nom: 'Montée sur la pointe',
        duree: 900,
        pose: debout({ hanche: [100, 86], brasHaut: 8, brasBas: 8, pied: 136 }),
      },
      {
        nom: 'Pause en haut',
        duree: 700,
        pose: debout({ hanche: [100, 85], brasHaut: 8, brasBas: 8, pied: 138 }),
      },
    ],
  },

  'ab-wheel-rollout': {
    vue: 'cote',
    materiel: ['sol', 'roue'],
    decalage: [-14, -14],
    phases: [
      {
        nom: 'À genoux, dos arrondi',
        duree: 900,
        pose: {
          hanche: [92, 138],
          torse: 52,
          brasHaut: 22,
          brasBas: 22,
          cuisse: 6,
          tibia: -86,
          pied: -92,
          cuisseLoin: 8,
          tibiaLoin: -84,
          piedLoin: -92,
        },
      },
      {
        nom: 'Extension vers l’avant',
        duree: 1200,
        pose: {
          hanche: [86, 152],
          torse: 82,
          brasHaut: 54,
          brasBas: 46,
          cuisse: 4,
          tibia: -88,
          pied: -92,
          cuisseLoin: 6,
          tibiaLoin: -86,
          piedLoin: -92,
        },
      },
      {
        nom: 'Retour avec les abdos',
        duree: 1100,
        pose: {
          hanche: [92, 138],
          torse: 52,
          brasHaut: 22,
          brasBas: 22,
          cuisse: 6,
          tibia: -86,
          pied: -92,
          cuisseLoin: 8,
          tibiaLoin: -84,
          piedLoin: -92,
        },
      },
    ],
  },

  echauffement: {
    vue: 'cote',
    materiel: ['sol'],
    phases: [
      {
        nom: 'Montée de genou',
        duree: 500,
        pose: debout({ brasHaut: -28, brasBas: 70, brasHautLoin: 34, brasBasLoin: 96, cuisse: 76, tibia: 10, cuisseLoin: -12, tibiaLoin: -16 }),
      },
      {
        nom: 'Appui au sol',
        duree: 500,
        pose: debout({ brasHaut: 24, brasBas: 86, brasHautLoin: -20, brasBasLoin: 64, cuisse: 6, tibia: -8, cuisseLoin: 14, tibiaLoin: -12 }),
      },
      {
        nom: 'Genou opposé',
        duree: 500,
        pose: debout({ brasHaut: 34, brasBas: 96, brasHautLoin: -28, brasBasLoin: 70, cuisse: -12, tibia: -16, cuisseLoin: 76, tibiaLoin: 10 }),
      },
    ],
  },

  'sprints-60m': {
    vue: 'cote',
    materiel: ['piste'],
    phases: [
      {
        nom: 'Appui et poussée',
        duree: 320,
        pose: {
          hanche: [100, 96],
          torse: 14,
          brasHaut: -36,
          brasBas: 54,
          brasHautLoin: 44,
          brasBasLoin: 118,
          cuisse: -32,
          tibia: -8,
          pied: 110,
          cuisseLoin: 58,
          tibiaLoin: 14,
          piedLoin: 120,
        },
      },
      {
        nom: 'Suspension',
        duree: 320,
        pose: {
          hanche: [100, 90],
          torse: 12,
          brasHaut: 4,
          brasBas: 88,
          brasHautLoin: 6,
          brasBasLoin: 92,
          cuisse: 20,
          tibia: -46,
          pied: 118,
          cuisseLoin: 16,
          tibiaLoin: 56,
          piedLoin: 116,
        },
      },
      {
        nom: 'Griffé au sol',
        duree: 320,
        pose: {
          hanche: [100, 96],
          torse: 14,
          brasHaut: 44,
          brasBas: 118,
          brasHautLoin: -36,
          brasBasLoin: 54,
          cuisse: 58,
          tibia: 14,
          pied: 120,
          cuisseLoin: -32,
          tibiaLoin: -8,
          piedLoin: 110,
        },
      },
    ],
  },

  tractions: {
    vue: 'face',
    materiel: ['barre-fixe'],
    decalage: [0, -8],
    phases: [
      {
        nom: 'Suspension, bras tendus',
        duree: 900,
        pose: {
          hanche: [100, 124],
          torse: 0,
          brasHaut: 166,
          brasBas: 172,
          cuisse: 4,
          tibia: -18,
          pied: 80,
        },
      },
      {
        nom: 'Menton au-dessus de la barre',
        duree: 900,
        pose: {
          hanche: [100, 90],
          torse: -4,
          brasHaut: 128,
          brasBas: 196,
          cuisse: 6,
          tibia: -20,
          pied: 80,
        },
      },
      {
        nom: 'Descente contrôlée',
        duree: 1200,
        pose: {
          hanche: [100, 124],
          torse: 0,
          brasHaut: 166,
          brasBas: 172,
          cuisse: 4,
          tibia: -18,
          pied: 80,
        },
      },
    ],
  },

  dips: {
    vue: 'cote',
    materiel: ['barres-paralleles'],
    decalage: [0, -12],
    phases: [
      {
        nom: 'Bras tendus',
        duree: 800,
        pose: {
          hanche: [100, 118],
          torse: 16,
          brasHaut: 2,
          brasBas: 0,
          cuisse: 26,
          tibia: -52,
          pied: 86,
          cuisseLoin: 24,
          tibiaLoin: -50,
        },
      },
      {
        nom: 'Descente, épaules au niveau des coudes',
        duree: 1000,
        pose: {
          hanche: [100, 142],
          torse: 24,
          brasHaut: -24,
          brasBas: 36,
          cuisse: 26,
          tibia: -52,
          pied: 86,
          cuisseLoin: 24,
          tibiaLoin: -50,
        },
      },
      {
        nom: 'Poussée',
        duree: 800,
        pose: {
          hanche: [100, 118],
          torse: 16,
          brasHaut: 2,
          brasBas: 0,
          cuisse: 26,
          tibia: -52,
          pied: 86,
          cuisseLoin: 24,
          tibiaLoin: -50,
        },
      },
    ],
  },

  pompes: {
    vue: 'cote',
    materiel: ['sol'],
    decalage: [0, -18],
    phases: [
      {
        nom: 'Planche, bras tendus',
        duree: 800,
        pose: {
          hanche: [104, 150],
          torse: 70,
          brasHaut: 8,
          brasBas: 8,
          cuisse: -70,
          tibia: -70,
          pied: -18,
          cuisseLoin: -72,
          tibiaLoin: -68,
          piedLoin: -18,
        },
      },
      {
        nom: 'Descente, coudes à 45°',
        duree: 1000,
        pose: {
          hanche: [104, 157],
          torse: 78,
          brasHaut: -25,
          brasBas: 50,
          cuisse: -74,
          tibia: -74,
          pied: -14,
          cuisseLoin: -76,
          tibiaLoin: -72,
          piedLoin: -14,
        },
      },
      {
        nom: 'Poussée complète',
        duree: 800,
        pose: {
          hanche: [104, 150],
          torse: 70,
          brasHaut: 8,
          brasBas: 8,
          cuisse: -70,
          tibia: -70,
          pied: -18,
          cuisseLoin: -72,
          tibiaLoin: -68,
          piedLoin: -18,
        },
      },
    ],
  },

  'squats-sautes': {
    vue: 'cote',
    materiel: ['sol'],
    phases: [
      {
        nom: 'Squat contrôlé',
        duree: 700,
        pose: {
          hanche: [100, 128],
          torse: 30,
          brasHaut: -30,
          brasBas: 10,
          cuisse: 62,
          tibia: -24,
          pied: 90,
          cuisseLoin: 64,
          tibiaLoin: -26,
        },
      },
      {
        nom: 'Explosion vers le haut',
        duree: 420,
        pose: {
          hanche: [100, 86],
          torse: 4,
          brasHaut: 150,
          brasBas: 168,
          cuisse: 0,
          tibia: 2,
          pied: 130,
          cuisseLoin: 2,
          tibiaLoin: 2,
        },
      },
      {
        nom: 'Réception amortie',
        duree: 600,
        pose: {
          hanche: [100, 122],
          torse: 26,
          brasHaut: -20,
          brasBas: 18,
          cuisse: 54,
          tibia: -20,
          pied: 90,
          cuisseLoin: 56,
          tibiaLoin: -22,
        },
      },
    ],
  },

  planche: {
    vue: 'cote',
    materiel: ['sol'],
    decalage: [0, -18],
    phases: [
      {
        nom: 'Coudes sous les épaules',
        duree: 1600,
        pose: {
          hanche: [100, 160],
          torse: 79,
          brasHaut: 0,
          brasBas: 92,
          cuisse: -78,
          tibia: -80,
          pied: -14,
          cuisseLoin: -80,
          tibiaLoin: -78,
          piedLoin: -14,
        },
      },
      {
        nom: 'Corps en ligne, gainé',
        duree: 1600,
        pose: {
          hanche: [100, 157],
          torse: 77,
          brasHaut: 0,
          brasBas: 92,
          cuisse: -76,
          tibia: -79,
          pied: -14,
          cuisseLoin: -78,
          tibiaLoin: -77,
          piedLoin: -14,
        },
      },
    ],
  },

  'tirage-vertical': {
    vue: 'face',
    materiel: ['poulie-haute', 'banc'],
    phases: [
      {
        nom: 'Bras tendus, omoplates hautes',
        duree: 900,
        pose: {
          hanche: [100, 120],
          torse: -8,
          brasHaut: 158,
          brasBas: 168,
          cuisse: 70,
          tibia: -14,
          pied: 90,
        },
      },
      {
        nom: 'Barre vers le haut des pectoraux',
        duree: 900,
        pose: {
          hanche: [100, 120],
          torse: -12,
          brasHaut: 108,
          brasBas: 182,
          cuisse: 70,
          tibia: -14,
          pied: 90,
        },
      },
      {
        nom: 'Remontée contrôlée',
        duree: 1200,
        pose: {
          hanche: [100, 120],
          torse: -8,
          brasHaut: 158,
          brasBas: 168,
          cuisse: 70,
          tibia: -14,
          pied: 90,
        },
      },
    ],
  },

  'releves-jambes-suspendu': {
    vue: 'cote',
    materiel: ['barre-fixe'],
    decalage: [0, -8],
    phases: [
      {
        nom: 'Suspendu, corps immobile',
        duree: 900,
        pose: {
          hanche: [100, 122],
          torse: 0,
          brasHaut: 174,
          brasBas: 178,
          cuisse: 2,
          tibia: -2,
          pied: 90,
          cuisseLoin: 4,
          tibiaLoin: -4,
        },
      },
      {
        nom: 'Jambes à l’horizontale',
        duree: 1000,
        pose: {
          hanche: [100, 122],
          torse: -14,
          brasHaut: 174,
          brasBas: 178,
          cuisse: 86,
          tibia: 80,
          pied: 110,
          cuisseLoin: 88,
          tibiaLoin: 82,
        },
      },
      {
        nom: 'Descente freinée',
        duree: 1200,
        pose: {
          hanche: [100, 122],
          torse: 0,
          brasHaut: 174,
          brasBas: 178,
          cuisse: 2,
          tibia: -2,
          pied: 90,
          cuisseLoin: 4,
          tibiaLoin: -4,
        },
      },
    ],
  },

  'marche-inclinee': {
    vue: 'cote',
    materiel: ['rampe'],
    decalage: [0, -10],
    phases: [
      {
        nom: 'Appui jambe avant',
        duree: 620,
        pose: {
          hanche: [100, 98],
          torse: 10,
          brasHaut: -22,
          brasBas: 34,
          brasHautLoin: 26,
          brasBasLoin: 64,
          cuisse: 34,
          tibia: -18,
          pied: 96,
          cuisseLoin: -18,
          tibiaLoin: 6,
          piedLoin: 84,
        },
      },
      {
        nom: 'Passage du pas',
        duree: 620,
        pose: {
          hanche: [100, 94],
          torse: 10,
          brasHaut: 4,
          brasBas: 52,
          brasHautLoin: 6,
          brasBasLoin: 54,
          cuisse: 10,
          tibia: -10,
          pied: 92,
          cuisseLoin: 6,
          tibiaLoin: -6,
          piedLoin: 92,
        },
      },
      {
        nom: 'Appui jambe opposée',
        duree: 620,
        pose: {
          hanche: [100, 98],
          torse: 10,
          brasHaut: 26,
          brasBas: 64,
          brasHautLoin: -22,
          brasBasLoin: 34,
          cuisse: -18,
          tibia: 6,
          pied: 84,
          cuisseLoin: 34,
          tibiaLoin: -18,
          piedLoin: 96,
        },
      },
    ],
  },
  'extensions-triceps': {
    vue: 'face',
    materiel: ['corde'],
    phases: [
      {
        nom: 'Coudes pliés, collés au buste',
        duree: 800,
        pose: debout({ torse: 8, brasHaut: 12, brasBas: 148 }),
      },
      {
        nom: 'Extension complète',
        duree: 800,
        pose: debout({ torse: 8, brasHaut: 10, brasBas: 14 }),
      },
      {
        nom: 'Retour contrôlé',
        duree: 1100,
        pose: debout({ torse: 8, brasHaut: 12, brasBas: 148 }),
      },
    ],
  },

  'tirage-horizontal': {
    vue: 'cote',
    materiel: ['banc', 'machine'],
    decalage: [-6, -6],
    phases: [
      {
        nom: 'Bras tendus, dos étiré',
        duree: 900,
        pose: {
          hanche: [86, 128],
          torse: 4,
          brasHaut: 82,
          brasBas: 86,
          cuisse: 86,
          tibia: 20,
          pied: 80,
          cuisseLoin: 88,
          tibiaLoin: 22,
        },
      },
      {
        nom: 'Coudes le long des côtes',
        duree: 900,
        pose: {
          hanche: [86, 128],
          torse: -8,
          brasHaut: -4,
          brasBas: 48,
          cuisse: 86,
          tibia: 20,
          pied: 80,
          cuisseLoin: 88,
          tibiaLoin: 22,
        },
      },
      {
        nom: 'Retour lent',
        duree: 1200,
        pose: {
          hanche: [86, 128],
          torse: 4,
          brasHaut: 82,
          brasBas: 86,
          cuisse: 86,
          tibia: 20,
          pied: 80,
          cuisseLoin: 88,
          tibiaLoin: 22,
        },
      },
    ],
  },

  'face-pull': {
    vue: 'face',
    materiel: ['corde'],
    phases: [
      {
        nom: 'Bras tendus vers la poulie',
        duree: 800,
        pose: debout({ brasHaut: 148, brasBas: 160 }),
      },
      {
        nom: 'Corde vers le front, coudes hauts',
        duree: 900,
        pose: debout({ brasHaut: 102, brasBas: 150 }),
      },
      {
        nom: 'Retour contrôlé',
        duree: 1100,
        pose: debout({ brasHaut: 148, brasBas: 160 }),
      },
    ],
  },

  'curl-marteau': {
    vue: 'face',
    materiel: ['halteres'],
    phases: [
      { nom: 'Bras déroulés, prise neutre', duree: 900, pose: debout({ brasHaut: 10, brasBas: 12 }) },
      { nom: 'Flexion, coudes fixes', duree: 900, pose: debout({ brasHaut: 16, brasBas: 160 }) },
      { nom: 'Descente contrôlée', duree: 1200, pose: debout({ brasHaut: 10, brasBas: 12 }) },
    ],
  },
}

export function animationDe(exerciceId: string): Animation | null {
  return ANIMATIONS[exerciceId] ?? null
}
