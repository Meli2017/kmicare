'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

import SiteHeader from './sections/SiteHeader';
import HeroCarousel from './sections/HeroCarousel';

import type { BlockedDate, Testimonial, SocialLink, DateAvailability, ServiceArea, NavItem } from '@/lib/types';
import { defaultTestimonials } from '@/lib/data';

// ─── Skeletons ────────────────────────────────────────────────────────────────
function ServicesSkeleton() {
  return (
    <div className="py-20 bg-white animate-pulse">
      <div className="h-10 bg-gray-100 rounded w-48 mx-auto mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50 animate-pulse">
      <div className="h-10 bg-gray-100 rounded w-64 mx-auto mb-12" />
      <div className="max-w-5xl mx-auto px-4 h-96 bg-gray-100 rounded-2xl" />
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50/50 animate-pulse">
      <div className="h-10 bg-gray-100 rounded w-48 mx-auto mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ─── Dynamic imports (lazy-loaded) ────────────────────────────────────────────
const ServicesSection = dynamic(() => import('./sections/ServicesSection'), {
  loading: () => <ServicesSkeleton />,
  ssr: false,
});

const BookingSection = dynamic(() => import('./sections/BookingSection'), {
  loading: () => <BookingSkeleton />,
  ssr: false,
});

const WhatsAppDialog = dynamic(() => import('./sections/WhatsAppDialog'), {
  ssr: false,
});

const TestimonialsSection = dynamic(() => import('./sections/TestimonialsSection'), {
  loading: () => <TestimonialsSkeleton />,
  ssr: false,
});

const ServiceAreasSection = dynamic(() => import('./sections/ServiceAreasSection'), {
  ssr: false,
});

const FeaturesSection = dynamic(() => import('./sections/FeaturesSection'), {
  ssr: false,
});

const SiteFooter = dynamic(() => import('./sections/SiteFooter'), {
  ssr: false,
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface LandingPageClientProps {
  initialBlockedDates: BlockedDate[];
  initialTestimonials: Testimonial[];
  initialSocialLinks: SocialLink[];
  initialDateAvailabilities: DateAvailability[];
  initialServiceAreas: ServiceArea[];
}

const navItems: NavItem[] = [
  { label: 'Services', href: '#services' },
  { label: 'Packs', href: '#packs' },
  { label: 'Témoignages', href: '#testimonials' },
  { label: 'Rendez-vous', href: '#booking' },
  { label: 'Contact', href: '#contact' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPageClient({
  initialBlockedDates,
  initialTestimonials,
  initialSocialLinks,
  initialDateAvailabilities,
  initialServiceAreas,
}: LandingPageClientProps) {
  const { toast } = useToast();
  const bookingRef = useRef<HTMLDivElement | null>(null);

  // Header state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ start: string; end: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog state
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [confirmedBookingNumber, setConfirmedBookingNumber] = useState('');

  // Data state
  const [blockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [dateAvailabilities] = useState<DateAvailability[]>(initialDateAvailabilities);
  const [testimonials] = useState<Testimonial[]>(initialTestimonials.length > 0 ? initialTestimonials : defaultTestimonials);
  const [socialLinks] = useState<SocialLink[]>(initialSocialLinks);
  const [serviceAreas] = useState<ServiceArea[]>(initialServiceAreas);

  // Load reCAPTCHA only on this page
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!key) return;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Generate time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slots = dateAvailabilities
      .filter(s => s.date === dateStr && s.isActive)
      .map(s => ({ start: s.startTime, end: s.endTime }));
    const unique = slots
      .filter((slot, idx, arr) => arr.findIndex(s => s.start === slot.start && s.end === slot.end) === idx)
      .sort((a, b) => a.start.localeCompare(b.start));
    setAvailableTimeSlots(unique);
    setSelectedTime('');
  }, [selectedDate, dateAvailabilities]);

  const isDateAvailable = useCallback((date: Date) => {
    const today = startOfDay(new Date());
    if (date < today) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    if (blockedDates.some(b => b.date === dateStr)) return false;
    return dateAvailabilities.some(s => s.date === dateStr && s.isActive);
  }, [blockedDates, dateAvailabilities]);

  const handleServiceClick = (categoryKey: string, serviceName: string) => {
    setSelectedCategory(categoryKey);
    setSelectedService(serviceName);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const generateWhatsAppMessage = () => {
    const dateStr = selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Non specifiee';
    const lines = [
      '*NOUVELLE DEMANDE DE RENDEZ-VOUS*', '*KMI Home & Car Care*', '',
      '----------------------------', '',
      '*SERVICE DEMANDE:*', selectedService, '',
      '*DATE SOUHAITEE:*', dateStr, '',
      '*HORAIRE:*', selectedTime || 'Non specifie', '',
      '*ADRESSE:*', address || 'Non specifiee', '',
      '*CLIENT:*', customerName || 'Non specifie', '',
      '*EMAIL:*', email || 'Non specifie', '',
      '*TELEPHONE:*', phone || 'Non specifie', '',
      '*NOTES:*', notes || 'Aucune', '',
      '----------------------------', '',
      'Merci de confirmer la disponibilite !',
    ];
    return encodeURIComponent(lines.join('\n'));
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !address || !selectedService || !phone) {
      toast({ title: "❌ Informations manquantes", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      toast({ title: "❌ Numéro invalide", description: "Le numéro doit contenir 10 chiffres.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      let recaptchaToken = '';
      try {
        recaptchaToken = await new Promise<string>((resolve, reject) => {
          const w = window as any;
          if (!w.grecaptcha) { reject('reCAPTCHA not loaded'); return; }
          w.grecaptcha.ready(() => {
            w.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'booking' }).then(resolve).catch(reject);
          });
        });
      } catch { /* continue without recaptcha */ }

      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const localDateStr = `${y}-${m}-${d}`;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService, serviceName: selectedService, date: localDateStr, time: selectedTime, address, customerName, email, phone, notes, recaptchaToken }),
      });
      
      const result = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        toast({ title: "❌ Réservation refusée", description: result.error || "Une erreur est survenue.", variant: "destructive" });
        return; // Stoppe le processus ici
      }
      
      const bookingNum = result?.bookingNumber || '';
      setConfirmedBookingNumber(bookingNum);
      toast({
        title: "✅ Réservation effectuée avec succès !",
        description: bookingNum
          ? `N° ${bookingNum} — ${selectedService} le ${format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} à ${selectedTime}`
          : `Votre rendez-vous pour « ${selectedService} » a bien été enregistré.`,
      });
      setShowWhatsAppDialog(true);
    } catch {
      toast({ title: "❌ Erreur", description: "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(`https://wa.me/18733442040?text=${generateWhatsAppMessage()}`, '_blank');
    setShowWhatsAppDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Immediately rendered — above the fold */}
      <SiteHeader navItems={navItems} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} handleNavClick={handleNavClick} />
      <HeroCarousel />

      {/* Lazy-loaded — below the fold */}
      <ServicesSection onServiceClick={handleServiceClick} />
      <BookingSection
        bookingRef={bookingRef}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        selectedTime={selectedTime} setSelectedTime={setSelectedTime}
        selectedService={selectedService} setSelectedService={setSelectedService}
        address={address} setAddress={setAddress}
        customerName={customerName} setCustomerName={setCustomerName}
        email={email} setEmail={setEmail}
        phone={phone} setPhone={setPhone}
        notes={notes} setNotes={setNotes}
        availableTimeSlots={availableTimeSlots}
        isLoading={isLoading}
        isDateAvailable={isDateAvailable}
        onBook={handleBooking}
      />
      <WhatsAppDialog
        open={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        confirmedBookingNumber={confirmedBookingNumber}
        onOpenWhatsApp={handleOpenWhatsApp}
      />
      <TestimonialsSection testimonials={testimonials} />
      <ServiceAreasSection serviceAreas={serviceAreas} />
      <FeaturesSection />
      <SiteFooter socialLinks={socialLinks} navItems={navItems} handleNavClick={handleNavClick} />
    </div>
  );
}
