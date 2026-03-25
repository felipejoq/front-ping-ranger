'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient, getBackendToken } from '@/lib/auth-client'
import useSWR from 'swr'
import { ExternalLink, Pencil, Trash2, Clock, Activity, Wifi, Calendar, Globe, GlobeLock, Copy, Check } from 'lucide-react'
import { MonitorDetail, createApiClient } from '@/lib/api'
import { StatusBadge } from '@/components/monitors/status-badge'
import { LatencyBadge } from '@/components/monitors/latency-badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { IncidentsTable } from '@/components/incidents/incidents-table'
import { useToast } from '@/components/ui/toast'
import { formatRelativeTime, formatDate, formatDuration } from '@/lib/utils'

export default function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: monitor, isLoading, mutate } = useSWR<MonitorDetail>(
    !isPending && session ? `/monitors/${id}` : null,
    async () => {
      const token = await getBackendToken()
      const api = createApiClient(token)
      return api.getMonitor(id)
    },
    { refreshInterval: 30000 },
  )

  async function handleTogglePublic() {
    if (!monitor) return
    setPublishing(true)
    try {
      const token = await getBackendToken()
      const api = createApiClient(token)
      await api.updateMonitor(id, { makePublic: !monitor.publicSlug })
      toast(monitor.publicSlug ? 'Monitor despublicado' : 'Status page publicada')
      mutate()
    } catch {
      toast('Error al actualizar', 'error')
    } finally {
      setPublishing(false)
    }
  }

  function handleCopy() {
    if (!monitor?.publicSlug) return
    navigator.clipboard.writeText(`${window.location.origin}/p/${monitor.publicSlug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const token = await getBackendToken()
      const api = createApiClient(token)
      await api.deleteMonitor(id)
      toast('Monitor eliminado')
      router.push('/dashboard')
    } catch {
      toast('Error al eliminar', 'error')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (isLoading || !monitor) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-bg-elevated rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-bg-elevated rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const activeIncident = monitor.incidents?.find((i) => !i.resolvedAt)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <StatusBadge status={monitor.lastStatus} size="md" />
            <h1 className="text-2xl font-bold text-text-primary">{monitor.name}</h1>
          </div>
          <a
            href={monitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {monitor.url}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {monitor.publicSlug ? (
            <div className="flex items-center gap-1 bg-bg-elevated border border-border-subtle rounded-lg pl-3 pr-1 h-9">
              <Globe className="h-3.5 w-3.5 text-accent shrink-0" />
              <a
                href={`/p/${monitor.publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline max-w-[160px] truncate"
              >
                /p/{monitor.publicSlug}
              </a>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
                title="Copiar URL"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-status-up" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleTogglePublic}
                disabled={publishing}
                className="p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-status-down transition-colors disabled:opacity-50"
                title="Despublicar"
              >
                <GlobeLock className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button variant="secondary" onClick={handleTogglePublic} loading={publishing}>
              <Globe className="h-4 w-4" /> Publicar
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push(`/monitors/${id}/edit`)}>
            <Pencil className="h-4 w-4" /> Editar
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      {/* Active incident banner */}
      {activeIncident && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-status-down/5 border border-status-down/10">
          <span className="h-2 w-2 rounded-full bg-status-down animate-pulse" />
          <span className="text-sm text-status-down font-medium">
            Caído desde {formatDate(activeIncident.startedAt)} ({formatDuration(activeIncident.startedAt, null)})
          </span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Clock className="h-3.5 w-3.5" /> Último chequeo
          </div>
          <p className="font-mono text-sm text-text-primary">
            {monitor.lastCheckedAt ? formatRelativeTime(monitor.lastCheckedAt) : '—'}
          </p>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Activity className="h-3.5 w-3.5" /> Latencia
          </div>
          <LatencyBadge ms={monitor.lastLatencyMs} />
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Wifi className="h-3.5 w-3.5" /> Estado
          </div>
          <StatusBadge status={monitor.lastStatus} />
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Calendar className="h-3.5 w-3.5" /> Creado
          </div>
          <p className="font-mono text-sm text-text-primary">
            {formatRelativeTime(monitor.createdAt)}
          </p>
        </Card>
      </div>

      {/* Incidents */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Historial de incidentes</h2>
        <IncidentsTable monitorId={id} />
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar monitor"
        description={`¿Seguro que quieres eliminar "${monitor.name}"? Se borrarán todos los incidentes asociados.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
