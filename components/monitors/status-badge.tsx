import { MonitorStatus } from '@/lib/api'

interface StatusBadgeProps {
  status: MonitorStatus
  size?: 'sm' | 'md'
}

const config = {
  up: {
    bg: 'bg-status-up/10',
    border: 'border-status-up/20',
    text: 'text-status-up',
    label: 'UP',
    dot: 'bg-status-up',
  },
  down: {
    bg: 'bg-status-down/10',
    border: 'border-status-down/20',
    text: 'text-status-down',
    label: 'DOWN',
    dot: 'bg-status-down animate-pulse',
  },
  null: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-text-muted',
    label: 'PENDING',
    dot: 'bg-text-muted',
  },
} as const

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const c = config[status ?? 'null']
  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium font-mono ${c.bg} ${c.border} ${c.text} ${sizeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
