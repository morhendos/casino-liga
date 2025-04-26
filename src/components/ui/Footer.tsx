import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, Send } from 'lucide-react';

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
    <h3 className="text-lg font-semibold mb-4 text-white">
      <span className="border-b-2 border-padeliga-orange pb-1">{title}</span>
    </h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link 
            href={link.href}
            className="text-gray-200 hover:text-padeliga-orange transition-colors duration-300"
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
    className="bg-white/10 hover:bg-white/20 p-2 rounded-none text-white hover:text-padeliga-orange transition-colors duration-300"
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
    <footer className="bg-gradient-to-br from-padeliga-teal to-padeliga-purple text-white border-t border-white/10">
      {/* Newsletter Sign Up with updated design */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 max-w-lg">
              <h3 className="text-xl font-bold mb-2">Mantente Conectado</h3>
              <p className="text-gray-200">
                Recibe las últimas novedades y actualizaciones en tu correo.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow max-w-md">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="pl-10 pr-3 py-2 w-full bg-white/10 placeholder-gray-300 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-padeliga-orange"
                />
              </div>
              <button
                className="bg-padeliga-orange hover:bg-padeliga-orange/90 text-white py-2 px-4 transition-colors duration-300"
              >
                <span className="flex items-center gap-2">
                  <span>Suscribirse</span>
                  <Send className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer with improved colors */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <Image src="/logo.png" alt="Padeliga" width={150} height={50} />
            </div>
            <p className="text-gray-200 mb-6">
              La plataforma definitiva para la gestión de ligas de padel.
            </p>
            <div className="flex space-x-4 mb-6">
              <SocialLink 
                href="#" 
                icon={<Facebook className="h-5 w-5" />} 
                label="Facebook"
              />
              <SocialLink 
                href="#" 
                icon={<Twitter className="h-5 w-5" />} 
                label="Twitter"
              />
              <SocialLink 
                href="#" 
                icon={<Instagram className="h-5 w-5" />} 
                label="Instagram"
              />
            </div>
            
            <div className="space-y-3 text-gray-200">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-padeliga-orange mt-0.5 mr-2 flex-shrink-0" />
                <span>Calle Padel 123, 28001 Madrid</span>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-padeliga-orange mt-0.5 mr-2 flex-shrink-0" />
                <span>+34 91 123 45 67</span>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-padeliga-orange mt-0.5 mr-2 flex-shrink-0" />
                <span>info@padeliga.com</span>
              </div>
            </div>
          </div>
          
          <FooterColumn title="Explorar" links={exploreLinks} />
          <FooterColumn title="Recursos" links={resourceLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
        
        {/* Bottom bar with new styling */}
        <div className="pt-8 border-t border-white/10 text-center text-gray-300 text-sm">
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