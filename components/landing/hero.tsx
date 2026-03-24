import Link from 'next/link'
import { Button } from '@/components/ui/button'

const mockMonitors = [
  { name: 'api.miapp.com', status: 'up' as const, latency: 89, lastCheck: 'hace 1 min' },
  { name: 'admin.miapp.com', status: 'down' as const, latency: null, lastCheck: 'Caído hace 23 min' },
  { name: 'blog.miapp.com', status: 'up' as const, latency: 142, lastCheck: 'hace 2 min' },
]

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/30 px-4 py-1.5 mb-8">
          <span className="h-2 w-2 rounded-full bg-status-up animate-pulse" />
          <span className="text-sm text-accent font-medium">Monitoring 10,000+ URLs right now</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
          Know when your site{' '}
          <span className="text-status-down line-through decoration-status-down/50">goes down</span>.
          <br />
          <span className="text-accent">Before your users do.</span>
        </h1>

        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          PingRanger monitors your URLs every minute and alerts you on Telegram the moment something breaks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/sign-up">
            <Button size="lg" className="w-full sm:w-auto">Start monitoring free</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              See how it works
            </Button>
          </a>
        </div>

        {/* Mock dashboard */}
        <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden max-w-lg mx-auto shadow-2xl shadow-accent/5">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-subtle">
            <span className="h-2.5 w-2.5 rounded-full bg-status-down" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-pending" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-up" />
            <span className="ml-3 text-xs text-text-muted">PingRanger Dashboard</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {mockMonitors.map((m) => (
              <div key={m.name} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      m.status === 'up' ? 'bg-status-up' : 'bg-status-down animate-pulse'
                    }`}
                  />
                  <span className="text-sm font-medium text-text-primary">{m.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-sm ${m.latency ? 'text-status-up' : 'text-text-muted'}`}>
                    {m.latency ? `${m.latency}ms` : '—'}
                  </span>
                  <span className="text-xs text-text-muted w-28 text-right">{m.lastCheck}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
