'use client'

import { authClient, getBackendToken } from '@/lib/auth-client'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { IncidentsResponse, createApiClient } from '@/lib/api'
import { formatDate, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface IncidentsTableProps {
  monitorId: string
}

const PAGE_SIZE = 10

export function IncidentsTable({ monitorId }: IncidentsTableProps) {
  const { data: session, isPending } = authClient.useSession()
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = useSWR<IncidentsResponse>(
    !isPending && session ? `/incidents?monitorId=${monitorId}&offset=${offset}` : null,
    async () => {
      const token = await getBackendToken()
      const api = createApiClient(token)
      return api.getIncidents(monitorId, PAGE_SIZE, offset)
    },
  )

  const incidents = data?.incidents ?? []
  const total = data?.total ?? 0
  const hasNext = offset + PAGE_SIZE < total
  const hasPrev = offset > 0

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-bg-elevated rounded" />
        ))}
      </div>
    )
  }

  if (incidents.length === 0) {
    return (
      <p className="text-sm text-text-muted py-8 text-center">Sin incidentes registrados</p>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted border-b border-border-subtle">
              <th className="pb-3 font-medium">Inicio</th>
              <th className="pb-3 font-medium">Fin</th>
              <th className="pb-3 font-medium">Duración</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {incidents.map((inc, i) => (
              <tr key={inc.id} className={i % 2 === 0 ? '' : 'bg-white/[0.02]'}>
                <td className="py-3 font-mono text-text-secondary">{formatDate(inc.startedAt)}</td>
                <td className="py-3 font-mono text-text-secondary">
                  {inc.resolvedAt ? (
                    formatDate(inc.resolvedAt)
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-status-down">
                      <span className="h-1.5 w-1.5 rounded-full bg-status-down animate-pulse" />
                      En curso
                    </span>
                  )}
                </td>
                <td className="py-3 font-mono text-text-secondary">
                  {formatDuration(inc.startedAt, inc.resolvedAt)}
                </td>
                <td className="py-3 font-mono text-text-secondary">
                  {inc.statusCode ?? '—'}
                </td>
                <td className="py-3 text-text-muted max-w-[200px] truncate">
                  {inc.errorMsg ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
          <span className="text-sm text-text-muted">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={!hasPrev} onClick={() => setOffset((o) => o - PAGE_SIZE)}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button variant="ghost" size="sm" disabled={!hasNext} onClick={() => setOffset((o) => o + PAGE_SIZE)}>
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
