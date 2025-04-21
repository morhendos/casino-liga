import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import PadeligaLogo from '@/components/PadeligaLogo';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
  children?: React.ReactNode;
}

const NavLink = ({ href, label, active, children }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 font-medium transition-colors relative group",
        active 
          ? "text-padeliga-teal" 
          : "text-gray-700 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal"
      )}
    >
      <div className="flex items-center">
        {label}
        {children && <ChevronDown className="ml-1 h-4 w-4" />}
      </div>
      <div className={cn(
        "absolute bottom-0 left-0 w-0 h-0.5 bg-padeliga-teal transition-all duration-300",
        active ? "w-full" : "group-hover:w-full"
      )}></div>
    </Link>
  );
};

const DropdownLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {label}
    </Link>
  );
};

const MobileNavLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link
      href={href}
      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
    >
      {label}
    </Link>
  );
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for dark mode
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-2" 
        : "bg-transparent py-4"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <PadeligaLogo 
              size="md" 
              showTagline={!isScrolled} 
              sloganPosition="right"
              variant={isScrolled ? "default" : "light"}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/leagues" label="Ligas" />
            
            {/* Features dropdown */}
            <div className="relative" onMouseEnter={() => setFeaturesDropdownOpen(true)} onMouseLeave={() => setFeaturesDropdownOpen(false)}>
              <NavLink href="/features" label="Características">
                <ChevronDown className={cn(
                  "ml-1 h-4 w-4 transition-transform duration-200",
                  featuresDropdownOpen ? "rotate-180" : ""
                )} />
              </NavLink>
              
              {featuresDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-none z-50">
                  <DropdownLink href="/features/leagues" label="Gestión de Ligas" />
                  <DropdownLink href="/features/teams" label="Gestión de Equipos" />
                  <DropdownLink href="/features/matches" label="Programación de Partidos" />
                  <DropdownLink href="/features/results" label="Seguimiento de Resultados" />
                  <DropdownLink href="/features/public" label="Ligas Públicas" />
                  <DropdownLink href="/features/security" label="Autenticación Segura" />
                </div>
              )}
            </div>
            
            <NavLink href="/pricing" label="Precios" />
            <NavLink href="/about" label="Nosotros" />
            <NavLink href="/contact" label="Contacto" />
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {status === 'authenticated' ? (
              <Button variant="teal" asChild>
                <Link href="/dashboard">Mi Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button variant="teal" asChild>
                  <Link href="/signup">Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Theme toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
          <nav className="py-2">
            <MobileNavLink href="/leagues" label="Ligas" />
            <MobileNavLink href="/features" label="Características" />
            <MobileNavLink href="/pricing" label="Precios" />
            <MobileNavLink href="/about" label="Nosotros" />
            <MobileNavLink href="/contact" label="Contacto" />
            
            {status === 'authenticated' ? (
              <div className="px-4 py-3">
                <Button variant="teal" className="w-full" asChild>
                  <Link href="/dashboard">Mi Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <Button variant="teal" className="w-full" asChild>
                  <Link href="/signup">Registrarse</Link>
                </Button>
                <Button variant="outline" className="w-full border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}