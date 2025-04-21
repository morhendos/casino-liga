import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import PadeligaLogo from '@/components/PadeligaLogo';
import { Menu, X, ChevronDown, Sun, Moon, LogIn, UserPlus } from 'lucide-react';
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

          {/* Right side buttons - REDESIGNED */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle button with enhanced design */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {status === 'authenticated' ? (
              <Button 
                variant="teal"
                className="relative overflow-hidden group transform transition-transform duration-300 hover:scale-105 shadow-md"
                asChild
              >
                <Link href="/dashboard">
                  <span className="relative z-10">Mi Dashboard</span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Link>
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Login button with icon and hover effect */}
                <Button 
                  variant="outline" 
                  className="border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5 transition-all duration-300 relative overflow-hidden group flex items-center space-x-2"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    <span>Iniciar Sesión</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-padeliga-teal transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </Link>
                </Button>
                
                {/* Signup button with special styling */}
                <Button 
                  variant="default"
                  className="relative overflow-hidden border-2 border-padeliga-orange bg-padeliga-orange text-white group transform transition-all duration-300 hover:translate-y-[-2px] shadow-md"
                  asChild
                >
                  <Link href="/signup" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4 mr-1" />
                    <span className="relative z-10">Registrarse</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu buttons - ENHANCED */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Theme toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal transition-colors duration-300"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal transition-colors duration-300"
              aria-label="Toggle menu"
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

      {/* Mobile menu - ENHANCED */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <nav className="py-2">
            <MobileNavLink href="/leagues" label="Ligas" />
            <MobileNavLink href="/features" label="Características" />
            <MobileNavLink href="/pricing" label="Precios" />
            <MobileNavLink href="/about" label="Nosotros" />
            <MobileNavLink href="/contact" label="Contacto" />
            
            {status === 'authenticated' ? (
              <div className="px-4 py-3">
                <Button 
                  variant="teal"
                  className="w-full relative overflow-hidden group transform transition-transform duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/dashboard">
                    <span className="relative z-10">Mi Dashboard</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-3">
                <Button 
                  variant="default"
                  className="w-full relative overflow-hidden border-2 border-padeliga-orange bg-padeliga-orange text-white group transform transition-all duration-300 hover:translate-y-[-2px]"
                  asChild
                >
                  <Link href="/signup" className="flex items-center justify-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="relative z-10">Registrarse</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5 transition-all duration-300 relative overflow-hidden group flex items-center justify-center"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Iniciar Sesión</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-padeliga-teal transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}