'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GeometricBackground from '@/components/ui/GeometricBackground';
import PadeligaLogo from '@/components/PadeligaLogo';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, Trophy, Calendar, Users, BarChart, Globe, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading...</span>
      </div>
    );
  }
  
  // If authenticated and not yet redirected, show loading
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-xl">Redirecting to dashboard...</span>
      </div>
    );
  }
  
  // For non-authenticated users, show the landing page
  return (
    <div className="relative min-h-screen">
      {/* Geometric Background */}
      <GeometricBackground variant="default" animated={true} />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-10 transform hover:scale-105 transition-transform duration-300">
              <PadeligaLogo size="xl" />
            </div>
            
            <h1 className="heading-accent text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
              Administra Tu Liga de Padel
            </h1>
            
            <p className="text-xl max-w-2xl mb-12 text-gray-600 dark:text-gray-300">
              La plataforma completa para organizar, gestionar y disfrutar de tus ligas de padel 
              de manera sencilla y eficiente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Button variant="cta" size="xl" className="min-w-[180px]" asChild>
                <Link href="/signup">
                  Comenzar Ahora
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="xl" className="min-w-[180px] border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/5" asChild>
                <Link href="/leagues">Explorar Ligas</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-padeliga-teal opacity-10 transform rotate-15" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-padeliga-orange opacity-10 transform -rotate-15" />
      </section>
      
      {/* Features Section */}
      <section className="py-20 relative bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-accent text-3xl font-bold text-center mb-16">
            Características Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card variant="highlight" hover="raise" className="overflow-hidden border-t-4 border-t-padeliga-teal">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge variant="teal" size="lg">Gestión de Ligas</Badge>
                    <Trophy className="h-6 w-6 text-padeliga-teal" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Organiza tu Liga</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Crea y administra ligas con configuraciones personalizables. Controla fechas, 
                    formatos de partidos, puntuaciones y más.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 2 */}
            <Card variant="highlight" hover="raise" className="overflow-hidden border-t-4 border-t-padeliga-purple">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge variant="purple" size="lg">Equipos</Badge>
                    <Users className="h-6 w-6 text-padeliga-purple" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Gestión de Equipos</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Forma equipos de dos jugadores y únete a ligas. Administra los registros 
                    de jugadores y controla las inscripciones.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 3 */}
            <Card variant="highlight" hover="raise" className="overflow-hidden border-t-4 border-t-padeliga-orange">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge variant="orange" size="lg">Partidos</Badge>
                    <Calendar className="h-6 w-6 text-padeliga-orange" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Programación de Partidos</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Programa partidos entre equipos, ya sea manualmente o automáticamente. 
                    Gestiona horarios y ubicaciones.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 4 */}
            <Card variant="highlight" hover="raise" className="overflow-hidden border-t-4 border-t-padeliga-green">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge variant="green" size="lg">Resultados</Badge>
                    <BarChart className="h-6 w-6 text-padeliga-green" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Seguimiento de Resultados</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Registra los resultados de los partidos y visualiza las clasificaciones 
                    de la liga en tiempo real.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 5 */}
            <Card variant="highlight" hover="raise" className="overflow-hidden border-t-4 border-t-padeliga-red">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge variant="red" size="lg">Público</Badge>
                    <Globe className="h-6 w-6 text-padeliga-red" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ligas Públicas</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Haz que tus ligas sean accesibles para usuarios no autenticados. 
                    Comparte fácilmente la información con todos.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 6 */}
            <Card variant="highlight" hover="raise" className="overflow-hidden border-t-4 border-t-padeliga-teal">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge variant="teal" size="lg">Seguridad</Badge>
                    <ShieldCheck className="h-6 w-6 text-padeliga-teal" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Autenticación Segura</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Inicio de sesión seguro y permisos basados en roles para proteger 
                    la integridad de tus datos.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-padeliga-orange text-white p-12 relative overflow-hidden">
            {/* Geometric shapes */}
            <div className="absolute top-0 -right-10 w-40 h-40 bg-white opacity-10 transform rotate-45" />
            <div className="absolute bottom-0 -left-10 w-40 h-40 bg-white opacity-10 transform -rotate-45" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto">
                Únete a la comunidad de Padeliga y lleva tus ligas de padel al siguiente nivel.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-5">
                <Button variant="default" size="xl" className="bg-white text-padeliga-orange hover:bg-gray-100 min-w-[180px]" asChild>
                  <Link href="/signup">Registrarse</Link>
                </Button>
                <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10 min-w-[180px]" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <PadeligaLogo size="md" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                La plataforma definitiva para la gestión de ligas de padel.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-padeliga-teal hover:text-padeliga-teal/80">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-padeliga-teal hover:text-padeliga-teal/80">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-padeliga-teal hover:text-padeliga-teal/80">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-padeliga-teal">Explorar</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/leagues" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Ligas Públicas
                  </Link>
                </li>
                <li>
                  <Link href="/rankings" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Rankings
                  </Link>
                </li>
                <li>
                  <Link href="/matches" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Partidos
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Equipos
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-padeliga-teal">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-padeliga-teal">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} Padeliga. Todos los derechos reservados.</p>
              <p className="mt-2 md:mt-0">Desarrollado con pasión para la comunidad de padel.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}