'use client';

/**
 * Public layout component
 * Provides consistent layout for all public pages
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SkewedButton } from '@/components/ui/SkewedButton';
import PadeligaLogo from '@/components/PadeligaLogo';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/ui/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();
  
  // Check if current path is a league detail page to hide the back button
  const isLeagueDetailPage = pathname.includes('/leagues/') && pathname !== '/leagues';
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-[#1A1F2C] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <PadeligaLogo size="sm" />
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/leagues"
              className="text-sm font-medium text-gray-200 hover:text-padeliga-teal transition-colors"
            >
              Ligas
            </Link>
            
            <div className="h-4 w-px bg-gray-700"></div>
            
            {isAuthenticated ? (
              /* Show dashboard link for authenticated users */
              <SkewedButton 
                buttonVariant="teal" 
                buttonSize="sm"
                hoverEffectColor="teal"
                hoverEffectVariant="solid"
                className="text-white font-medium"
                asChild
              >
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </SkewedButton>
            ) : (
              /* Show login/signup for non-authenticated users */
              <>
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
                
                <SkewedButton 
                  buttonVariant="teal" 
                  buttonSize="sm"
                  hoverEffectColor="teal"
                  hoverEffectVariant="solid"
                  className="text-white font-medium"
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
  );
}