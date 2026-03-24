'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

interface MonitorEvent {
  type: 'check_completed' | 'monitor_created' | 'monitor_updated' | 'monitor_deleted'
  monitorId: string
  status?: string
  latencyMs?: number
  lastCheckedAt?: string
}

export function useMonitorEvents(onEvent: (event: MonitorEvent) => void): boolean {
  const { getToken, isLoaded } = useAuth()
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    let eventSource: EventSource | null = null
    let cancelled = false

    async function connect() {
      const token = await getToken()
      if (cancelled || !token) return

      const url = `${API_URL}/events/monitors?token=${encodeURIComponent(token)}`
      eventSource = new EventSource(url)

      eventSource.onopen = () => setConnected(true)

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as MonitorEvent
          onEventRef.current(data)
        } catch {
          // ignore parse errors
        }
      }

      eventSource.onerror = () => {
        setConnected(false)
        eventSource?.close()
        if (!cancelled) {
          setTimeout(connect, 5000)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      setConnected(false)
      eventSource?.close()
    }
  }, [isLoaded, getToken])

  return connected
}
