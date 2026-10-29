import { useMemo } from 'react'
import type { MuscleId } from '../data/muscles'
import { MUSCLES } from '../data/muscles'

export type Vue = 'face' | 'dos'

type Forme = { d: string; cote?: 'gauche' | 'centre' }

/** Silhouette : dessinée sous les muscles, identique de face et de dos. */
const SILHOUETTE: Forme[] = [
  { d: 'M 92 46 L 108 46 L 110 62 L 90 62 Z', cote: 'centre' },
  {
    d: 'M 100 58 C 86 58 74 62 66 71 C 60 79 58 92 60 104 C 62 122 70 141 76 158 C 74 172 74 186 78 201 L 122 201 C 126 186 126 172 124 158 C 130 141 138 122 140 104 C 142 92 140 79 134 71 C 126 62 114 58 100 58 Z',
    cote: 'centre',
  },
  { d: 'M 66 72 C 56 77 50 93 49 111 C 48 125 50 137 54 147 L 69 147 C 71 129 72 100 70 76 Z', cote: 'gauche' },
  { d: 'M 54 150 C 49 164 47 181 50 197 L 64 199 C 68 181 69 163 68 150 Z', cote: 'gauche' },
  { d: 'M 50 201 C 46 209 48 221 56 222 C 63 222 66 211 63 201 Z', cote: 'gauche' },
  { d: 'M 78 203 C 69 221 67 252 72 283 C 74 293 77 301 80 307 L 99 307 C 101 273 100 235 98 203 Z', cote: 'gauche' },
  { d: 'M 80 313 C 73 331 73 353 78 373 C 80 383 82 391 84 395 L 95 395 C 98 369 96 341 93 313 Z', cote: 'gauche' },
  { d: 'M 82 399 C 76 401 71 409 73 415 L 96 415 C 98 407 97 401 94 399 Z', cote: 'gauche' },
]

/** Un groupe musculaire = une ou plusieurs formes, pour chaque vue. */
const MUSCLE_FORMES: Record<MuscleId, { face: Forme[]; dos: Forme[] }> = {
  trapezes: {
    face: [{ d: 'M 93 58 C 83 60 73 65 66 72 C 74 77 84 78 93 75 Z', cote: 'gauche' }],
    dos: [
      {
        d: 'M 100 57 C 87 58 75 64 67 72 C 75 87 87 103 100 115 C 113 103 125 87 133 72 C 125 64 113 58 100 57 Z',
        cote: 'centre',
      },
      { d: 'M 99 118 L 86 124 C 81 133 79 143 81 152 L 99 145 Z', cote: 'gauche' },
    ],
  },
  deltoideAnterieur: {
    face: [{ d: 'M 77 68 C 69 72 64 82 64 94 C 71 95 77 87 81 72 Z', cote: 'gauche' }],
    dos: [],
  },
  deltoideLateral: {
    face: [{ d: 'M 66 72 C 57 78 52 91 51 105 C 57 107 62 99 65 89 C 66 83 66 77 66 72 Z', cote: 'gauche' }],
    dos: [{ d: 'M 66 72 C 57 78 52 91 51 105 C 57 107 62 99 65 89 C 66 83 66 77 66 72 Z', cote: 'gauche' }],
  },
  deltoidePosterieur: {
    face: [],
    dos: [{ d: 'M 77 68 C 68 73 63 85 64 96 C 71 96 77 87 81 72 Z', cote: 'gauche' }],
  },
  pectoraux: {
    face: [
      { d: 'M 97 76 C 88 74 78 78 74 88 C 71 98 78 108 90 108 C 95 108 97 102 97 95 Z', cote: 'gauche' },
    ],
    dos: [],
  },
  biceps: {
    face: [{ d: 'M 65 80 C 57 89 54 105 54 121 C 54 131 56 139 59 145 L 68 145 C 70 127 70 100 69 82 Z', cote: 'gauche' }],
    dos: [],
  },
  triceps: {
    face: [],
    dos: [{ d: 'M 64 78 C 55 89 52 106 52 122 C 52 132 54 140 57 146 L 68 146 C 70 127 70 100 69 80 Z', cote: 'gauche' }],
  },
  avantBras: {
    face: [{ d: 'M 55 151 C 50 165 48 181 51 196 L 63 198 C 67 181 68 163 67 151 Z', cote: 'gauche' }],
    dos: [{ d: 'M 55 151 C 50 165 48 181 51 196 L 63 198 C 67 181 68 163 67 151 Z', cote: 'gauche' }],
  },
  abdos: {
    face: [
      { d: 'M 90 112 L 99 112 L 99 127 L 89 127 Z', cote: 'gauche' },
      { d: 'M 89 130 L 99 130 L 99 145 L 88 145 Z', cote: 'gauche' },
      { d: 'M 88 148 L 99 148 L 99 163 L 88 163 Z', cote: 'gauche' },
      { d: 'M 88 166 L 99 166 L 99 184 L 90 184 Z', cote: 'gauche' },
    ],
    dos: [],
  },
  obliques: {
    face: [{ d: 'M 87 112 C 79 118 77 132 79 147 C 81 161 85 173 91 182 L 88 150 Z', cote: 'gauche' }],
    dos: [],
  },
  dorsaux: {
    face: [],
    dos: [{ d: 'M 99 102 L 86 111 C 75 120 71 137 76 151 C 83 159 92 156 99 148 Z', cote: 'gauche' }],
  },
  lombaires: {
    face: [],
    dos: [{ d: 'M 99 154 C 92 155 87 159 85 166 C 84 176 86 186 90 194 L 99 196 Z', cote: 'gauche' }],
  },
  fessiers: {
    face: [],
    dos: [{ d: 'M 99 198 C 88 198 80 202 76 211 C 73 221 78 232 88 234 C 95 234 99 229 99 221 Z', cote: 'gauche' }],
  },
  quadriceps: {
    face: [{ d: 'M 79 206 C 71 224 69 254 74 283 C 76 292 78 299 81 304 L 98 304 C 100 272 99 236 97 206 Z', cote: 'gauche' }],
    dos: [],
  },
  ischios: {
    face: [],
    dos: [{ d: 'M 79 236 C 72 254 71 278 75 296 C 77 301 79 304 81 306 L 98 306 C 100 282 99 256 97 236 Z', cote: 'gauche' }],
  },
  mollets: {
    face: [{ d: 'M 84 318 C 80 336 80 356 83 374 L 92 374 C 95 352 93 334 91 318 Z', cote: 'gauche' }],
    dos: [{ d: 'M 81 316 C 75 334 75 356 79 374 C 81 382 83 388 85 391 L 94 391 C 97 364 95 338 92 316 Z', cote: 'gauche' }],
  },
}

export type Intensite = 'principal' | 'secondaire' | 'inactif'

const REMPLISSAGE: Record<Intensite, string> = {
  principal: '#c6f948',
  secondaire: '#6f8f41',
  inactif: '#232a32',
}

/** Contour sombre : sépare visuellement deux groupes voisins tous les deux surlignés. */
const CONTOUR: Record<Intensite, string> = {
  principal: '#0d1013',
  secondaire: '#0d1013',
  inactif: '#2e3741',
}

function Formes({
  formes,
  intensite,
  nom,
}: {
  formes: Forme[]
  intensite: Intensite
  nom: string
}) {
  return (
    <g>
      {formes.map((f, i) => {
        const elements = [
          <path
            key={`${i}-d`}
            d={f.d}
            fill={REMPLISSAGE[intensite]}
            stroke={CONTOUR[intensite]}
            strokeWidth={0.9}
          >
            <title>{nom}</title>
          </path>,
        ]
        if (f.cote !== 'centre') {
          elements.push(
            <path
              key={`${i}-g`}
              d={f.d}
              fill={REMPLISSAGE[intensite]}
              stroke={CONTOUR[intensite]}
              strokeWidth={0.9}
              transform="translate(200,0) scale(-1,1)"
            >
              <title>{nom}</title>
            </path>,
          )
        }
        return elements
      })}
    </g>
  )
}

export default function BonhommeMuscles({
  vue,
  principaux,
  secondaires,
  className,
}: {
  vue: Vue
  principaux: MuscleId[]
  secondaires: MuscleId[]
  className?: string
}) {
  const intensites = useMemo(() => {
    const map = new Map<MuscleId, Intensite>()
    for (const id of Object.keys(MUSCLE_FORMES) as MuscleId[]) map.set(id, 'inactif')
    for (const id of secondaires) map.set(id, 'secondaire')
    for (const id of principaux) map.set(id, 'principal')
    return map
  }, [principaux, secondaires])

  const ids = Object.keys(MUSCLE_FORMES) as MuscleId[]

  return (
    <svg
      viewBox="0 0 200 430"
      className={className}
      role="img"
      aria-label={`Vue de ${vue === 'face' ? 'face' : 'dos'} des muscles sollicités`}
    >
      <defs>
        <radialGradient id="halo" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#c6f948" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c6f948" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="430" fill="url(#halo)" />

      {/* Silhouette */}
      <g>
        <ellipse cx="100" cy="30" rx="16.5" ry="19.5" fill="#1a1f25" stroke="#2e3741" strokeWidth="0.8" />
        {vue === 'dos' && <ellipse cx="100" cy="27" rx="12" ry="14" fill="#151a1f" />}
        {SILHOUETTE.map((f, i) => (
          <g key={i}>
            <path d={f.d} fill="#1a1f25" stroke="#2e3741" strokeWidth="0.8" />
            {f.cote !== 'centre' && (
              <path
                d={f.d}
                fill="#1a1f25"
                stroke="#2e3741"
                strokeWidth="0.8"
                transform="translate(200,0) scale(-1,1)"
              />
            )}
          </g>
        ))}
      </g>

      {/* Muscles : les inactifs d'abord, les surlignés par-dessus */}
      {(['inactif', 'secondaire', 'principal'] as Intensite[]).map((niveau) => (
        <g key={niveau}>
          {ids
            .filter((id) => intensites.get(id) === niveau)
            .map((id) => (
              <Formes
                key={id}
                formes={MUSCLE_FORMES[id][vue]}
                intensite={niveau}
                nom={MUSCLES[id].label}
              />
            ))}
        </g>
      ))}
    </svg>
  )
}

/** Muscles sollicités qui ne sont pas dessinés dans la vue affichée. */
export function musclesHorsVue(vue: Vue, ids: MuscleId[]): MuscleId[] {
  return ids.filter((id) => MUSCLE_FORMES[id][vue].length === 0)
}
