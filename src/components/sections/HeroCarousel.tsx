'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Home, Car, Sparkles, Zap, Shield, CheckCircle,
  Star, CalendarCheck, MessageCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';

const slides = [
  { title: "Nettoyage Maison Professionnel", subtitle: "Votre intérieur étincelant, sans effort. Service complet 7j/7 à domicile.", imageUrl: "/carousel-1.jpg" },
  { title: "Lavage Auto à Domicile", subtitle: "Votre voiture comme neuve, sans bouger de chez vous. Service premium disponible.", imageUrl: "/carousel-2.jpg" },
  { title: "Équipe Professionnelle & Fiable", subtitle: "Des experts qualifiés, équipements professionnels, résultat garanti à chaque intervention.", imageUrl: "/carousel-3.jpg" },
  { title: "Satisfaction Client Garantie", subtitle: "10% de réduction sur votre première visite. Devis gratuit et sans engagement !", imageUrl: "/carousel-4.jpg" },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goTo = (index: number) => setCurrentSlide((index + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(() => goTo(currentSlide + 1), 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section className="relative overflow-hidden text-white min-h-[500px] flex items-center">
      {/* Carousel backgrounds */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index <= 2}
              loading="eager"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/90 via-[#003366]/70 to-[#003366]/50" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-28 relative z-10 w-full">
        <div className="max-w-3xl">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="relative">
              <Home className="w-10 h-10 md:w-16 md:h-16 drop-shadow-lg" />
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold">
                <span className="text-cyan-300">KMI</span> Home &amp; Car Care
              </h1>
              <p className="text-cyan-200 text-xs md:text-sm">Nettoyage professionnel à domicile</p>
            </div>
            <Car className="w-10 h-10 md:w-16 md:h-16 drop-shadow-lg" />
          </div>

          {/* Slide content */}
          <div className="min-h-[220px] md:min-h-[200px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'}`}
              >
                {index === currentSlide && (
                  <>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="text-base md:text-xl text-cyan-100 mb-6 md:mb-8 max-w-xl leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="hidden md:flex flex-wrap gap-4 mb-8">
            {[{ icon: Zap, text: "Intervention rapide" }, { icon: Shield, text: "Produits sécuritaires" }, { icon: CheckCircle, text: "Résultat parfait" }].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                <f.icon className="w-5 h-5 text-cyan-300" />
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 w-full">
            <Button
              className="w-full sm:w-auto h-auto min-h-[54px] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm md:text-lg px-4 md:px-8 py-3 md:py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center"
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <CalendarCheck className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0" />
              <span>Prendre rendez-vous</span>
            </Button>
            <a href="https://wa.me/18733442040" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto block">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-auto min-h-[54px] bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold text-sm md:text-lg px-4 md:px-8 py-3 md:py-5 rounded-full flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0" />
                WhatsApp
              </Button>
            </a>
          </div>

          <div className="hidden md:inline-flex items-center gap-2 bg-yellow-400/95 text-gray-900 px-6 py-3 rounded-full font-bold shadow-lg">
            <Star className="w-5 h-5 fill-current" />
            10% SUR LA 1ÈRE VISITE
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`transition-all duration-300 ${index === currentSlide ? 'w-10 h-3 bg-yellow-400 rounded-full' : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={() => goTo(currentSlide - 1)} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 md:bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110 hidden sm:flex">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button onClick={() => goTo(currentSlide + 1)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 md:bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110 hidden sm:flex">
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </section>
  );
}
