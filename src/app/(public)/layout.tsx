/**
 * Public layout component
 * Provides consistent layout for all public pages
 */

import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Padeliga
            <span className="text-sm ml-2 text-gray-500 dark:text-gray-400 font-normal italic">
              Tu liga. Tu juego.
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            
            <Link
              href="/signup"
              className="text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-md px-3 py-2 transition-colors"
            >
              Sign Up
            </Link>
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
              <Link href="/" className="text-xl font-bold text-primary">
                Padeliga
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tu liga. Tu juego.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/leagues" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                Leagues
              </Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Padeliga. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
