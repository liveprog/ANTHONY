const JOUR_COURT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const JOUR_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

function enDate(iso: string): Date {
  const [a, m, j] = iso.split('-').map(Number)
  return new Date(a, (m ?? 1) - 1, j ?? 1)
}

export function formaterDateCourte(iso: string): string {
  return JOUR_COURT.format(enDate(iso)).replace('.', '')
}

export function formaterDateLongue(iso: string): string {
  return JOUR_LONG.format(enDate(iso))
}

export function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function formaterDuree(secondes: number): string {
  const m = Math.floor(secondes / 60)
  const s = Math.round(secondes % 60)
  if (m === 0) return `${s} s`
  if (s === 0) return `${m} min`
  return `${m} min ${s} s`
}
