import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Carte({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const base =
    'rounded-2xl bg-ink-850/90 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} text-left w-full active:scale-[0.99] transition ${className}`}>
        {children}
      </button>
    )
  }
  return <div className={`${base} ${className}`}>{children}</div>
}

type VarianteBouton = 'principal' | 'secondaire' | 'fantome' | 'danger'

const VARIANTES: Record<VarianteBouton, string> = {
  principal: 'bg-lime-500 text-ink-950 font-bold active:bg-lime-600',
  secondaire: 'bg-ink-700 text-white font-semibold active:bg-ink-600',
  fantome: 'bg-transparent border border-white/10 text-white/80 font-semibold active:bg-white/5',
  danger: 'bg-red-500/15 border border-red-500/40 text-red-300 font-semibold active:bg-red-500/25',
}

export function Bouton({
  variante = 'principal',
  className = '',
  children,
  ...props
}: { variante?: VarianteBouton } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl px-4 min-h-[48px] transition disabled:opacity-40 disabled:active:scale-100 active:scale-[0.98] ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Titre({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <h2 className="text-[13px] uppercase tracking-[0.14em] text-white/40 font-bold">{children}</h2>
      {action}
    </div>
  )
}

export function Etiquette({
  children,
  ton = 'neutre',
}: {
  children: ReactNode
  ton?: 'neutre' | 'lime' | 'sombre' | 'alerte'
}) {
  const tons = {
    neutre: 'bg-white/5 text-white/60 border-white/10',
    lime: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
    sombre: 'bg-ink-900 text-white/40 border-white/5',
    alerte: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tons[ton]}`}>
      {children}
    </span>
  )
}

export function Stat({ valeur, unite, libelle }: { valeur: string | number; unite?: string; libelle: string }) {
  return (
    <div className="rounded-2xl bg-ink-850/90 border border-white/5 px-3 py-3">
      <div className="text-xl font-extrabold text-white leading-none">
        {valeur}
        {unite && <span className="text-xs font-semibold text-white/40 ml-0.5">{unite}</span>}
      </div>
      <div className="text-[11px] text-white/40 mt-1 leading-tight">{libelle}</div>
    </div>
  )
}

export function Vide({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
      <p className="font-bold text-white/70">{titre}</p>
      <p className="text-sm text-white/40 mt-1 leading-snug">{texte}</p>
    </div>
  )
}

export function Compteur({
  valeur,
  onChange,
  pas = 15,
  min = 15,
  max = 300,
  suffixe = 's',
}: {
  valeur: number
  onChange: (v: number) => void
  pas?: number
  min?: number
  max?: number
  suffixe?: string
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-ink-900 border border-white/10 p-1">
      <button
        type="button"
        aria-label={`Diminuer de ${pas} ${suffixe}`}
        onClick={() => onChange(Math.max(min, valeur - pas))}
        disabled={valeur <= min}
        className="w-10 h-10 rounded-lg bg-ink-700 text-lg font-bold text-white active:bg-ink-600 disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-[62px] text-center font-bold tabular-nums">
        {valeur}
        <span className="text-white/40 text-xs ml-0.5">{suffixe}</span>
      </span>
      <button
        type="button"
        aria-label={`Augmenter de ${pas} ${suffixe}`}
        onClick={() => onChange(Math.min(max, valeur + pas))}
        disabled={valeur >= max}
        className="w-10 h-10 rounded-lg bg-ink-700 text-lg font-bold text-white active:bg-ink-600 disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}

export function formaterChrono(secondes: number): string {
  const s = Math.max(0, Math.round(secondes))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${`${r}`.padStart(2, '0')}`
}
