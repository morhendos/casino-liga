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

          {/* Right side buttons - REDESIGNED TO MATCH LOGO STYLE */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle button with angular design */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 relative"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              {/* Angular accent line */}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-padeliga-purple transform scale-x-0 hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </button>
            
            {status === 'authenticated' ? (
              <div className="relative inline-block group">
                <Button 
                  variant="default"
                  className="bg-padeliga-teal border border-padeliga-teal text-white relative overflow-hidden transition-all duration-300 px-6 py-2"
                  asChild
                >
                  <Link href="/dashboard">Mi Dashboard</Link>
                </Button>
                {/* Angular accent line and border effect */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padeliga-orange group-hover:w-full transition-all duration-300"></span>
                <span className="absolute top-0 right-0 w-0 h-0.5 bg-padeliga-orange group-hover:w-full transition-all duration-300"></span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Login button with angular design and underline effect */}
                <div className="relative inline-block group">
                  <Button 
                    variant="outline" 
                    className="border border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5 transition-all duration-300 px-6 py-2 flex items-center"
                    asChild
                  >
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                  {/* Angular accent line */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padeliga-teal group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute top-0 right-0 w-0 h-0.5 bg-padeliga-teal group-hover:w-full transition-all duration-300"></span>
                </div>
                
                {/* Signup button with matching angular design and effects */}
                <div className="relative inline-block group">
                  <Button 
                    variant="default"
                    className="bg-padeliga-orange border border-padeliga-orange text-white transition-all duration-300 px-6 py-2 flex items-center"
                    asChild
                  >
                    <Link href="/signup">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>Registrarse</span>
                    </Link>
                  </Button>
                  {/* Angular accent line */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute top-0 right-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu buttons - ENHANCED WITH ANGULAR DESIGN */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Theme toggle */}
            <div className="relative">
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
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-padeliga-purple transform scale-x-0 hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </div>
            
            <div className="relative">
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
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-padeliga-teal transform scale-x-0 hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - ENHANCED WITH MATCHING BUTTON STYLES */}
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
                <div className="relative group w-full">
                  <Button 
                    variant="default"
                    className="w-full bg-padeliga-teal border border-padeliga-teal text-white px-6 py-2 relative"
                    asChild
                  >
                    <Link href="/dashboard">Mi Dashboard</Link>
                  </Button>
                  {/* Angular accent line */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padeliga-orange group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute top-0 right-0 w-0 h-0.5 bg-padeliga-orange group-hover:w-full transition-all duration-300"></span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-3">
                <div className="relative group w-full">
                  <Button 
                    variant="default"
                    className="w-full bg-padeliga-orange border border-padeliga-orange text-white px-6 py-2 flex items-center justify-center"
                    asChild
                  >
                    <Link href="/signup">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>Registrarse</span>
                    </Link>
                  </Button>
                  {/* Angular accent line */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute top-0 right-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </div>
                
                <div className="relative group w-full">
                  <Button 
                    variant="outline" 
                    className="w-full border border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5 px-6 py-2 flex items-center justify-center"
                    asChild
                  >
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                  {/* Angular accent line */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padeliga-teal group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute top-0 right-0 w-0 h-0.5 bg-padeliga-teal group-hover:w-full transition-all duration-300"></span>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}