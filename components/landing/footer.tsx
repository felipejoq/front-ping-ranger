import Link from 'next/link'
import { Radar } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-accent" />
          <span className="font-semibold text-text-primary">PingRanger</span>
          <span className="text-text-muted text-sm ml-2">Uptime monitoring, simplified.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <Link href="/sign-in" className="hover:text-text-primary transition-colors">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:text-text-primary transition-colors">
            Sign up
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-border-subtle text-center">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} PingRanger.
        </p>
      </div>
    </footer>
  )
}
