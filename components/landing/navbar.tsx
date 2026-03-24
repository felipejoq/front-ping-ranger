'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { Radar, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg-main/80 backdrop-blur-lg border-b border-border-subtle' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Radar className="h-6 w-6 text-accent" />
          <span className="font-bold text-lg text-text-primary">PingRanger</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            How it works
          </a>
          <a href="#faq" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            FAQ
          </a>
          {!isLoaded ? (
            <div className="w-24 h-8 rounded-lg bg-white/5 animate-pulse" />
          ) : isSignedIn ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Empezar gratis</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-text-secondary" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-bg-main/95 backdrop-blur-lg border-b border-border-subtle px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm text-text-secondary" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="block text-sm text-text-secondary" onClick={() => setMobileOpen(false)}>
            How it works
          </a>
          <a href="#faq" className="block text-sm text-text-secondary" onClick={() => setMobileOpen(false)}>
            FAQ
          </a>
          {!isLoaded ? (
            <div className="w-full h-9 rounded-lg bg-white/5 animate-pulse" />
          ) : isSignedIn ? (
            <Link href="/dashboard">
              <Button className="w-full">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="block text-sm text-text-secondary">
                Iniciar sesión
              </Link>
              <Link href="/sign-up">
                <Button className="w-full">Empezar gratis</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
