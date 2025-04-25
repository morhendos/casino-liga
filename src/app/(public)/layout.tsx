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
import { Trophy } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();
  
  // Determine if current page is the leagues page
  const isLeaguesPage = pathname === '/leagues';
  
  return (
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
            <SkewedButton 
              buttonVariant="ghost"
              buttonSize="sm"
              hoverEffectColor="teal"
              hoverEffectVariant="outline"
              className="border border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
              skewAngle={354}
            >
              <Link href="/leagues" className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                <span>Ligas</span>
              </Link>
            </SkewedButton>
            
            {isAuthenticated ? (
              /* Show dashboard link for authenticated users */
              <SkewedButton 
                buttonVariant="teal" 
                buttonSize="sm"
                hoverEffectColor="teal"
                hoverEffectVariant="solid"
                className="text-white font-medium"
                skewAngle={354}
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
                  className="border border-gray-600 text-gray-200 hover:bg-white/10"
                  skewAngle={354}
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
                  skewAngle={354}
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