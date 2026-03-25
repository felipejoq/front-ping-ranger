'use client'

import { createAuthClient } from 'better-auth/react'
import { jwtClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  plugins: [jwtClient()],
})

export async function getBackendToken(): Promise<string | null> {
  try {
    const { data, error } = await authClient.token()
    if (error || !data) return null
    return data.token
  } catch {
    return null
  }
}
