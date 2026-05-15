'use client';

import { Home, Car, Menu, X } from 'lucide-react';
import type { NavItem } from '@/lib/types';

interface SiteHeaderProps {
  navItems: NavItem[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function SiteHeader({ navItems, mobileMenuOpen, setMobileMenuOpen, handleNavClick }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#003366]/95 backdrop-blur-sm text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <Home className="w-7 h-7" />
            <span className="text-xl font-bold">
              <span className="text-cyan-300">KMI</span> Home &amp; Car Care
            </span>
            <Car className="w-7 h-7" />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-white/90 hover:text-cyan-300 transition-all duration-300 font-medium relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-300 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20 animate-in slide-in-from-top duration-300">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block py-3 text-white/90 hover:text-cyan-300 transition-colors px-2"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
