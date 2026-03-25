import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MonitorList } from '@/components/monitors/monitor-list'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
  console.log('[Dashboard] cookies present:', cookieStore.getAll().map((c) => c.name))

  const res = await fetch(`${apiUrl}/api/auth/get-session`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })

  console.log('[Dashboard] session status:', res.status)
  const data = (await res.json().catch(() => null)) as { session?: unknown } | null
  console.log('[Dashboard] session data:', JSON.stringify(data))

  if (!data?.session) redirect('/sign-in')

  return <MonitorList initialMonitors={[]} />
}
