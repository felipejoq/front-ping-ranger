import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PingRanger — Uptime Monitoring',
  description: 'Monitor your URLs every minute and get Telegram alerts when something breaks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#ffffff',
          colorInputBackground: '#f4f4f5',
          colorInputText: '#18181b',
          colorText: '#18181b',
          colorTextSecondary: '#52525b',
          colorNeutral: '#18181b',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'shadow-2xl shadow-black/50',
          footerActionLink: 'text-[#6366f1] hover:text-[#4f46e5]',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
