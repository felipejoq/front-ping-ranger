import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-1 ${
            error
              ? 'border-status-down/50 focus:border-status-down/50 focus:ring-status-down/20'
              : 'border-border-subtle focus:border-accent/50 focus:ring-accent/20'
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-status-down">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
