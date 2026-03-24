import { getLatencyColor } from '@/lib/utils'

interface LatencyBadgeProps {
  ms: number | null
}

export function LatencyBadge({ ms }: LatencyBadgeProps) {
  if (ms === null) {
    return <span className="font-mono text-sm text-text-muted">&mdash;</span>
  }

  return (
    <span className={`font-mono text-sm ${getLatencyColor(ms)}`}>
      {ms}ms
    </span>
  )
}
