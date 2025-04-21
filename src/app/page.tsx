import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GeometricBackground from '@/components/ui/GeometricBackground';
import PadeligaLogo from '@/components/PadeligaLogo';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Geometric Background */}
      <GeometricBackground variant="default" animated={true} />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
              <PadeligaLogo size="xl" showTagline={true} />
            </div>
            
            <h1 className="heading-accent text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Administra Tu Liga de Padel
            </h1>
            
            <p className="text-xl max-w-2xl mb-10 text-gray-600 dark:text-gray-300">
              La plataforma completa para organizar, gestionar y disfrutar de tus ligas de padel de manera sencilla y eficiente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gradient" size="xl" asChild>
                <Link href="/signup">Comenzar Ahora</Link>
              </Button>
              
              <Button variant="outline" size="xl" asChild>
                <Link href="/leagues">Explorar Ligas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-accent text-3xl font-bold text-center mb-12">
            Características Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card variant="gradient" hover="raise" className="overflow-hidden">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-4 inline-block">
                    <Badge variant="teal" size="lg">Gestión de Ligas</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Organiza tu Liga</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Crea y administra ligas con configuraciones personalizables. Controla fechas, formatos de partidos, puntuaciones y más.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 2 */}
            <Card variant="gradient" hover="raise" className="overflow-hidden">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-4 inline-block">
                    <Badge variant="purple" size="lg">Equipos</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Gestión de Equipos</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Forma equipos de dos jugadores y únete a ligas. Administra los registros de jugadores y controla las inscripciones.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 3 */}
            <Card variant="gradient" hover="raise" className="overflow-hidden">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-4 inline-block">
                    <Badge variant="orange" size="lg">Partidos</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Programación de Partidos</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Programa partidos entre equipos, ya sea manualmente o automáticamente. Gestiona horarios y ubicaciones.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 4 */}
            <Card variant="gradient" hover="raise" className="overflow-hidden">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-4 inline-block">
                    <Badge variant="green" size="lg">Resultados</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Seguimiento de Resultados</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Registra los resultados de los partidos y visualiza las clasificaciones de la liga en tiempo real.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 5 */}
            <Card variant="gradient" hover="raise" className="overflow-hidden">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-4 inline-block">
                    <Badge variant="red" size="lg">Público</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ligas Públicas</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Haz que tus ligas sean accesibles para usuarios no autenticados. Comparte fácilmente la información con todos.
                  </p>
                </CardContent>
              </div>
            </Card>
            
            {/* Feature 6 */}
            <Card variant="gradient" hover="raise" className="overflow-hidden">
              <div className="p-1">
                <CardContent className="bg-card p-6">
                  <div className="mb-4 inline-block">
                    <Badge variant="teal" size="lg">Seguridad</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Autenticación Segura</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Inicio de sesión seguro y permisos basados en roles para proteger la integridad de tus datos.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-padeliga-gradient text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Únete a la comunidad de Padeliga y lleva tus ligas de padel al siguiente nivel.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="default" size="lg" className="bg-white text-gray-800 hover:bg-gray-100" asChild>
                <Link href="/signup">Registrarse</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <PadeligaLogo size="md" />
            </div>
            
            <div className="flex space-x-6">
              <Link href="/leagues" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                Ligas
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                Acerca de
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300">
                Contacto
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Padeliga. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}