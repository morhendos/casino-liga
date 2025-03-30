'use client'

import { SessionProvider } from 'next-auth/react'
import { type Session } from 'next-auth'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { UIProvider } from '@/components/ui-provider'

export default function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <UIProvider>
          {children}
        </UIProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
