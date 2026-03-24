import { auth } from '@clerk/nextjs/server'
import { Monitor } from '@/lib/api'
import { MonitorList } from '@/components/monitors/monitor-list'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function getMonitors(token: string): Promise<Monitor[]> {
  try {
    const res = await fetch(`${API_URL}/monitors`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const { getToken } = await auth()
  const token = await getToken()
  const initialMonitors = token ? await getMonitors(token) : []

  return <MonitorList initialMonitors={initialMonitors} />
}
