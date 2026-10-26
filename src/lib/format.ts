const dateTime = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
const relative = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' })

export function formatDateTime(timestamp: number): string {
  return dateTime.format(timestamp)
}

/** "hoy", "ayer", "hace 3 días"… */
export function formatRelativeDay(timestamp: number, now = Date.now()): string {
  const startOfDay = (t: number) => new Date(t).setHours(0, 0, 0, 0)
  const days = Math.round((startOfDay(timestamp) - startOfDay(now)) / 86_400_000)
  return relative.format(days, 'day')
}

/** "45 s", "3 min", "1 h 5 min" */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s} s`
  const min = Math.round(s / 60)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${min % 60} min`
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/** Color del texto de una nota: verde ≥ 80 %, ámbar ≥ 50 %, rojo por debajo. */
export function scoreColor(percent: number): string {
  if (percent >= 80) return 'text-green-700'
  if (percent >= 50) return 'text-amber-600'
  return 'text-red-700'
}
