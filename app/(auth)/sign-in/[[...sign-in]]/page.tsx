'use client'

import { useState } from 'react'
import { Radar } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const GitHubIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
)

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

export default function SignInPage() {
  const [githubLoading, setGithubLoading] = useState(false)

  async function handleGitHub() {
    setGithubLoading(true)
    await authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' })
    // Si llega aquí hubo un error (el redirect no ocurrió)
    setGithubLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <Radar className="h-8 w-8 text-accent" />
        <span className="text-2xl font-bold text-text-primary">PingRanger</span>
      </div>

      <div className="w-full max-w-sm bg-bg-card border border-border-subtle rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-text-primary">Iniciar sesión</h1>
          <p className="text-sm text-text-muted">Ingresa a tu cuenta de PingRanger</p>
        </div>

        <button
          onClick={handleGitHub}
          disabled={githubLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border-subtle rounded-lg text-sm text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {githubLoading ? <Spinner /> : <GitHubIcon />}
          {githubLoading ? 'Conectando con GitHub...' : 'Continuar con GitHub'}
        </button>
      </div>
    </div>
  )
}
