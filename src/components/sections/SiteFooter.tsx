'use client';

import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Twitter, Mail, MessageCircle, Phone } from 'lucide-react';
import type { SocialLink, NavItem } from '@/lib/types';

interface SiteFooterProps {
  socialLinks: SocialLink[];
  navItems: NavItem[];
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

function getSocialIcon(platform: string) {
  const icons: Record<string, React.ElementType> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
  };
  return icons[platform.toLowerCase()] || Mail;
}

const footerNavItems: NavItem[] = [
  { label: 'Services', href: '#services' },
  { label: 'Tarifs', href: '#packs' },
  { label: 'Rendez-vous', href: '#booking' },
  { label: 'Contact', href: '#contact' },
];

export default function SiteFooter({ socialLinks, handleNavClick }: SiteFooterProps) {
  return (
    <footer className="bg-sky-50 text-[#003366] mt-auto px-20" id="contact">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold">
              <span className="text-cyan-600">KMI</span>{' '}
              <span className="text-[#003366] font-extrabold">Home &amp; Car Care</span>
            </h3>
            <p className="text-[#003366]/60 text-sm mt-1 text-justify">L&apos;excellence de l&apos;entretien ménager et automobile, directement à votre porte pour vous simplifier la vie.</p>
          </div>

          {/* Links + Email */}
          <div className="flex flex-col items-center gap-4">
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {footerNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-[#003366]/80 hover:text-[#003366] font-medium text-sm transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a href="mailto:contact@kmicare.ca" className="inline-flex items-center gap-2 text-sm text-[#003366]/70 hover:text-cyan-600 transition-colors duration-200 group">
              <Mail className="w-4 h-4 shrink-0 group-hover:text-cyan-600" />
              <span className="font-medium">contact@kmicare.ca</span>
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center justify-center md:justify-end gap-3">
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => {
                const IconComponent = getSocialIcon(link.platform);
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm">
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })
            ) : (
              <>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm"><Facebook className="w-4 h-4" /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm"><Instagram className="w-4 h-4" /></a>
                <a href="https://wa.me/18733442040" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm"><MessageCircle className="w-4 h-4" /></a>
              </>
            )}
            <a href="tel:18733442040" title="(873) 344-2040" className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-700 transition-all duration-300 hover:scale-110 shadow-md group relative">
              <Phone className="w-4 h-4" />
              <span className="absolute -top-10 scale-0 transition-all rounded bg-gray-900 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap shadow-lg border border-gray-700">(873) 344-2040</span>
            </a>
          </div>
        </div>
      </div>

      <Separator className="bg-[#003366]/10" />

      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#003366]/60">© {new Date().getFullYear()} KMI Home &amp; Car Care. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[#003366]/60 hover:text-[#003366] transition-colors">Politique de confidentialité</a>
            <a href="#" className="text-sm text-[#003366]/60 hover:text-[#003366] transition-colors">Conditions d&apos;utilisation</a>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-[#003366]/50">
            Sponsorisé par{' '}
            <a href="https://trendoraboutique.ca/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">Trendora</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
