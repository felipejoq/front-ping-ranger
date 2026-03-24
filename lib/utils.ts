export function formatRelativeTime(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`

  const days = Math.floor(hours / 24)
  return `hace ${days} día${days > 1 ? 's' : ''}`
}

export function formatDuration(start: string, end: string | null): string {
  const startMs = new Date(start).getTime()
  const endMs = end ? new Date(end).getTime() : Date.now()
  const diffMs = endMs - startMs

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''}`

  const days = Math.floor(hours / 24)
  return `${days} día${days > 1 ? 's' : ''}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateUptime(
  incidents: { startedAt: string; resolvedAt: string | null }[],
  monitorCreatedAt: string,
): number {
  const windowMs = 30 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const windowStart = now - windowMs
  const monitorStart = new Date(monitorCreatedAt).getTime()
  const effectiveStart = Math.max(windowStart, monitorStart)
  const totalMs = now - effectiveStart

  if (totalMs <= 0) return 100

  let downtimeMs = 0
  for (const incident of incidents) {
    const start = Math.max(new Date(incident.startedAt).getTime(), effectiveStart)
    const end = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : now
    if (end > effectiveStart) {
      downtimeMs += Math.max(0, end - start)
    }
  }

  return Math.max(0, Math.min(100, ((totalMs - downtimeMs) / totalMs) * 100))
}

export function getLatencyColor(ms: number | null): string {
  if (ms === null) return 'text-text-muted'
  if (ms < 200) return 'text-status-up'
  if (ms <= 500) return 'text-status-pending'
  return 'text-status-down'
}
