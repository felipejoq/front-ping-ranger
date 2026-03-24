import { SignIn } from '@clerk/nextjs'
import { Radar } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <Radar className="h-8 w-8 text-accent" />
        <span className="text-2xl font-bold text-text-primary">PingRanger</span>
      </div>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  )
}
