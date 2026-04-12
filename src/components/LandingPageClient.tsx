'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home, Car, Sparkles, Phone, MapPin, Clock, CheckCircle, Star,
  Shield, Zap, Heart, CalendarCheck, MessageCircle,
  Building, Wrench, SprayCan, Menu, X, ChevronLeft, ChevronRight,
  Facebook, Instagram, Twitter, Mail, Quote, Verified, Info
} from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

interface Testimonial {
  id: string;
  customerName: string;
  message: string;
  rating: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface DateAvailability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ServiceArea {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

// Services data with categories
const servicesCategories = [
  {
    key: 'pack',
    title: "Nos Packs",
    icon: Sparkles,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    items: [
      { name: "Pack populaire", desc: "Maison + voiture" },
      { name: "Pack Déménagement", desc: "Nettoyage complet" },
      { name: "Pack Premium", desc: "Maison + voiture + canapé" },
    ],
    prices: [
      { size: "Pack populaire", price: "150 – 220 $" },
      { size: "Pack Déménagement", price: "180 – 300 $" },
      { size: "Pack Premium", price: "200 – 350 $" },
    ],
  },
  {
    key: 'residential',
    title: "Entretien ménager résidentiel",
    icon: Home,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    items: [
      { name: "Nettoyage complet", desc: "Salon, chambres, cuisine, salle de bain" },
      { name: "Dépoussiérage", desc: "Surfaces et meubles" },
      { name: "Lavage des sols", desc: "Tous types de revêtements" },
      { name: "Désinfection surfaces", desc: "Produits sécuritaires" },
      { name: "Nettoyage électroménagers", desc: "Intérieur et extérieur" },
    ],
    prices: [
      { size: "1 ½ – 2 ½", price: "80 – 120 $" },
      { size: "3 ½ – 4 ½", price: "100 – 150 $" },
      { size: "5 ½ et +", price: "130 – 200 $" },
      { size: "Nettoyage profond", price: "+50 à 100 $" },
    ],
  },
  {
    key: 'rental',
    title: "Nettoyage avant / après location",
    icon: Building,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    items: [
      { name: "Remise à neuf", desc: "Avant entrée locataire" },
      { name: "Nettoyage après départ", desc: "Remise en état complète" },
      { name: "Désinfection complète", desc: "Normes sanitaires" },
      { name: "Cuisine + salle de bain", desc: "Nettoyage en profondeur" },
    ],
    prices: [
      { size: "Petit logement", price: "120 – 180 $" },
      { size: "Moyen", price: "150 – 250 $" },
      { size: "Grande maison", price: "200 – 350 $" },
    ],
  },
  {
    key: 'construction',
    title: "Nettoyage après chantier",
    icon: Wrench,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    items: [
      { name: "Enlèvement poussière lourde", desc: "Toutes surfaces" },
      { name: "Traces de peinture/ciment", desc: "Nettoyage spécialisé" },
      { name: "Lavage vitres", desc: "Intérieur et extérieur" },
      { name: "Sols et surfaces", desc: "Remise en état" },
    ],
    prices: [
      { size: "Petit chantier", price: "150 – 250 $" },
      { size: "Moyen", price: "250 – 400 $" },
      { size: "Grand chantier", price: "400 $ +" },
    ],
  },
  {
    key: 'carWash',
    title: "Lavage automobile à domicile",
    icon: Car,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    items: [
      { name: "Lavage extérieur complet", desc: "Carrosserie, jantes" },
      { name: "Nettoyage intérieur", desc: "Aspiration, sièges, tapis" },
      { name: "Nettoyage tableau de bord", desc: "Détails et finitions" },
      { name: "Désodorisation", desc: "Traitement anti-odeurs" },
    ],
    prices: [
      { size: "Lavage extérieur", price: "30 – 50 $" },
      { size: "Nettoyage intérieur", price: "50 – 80 $" },
      { size: "Complet (int + ext)", price: "80 – 120 $" },
    ],
  },
  {
    key: 'carPremium',
    title: "Service « Voiture comme neuve »",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    items: [
      { name: "Shampoing sièges", desc: "Nettoyage en profondeur" },
      { name: "Traitement des taches", desc: "Élimination complète" },
      { name: "Rénovation plastique intérieur", desc: "Redonne l'éclat" },
      { name: "Finition brillante extérieure", desc: "Protection et brillance" },
    ],
    prices: [
      { size: "Shampoing sièges", price: "80 – 120 $" },
      { size: "Traitement complet", price: "120 – 180 $" },
    ],
  },
  {
    key: 'additional',
    title: "Services supplémentaires",
    icon: SprayCan,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    items: [
      { name: "Nettoyage vitres", desc: "Toutes dimensions" },
      { name: "Nettoyage tapis et moquettes", desc: "Shampoing professionnel" },
      { name: "Nettoyage canapé", desc: "Tous types de tissus" },
      { name: "Désinfection anti-bactérien", desc: "Traitement complet" },
    ],
    prices: [
      { size: "Nettoyage canapé", price: "60 – 120 $" },
      { size: "Nettoyage tapis", price: "40 – 100 $" },
      { size: "Vitres", price: "50 – 150 $" },
    ],
  },
];

const packsData = [
  {
    key: 'pack',
    name: "Pack populaire",
    description: "Maison + voiture",
    price: "150 – 220 $",
    popular: true,
    icon: Star,
  },
  {
    key: 'pack',
    name: "Pack Déménagement",
    description: "Nettoyage complet",
    price: "180 – 300 $",
    popular: false,
    icon: Building,
  },
  {
    key: 'pack',
    name: "Pack Premium",
    description: "Maison + voiture + canapé",
    price: "250 – 400 $",
    popular: false,
    icon: Sparkles,
  },
];

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Default carousel slides with images
const defaultCarouselSlides = [
  {
    title: "Nettoyage Maison Professionnel",
    subtitle: "Votre intérieur étincelant, sans effort. Service complet 7j/7 à domicile.",
    imageUrl: "/carousel-1.jpg",
  },
  {
    title: "Lavage Auto à Domicile",
    subtitle: "Votre voiture comme neuve, sans bouger de chez vous. Service premium disponible.",
    imageUrl: "/carousel-2.jpg",
  },
  {
    title: "Équipe Professionnelle & Fiable",
    subtitle: "Des experts qualifiés, équipements professionnels, résultat garanti à chaque intervention.",
    imageUrl: "/carousel-3.jpg",
  },
  {
    title: "Satisfaction Client Garantie",
    subtitle: "10% de réduction sur votre première visite. Devis gratuit et sans engagement !",
    imageUrl: "/carousel-4.jpg",
  },
];

// Default testimonials
const defaultTestimonials: Testimonial[] = [
  {
    id: 'default-1',
    customerName: "Sarah M.",
    message: "Rapide et soigné. Mon appartement n'a jamais été aussi propre ! Je recommande à 100%.",
    rating: 5,
  },
  {
    id: 'default-2',
    customerName: "Karim B.",
    message: "Ma voiture est comme neuve. Service impeccable et très professionnel. Équipe ponctuelle et efficace.",
    rating: 5,
  },
  {
    id: 'default-3',
    customerName: "Léa D.",
    message: "Enfin un service fiable le samedi. Je recommande à 100% ! Le rapport qualité-prix est excellent.",
    rating: 5,
  },
];

interface LandingPageClientProps {
  initialBlockedDates: BlockedDate[];
  initialTestimonials: Testimonial[];
  initialSocialLinks: SocialLink[];
  initialDateAvailabilities: DateAvailability[];
  initialServiceAreas: ServiceArea[];
}

export default function LandingPageClient({
  initialBlockedDates,
  initialTestimonials,
  initialSocialLinks,
  initialDateAvailabilities,
  initialServiceAreas
}: LandingPageClientProps) {
  const { toast } = useToast();
  const bookingRef = useRef<HTMLDivElement>(null);

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Data state from props
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [dateAvailabilities, setDateAvailabilities] = useState<DateAvailability[]>(initialDateAvailabilities);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ start: string, end: string }[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials.length > 0 ? initialTestimonials : defaultTestimonials);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(initialServiceAreas);
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Carousel auto-play - infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % defaultCarouselSlides.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Date-specific slots for that exact date
      const specificSlots = dateAvailabilities
        .filter(s => s.date === dateStr && s.isActive)
        .map(s => ({ start: s.startTime, end: s.endTime }));

      // Deduplicate by start time
      const unique = specificSlots.filter(
        (slot, idx, arr) => arr.findIndex(s => s.start === slot.start && s.end === slot.end) === idx
      ).sort((a, b) => a.start.localeCompare(b.start));

      setAvailableTimeSlots(unique);
      setSelectedTime('');
    }
  }, [selectedDate, dateAvailabilities]);

  // Check if date is available
  // A date is available if: not in the past, not blocked, AND has date-specific slots
  const isDateAvailable = useCallback((date: Date) => {
    const today = startOfDay(new Date());
    if (date < today) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    if (blockedDates.some(b => b.date === dateStr)) return false;

    // Check date-specific slots
    return dateAvailabilities.some(s => s.date === dateStr && s.isActive);
  }, [blockedDates, dateAvailabilities]);

  // Handle service click from services section
  const handleServiceClick = (categoryKey: string, serviceName: string) => {
    setSelectedCategory(categoryKey);
    setSelectedService(serviceName);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle navigation click with smooth scroll
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  // Generate WhatsApp message - plain text, no emojis to avoid encoding issues
  const generateWhatsAppMessage = () => {
    const categoryName = selectedCategory ?
      servicesCategories.find(c => c.key === selectedCategory)?.title || '' : '';

    const dateStr = selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Non specifiee';

    const lines = [
      '*NOUVELLE DEMANDE DE RENDEZ-VOUS*',
      '*KMI Home & Car Care*',
      '',
      '----------------------------',
      '',
      '*SERVICE DEMANDE:*',
      categoryName,
      selectedService ? ('- ' + selectedService) : '',
      '',
      '*DATE SOUHAITEE:*',
      dateStr,
      '',
      '*HORAIRE:*',
      selectedTime || 'Non specifie',
      '',
      '*ADRESSE:*',
      address || 'Non specifiee',
      '',
      '*CLIENT:*',
      customerName || 'Non specifie',
      '',
      '*EMAIL:*',
      email || 'Non specifie',
      '',
      '*TELEPHONE:*',
      phone || 'Non specifie',
      '',
      '*NOTES:*',
      notes || 'Aucune',
      '',
      '----------------------------',
      '',
      'Merci de confirmer la disponibilite !'
    ];

    const message = lines.join('\n');
    return encodeURIComponent(message);
  };

  // Handle booking
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !address || !selectedService || !phone) {
      toast({
        title: "❌ Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires (service, date, heure, adresse, téléphone).",
        variant: "destructive",
      });
      return;
    }

    // Validation du numéro de téléphone canadien (10 chiffres)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast({
        title: "❌ Numéro invalide",
        description: "Le numéro de téléphone doit contenir 10 chiffres (ex: 514 123 4567).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Obtenir le token reCAPTCHA v3
      let recaptchaToken = '';
      try {
        recaptchaToken = await new Promise<string>((resolve, reject) => {
          const w = window as any;
          if (!w.grecaptcha) {
            reject('reCAPTCHA not loaded');
            return;
          }
          w.grecaptcha.ready(() => {
            w.grecaptcha
              .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'booking' })
              .then(resolve)
              .catch(reject);
          });
        });
      } catch (recaptchaError) {
        console.error('reCAPTCHA error:', recaptchaError);
      }

      // Construction de la date en heure locale SANS passer par UTC
      // (évite le décalage +/- 1 jour dû au fuseau horaire)
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const localDateStr = `${y}-${m}-${d}`;

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService,
          serviceName: selectedService,
          date: localDateStr,
          time: selectedTime,
          address,
          customerName,
          email,
          phone,
          notes,
          recaptchaToken,
        }),
      });

      // Afficher le toast de succès
      toast({
        title: "✅ Réservation effectuée avec succès !",
        description: `Votre rendez-vous pour « ${selectedService} » le ${format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} à ${selectedTime} a bien été enregistré.`,
      });

      // Ouvrir la dialog WhatsApp
      setShowWhatsAppDialog(true);

    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ouvrir WhatsApp avec le message pré-rempli
  const handleOpenWhatsApp = () => {
    const whatsappUrl = `https://wa.me/18733442040?text=${generateWhatsAppMessage()}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppDialog(false);
  };

  // Get social icon
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, React.ElementType> = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
    };
    return icons[platform.toLowerCase()] || Mail;
  };

  // Navigation items
  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'Packs', href: '#packs' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'Rendez-vous', href: '#booking' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#003366]/95 backdrop-blur-sm text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <Home className="w-7 h-7" />
              <span className="text-xl font-bold">
                <span className="text-cyan-300">KMI</span> Home & Car Care
              </span>
              <Car className="w-7 h-7" />
            </a>

            {/* Desktop Navigation */}
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
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

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden text-white min-h-[500px] flex items-center">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {defaultCarouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/90 via-[#003366]/70 to-[#003366]/50"></div>
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
                  <span className="text-cyan-300">KMI</span> Home & Car Care
                </h1>
                <p className="text-cyan-200 text-xs md:text-sm">Nettoyage professionnel à domicile</p>
              </div>
              <Car className="w-10 h-10 md:w-16 md:h-16 drop-shadow-lg" />
            </div>

            {/* Carousel Content */}
            <div className="min-h-[220px] md:min-h-[200px]">
              {defaultCarouselSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${index === currentSlide
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 absolute'
                    }`}
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

            {/* Quick features */}
            <div className="hidden md:flex flex-wrap gap-4 mb-8">
              {[
                { icon: Zap, text: "Intervention rapide" },
                { icon: Shield, text: "Produits sécuritaires" },
                { icon: CheckCircle, text: "Résultat parfait" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                  <feature.icon className="w-5 h-5 text-cyan-300" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 w-full">
              <Button
                className="w-full sm:w-auto h-auto min-h-[54px] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm md:text-lg px-4 md:px-8 py-3 md:py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center whitespace-normal break-words text-center"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <CalendarCheck className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0" />
                <span>Prendre rendez-vous</span>
              </Button>

              <a href="https://wa.me/18733442040" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto block">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-auto min-h-[54px] bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold text-sm md:text-lg px-4 md:px-8 py-3 md:py-5 rounded-full flex items-center justify-center whitespace-normal break-words text-center"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0" />
                  WhatsApp
                </Button>
              </a>
            </div>

            {/* Promotion badge */}
            <div className="hidden md:inline-flex items-center gap-2 bg-yellow-400/95 text-gray-900 px-6 py-3 rounded-full font-bold shadow-lg">
              <Star className="w-5 h-5 fill-current" />
              10% SUR LA 1ÈRE VISITE
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {defaultCarouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsTransitioning(false);
                  }, 250);
                }}
                className={`transition-all duration-300 ${index === currentSlide
                  ? 'w-10 h-3 bg-yellow-400 rounded-full'
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
                  }`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <button
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentSlide((prev) => (prev - 1 + defaultCarouselSlides.length) % defaultCarouselSlides.length);
                setIsTransitioning(false);
              }, 250);
            }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 md:bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110 hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % defaultCarouselSlides.length);
                setIsTransitioning(false);
              }, 250);
            }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 md:bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110 hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 bg-white" id="services">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cliquez sur un service pour prendre rendez-vous
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {servicesCategories.map((category) => {
              const IconComponent = category.icon;
              if (category.title == "Nos Packs") return;
              return (
                <Card key={category.key} className={`group hover:shadow-2xl transition-all duration-500 border-0 ${category.bgColor} overflow-hidden hover:-translate-y-2`}>
                  <CardHeader className="pb-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} text-white mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.items.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleServiceClick(category.key, item.name)}
                        className="flex items-start gap-3 w-full text-left p-3 rounded-xl hover:bg-white/70 transition-all duration-300 cursor-pointer group/item"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                        <div>
                          <p className="font-medium text-gray-800 group-hover/item:text-cyan-700 transition-colors">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </button>
                    ))}

                    {/* Price list */}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {category.prices.slice(0, 3).map((price, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{price.size}</span>
                          <span className="font-semibold text-gray-900">{price.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Packs Section */}
          <div className="mt-20" id="packs">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Nos Packs Avantageux
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto p-10">
              {packsData.map((pack, index) => {
                const IconComponent = pack.icon;
                return (
                  <Card
                    key={index}
                    className={`relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${pack.popular ? 'border-2 border-green-500 shadow-xl scale-105' : 'border border-gray-200'}`}
                    onClick={() => handleServiceClick('', pack.name)}
                  >
                    {pack.popular && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                        POPULAIRE
                      </div>
                    )}
                    <CardContent className="p-8 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${pack.popular ? 'bg-green-100' : 'bg-gray-100'} mb-6`}>
                        <IconComponent className={`w-8 h-8 ${pack.popular ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <h4 className="font-bold text-xl text-gray-900 mb-2 uppercase">{pack.name}</h4>
                      <p className="text-gray-600 mb-6">{pack.description}</p>
                      <p className="text-3xl font-bold text-gray-900">{pack.price}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Booking Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-cyan-50" id="booking" ref={bookingRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Prendre Rendez-vous
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choisissez votre service, la date et l'heure qui vous conviennent
            </p>
          </div>

          <Card className="max-w-5xl mx-auto shadow-2xl border-0">
            <CardContent className="p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left: Calendar and Time */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                      📅 Sélectionnez une date
                    </Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={[date => !isDateAvailable(date)]}
                      locale={fr}
                      weekStartsOn={0}
                      className="rounded-2xl border shadow-md"
                    />
                  </div>

                  {selectedDate && availableTimeSlots.length > 0 && (
                    <div>
                      <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                        ⏰ Choisissez un horaire
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {availableTimeSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedTime === `${slot.start} - ${slot.end}` ? "default" : "outline"}
                            size="lg"
                            onClick={() => setSelectedTime(`${slot.start} - ${slot.end}`)}
                            className={`h-14 text-lg font-medium rounded-xl transition-all duration-300 ${selectedTime === `${slot.start} - ${slot.end}`
                              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105"
                              : "hover:border-green-500 hover:text-green-600"
                              }`}
                          >
                            {slot.start} - {slot.end}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && availableTimeSlots.length === 0 && (
                    <div className="p-6 bg-yellow-50 rounded-xl text-yellow-800 flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      Aucun créneau disponible pour cette date.
                    </div>
                  )}
                </div>

                {/* Right: Form */}
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="service" className="text-lg font-semibold text-gray-900 mb-3 block">
                      🧹 Service souhaité <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger id="service" className="h-14 rounded-xl text-lg">
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesCategories.map((category) => (
                          <div key={category.key}>
                            <div className="px-3 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg mb-1">
                              {category.title}
                            </div>
                            {category.items.map((item, index) => (
                              <SelectItem key={`${category.key}-${index}`} value={item.name} className="text-base py-2">
                                {item.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-lg font-semibold text-gray-900 mb-3 block">
                      📍 Votre adresse <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="Saisir votre adresse complète"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-14 rounded-xl text-lg placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-base font-semibold text-gray-900 mb-2 block">
                        👤 Nom <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="ex: Jean Dupont"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`h-12 rounded-xl placeholder:text-gray-400 ${customerName === '' && address ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        required
                      />
                      {customerName === '' && address && (
                        <p className="text-red-500 text-xs mt-1">Le nom est requis</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-base font-semibold text-gray-900 mb-2 block">
                        📞 Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="10 chiffres, ex: 8001234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        className={`h-12 rounded-xl placeholder:text-gray-400 ${phone && phone.length !== 10 ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        required
                      />
                      {phone && phone.length !== 10 && (
                        <p className="text-red-500 text-xs mt-1">Le numéro doit contenir exactement 10 chiffres ({phone.length}/10)</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-semibold text-gray-900 mb-2 block">
                      ✉️ Adresse mail (optionnel)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-12 rounded-xl placeholder:text-gray-400 ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    />
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <p className="text-red-500 text-xs mt-1">Format invalide (ex: nom@domaine.com)</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-base font-semibold text-gray-900 mb-2 block">
                      📝 Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Instructions particulières..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="rounded-xl placeholder:text-gray-400"
                    />
                  </div>

                  {/* Summary */}
                  {selectedDate && selectedTime && selectedService && (
                    <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">✅ Récapitulatif</h4>
                      <div className="text-green-700 space-y-2">
                        <p><strong>Service:</strong> {selectedService}</p>
                        <p><strong>Date:</strong> {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</p>
                        <p><strong>Heure:</strong> {selectedTime}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || !selectedService || !address || !phone || !customerName || isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                  >
                    <MessageCircle className="w-6 h-6 mr-2" />
                    {isLoading ? "Envoi en cours..." : "Réserver"}
                  </Button>

                  {/* Info tooltip */}
                  {showInfoTooltip && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowInfoTooltip(false)}
                    />
                  )}
                  <div className="flex justify-end mt-1">
                    <div className="relative inline-flex items-center gap-1.5 cursor-pointer">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-600 transition-colors focus:outline-none"
                        onClick={() => setShowInfoTooltip((v) => !v)}
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Service non listé ?</span>
                      </button>
                      {/* Tooltip — visible on hover (desktop) or via state (tap mobile) */}
                      <div className={`absolute bottom-6 right-0 z-50 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed transition-all duration-200 ${showInfoTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <p className="font-semibold mb-1">💡 Astuce :</p>
                        <p>Si votre besoin n&apos;est pas dans la liste, choisissez la rubrique la plus proche et décrivez votre demande dans la section <strong>Notes</strong>. Nous vous contacterons pour adapter le service.</p>
                        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dialog de confirmation WhatsApp */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Réservation confirmée ! 🎉
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Votre réservation a bien été enregistrée. Voulez-vous envoyer un message WhatsApp à l&apos;équipe KMI pour confirmer les détails ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowWhatsAppDialog(false)}
              className="flex-1 h-12 rounded-xl font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Non, merci
            </Button>
            <Button
              onClick={handleOpenWhatsApp}
              className="flex-1 h-12 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Oui, envoyer via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonials Section - Improved Design */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils recommandent
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez ce que nos clients disent de nos services
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id || index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 relative overflow-hidden group hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 left-6 text-cyan-500/20">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Content */}
                <div className="relative z-10 pt-8">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg italic">
                    "{testimonial.message}"
                  </p>

                  {/* Customer info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {testimonial.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.customerName}</p>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Verified className="w-4 h-4" />
                        Client vérifié
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-tl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {[
              { icon: Verified, text: "Service vérifié", color: "text-green-600 bg-green-50" },
              { icon: Shield, text: "Paiement sécurisé", color: "text-blue-600 bg-blue-50" },
              { icon: Heart, text: "Garantie satisfaction", color: "text-pink-600 bg-pink-50" },
            ].map((badge, index) => (
              <div key={index} className={`flex items-center gap-3 px-6 py-4 rounded-xl ${badge.color} transition-all duration-300 hover:scale-105 shadow-sm`}>
                <badge.icon className="w-6 h-6" />
                <span className="font-semibold">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Zones de service */}
      <section className="py-12 from-slate-50 to-sky-50/60">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#003366] font-semibold text-lg mb-6">Zones de service principales :</p>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.length > 0 ? (
              serviceAreas.map((area) => (
                <span
                  key={area.id}
                  className="px-5 py-2 bg-white border border-[#003366]/20 text-[#003366] rounded-full text-sm font-medium shadow-sm hover:shadow-md hover:border-[#003366]/40 transition-all duration-300 cursor-default"
                >
                  {area.name}
                </span>
              ))
            ) : (
              // Affichage temporaire fluide en attendant le chargement
              ['Montréal', 'Laval', 'Longueuil', 'Brossard', 'Dollard-des-Ormeaux', 'Pointe-Claire', 'Kirkland'].map((city) => (
                <span
                  key={city}
                  className="px-5 py-2 bg-white border border-[#003366]/20 text-[#003366] rounded-full text-sm font-medium shadow-sm opacity-50 cursor-default"
                >
                  {city}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features/Trust Section */}
      <section className="p-10 py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "Disponible 7j/7", desc: "Intervention rapide" },
              { icon: Shield, title: "Produits sécuritaires", desc: "Écologiques et efficaces" },
              { icon: CheckCircle, title: "Travail professionnel", desc: "Résultat impeccable" },
              { icon: Heart, title: "Prix compétitifs", desc: "Forfaits avantageux" },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white mb-4 shadow-lg">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-50 text-[#003366] mt-auto px-20" id="contact">
        {/* Top section */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-xl font-bold">
                <span className="text-cyan-600">KMI</span>{' '}
                <span className="text-[#003366] font-extrabold">Home & Car Care</span>
              </h3>
              <p className="text-[#003366]/60 text-sm mt-1 text-justify">L'excellence de l'entretien ménager et automobile, directement à votre porte pour vous simplifier la vie.</p>
            </div>

            {/* Contact & Nav links */}
            <div className="flex flex-col items-center gap-4">
              <nav className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: 'Services', href: '#services' },
                  { label: 'Tarifs', href: '#packs' },
                  { label: 'Rendez-vous', href: '#booking' },
                  { label: 'Contact', href: '#contact' },
                ].map((item) => (
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
              {/* Email visible */}
              <a
                href="mailto:contact@kmicare.ca"
                className="inline-flex items-center gap-2 text-sm text-[#003366]/70 hover:text-cyan-600 transition-colors duration-200 group"
              >
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
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm"
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })
              ) : (
                <>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://wa.me/18733442040" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 hover:scale-110 shadow-sm">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </>
              )}

              {/* Bouton d'appel direct ajouté à côté des réseaux */}
              <a 
                href="tel:18733442040" 
                title="(873) 344-2040" 
                className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-700 transition-all duration-300 hover:scale-110 shadow-md group relative"
              >
                <Phone className="w-4 h-4" />
                {/* Tooltip visible au survol */}
                <span className="absolute -top-10 scale-0 transition-all rounded bg-gray-900 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap shadow-lg border border-gray-700">
                  (873) 344-2040
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="bg-[#003366]/10" />

        {/* Bottom section */}
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#003366]/60">
              © {new Date().getFullYear()} KMI Home & Car Care. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#003366]/60 hover:text-[#003366] transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-sm text-[#003366]/60 hover:text-[#003366] transition-colors">Conditions d&apos;utilisation</a>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-[#003366]/50">
              Sponsorisé par{' '}
              <a
                href="https://trendoraboutique.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                Trendora
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
