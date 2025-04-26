import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SkewedButton } from "@/components/ui/SkewedButton";
import PadeligaLogo from "@/components/PadeligaLogo";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "absolute bottom-0 left-0 w-0 h-0.5 bg-padeliga-teal transition-all duration-300",
          active ? "w-full" : "group-hover:w-full"
        )}
      ></div>
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for dark mode
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-2"
          : "bg-transparent py-4"
      )}
    >
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
            <div
              className="relative"
              onMouseEnter={() => setFeaturesDropdownOpen(true)}
              onMouseLeave={() => setFeaturesDropdownOpen(false)}
            >
              <NavLink href="/features" label="Características">
                <ChevronDown
                  className={cn(
                    "ml-1 h-4 w-4 transition-transform duration-200",
                    featuresDropdownOpen ? "rotate-180" : ""
                  )}
                />
              </NavLink>

              {featuresDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-none z-50">
                  <DropdownLink
                    href="/features/leagues"
                    label="Gestión de Ligas"
                  />
                  <DropdownLink
                    href="/features/teams"
                    label="Gestión de Equipos"
                  />
                  <DropdownLink
                    href="/features/matches"
                    label="Programación de Partidos"
                  />
                  <DropdownLink
                    href="/features/results"
                    label="Seguimiento de Resultados"
                  />
                  <DropdownLink
                    href="/features/public"
                    label="Ligas Públicas"
                  />
                  <DropdownLink
                    href="/features/security"
                    label="Autenticación Segura"
                  />
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
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
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

          {/* Right side buttons - Updated to use SkewedButton */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" ? (
              // Dashboard button with SkewedButton
              <SkewedButton
                buttonVariant="teal"
                buttonSize="default"
                hoverEffectColor="teal"
                hoverEffectVariant="solid"
                asChild
              >
                <Link href="/dashboard">Mi Dashboard</Link>
              </SkewedButton>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Login button with SkewedButton */}
                <SkewedButton
                  buttonVariant="outline"
                  hoverEffectColor="teal"
                  hoverEffectVariant="outline"
                  asChild
                >
                  <Link href="/login">
                    <span>Iniciar Sesión</span>
                  </Link>
                </SkewedButton>

                {/* Signup button with SkewedButton */}
                <SkewedButton
                  buttonVariant="outline"
                  hoverEffectColor="purple"
                  hoverEffectVariant="outline"
                  asChild
                >
                  <Link href="/signup">
                    <span>Registrarse</span>
                  </Link>
                </SkewedButton>
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
              <span className="text-gray-700 dark:text-gray-300">
                Modo de Tema
              </span>
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

            {status === "authenticated" ? (
              <div className="px-4 py-3">
                {/* Mobile dashboard button with SkewedButton */}
                <SkewedButton
                  buttonVariant="teal"
                  hoverEffectColor="teal"
                  hoverEffectVariant="solid"
                  fullWidth
                  asChild
                >
                  <Link href="/dashboard">Mi Dashboard</Link>
                </SkewedButton>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-3">
                {/* Mobile signup button with SkewedButton */}
                <SkewedButton
                  buttonVariant="purple"
                  hoverEffectColor="purple"
                  hoverEffectVariant="solid"
                  fullWidth
                  asChild
                >
                  <Link href="/signup">
                    <span>Registrarse</span>
                  </Link>
                </SkewedButton>

                {/* Mobile login button with SkewedButton */}
                <SkewedButton
                  buttonVariant="outline"
                  hoverEffectColor="teal"
                  hoverEffectVariant="outline"
                  fullWidth
                  asChild
                >
                  <Link href="/login">
                    <span>Iniciar Sesión</span>
                  </Link>
                </SkewedButton>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
