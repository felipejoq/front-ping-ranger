'use client'

import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { User, Mail } from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-40 bg-bg-elevated rounded" />
        <div className="h-24 bg-bg-elevated rounded-xl" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-8">Configuración</h1>

      <Card className="max-w-lg space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Mi cuenta</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Nombre</p>
              <p className="text-sm text-text-primary">
                {user?.fullName ?? user?.firstName ?? 'Sin nombre'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm text-text-primary">
                {user?.primaryEmailAddress?.emailAddress ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
