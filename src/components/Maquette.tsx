import { useEffect, useState, type ReactNode } from 'react'

/** Vrai sur un écran de téléphone : la maquette disparaît et l'app passe en plein écran. */
export function useEcranTelephone(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 499px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 499px)')
    const ecouteur = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', ecouteur)
    setMobile(mq.matches)
    return () => mq.removeEventListener('change', ecouteur)
  }, [])
  return mobile
}

function BarreEtat() {
  const [heure, setHeure] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setHeure(new Date()), 20_000)
    return () => window.clearInterval(id)
  }, [])
  const h = `${heure.getHours()}:${`${heure.getMinutes()}`.padStart(2, '0')}`
  return (
    <div className="h-[46px] shrink-0 flex items-end justify-between px-7 pb-1 text-[13px] font-semibold text-white/90 select-none">
      <span className="tabular-nums">{h}</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.4} y={8 - i * 2.4} width="3" height={3 + i * 2.4} rx="0.8" fill="currentColor" />
          ))}
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true" fill="none">
          <path d="M8 9.2 1.2 3.6a9.6 9.6 0 0 1 13.6 0L8 9.2Z" fill="currentColor" opacity="0.9" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="currentColor" fill="none" opacity="0.5" />
          <rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor" />
          <path d="M23 4v4a2.2 2.2 0 0 0 0-4Z" fill="currentColor" opacity="0.6" />
        </svg>
      </div>
    </div>
  )
}

/** Cadre d'iPhone centré sur grand écran ; plein écran sur téléphone. */
export default function Maquette({ children }: { children: ReactNode }) {
  const mobile = useEcranTelephone()

  if (mobile) {
    return (
      <div className="h-[100dvh] w-full bg-ink-950 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center gap-6 py-8 px-4">
      <header className="text-center">
        <div className="inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
          <h1 className="text-lg font-extrabold tracking-tight">Antho Fit</h1>
        </div>
        <p className="text-[13px] text-white/35 mt-1">
          Programme, séances et calories. Ouvre la page sur ton téléphone pour l’avoir en plein écran.
        </p>
      </header>

      <div
        className="relative shrink-0 rounded-[58px] bg-[#0b0d10] p-[11px] shadow-phone"
        style={{ width: 412, height: 866 }}
      >
        {/* Boutons physiques */}
        <span className="absolute -left-[3px] top-[168px] h-[32px] w-[3px] rounded-l bg-ink-700" />
        <span className="absolute -left-[3px] top-[224px] h-[56px] w-[3px] rounded-l bg-ink-700" />
        <span className="absolute -left-[3px] top-[292px] h-[56px] w-[3px] rounded-l bg-ink-700" />
        <span className="absolute -right-[3px] top-[248px] h-[84px] w-[3px] rounded-r bg-ink-700" />

        <div
          className="relative overflow-hidden rounded-[47px] bg-ink-950 flex flex-col"
          style={{ width: 390, height: 844 }}
        >
          {/* Encoche */}
          <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-50 h-[31px] w-[122px] rounded-full bg-black flex items-center justify-end pr-3">
            <span className="h-[9px] w-[9px] rounded-full bg-[#1b2430] ring-1 ring-[#2a3a4a]" />
          </div>

          <BarreEtat />
          <div className="flex-1 min-h-0 flex flex-col">{children}</div>

          {/* Barre d'accueil */}
          <div className="h-[22px] shrink-0 grid place-items-center">
            <span className="h-[5px] w-[134px] rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      <p className="text-[12px] text-white/25">Données enregistrées sur cet appareil (localStorage).</p>
    </div>
  )
}
