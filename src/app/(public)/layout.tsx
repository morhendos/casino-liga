'use client';

/**
 * Public layout component
 * Provides consistent layout for all public pages
 */

import Link from 'next/link';
import { SkewedButton } from '@/components/ui/SkewedButton';
import PadeligaLogo from '@/components/PadeligaLogo';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/ui/Footer';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <header className="bg-[#1A1F2C] text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Link href="/" className="flex items-center">
                <PadeligaLogo variant="light" size="sm" showTagline={false} />
              </Link>
              
              {/* Will be used by child pages to inject the league name */}
              <div id="dynamic-title"></div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {isAuthenticated ? (
                /* Show dashboard link for authenticated users */
                <SkewedButton 
                  buttonVariant="teal" 
                  buttonSize="sm"
                  hoverEffectColor="teal"
                  hoverEffectVariant="solid"
                  className="text-white"
                  asChild
                >
                  <Link href="/dashboard">
                    Dashboard
                  </Link>
                </SkewedButton>
              ) : (
                /* Show login/signup for non-authenticated users - with login page styling */
                <>
                  {/* Login button with border styling from login page */}
                  <SkewedButton 
                    buttonVariant="ghost" 
                    buttonSize="sm"
                    hoverEffectColor="teal"
                    hoverEffectVariant="outline"
                    className="border border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/10"
                    asChild
                  >
                    <Link href="/login">
                      Iniciar Sesión
                    </Link>
                  </SkewedButton>
                  
                  {/* Register button with border and orange styling from login page */}
                  <SkewedButton 
                    buttonVariant="ghost" 
                    buttonSize="sm"
                    hoverEffectColor="orange"
                    hoverEffectVariant="outline"
                    className="border border-padeliga-orange text-padeliga-orange hover:bg-padeliga-orange/10"
                    asChild
                  >
                    <Link href="/signup">
                      Registrarse
                    </Link>
                  </SkewedButton>
                </>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}