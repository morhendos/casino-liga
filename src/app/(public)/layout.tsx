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
            <PadeligaLogo size="sm" />
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
              <Button variant="teal" size="sm" asChild>
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
            ) : (
              /* Show login/signup for non-authenticated users */
              <>
                <Button variant="outline" size="sm" className="text-padeliga-teal border-padeliga-teal hover:bg-padeliga-teal/10" asChild>
                  <Link href="/login">
                    Iniciar Sesión
                  </Link>
                </Button>
                
                <Button variant="teal" size="sm" asChild>
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
      
      <footer className="bg-padeliga-teal text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <PadeligaLogo variant="light" size="md" />
              <p className="mt-4 text-sm text-white/80">
                La plataforma completa para organizar y gestionar tus ligas de padel.
              </p>
            </div>
            
            <div className="md:col-span-1">
              <h3 className="font-bold mb-4 text-white">Plataforma</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/leagues" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Ligas Públicas
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-1">
              <h3 className="font-bold mb-4 text-white">Cuenta</h3>
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link 
                        href="/dashboard" 
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/dashboard/player-profile" 
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        Mi Perfil
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link 
                        href="/login" 
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        Iniciar Sesión
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/signup" 
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        Registrarse
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="md:col-span-1">
              <h3 className="font-bold mb-4 text-white">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/60">
            <p>© {new Date().getFullYear()} Padeliga. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}