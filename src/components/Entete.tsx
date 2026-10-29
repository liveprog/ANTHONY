import type { ReactNode } from 'react'

export function EnteteOnglet({
  titre,
  sous,
  action,
}: {
  titre: string
  sous?: string
  action?: ReactNode
}) {
  return (
    <header className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">{titre}</h1>
        {sous && <p className="text-[13px] text-white/40 mt-0.5">{sous}</p>}
      </div>
      {action}
    </header>
  )
}

export function EntetePage({
  titre,
  sous,
  onRetour,
  action,
}: {
  titre: string
  sous?: string
  onRetour: () => void
  action?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 bg-ink-950/90 backdrop-blur-xl px-3 pt-3 pb-3 border-b border-white/5 flex items-center gap-2">
      <button
        type="button"
        onClick={onRetour}
        aria-label="Retour"
        className="w-10 h-10 shrink-0 rounded-xl bg-ink-800 grid place-items-center active:bg-ink-700"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14.5 5 8 12l6.5 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-[17px] font-extrabold truncate leading-tight">{titre}</h1>
        {sous && <p className="text-[12px] text-white/40 truncate">{sous}</p>}
      </div>
      {action}
    </header>
  )
}
