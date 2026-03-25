export type MonitorStatus = 'up' | 'down' | null

export interface Monitor {
  id: string
  name: string
  url: string
  intervalMin: number
  active: boolean
  publicSlug: string | null
  lastCheckedAt: string | null
  lastStatus: MonitorStatus
  lastLatencyMs: number | null
  createdAt: string
  incidents?: (Incident | null)[]
  alertConfig?: AlertConfig | null
}

export interface Incident {
  id: string
  monitorId: string
  startedAt: string
  resolvedAt: string | null
  statusCode: number | null
  errorMsg: string | null
}

export interface AlertConfig {
  id: string
  monitorId: string
  type: 'telegram' | 'discord' | 'slack'
  config: { chatId?: string; webhookUrl?: string }
}

export interface MonitorDetail extends Monitor {
  incidents: Incident[]
}

export interface IncidentsResponse {
  incidents: Incident[]
  total: number
  limit: number
  offset: number
}

export interface CreateMonitorInput {
  name: string
  url: string
  intervalMin?: number
  active?: boolean
  makePublic?: boolean
  alertConfig?: {
    type: 'telegram' | 'discord' | 'slack'
    chatId?: string
    webhookUrl?: string
  }
}

export interface UpdateMonitorInput extends Partial<CreateMonitorInput> {}

export interface PublicMonitor {
  name: string
  url: string
  active: boolean
  lastStatus: MonitorStatus
  lastCheckedAt: string | null
  lastLatencyMs: number | null
  createdAt: string
  incidents: {
    startedAt: string
    resolvedAt: string | null
    statusCode: number | null
    errorMsg: string | null
  }[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function request<T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export function createApiClient(token: string | null) {
  return {
    getMonitors: () => request<Monitor[]>('/monitors', token),

    createMonitor: (data: CreateMonitorInput) =>
      request<Monitor>('/monitors', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMonitor: (id: string) =>
      request<MonitorDetail>(`/monitors/${id}`, token),

    updateMonitor: (id: string, data: UpdateMonitorInput) =>
      request<Monitor>(`/monitors/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteMonitor: (id: string) =>
      request<void>(`/monitors/${id}`, token, { method: 'DELETE' }),

    checkMonitor: (id: string) =>
      request<void>(`/monitors/${id}/check`, token, { method: 'POST' }),

    getIncidents: (monitorId: string, limit = 20, offset = 0) =>
      request<IncidentsResponse>(
        `/incidents?monitorId=${monitorId}&limit=${limit}&offset=${offset}`,
        token,
      ),
  }
}

export function getPublicMonitor(slug: string) {
  return request<PublicMonitor>(`/public/${slug}`, null)
}
