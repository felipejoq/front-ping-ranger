'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { authClient, getBackendToken } from '@/lib/auth-client'
import { Plus, Radar, AlertTriangle } from 'lucide-react'
import { Monitor, createApiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { MonitorCard } from '@/components/monitors/monitor-card'
import { useMonitorEvents } from '@/hooks/use-monitor-events'

interface MonitorListProps {
  initialMonitors: Monitor[]
}

export function MonitorList({ initialMonitors }: MonitorListProps) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  const { data: monitors, mutate } = useSWR<Monitor[]>(
    !isPending && session ? '/monitors' : null,
    async () => {
      const token = await getBackendToken()
      const api = createApiClient(token)
      return api.getMonitors()
    },
    {
      fallbackData: initialMonitors,
      revalidateOnFocus: false,
    },
  )

  const connected = useMonitorEvents(
    useCallback(() => {
      mutate()
    }, [mutate]),
  )

  const total = monitors?.length ?? 0
  const downCount = monitors?.filter((m) => m.active && m.lastStatus === 'down').length ?? 0
  const upCount = monitors?.filter((m) => m.active && m.lastStatus === 'up').length ?? 0

  const sorted = monitors ? [...monitors].sort((a, b) => {
    const score = (m: Monitor) => {
      if (m.active && m.lastStatus === 'down') return 0
      if (!m.active) return 2
      return 1
    }
    return score(a) - score(b)
  }) : []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tus monitores</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-text-secondary">
              {total} monitor{total !== 1 ? 'es' : ''}
            </p>
            <div className={`flex items-center gap-1.5 text-xs ${connected ? 'text-status-up' : 'text-text-muted'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-status-up animate-pulse' : 'bg-text-muted'}`} />
              {connected ? 'En vivo' : 'Conectando...'}
            </div>
          </div>
        </div>
        <Button onClick={() => router.push('/monitors/new')}>
          <Plus className="h-4 w-4" />
          Nuevo monitor
        </Button>
      </div>

      {/* Summary bar */}
      {monitors && monitors.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Total</p>
            <p className="text-2xl font-bold text-text-primary">{total}</p>
          </div>
          <div className={`bg-bg-card border rounded-xl p-4 ${upCount > 0 ? 'border-status-up/20' : 'border-border-subtle'}`}>
            <p className="text-xs text-text-muted mb-1">Operacionales</p>
            <p className={`text-2xl font-bold ${upCount > 0 ? 'text-status-up' : 'text-text-muted'}`}>{upCount}</p>
          </div>
          <div className={`bg-bg-card border rounded-xl p-4 ${downCount > 0 ? 'border-status-down/20' : 'border-border-subtle'}`}>
            <p className="text-xs text-text-muted mb-1">Con incidente</p>
            <p className={`text-2xl font-bold ${downCount > 0 ? 'text-status-down' : 'text-text-muted'}`}>{downCount}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {monitors?.length === 0 && (
        <EmptyState
          icon={Radar}
          title="No tienes monitores aún"
          description="Agrega tu primera URL para empezar a monitorear"
          actionLabel="Agregar monitor"
          onAction={() => router.push('/monitors/new')}
        />
      )}

      {/* Monitor list */}
      {sorted.length > 0 && (
        <div className="space-y-3">
          {downCount > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-status-down" />
              <span className="text-xs text-status-down font-medium">
                {downCount} monitor{downCount !== 1 ? 'es' : ''} con incidente activo
              </span>
            </div>
          )}
          {sorted.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onDeleted={() => mutate()}
              onUpdated={() => mutate()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
