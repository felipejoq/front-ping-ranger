'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBackendToken } from '@/lib/auth-client'
import { MoreHorizontal, Pencil, Trash2, Pause, Play, PauseCircle, RefreshCw, Globe, GlobeLock } from 'lucide-react'
import { Monitor, createApiClient } from '@/lib/api'
import { LatencyBadge } from './latency-badge'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/components/ui/toast'
import { formatRelativeTime, formatDuration, calculateUptime } from '@/lib/utils'

interface MonitorCardProps {
  monitor: Monitor
  onDeleted: () => void
  onUpdated: () => void
}

export function MonitorCard({ monitor, onDeleted, onUpdated }: MonitorCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [checking, setChecking] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const activeIncident = monitor.incidents?.find((i) => i && !i.resolvedAt)

  async function handleCheckNow() {
    setChecking(true)
    setMenuOpen(false)
    try {
      const token = await getBackendToken()
      const api = createApiClient(token)
      await api.checkMonitor(monitor.id)
      toast('Check iniciado')
      onUpdated()
    } catch {
      toast('Error al ejecutar check', 'error')
    } finally {
      setChecking(false)
    }
  }

  async function handleTogglePublic() {
    setPublishing(true)
    setMenuOpen(false)
    try {
      const token = await getBackendToken()
      const api = createApiClient(token)
      await api.updateMonitor(monitor.id, { makePublic: !monitor.publicSlug })
      toast(monitor.publicSlug ? 'Monitor despublicado' : 'Status page publicada')
      onUpdated()
    } catch {
      toast('Error al actualizar', 'error')
    } finally {
      setPublishing(false)
    }
  }

  async function handleToggleActive() {
    setToggling(true)
    setMenuOpen(false)
    try {
      const token = await getBackendToken()
      const api = createApiClient(token)
      await api.updateMonitor(monitor.id, { active: !monitor.active })
      toast(monitor.active ? 'Monitor pausado' : 'Monitor activado')
      onUpdated()
    } catch {
      toast('Error al actualizar', 'error')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const token = await getBackendToken()
      const api = createApiClient(token)
      await api.deleteMonitor(monitor.id)
      toast('Monitor eliminado')
      onDeleted()
    } catch {
      toast('Error al eliminar', 'error')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <div
        className="bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-active transition-all duration-200 cursor-pointer"
        onClick={() => router.push(`/monitors/${monitor.id}`)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {!monitor.active ? (
              <PauseCircle className="shrink-0 h-4 w-4 text-text-muted" />
            ) : (
              <span
                className={`shrink-0 h-3 w-3 rounded-full ${
                  monitor.lastStatus === 'up'
                    ? 'bg-status-up'
                    : monitor.lastStatus === 'down'
                      ? 'bg-status-down animate-pulse'
                      : 'bg-text-muted'
                }`}
              />
            )}
            <div className="min-w-0">
              <h3 className="font-medium text-text-primary truncate">{monitor.name}</h3>
              <p className="text-sm text-text-secondary truncate">{monitor.url}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
            {monitor.publicSlug && (
              <a
                href={`/p/${monitor.publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors hidden sm:block"
                title="Ver status page pública"
              >
                <Globe className="h-3.5 w-3.5" />
              </a>
            )}
            {monitor.incidents && monitor.incidents.length >= 0 && (
              <span className="text-xs text-text-muted hidden sm:block">
                {calculateUptime(
                  monitor.incidents.filter((i): i is NonNullable<typeof i> => i !== null),
                  monitor.createdAt,
                ).toFixed(2)}% uptime
              </span>
            )}
            <LatencyBadge ms={monitor.lastLatencyMs} />
            {monitor.lastCheckedAt && (
              <span className="text-xs text-text-muted hidden sm:block">
                {formatRelativeTime(monitor.lastCheckedAt)}
              </span>
            )}

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded hover:bg-white/5 text-text-muted transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-44 bg-bg-elevated border border-border-subtle rounded-lg py-1 shadow-xl">
                    <button
                      onClick={handleCheckNow}
                      disabled={checking}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} /> Verificar ahora
                    </button>
                    <button
                      onClick={() => router.push(`/monitors/${monitor.id}/edit`)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={handleTogglePublic}
                      disabled={publishing}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50"
                    >
                      {monitor.publicSlug
                        ? <><GlobeLock className="h-3.5 w-3.5" /> Despublicar</>
                        : <><Globe className="h-3.5 w-3.5" /> Publicar</>
                      }
                    </button>
                    <button
                      onClick={handleToggleActive}
                      disabled={toggling}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50"
                    >
                      {monitor.active
                        ? <><Pause className="h-3.5 w-3.5" /> Pausar</>
                        : <><Play className="h-3.5 w-3.5" /> Activar</>
                      }
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setConfirmOpen(true) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-status-down hover:bg-status-down/5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {activeIncident && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-down/5 border border-status-down/10">
            <span className="h-1.5 w-1.5 rounded-full bg-status-down animate-pulse" />
            <span className="text-xs text-status-down">
              Caído desde hace {formatDuration(activeIncident.startedAt, null)}
            </span>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar monitor"
        description={`¿Seguro que quieres eliminar "${monitor.name}"? Se borrarán todos los incidentes asociados.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
