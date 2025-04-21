'use client';

/**
 * Public layout component
 * Provides consistent layout for all public pages
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PadeligaLogo from '@/components/PadeligaLogo';
import { useSession } from 'next-auth/react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <PadeligaLogo size="sm" showTagline={false} />
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/leagues"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors"
            >
              Ligas
            </Link>
            
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
            
            {isAuthenticated ? (
              /* Show dashboard link for authenticated users */
              <Button variant="gradient" size="sm" asChild>
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
            ) : (
              /* Show login/signup for non-authenticated users */
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors"
                >
                  Iniciar Sesión
                </Link>
                
                <Button variant="gradient" size="sm" asChild>
                  <Link href="/signup">
                    Registrarse
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <PadeligaLogo size="sm" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors text-center md:text-left">
                Inicio
              </Link>
              <Link href="/leagues" className="text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors text-center md:text-left">
                Ligas
              </Link>
              
              {isAuthenticated ? (
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors text-center md:text-left">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors text-center md:text-left">
                    Iniciar Sesión
                  </Link>
                  <Link href="/signup" className="text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors text-center md:text-left">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Padeliga. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}