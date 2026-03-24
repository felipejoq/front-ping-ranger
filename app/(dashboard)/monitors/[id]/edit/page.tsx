'use client'

import { use } from 'react'
import { useAuth } from '@clerk/nextjs'
import useSWR from 'swr'
import { MonitorDetail, createApiClient } from '@/lib/api'
import { MonitorForm } from '@/components/monitors/monitor-form'

export default function EditMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getToken, isLoaded } = useAuth()

  const { data: monitor, isLoading } = useSWR<MonitorDetail>(
    isLoaded ? `/monitors/${id}` : null,
    async () => {
      const token = await getToken()
      const api = createApiClient(token)
      return api.getMonitor(id)
    },
  )

  if (isLoading || !monitor) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-bg-elevated rounded" />
        <div className="h-10 w-full max-w-lg bg-bg-elevated rounded" />
        <div className="h-10 w-full max-w-lg bg-bg-elevated rounded" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-8">Editar monitor</h1>
      <MonitorForm monitor={monitor} />
    </div>
  )
}
