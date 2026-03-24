import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Radar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getPublicMonitor } from '@/lib/api'
import { calculateUptime, formatRelativeTime, formatDuration, formatDate } from '@/lib/utils'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  try {
    const monitor = await getPublicMonitor(slug)
    const status = !monitor.active ? 'Pausado' : monitor.lastStatus === 'up' ? 'Operacional' : 'Con incidentes'
    return {
      title: `${monitor.name} · Status | PingRanger`,
      description: `Estado en tiempo real de ${monitor.url}. Estado actual: ${status}.`,
      openGraph: {
        title: `${monitor.name} · Status`,
        description: `Monitorizado por PingRanger. Estado: ${status}.`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${monitor.name} · Status`,
        description: `Estado: ${status} · Monitorizado por PingRanger`,
      },
    }
  } catch {
    return {
      title: 'Status Page · PingRanger',
    }
  }
}

export default async function PublicStatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let monitor
  try {
    monitor = await getPublicMonitor(slug)
  } catch {
    notFound()
  }

  const uptime = calculateUptime(monitor.incidents, monitor.createdAt)
  const activeIncident = monitor.incidents.find((i) => !i.resolvedAt)
  const isUp = monitor.lastStatus === 'up'
  const isPaused = !monitor.active

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Radar className="h-5 w-5 text-accent" />
            <span className="font-semibold text-text-primary text-sm">PingRanger</span>
          </a>
          <span className="text-text-muted text-sm">· Status Page</span>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Monitor identity */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{monitor.name}</h1>
            <p className="text-sm text-text-muted mt-1">{monitor.url}</p>
          </div>

          {/* Status banner */}
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${
            isPaused
              ? 'bg-bg-card border-border-subtle'
              : isUp
                ? 'bg-status-up/5 border-status-up/20'
                : 'bg-status-down/5 border-status-down/20'
          }`}>
            {isPaused ? (
              <Clock className="h-5 w-5 text-text-muted" />
            ) : isUp ? (
              <CheckCircle className="h-5 w-5 text-status-up" />
            ) : (
              <XCircle className="h-5 w-5 text-status-down" />
            )}
            <div>
              <p className={`font-semibold ${
                isPaused ? 'text-text-muted' : isUp ? 'text-status-up' : 'text-status-down'
              }`}>
                {isPaused ? 'Monitor pausado' : isUp ? 'Operacional' : 'Caído'}
              </p>
              {monitor.lastCheckedAt && !isPaused && (
                <p className="text-xs text-text-muted mt-0.5">
                  Último check {formatRelativeTime(monitor.lastCheckedAt)}
                  {monitor.lastLatencyMs != null && ` · ${monitor.lastLatencyMs}ms`}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
              <p className="text-xs text-text-muted mb-1">Uptime (30 días)</p>
              <p className={`text-2xl font-bold ${
                uptime >= 99 ? 'text-status-up' : uptime >= 95 ? 'text-status-pending' : 'text-status-down'
              }`}>
                {uptime.toFixed(2)}%
              </p>
            </div>
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
              <p className="text-xs text-text-muted mb-1">Incidentes (30 días)</p>
              <p className="text-2xl font-bold text-text-primary">{monitor.incidents.length}</p>
            </div>
          </div>

          {/* Active incident */}
          {activeIncident && (
            <div className="bg-status-down/5 border border-status-down/20 rounded-xl p-4">
              <p className="text-sm font-medium text-status-down mb-1">Incidente activo</p>
              <p className="text-xs text-text-secondary">
                Caído desde hace {formatDuration(activeIncident.startedAt, null)}
                {activeIncident.statusCode && ` · HTTP ${activeIncident.statusCode}`}
                {activeIncident.errorMsg && ` · ${activeIncident.errorMsg}`}
              </p>
            </div>
          )}

          {/* Incident history */}
          {monitor.incidents.filter((i) => i.resolvedAt).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-3">Historial de incidentes</h2>
              <div className="space-y-2">
                {monitor.incidents
                  .filter((i) => i.resolvedAt)
                  .slice(0, 5)
                  .map((incident, idx) => (
                    <div
                      key={idx}
                      className="bg-bg-card border border-border-subtle rounded-lg px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs text-text-secondary">
                          {formatDate(incident.startedAt)}
                          {incident.statusCode && ` · HTTP ${incident.statusCode}`}
                        </p>
                      </div>
                      <span className="text-xs text-text-muted shrink-0">
                        {formatDuration(incident.startedAt, incident.resolvedAt)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="border-t border-border-subtle px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Radar className="h-4 w-4 text-accent" />
            <span className="font-semibold text-text-primary text-sm">PingRanger</span>
            <span className="text-text-muted text-sm">— Uptime monitoring, simplified.</span>
          </a>
          <a
            href="/"
            className="text-sm px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
          >
            Monitoriza tu servicio gratis →
          </a>
        </div>
      </footer>
    </div>
  )
}
