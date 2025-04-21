import React from 'react';
import Link from 'next/link';
import PadeligaLogo from '@/components/PadeligaLogo';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-padeliga-teal">
      {title}
    </h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link 
            href={link.href}
            className="text-gray-600 hover:text-padeliga-teal dark:text-gray-300 transition-colors duration-300"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialLink = ({ href, icon, label }: SocialLinkProps) => (
  <a 
    href={href}
    className="text-padeliga-teal hover:text-padeliga-teal/80 transition-colors duration-300"
    aria-label={label}
  >
    {icon}
  </a>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const exploreLinks = [
    { label: 'Ligas Públicas', href: '/leagues' },
    { label: 'Rankings', href: '/rankings' },
    { label: 'Partidos', href: '/matches' },
    { label: 'Equipos', href: '/teams' },
  ];
  
  const resourceLinks = [
    { label: 'Acerca de', href: '/about' },
    { label: 'Contacto', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
  ];
  
  const legalLinks = [
    { label: 'Términos de Servicio', href: '/terms' },
    { label: 'Política de Privacidad', href: '/privacy' },
    { label: 'Política de Cookies', href: '/cookies' },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Newsletter Sign Up */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 max-w-lg">
              <h3 className="text-xl font-bold mb-2">Mantente Conectado</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Recibe las últimas novedades y actualizaciones en tu correo.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow max-w-md">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="pl-10 pr-3 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-padeliga-teal"
                />
              </div>
              <Button variant="teal" className="whitespace-nowrap">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <PadeligaLogo size="md" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              La plataforma definitiva para la gestión de ligas de padel.
            </p>
            <div className="flex space-x-4 mb-6">
              <SocialLink 
                href="#" 
                icon={<Facebook className="h-6 w-6" />} 
                label="Facebook"
              />
              <SocialLink 
                href="#" 
                icon={<Twitter className="h-6 w-6" />} 
                label="Twitter"
              />
              <SocialLink 
                href="#" 
                icon={<Instagram className="h-6 w-6" />} 
                label="Instagram"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-padeliga-teal mt-0.5 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  Calle Padel 123, 28001 Madrid
                </span>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-padeliga-teal mt-0.5 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  +34 91 123 45 67
                </span>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-padeliga-teal mt-0.5 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  info@padeliga.com
                </span>
              </div>
            </div>
          </div>
          
          <FooterColumn title="Explorar" links={exploreLinks} />
          <FooterColumn title="Recursos" links={resourceLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {currentYear} Padeliga. Todos los derechos reservados.</p>
            <p className="mt-2 md:mt-0">Desarrollado con pasión para la comunidad de padel.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;