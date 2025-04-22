import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import PadeligaLogo from '@/components/PadeligaLogo';
import { Menu, X, ChevronDown, Sun, Moon, UserPlus, ChevronRight } from 'lucide-react';
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
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle button with enhanced geometric effect */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 relative overflow-hidden"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="relative z-10">
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </div>
              {/* Geometric shape that appears on hover */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute -top-6 -left-6 w-6 h-12 bg-padeliga-purple/20 transform rotate-45 transition-transform duration-300 scale-0 origin-bottom-right hover:scale-100"></div>
                <div className="absolute -bottom-6 -right-6 w-6 h-12 bg-padeliga-teal/20 transform rotate-45 transition-transform duration-300 scale-0 origin-top-left hover:scale-100"></div>
              </div>
            </button>
            
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
                {/* Login button with enhanced ring-inspired effects */}
                <div className="relative overflow-hidden group">
                  <Button 
                    variant="outline" 
                    className="border border-padeliga-teal text-padeliga-teal bg-transparent hover:bg-transparent relative z-10 transition-all duration-300 px-6 py-2 flex items-center"
                    asChild
                  >
                    <Link href="/login">
                      {/* Custom geometric icon that matches the aesthetic */}
                      <div className="mr-2 h-4 w-4 relative">
                        <div className="absolute inset-0 border border-current"></div>
                        <div className="absolute inset-[2px] border border-current opacity-70"></div>
                      </div>
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                  
                  {/* Enhanced geometric layered hover effects with concentric rings */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Base layer - full teal wash with very low opacity */}
                    <div className="absolute inset-0 bg-padeliga-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Concentric ring effect with thin borders */}
                    <div className="absolute inset-3 border border-padeliga-teal/0 group-hover:border-padeliga-teal/20 transition-colors duration-500 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transform-gpu"></div>
                    <div className="absolute inset-6 border border-padeliga-teal/0 group-hover:border-padeliga-teal/30 transition-colors duration-500 delay-100 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transform-gpu"></div>
                    
                    {/* Diagonal striped overlays */}
                    <div className="absolute -top-full -left-full w-[200%] h-[200%] group-hover:top-[-20%] group-hover:left-[-20%] transition-all duration-500">
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left"></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '20%' }}></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '40%' }}></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '60%' }}></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '80%' }}></div>
                    </div>
                    
                    {/* Angular geometric accent shapes */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[12px] border-l-[12px] border-padeliga-teal/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[12px] border-r-[12px] border-padeliga-teal/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
                    
                    {/* Pulsing ring effect on hover */}
                    <div className="absolute inset-0 border-2 border-padeliga-teal/0 group-hover:border-padeliga-teal/20 scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse-slow"></div>
                  </div>
                </div>
                
                {/* Signup button with purple color and advanced logo-inspired effects */}
                <div className="relative overflow-hidden group">
                  <Button 
                    variant="default"
                    className="bg-padeliga-purple border-none text-white relative z-10 transition-all duration-300 px-6 py-2 flex items-center"
                    asChild
                  >
                    <Link href="/signup">
                      <UserPlus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Registrarse</span>
                    </Link>
                  </Button>
                  
                  {/* Logo-inspired geometric layered hover effects */}
                  <div className="absolute inset-0">
                    {/* Background base layers */}
                    <div className="absolute inset-0 bg-padeliga-purple"></div>
                    
                    {/* Geometric shape overlays that appear on hover */}
                    <div className="absolute top-0 -right-full w-full h-full bg-padeliga-orange/20 transform skew-x-12 group-hover:right-0 transition-all ease-out duration-500"></div>
                    <div className="absolute -bottom-full right-0 w-full h-full bg-padeliga-teal/20 transform -skew-x-12 group-hover:bottom-0 transition-all ease-out duration-500 delay-100"></div>
                    
                    {/* Diagonal stripes */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                      <div className="absolute top-0 left-0 w-3 h-full bg-white/10 transform -skew-x-45"></div>
                      <div className="absolute top-0 left-1/3 w-3 h-full bg-white/10 transform -skew-x-45"></div>
                      <div className="absolute top-0 right-1/3 w-3 h-full bg-white/10 transform -skew-x-45"></div>
                    </div>
                    
                    {/* Corner geometric accents */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[10px] border-l-[10px] border-white/30 group-hover:w-10 group-hover:h-10 transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[10px] border-r-[10px] border-white/30 group-hover:w-10 group-hover:h-10 transition-all duration-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu buttons - WITH ENHANCED LOGO-INSPIRED EFFECTS */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Theme toggle with geometric effects */}
            <div className="relative overflow-hidden group">
              <button 
                onClick={toggleDarkMode}
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 hover:text-padeliga-teal dark:text-gray-300 dark:hover:text-padeliga-teal transition-colors duration-300 relative z-10"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              
              {/* Geometric corner accents */}
              <div className="absolute top-0 left-0 w-0 h-0 border-t-[6px] border-l-[6px] border-padeliga-purple/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[6px] border-r-[6px] border-padeliga-purple/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
            </div>
            
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
                {/* Mobile signup button with matching effects */}
                <div className="relative overflow-hidden group w-full">
                  <Button 
                    variant="default"
                    className="w-full bg-padeliga-purple text-white px-6 py-2 flex items-center justify-center relative z-10"
                    asChild
                  >
                    <Link href="/signup">
                      <UserPlus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Registrarse</span>
                    </Link>
                  </Button>
                  
                  {/* Logo-inspired geometric layered hover effects */}
                  <div className="absolute inset-0">
                    {/* Background base layers */}
                    <div className="absolute inset-0 bg-padeliga-purple"></div>
                    
                    {/* Geometric shape overlays that appear on hover */}
                    <div className="absolute top-0 -right-full w-full h-full bg-padeliga-orange/20 transform skew-x-12 group-hover:right-0 transition-all ease-out duration-500"></div>
                    <div className="absolute -bottom-full right-0 w-full h-full bg-padeliga-teal/20 transform -skew-x-12 group-hover:bottom-0 transition-all ease-out duration-500 delay-100"></div>
                    
                    {/* Diagonal stripes */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                      <div className="absolute top-0 left-0 w-3 h-full bg-white/10 transform -skew-x-45"></div>
                      <div className="absolute top-0 left-1/3 w-3 h-full bg-white/10 transform -skew-x-45"></div>
                      <div className="absolute top-0 right-1/3 w-3 h-full bg-white/10 transform -skew-x-45"></div>
                    </div>
                    
                    {/* Corner geometric accents */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[10px] border-l-[10px] border-white/30 group-hover:w-10 group-hover:h-10 transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[10px] border-r-[10px] border-white/30 group-hover:w-10 group-hover:h-10 transition-all duration-300"></div>
                  </div>
                </div>
                
                {/* Mobile login button with enhanced ring-inspired effects */}
                <div className="relative overflow-hidden group w-full">
                  <Button 
                    variant="outline" 
                    className="w-full border border-padeliga-teal text-padeliga-teal bg-transparent hover:bg-transparent px-6 py-2 flex items-center justify-center relative z-10"
                    asChild
                  >
                    <Link href="/login">
                      {/* Custom geometric icon that matches the aesthetic */}
                      <div className="mr-2 h-4 w-4 relative">
                        <div className="absolute inset-0 border border-current"></div>
                        <div className="absolute inset-[2px] border border-current opacity-70"></div>
                      </div>
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>
                  
                  {/* Enhanced geometric layered hover effects with concentric rings */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Base layer - full teal wash with very low opacity */}
                    <div className="absolute inset-0 bg-padeliga-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Concentric ring effect with thin borders */}
                    <div className="absolute inset-3 border border-padeliga-teal/0 group-hover:border-padeliga-teal/20 transition-colors duration-500 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transform-gpu"></div>
                    <div className="absolute inset-6 border border-padeliga-teal/0 group-hover:border-padeliga-teal/30 transition-colors duration-500 delay-100 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transform-gpu"></div>
                    
                    {/* Diagonal striped overlays */}
                    <div className="absolute -top-full -left-full w-[200%] h-[200%] group-hover:top-[-20%] group-hover:left-[-20%] transition-all duration-500">
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left"></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '20%' }}></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '40%' }}></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '60%' }}></div>
                      <div className="absolute h-[20%] w-[500%] bg-padeliga-teal/5 rotate-45 transform origin-top-left" style={{ top: '80%' }}></div>
                    </div>
                    
                    {/* Angular geometric accent shapes */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[12px] border-l-[12px] border-padeliga-teal/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[12px] border-r-[12px] border-padeliga-teal/40 group-hover:w-6 group-hover:h-6 transition-all duration-300"></div>
                    
                    {/* Pulsing ring effect on hover */}
                    <div className="absolute inset-0 border-2 border-padeliga-teal/0 group-hover:border-padeliga-teal/20 scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse-slow"></div>
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