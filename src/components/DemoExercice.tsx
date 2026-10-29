import { useEffect, useMemo, useRef, useState } from 'react'
import type { Animation, Materiel, Pose } from '../data/animations'

/** Longueurs des segments, en unités du viewBox. */
const L = {
  torse: 52,
  cou: 12,
  bras: 26,
  avantBras: 24,
  cuisse: 36,
  tibia: 34,
  pied: 13,
}

const SOL = 182
const TETE_R = 11

type Point = [number, number]

function depuis([x, y]: Point, angleDeg: number, longueur: number): Point {
  const a = (angleDeg * Math.PI) / 180
  return [x + Math.sin(a) * longueur, y + Math.cos(a) * longueur]
}

type Squelette = {
  hanche: Point
  epaule: Point
  tete: Point
  coude: Point
  poignet: Point
  coudeLoin: Point
  poignetLoin: Point
  genou: Point
  cheville: Point
  orteils: Point
  genouLoin: Point
  chevilleLoin: Point
  orteilsLoin: Point
  epauleProche: Point
  epauleLoin: Point
  hancheProche: Point
  hancheLoin: Point
}

/** Calcule la position des articulations à partir des angles de la pose. */
function squelette(pose: Pose, vue: 'cote' | 'face'): Squelette {
  const hanche = pose.hanche
  const epaule = depuis(hanche, 180 - pose.torse, L.torse)
  const tete = depuis(epaule, 180 - pose.torse + (pose.tete ?? 0), L.cou + TETE_R * 0.4)

  // De face, les deux côtés s'écartent ; de côté, le membre éloigné est juste décalé.
  const ecartEpaule = vue === 'face' ? 13 : 4
  const ecartHanche = vue === 'face' ? 9 : 3
  const signe = vue === 'face' ? -1 : 1

  const epauleProche: Point = [epaule[0] + ecartEpaule, epaule[1]]
  const epauleLoin: Point = [epaule[0] - ecartEpaule, epaule[1]]
  const hancheProche: Point = [hanche[0] + ecartHanche, hanche[1]]
  const hancheLoin: Point = [hanche[0] - ecartHanche, hanche[1]]

  const brasHautLoin = pose.brasHautLoin ?? signe * pose.brasHaut
  const brasBasLoin = pose.brasBasLoin ?? signe * pose.brasBas
  const cuisseLoin = pose.cuisseLoin ?? signe * pose.cuisse
  const tibiaLoin = pose.tibiaLoin ?? signe * pose.tibia
  const piedLoin = pose.piedLoin ?? signe * (pose.pied ?? 90)

  const coude = depuis(epauleProche, pose.brasHaut, L.bras)
  const poignet = depuis(coude, pose.brasBas, L.avantBras)
  const coudeLoin = depuis(epauleLoin, brasHautLoin, L.bras)
  const poignetLoin = depuis(coudeLoin, brasBasLoin, L.avantBras)

  const genou = depuis(hancheProche, pose.cuisse, L.cuisse)
  const cheville = depuis(genou, pose.tibia, L.tibia)
  const orteils = depuis(cheville, pose.pied ?? 90, L.pied)
  const genouLoin = depuis(hancheLoin, cuisseLoin, L.cuisse)
  const chevilleLoin = depuis(genouLoin, tibiaLoin, L.tibia)
  const orteilsLoin = depuis(chevilleLoin, piedLoin, L.pied)

  return {
    hanche,
    epaule,
    tete,
    coude,
    poignet,
    coudeLoin,
    poignetLoin,
    genou,
    cheville,
    orteils,
    genouLoin,
    chevilleLoin,
    orteilsLoin,
    epauleProche,
    epauleLoin,
    hancheProche,
    hancheLoin,
  }
}

function melangerPoses(a: Pose, b: Pose, t: number): Pose {
  const m = (x: number, y: number) => x + (y - x) * t
  const opt = (x: number | undefined, y: number | undefined, defaut: number) =>
    m(x ?? defaut, y ?? defaut)
  return {
    hanche: [m(a.hanche[0], b.hanche[0]), m(a.hanche[1], b.hanche[1])],
    torse: m(a.torse, b.torse),
    brasHaut: m(a.brasHaut, b.brasHaut),
    brasBas: m(a.brasBas, b.brasBas),
    brasHautLoin: opt(a.brasHautLoin, b.brasHautLoin, NaN),
    brasBasLoin: opt(a.brasBasLoin, b.brasBasLoin, NaN),
    cuisse: m(a.cuisse, b.cuisse),
    tibia: m(a.tibia, b.tibia),
    pied: opt(a.pied, b.pied, 90),
    cuisseLoin: opt(a.cuisseLoin, b.cuisseLoin, NaN),
    tibiaLoin: opt(a.tibiaLoin, b.tibiaLoin, NaN),
    piedLoin: opt(a.piedLoin, b.piedLoin, NaN),
    tete: opt(a.tete, b.tete, 0),
  }
}

function nettoyer(pose: Pose): Pose {
  const sansNaN = (v: number | undefined) => (v === undefined || Number.isNaN(v) ? undefined : v)
  return {
    ...pose,
    brasHautLoin: sansNaN(pose.brasHautLoin),
    brasBasLoin: sansNaN(pose.brasBasLoin),
    cuisseLoin: sansNaN(pose.cuisseLoin),
    tibiaLoin: sansNaN(pose.tibiaLoin),
    piedLoin: sansNaN(pose.piedLoin),
  }
}

const adoucir = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const LIME = '#c6f948'
const PROCHE = '#e8eef4'
const LOIN = '#4a5663'

function Membre({ points, largeur, couleur }: { points: Point[]; largeur: number; couleur: string }) {
  return (
    <polyline
      points={points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}
      fill="none"
      stroke={couleur}
      strokeWidth={largeur}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function Equipement({ type, s, vue }: { type: Materiel; s: Squelette; vue: 'cote' | 'face' }) {
  const milieuPoignets: Point = [
    (s.poignet[0] + s.poignetLoin[0]) / 2,
    (s.poignet[1] + s.poignetLoin[1]) / 2,
  ]

  switch (type) {
    case 'sol':
      return (
        <g>
          <line x1="10" y1={SOL} x2="190" y2={SOL} stroke="#39434e" strokeWidth="3" strokeLinecap="round" />
          {[22, 46, 70, 94, 118, 142, 166].map((x) => (
            <line key={x} x1={x} y1={SOL + 2} x2={x - 8} y2={SOL + 10} stroke="#242c35" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </g>
      )
    case 'piste':
      return (
        <g>
          <line x1="6" y1={SOL} x2="194" y2={SOL} stroke="#39434e" strokeWidth="3" strokeLinecap="round" />
          {[30, 70, 110, 150].map((x) => (
            <line key={x} x1={x} y1={SOL - 7} x2={x + 22} y2={SOL - 7} stroke="#242c35" strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
      )
    case 'rampe':
      return (
        <g>
          <line x1="8" y1={SOL + 14} x2="192" y2={SOL - 32} stroke="#39434e" strokeWidth="4" strokeLinecap="round" />
          <line x1="8" y1={SOL + 14} x2="8" y2={SOL + 22} stroke="#39434e" strokeWidth="3" />
          <text x="142" y={SOL + 6} fill="#5c6775" fontSize="11" fontWeight="700">
            10-12 %
          </text>
        </g>
      )
    case 'barre': {
      // De face : la barre et ses disques. De côté : le disque vu de profil.
      if (vue === 'cote') {
        return (
          <g>
            <circle cx={s.poignet[0]} cy={s.poignet[1]} r="12" fill="none" stroke={LIME} strokeWidth="4" />
            <line
              x1={s.poignet[0] - 16}
              y1={s.poignet[1]}
              x2={s.poignet[0] + 16}
              y2={s.poignet[1]}
              stroke={LIME}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )
      }
      const centre: Point = [
        (s.poignet[0] + s.poignetLoin[0]) / 2,
        (s.poignet[1] + s.poignetLoin[1]) / 2,
      ]
      const demi = 46
      return (
        <g>
          <line
            x1={centre[0] - demi}
            y1={centre[1]}
            x2={centre[0] + demi}
            y2={centre[1]}
            stroke={LIME}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {[-1, 1].map((cote) => (
            <rect
              key={cote}
              x={centre[0] + cote * demi - 4}
              y={centre[1] - 11}
              width="8"
              height="22"
              rx="2.5"
              fill={LIME}
            />
          ))}
        </g>
      )
    }
    case 'halteres':
      return (
        <g>
          {[s.poignet, s.poignetLoin].map((p, i) => (
            <g key={i} opacity={i === 1 && vue === 'cote' ? 0.55 : 1}>
              <line x1={p[0] - 11} y1={p[1]} x2={p[0] + 11} y2={p[1]} stroke={LIME} strokeWidth="3.5" strokeLinecap="round" />
              {[-1, 1].map((c) => (
                <rect key={c} x={p[0] + c * 11 - 3.5} y={p[1] - 7} width="7" height="14" rx="2" fill={LIME} />
              ))}
            </g>
          ))}
        </g>
      )
    case 'haltere-une-main':
      return (
        <g>
          <line x1={s.poignet[0] - 10} y1={s.poignet[1]} x2={s.poignet[0] + 10} y2={s.poignet[1]} stroke={LIME} strokeWidth="3.5" strokeLinecap="round" />
          {[-1, 1].map((c) => (
            <rect key={c} x={s.poignet[0] + c * 10 - 3.5} y={s.poignet[1] - 7} width="7" height="14" rx="2" fill={LIME} />
          ))}
        </g>
      )
    case 'banc':
      return (
        <g>
          <rect x={s.hanche[0] - 62} y={s.hanche[1] + 10} width="104" height="9" rx="4" fill="#2b333c" />
          <line x1={s.hanche[0] - 46} y1={s.hanche[1] + 19} x2={s.hanche[0] - 46} y2={SOL} stroke="#2b333c" strokeWidth="5" />
          <line x1={s.hanche[0] + 30} y1={s.hanche[1] + 19} x2={s.hanche[0] + 30} y2={SOL} stroke="#2b333c" strokeWidth="5" />
        </g>
      )
    case 'banc-incline':
      return (
        <g>
          <path
            d={`M ${s.hanche[0] + 22} ${s.hanche[1] + 14} L ${s.hanche[0] - 46} ${s.hanche[1] - 28} L ${s.hanche[0] - 52} ${s.hanche[1] - 18} L ${s.hanche[0] + 18} ${s.hanche[1] + 24} Z`}
            fill="#2b333c"
          />
          <line x1={s.hanche[0] + 16} y1={s.hanche[1] + 22} x2={s.hanche[0] + 16} y2={SOL} stroke="#2b333c" strokeWidth="5" />
          <line x1={s.hanche[0] - 44} y1={s.hanche[1] - 20} x2={s.hanche[0] - 44} y2={SOL} stroke="#2b333c" strokeWidth="5" />
        </g>
      )
    case 'machine':
      return (
        <g>
          <line x1="178" y1="34" x2="178" y2={SOL} stroke="#2b333c" strokeWidth="6" strokeLinecap="round" />
          <rect x="168" y="48" width="20" height="46" rx="4" fill="#2b333c" />
          <line
            x1={milieuPoignets[0]}
            y1={milieuPoignets[1]}
            x2="178"
            y2={milieuPoignets[1]}
            stroke={LIME}
            strokeWidth="2.5"
            strokeDasharray="5 4"
          />
        </g>
      )
    case 'barre-fixe':
      return (
        <g>
          <line x1="44" y1="26" x2="156" y2="26" stroke={LIME} strokeWidth="5" strokeLinecap="round" />
          <line x1="48" y1="26" x2="48" y2="12" stroke="#2b333c" strokeWidth="5" strokeLinecap="round" />
          <line x1="152" y1="26" x2="152" y2="12" stroke="#2b333c" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case 'poulie-haute':
      return (
        <g>
          <line x1="40" y1="20" x2="160" y2="20" stroke="#2b333c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="24" r="5" fill="#2b333c" />
          <line x1="100" y1="26" x2={milieuPoignets[0]} y2={milieuPoignets[1]} stroke={LIME} strokeWidth="2.5" />
          <line
            x1={s.poignet[0]}
            y1={s.poignet[1]}
            x2={s.poignetLoin[0]}
            y2={s.poignetLoin[1]}
            stroke={LIME}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      )
    case 'corde': {
      // Poulie haute à la corde : le câble descend puis se sépare en deux brins.
      const jonction: Point = [milieuPoignets[0], milieuPoignets[1] - 14]
      return (
        <g>
          <line x1="40" y1="20" x2="160" y2="20" stroke="#2b333c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="24" r="5" fill="#2b333c" />
          <line x1="100" y1="26" x2={jonction[0]} y2={jonction[1]} stroke={LIME} strokeWidth="2.5" />
          {[s.poignet, s.poignetLoin].map((pt, i) => (
            <g key={i}>
              <line x1={jonction[0]} y1={jonction[1]} x2={pt[0]} y2={pt[1]} stroke={LIME} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={pt[0]} cy={pt[1]} r="3.5" fill={LIME} />
            </g>
          ))}
        </g>
      )
    }
    case 'barres-paralleles':
      return (
        <g>
          {[s.poignet, s.poignetLoin].map((p, i) => (
            <g key={i} opacity={i === 1 ? 0.5 : 1}>
              <line x1={p[0] - 26} y1={p[1]} x2={p[0] + 26} y2={p[1]} stroke={LIME} strokeWidth="4.5" strokeLinecap="round" />
              <line x1={p[0] + 22} y1={p[1]} x2={p[0] + 22} y2={SOL} stroke="#2b333c" strokeWidth="4" />
            </g>
          ))}
        </g>
      )
    case 'roue':
      return (
        <g>
          <circle cx={s.poignet[0]} cy={SOL - 11} r="11" fill="none" stroke={LIME} strokeWidth="4" />
          <line
            x1={s.poignet[0] - 15}
            y1={SOL - 11}
            x2={s.poignet[0] + 15}
            y2={SOL - 11}
            stroke={LIME}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )
    default:
      return null
  }
}

export default function DemoExercice({
  animation,
  onPhase,
  className,
}: {
  animation: Animation
  onPhase?: (index: number) => void
  className?: string
}) {
  const reduit =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [joue, setJoue] = useState(!reduit)
  const [lent, setLent] = useState(false)
  const [pose, setPose] = useState<Pose>(() => animation.phases[0].pose)
  const [phase, setPhase] = useState(0)
  const debut = useRef<number>(0)
  const derniere = useRef<number>(0)

  const total = useMemo(
    () => animation.phases.reduce((t, p) => t + p.duree, 0),
    [animation],
  )

  useEffect(() => {
    setPose(animation.phases[0].pose)
    setPhase(0)
    debut.current = 0
  }, [animation])

  useEffect(() => {
    if (!joue) return
    let brut = 0
    const facteur = lent ? 0.5 : 1

    const tick = (maintenant: number) => {
      if (debut.current === 0) debut.current = maintenant
      const ecoule = ((maintenant - debut.current) * facteur) % total

      let reste = ecoule
      let index = 0
      while (index < animation.phases.length && reste > animation.phases[index].duree) {
        reste -= animation.phases[index].duree
        index += 1
      }
      index = Math.min(index, animation.phases.length - 1)
      const courante = animation.phases[index]
      const suivante = animation.phases[(index + 1) % animation.phases.length]
      const t = adoucir(Math.min(1, reste / courante.duree))

      setPose(nettoyer(melangerPoses(courante.pose, suivante.pose, t)))
      if (index !== derniere.current) {
        derniere.current = index
        setPhase(index)
        onPhase?.(index)
      }
      brut = requestAnimationFrame(tick)
    }

    brut = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(brut)
  }, [joue, lent, animation, total, onPhase])

  const s = squelette(pose, animation.vue)
  const nomPhase = animation.phases[phase]?.nom ?? ''

  return (
    <div className={className}>
      <div className="relative rounded-2xl bg-ink-900 border border-white/5 overflow-hidden">
        <svg viewBox="0 0 200 200" className="w-full h-auto" role="img" aria-label={`Démonstration : ${nomPhase}`}>
          <defs>
            <radialGradient id="scene" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#c6f948" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#c6f948" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="200" height="200" fill="url(#scene)" />

          <g
            transform={
              animation.decalage
                ? `translate(${animation.decalage[0]}, ${animation.decalage[1]})`
                : undefined
            }
          >
          {animation.materiel
            .filter(
              (m) =>
                m === 'sol' ||
                m === 'piste' ||
                m === 'rampe' ||
                m === 'banc' ||
                m === 'banc-incline' ||
                m === 'machine' ||
                m === 'barre-fixe' ||
                m === 'poulie-haute' ||
                m === 'corde',
            )
            .map((m) => (
              <Equipement key={m} type={m} s={s} vue={animation.vue} />
            ))}

          {/* Membres éloignés */}
          <g opacity={0.75}>
            <Membre points={[s.epauleLoin, s.coudeLoin, s.poignetLoin]} largeur={7} couleur={LOIN} />
            <Membre points={[s.hancheLoin, s.genouLoin, s.chevilleLoin, s.orteilsLoin]} largeur={9} couleur={LOIN} />
          </g>

          {/* Tronc et tête */}
          <Membre points={[s.hanche, s.epaule]} largeur={15} couleur={PROCHE} />
          <line
            x1={s.hancheLoin[0]}
            y1={s.hancheLoin[1]}
            x2={s.hancheProche[0]}
            y2={s.hancheProche[1]}
            stroke={PROCHE}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <line
            x1={s.epauleLoin[0]}
            y1={s.epauleLoin[1]}
            x2={s.epauleProche[0]}
            y2={s.epauleProche[1]}
            stroke={PROCHE}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx={s.tete[0]} cy={s.tete[1]} r={TETE_R} fill={PROCHE} />

          {/* Membres proches */}
          <Membre points={[s.hancheProche, s.genou, s.cheville, s.orteils]} largeur={11} couleur={PROCHE} />
          <Membre points={[s.epauleProche, s.coude, s.poignet]} largeur={8.5} couleur={PROCHE} />

          {animation.materiel
            .filter((m) => m === 'barre' || m === 'halteres' || m === 'haltere-une-main' || m === 'roue' || m === 'barres-paralleles')
            .map((m) => (
              <Equipement key={m} type={m} s={s} vue={animation.vue} />
            ))}
          </g>
        </svg>

        <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between gap-2 px-2.5 py-2 bg-gradient-to-t from-ink-950/95 to-transparent">
          <span className="text-[12px] font-bold text-lime-400 truncate">{nomPhase}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setLent((v) => !v)}
              className={`h-9 px-2.5 rounded-lg text-[11px] font-bold border ${
                lent ? 'bg-lime-500 text-ink-950 border-lime-500' : 'bg-ink-850/90 text-white/60 border-white/10'
              }`}
            >
              ×0,5
            </button>
            <button
              type="button"
              onClick={() => {
                debut.current = 0
                setJoue((v) => !v)
              }}
              aria-label={joue ? 'Mettre l’animation en pause' : 'Lancer l’animation'}
              className="h-9 w-9 rounded-lg bg-ink-850/90 border border-white/10 text-white/80 text-[12px] font-bold grid place-items-center"
            >
              {joue ? '❚❚' : '▶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
