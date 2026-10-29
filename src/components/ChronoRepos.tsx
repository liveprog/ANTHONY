import { useEffect, useState } from 'react'
import { ajouterTemps, arreterChrono, basculerPause, restantChrono, useChrono } from '../lib/chrono'
import { formaterChrono } from './Ui'

export default function ChronoRepos() {
  const etat = useChrono()
  const [restant, setRestant] = useState(() => restantChrono(etat))

  useEffect(() => {
    if (!etat.actif) return
    setRestant(restantChrono(etat))
    const id = window.setInterval(() => setRestant(restantChrono(etat)), 200)
    return () => window.clearInterval(id)
  }, [etat])

  if (!etat.actif) return null

  const termine = restant <= 0.05
  const progression = etat.total > 0 ? 1 - restant / etat.total : 1
  const rayon = 22
  const perimetre = 2 * Math.PI * rayon
  const enPause = etat.finAt === null

  return (
    <div className="px-3 pb-2 anim-apparait">
      <div
        className={`rounded-2xl border px-3 py-2.5 backdrop-blur-xl flex items-center gap-3 ${
          termine
            ? 'bg-lime-500/20 border-lime-500/50 anim-pulse'
            : 'bg-ink-850/95 border-white/10'
        }`}
      >
        <div className="relative w-[52px] h-[52px] shrink-0">
          <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90">
            <circle cx="26" cy="26" r={rayon} fill="none" stroke="#232a32" strokeWidth="5" />
            <circle
              cx="26"
              cy="26"
              r={rayon}
              fill="none"
              stroke={termine ? '#c6f948' : '#c6f948'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={perimetre}
              strokeDashoffset={perimetre * (1 - Math.min(1, Math.max(0, progression)))}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-[13px] font-extrabold tabular-nums">
            {termine ? '✓' : formaterChrono(restant)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider font-bold text-lime-400">
            {termine ? 'Repos terminé — à toi' : enPause ? 'Repos en pause' : 'Repos en cours'}
          </div>
          <div className="text-sm font-semibold truncate text-white/80">{etat.libelle}</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!termine && (
            <>
              <button
                type="button"
                onClick={() => ajouterTemps(15)}
                className="h-10 px-2.5 rounded-xl bg-ink-700 text-xs font-bold active:bg-ink-600"
                aria-label="Ajouter 15 secondes"
              >
                +15
              </button>
              <button
                type="button"
                onClick={basculerPause}
                className="h-10 w-10 rounded-xl bg-ink-700 text-sm font-bold active:bg-ink-600"
                aria-label={enPause ? 'Reprendre' : 'Mettre en pause'}
              >
                {enPause ? '▶' : '❚❚'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={arreterChrono}
            className={`h-10 px-3 rounded-xl text-xs font-bold ${
              termine ? 'bg-lime-500 text-ink-950' : 'bg-ink-700 text-white/70 active:bg-ink-600'
            }`}
          >
            {termine ? 'OK' : 'Passer'}
          </button>
        </div>
      </div>
    </div>
  )
}
