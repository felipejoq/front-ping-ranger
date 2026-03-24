import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-bg-card border border-border-subtle rounded-xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
