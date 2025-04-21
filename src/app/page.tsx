'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GeometricBackground from '@/components/ui/GeometricBackground';
import PadeligaLogo from '@/components/PadeligaLogo';
import Footer from '@/components/ui/Footer';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, Trophy, Calendar, Users, BarChart, Globe, ShieldCheck, ArrowRight, Mail, Check, Play } from 'lucide-react';

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
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-column layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Content */}
            <div className="text-left order-2 lg:order-1">
              {/* Slogan above heading with better visibility */}
              <div className="inline-block bg-padeliga-teal/10 px-4 py-2 mb-6 border-l-4 border-padeliga-teal">
                <span className="text-lg md:text-xl font-semibold text-padeliga-teal">
                  TU LIGA. TU JUEGO.
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Administra Tu Liga de <span className="text-padeliga-teal">Padel</span> con Facilidad
              </h1>
              
              <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-xl">
                La plataforma completa para organizar, gestionar y disfrutar de tus ligas de padel 
                de manera sencilla y eficiente.
              </p>
              
              {/* Feature bullets */}
              <div className="mb-10 space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-padeliga-orange" />
                  </div>
                  <p className="ml-3 text-gray-600 dark:text-gray-300">
                    <strong>Fácil de usar</strong> — Interfaz intuitiva para todos los usuarios
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-padeliga-orange" />
                  </div>
                  <p className="ml-3 text-gray-600 dark:text-gray-300">
                    <strong>100% personalizable</strong> — Adapta la liga a tus necesidades
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-padeliga-orange" />
                  </div>
                  <p className="ml-3 text-gray-600 dark:text-gray-300">
                    <strong>Resultados en tiempo real</strong> — Mantén a todos informados
                  </p>
                </div>
              </div>
              
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
              
              {/* Trust indicators */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 mb-2">Plataforma Preferida Por:</p>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-8 w-28 bg-gray-300 dark:bg-gray-600"></div>
                </div>
              </div>
            </div>
            
            {/* Right column - Visual */}
            <div className="flex justify-center items-center order-1 lg:order-2">
              <div className="relative">
                {/* Background shape for the visual */}
                <div className="absolute inset-0 bg-padeliga-orange/5 -m-6 transform rotate-3"></div>
                
                {/* Main visual container */}
                <div className="relative bg-white dark:bg-gray-800 shadow-xl p-8 mb-6">
                  {/* Logo with slogan better positioned */}
                  <div className="flex flex-col items-center">
                    <PadeligaLogo size="lg" showTagline={false} />
                    
                    {/* Visual content - mockup of the app */}
                    <div className="mt-8 h-64 w-full max-w-md bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                      {/* Sample mockup UI elements */}
                      <div className="absolute top-0 left-0 right-0 h-10 bg-padeliga-teal flex items-center px-4">
                        <div className="w-24 h-4 bg-white/30 rounded-sm"></div>
                      </div>
                      
                      <div className="pt-12 px-4 grid grid-cols-2 gap-2">
                        <div className="h-16 bg-white/20 dark:bg-white/10"></div>
                        <div className="h-16 bg-white/20 dark:bg-white/10"></div>
                        <div className="h-16 bg-white/20 dark:bg-white/10"></div>
                        <div className="h-16 bg-white/20 dark:bg-white/10"></div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/20 dark:bg-white/10 flex items-center justify-between px-4">
                        <div className="w-20 h-4 bg-white/30"></div>
                        <div className="w-20 h-6 bg-padeliga-orange"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats indicators below the visual */}
                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-padeliga-teal">150+</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ligas Activas</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-padeliga-purple">5.000+</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Jugadores</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-padeliga-orange">25.000+</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Partidos</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative shape below */}
                <div className="absolute inset-x-10 bottom-0 h-4 bg-padeliga-teal -mb-2 transform -rotate-1"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-padeliga-teal opacity-10 transform rotate-15"></div>
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-padeliga-orange opacity-10 transform -rotate-15"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 relative bg-gray-50 dark:bg-gray-900">
        {/* Section decorative shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-padeliga-purple opacity-5 transform -rotate-15" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-padeliga-green opacity-5 transform rotate-15" />
        
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
          
          <div className="mt-12 text-center">
            <Link href="/leagues" className="inline-flex items-center text-padeliga-teal hover:text-padeliga-teal/80 font-medium">
              Ver todas las características
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-accent text-3xl font-bold text-center mb-16">
            Lo Que Dicen Nuestros Usuarios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-padeliga-teal/20 hover:border-padeliga-teal/50 transition-colors duration-300">
              <CardContent className="p-6">
                <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                  "Padeliga ha hecho que organizar nuestra liga de padel sea mucho más fácil. Ahorramos tiempo y todos los jugadores están encantados con la plataforma."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-padeliga-teal text-white flex items-center justify-center">
                    <span className="font-bold">JR</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">Juan Rodríguez</p>
                    <p className="text-sm text-gray-500">Club de Padel Madrid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="border-padeliga-purple/20 hover:border-padeliga-purple/50 transition-colors duration-300">
              <CardContent className="p-6">
                <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                  "La visualización de resultados y clasificaciones en tiempo real es genial. Los jugadores pueden seguir su progreso fácilmente."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-padeliga-purple text-white flex items-center justify-center">
                    <span className="font-bold">ML</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">María López</p>
                    <p className="text-sm text-gray-500">Organizadora de Liga</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="border-padeliga-orange/20 hover:border-padeliga-orange/50 transition-colors duration-300">
              <CardContent className="p-6">
                <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                  "La gestión de equipos y la programación de partidos es muy intuitiva. Hemos reducido el tiempo de administración a la mitad."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-padeliga-orange text-white flex items-center justify-center">
                    <span className="font-bold">CS</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">Carlos Sánchez</p>
                    <p className="text-sm text-gray-500">Club Deportivo Barcelona</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section - DRAMATICALLY IMPROVED */}
      <section className="py-20 relative">
        <div className="bg-gradient-to-br from-padeliga-teal/90 to-padeliga-purple/90 text-white overflow-hidden relative">
          {/* Complex geometric background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-padeliga-orange transform rotate-15"></div>
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-padeliga-teal transform -rotate-15"></div>
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-padeliga-purple transform rotate-45"></div>
            <div className="absolute top-10 right-1/3 w-40 h-40 bg-padeliga-green transform -rotate-12"></div>
          </div>
          
          {/* Diagonal divider */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-900 transform -skew-y-2"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-20">
              {/* Left column - Content */}
              <div className="lg:pr-12">
                <div className="inline-block bg-white/10 px-4 py-2 mb-6 transform -rotate-1">
                  <span className="text-lg font-medium">¡Comienza hoy mismo!</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  ¿Listo para revolucionar tus ligas de padel?
                </h2>
                
                <p className="text-xl mb-8 opacity-90 leading-relaxed">
                  Únete a más de 5.000 jugadores y administradores que ya están 
                  disfrutando de la experiencia Padeliga para organizar sus competiciones.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="font-bold text-2xl">1</span>
                    </div>
                    <p className="text-lg">Regístrate en menos de 60 segundos</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="font-bold text-2xl">2</span>
                    </div>
                    <p className="text-lg">Crea tu primera liga o únete a una existente</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="font-bold text-2xl">3</span>
                    </div>
                    <p className="text-lg">¡Disfruta del juego y la competición!</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="default" 
                    size="xl" 
                    className="bg-padeliga-orange hover:bg-padeliga-orange/90 text-white border-2 border-white/20 min-w-[200px]" 
                    asChild
                  >
                    <Link href="/signup">
                      Registrarse Gratis
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="xl" 
                    className="border-2 border-white hover:bg-white/10 text-white min-w-[200px]" 
                    asChild
                  >
                    <Link href="/login">
                      Iniciar Sesión
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right column - Visual */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  {/* Phone mockup container */}
                  <div className="w-80 h-[500px] bg-gray-800 border-8 border-gray-900 relative overflow-hidden shadow-2xl transform rotate-2">
                    {/* Screen content */}
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
                      {/* App header */}
                      <div className="h-12 bg-padeliga-teal flex items-center px-4">
                        <PadeligaLogo size="sm" variant="light" showTagline={false} />
                        <div className="ml-auto flex space-x-2">
                          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* League standings mockup */}
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="h-6 w-36 bg-gray-300 dark:bg-gray-700 mb-2"></div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-700 p-3 mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className="h-5 w-5 bg-padeliga-orange rounded-full"></div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600"></div>
                            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-500 font-bold"></div>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-600"></div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-700 p-3 mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className="h-5 w-5 bg-padeliga-teal rounded-full"></div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600"></div>
                            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-500 font-bold"></div>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-600"></div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-700 p-3 mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className="h-5 w-5 bg-padeliga-purple rounded-full"></div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600"></div>
                            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-500 font-bold"></div>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-600"></div>
                        </div>
                        
                        <div className="mt-6 mb-4">
                          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 mb-2"></div>
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-white dark:bg-gray-700 p-3 flex justify-between items-center">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600"></div>
                            <div className="flex items-center">
                              <div className="h-6 w-6 bg-padeliga-orange mx-1"></div>
                              <div className="h-4 w-8 text-center bg-gray-300 dark:bg-gray-500"></div>
                              <div className="h-4 w-8 text-center bg-gray-300 dark:bg-gray-500 mx-1"></div>
                              <div className="h-6 w-6 bg-padeliga-teal mx-1"></div>
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-700 p-3 flex justify-between items-center">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600"></div>
                            <div className="flex items-center">
                              <div className="h-6 w-6 bg-padeliga-purple mx-1"></div>
                              <div className="h-4 w-8 text-center bg-gray-300 dark:bg-gray-500"></div>
                              <div className="h-4 w-8 text-center bg-gray-300 dark:bg-gray-500 mx-1"></div>
                              <div className="h-6 w-6 bg-padeliga-green mx-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* App navbar */}
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-around px-4">
                        <div className="h-6 w-6 bg-gray-400 dark:bg-gray-500"></div>
                        <div className="h-6 w-6 bg-gray-400 dark:bg-gray-500"></div>
                        <div className="h-10 w-10 bg-padeliga-orange rounded-full flex items-center justify-center -mt-4 border-4 border-white dark:border-gray-800">
                          <Play className="h-4 w-4 text-white ml-0.5" />
                        </div>
                        <div className="h-6 w-6 bg-gray-400 dark:bg-gray-500"></div>
                        <div className="h-6 w-6 bg-gray-400 dark:bg-gray-500"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-padeliga-orange opacity-80 transform rotate-12"></div>
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-padeliga-teal opacity-80 transform -rotate-12"></div>
                  
                  {/* "Play badge" */}
                  <div className="absolute -top-6 -right-6 bg-padeliga-orange text-white h-16 w-16 rounded-full flex items-center justify-center border-2 border-white transform rotate-12 shadow-lg">
                    <span className="font-bold text-sm">JUEGA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom diagonal divider */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 transform -skew-y-2"></div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}