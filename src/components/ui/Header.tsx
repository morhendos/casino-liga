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
            
            {/* Theme toggle moved to right side of navbar with updated styling */}
            <button 
              onClick={toggleDarkMode}
              className="ml-4 px-2 py-1 flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal border-l border-gray-200 dark:border-gray-700 transition-colors duration-300"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5 mr-1" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 mr-1" />
                  <span>Oscuro</span>
                </>
              )}
            </button>
          </nav>

          {/* Right side buttons - COMPLETELY REDESIGNED WITH LOGO-INSPIRED EFFECTS */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'authenticated' ? (
              // Dashboard button with logo-inspired hover effect
              <div className="relative overflow-hidden group">
                <Button 
                  variant="default"
                  className="bg-padeliga-teal text-white relative z-10 overflow-hidden transition-all duration-300 px-6 py-2"
                  asChild
                >
                  <Link href="/dashboard">Mi Dashboard</Link>
                </Button>
                
                {/* Layered geometric hover effects */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Background geometric shapes */}
                  <div className="absolute top-0 -left-full w-[200%] h-full bg-padeliga-purple/10 transform skew-x-12 group-hover:animate-slide-right transition-all duration-700"></div>
                  <div className="absolute -top-full left-0 w-full h-[200%] bg-padeliga-orange/10 transform -skew-y-12 group-hover:animate-slide-down transition-all duration-700"></div>
                  
                  {/* Border effect */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-white/30 transition-colors duration-300"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Login button with outline style and transparent hover effects */}
                <div className="relative overflow-hidden group">
                  <Button 
                    variant="outline" 
                    className="border border-padeliga-teal text-padeliga-teal bg-transparent hover:bg-transparent relative z-10 transition-all duration-300 px-6 py-2"
                    asChild
                  >
                    <Link href="/login">
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                  
                  {/* Logo-inspired geometric layered hover effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* First layer - diagonal teal trapezoid */}
                    <div className="absolute -top-full left-0 right-0 h-[200%] bg-padeliga-teal/5 transform skew-y-12 group-hover:top-0 transition-all ease-out duration-300"></div>
                    
                    {/* Second layer - bottom teal triangle */}
                    <div className="absolute top-full left-0 right-0 h-full bg-padeliga-teal/10 group-hover:top-1/2 transition-all ease-out duration-500 delay-100"></div>
                    
                    {/* Animated corner effects */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[8px] border-l-[8px] border-padeliga-teal/60 group-hover:w-8 group-hover:h-8 transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[8px] border-r-[8px] border-padeliga-teal/60 group-hover:w-8 group-hover:h-8 transition-all duration-300"></div>
                  </div>
                </div>
                
                {/* Signup button with CLEARLY VISIBLE HOVER EFFECT */}
                <div className="group">
                  <Button 
                    variant="default"
                    className="bg-padeliga-purple hover:bg-padeliga-purple/90 text-white px-6 py-2 group-hover:shadow-[0_0_0_3px_rgba(255,255,255,0.4),_0_0_20px_rgba(111,71,150,0.8)] transition-all duration-300"
                    asChild
                  >
                    <Link href="/signup">
                      <span className="relative z-10">Registrarse</span>
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu buttons - WITH ENHANCED LOGO-INSPIRED EFFECTS */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Menu toggle with geometric effects */}
            <div className="relative overflow-hidden group">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal transition-colors duration-300 relative z-10"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              {/* Geometric corner accents */}
              <div className="absolute top-0 left-0 w-0 h-0 border-t-[6px] border-l-[6px] border-padeliga-teal/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[6px] border-r-[6px] border-padeliga-teal/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - WITH MATCHING LOGO-INSPIRED BUTTON EFFECTS */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
          <nav className="py-2">
            <MobileNavLink href="/leagues" label="Ligas" />
            <MobileNavLink href="/features" label="Características" />
            <MobileNavLink href="/pricing" label="Precios" />
            <MobileNavLink href="/about" label="Nosotros" />
            <MobileNavLink href="/contact" label="Contacto" />
            
            {/* Theme toggle in mobile menu */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Modo de Tema</span>
              <button 
                onClick={toggleDarkMode}
                className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-padeliga-teal dark:hover:text-padeliga-teal transition-colors duration-300"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4 mr-1" />
                    <span>Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-1" />
                    <span>Oscuro</span>
                  </>
                )}
              </button>
            </div>
            
            {status === 'authenticated' ? (
              <div className="px-4 py-3">
                <div className="relative overflow-hidden group w-full">
                  <Button 
                    variant="default"
                    className="w-full bg-padeliga-teal text-white px-6 py-2 relative z-10"
                    asChild
                  >
                    <Link href="/dashboard">Mi Dashboard</Link>
                  </Button>
                  
                  {/* Logo-inspired geometric layered hover effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Background geometric shapes */}
                    <div className="absolute top-0 -left-full w-[200%] h-full bg-padeliga-purple/10 transform skew-x-12 group-hover:animate-slide-right transition-all duration-700"></div>
                    <div className="absolute -top-full left-0 w-full h-[200%] bg-padeliga-orange/10 transform -skew-y-12 group-hover:animate-slide-down transition-all duration-700"></div>
                    
                    {/* Border effect */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-white/30 transition-colors duration-300"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-3">
                {/* Mobile signup button with solid background hover effects */}
                <div className="group w-full">
                  <Button 
                    variant="default"
                    className="w-full bg-padeliga-purple hover:bg-padeliga-purple/90 text-white px-6 py-2 group-hover:shadow-[0_0_0_3px_rgba(255,255,255,0.4),_0_0_20px_rgba(111,71,150,0.8)] transition-all duration-300"
                    asChild
                  >
                    <Link href="/signup">
                      <span className="relative z-10">Registrarse</span>
                    </Link>
                  </Button>
                </div>
                
                {/* Mobile login button with outline hover effects */}
                <div className="relative overflow-hidden group w-full">
                  <Button 
                    variant="outline" 
                    className="w-full border border-padeliga-teal text-padeliga-teal bg-transparent hover:bg-transparent px-6 py-2 flex items-center justify-center relative z-10"
                    asChild
                  >
                    <Link href="/login">
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                  
                  {/* Logo-inspired geometric layered hover effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* First layer - diagonal teal trapezoid */}
                    <div className="absolute -top-full left-0 right-0 h-[200%] bg-padeliga-teal/5 transform skew-y-12 group-hover:top-0 transition-all ease-out duration-300"></div>
                    
                    {/* Second layer - bottom teal triangle */}
                    <div className="absolute top-full left-0 right-0 h-full bg-padeliga-teal/10 group-hover:top-1/2 transition-all ease-out duration-500 delay-100"></div>
                    
                    {/* Animated corner effects */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[8px] border-l-[8px] border-padeliga-teal/60 group-hover:w-8 group-hover:h-8 transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[8px] border-r-[8px] border-padeliga-teal/60 group-hover:w-8 group-hover:h-8 transition-all duration-300"></div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}