'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Lock, LogOut, Plus, Trash2, Clock, Calendar, CheckCircle, XCircle, 
  AlertCircle, Loader2, Home, Car, Star, Share2, MapPin, GripVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

interface Booking {
  id: string;
  bookingNumber: string | null;
  service: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
  customerName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  endDate?: string | null;
  endTime?: string | null;
  source?: string;
  invoices?: Invoice[];
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  status: string;
  issueDate: string;
  notes: string | null;
  items: InvoiceItem[];
  createdAt: string;
}

interface Testimonial {
  id: string;
  customerName: string;
  message: string;
  rating: number;
  isActive: boolean;
  source: string;
  order: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
  order: number;
}

interface ServiceArea {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

interface DateAvailability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const socialPlatforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
];

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Data state
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);


  // Data state for date-specific availabilities
  const [dateAvailabilities, setDateAvailabilities] = useState<DateAvailability[]>([]);

  // Form state for date-specific availability
  const [newDateAvail, setNewDateAvail] = useState('');
  const [newDateAvailStart, setNewDateAvailStart] = useState('09:00');
  const [newDateAvailEnd, setNewDateAvailEnd] = useState('17:00');
  
  // Form state for blocked date
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  
  // Form state for testimonial
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialMessage, setNewTestimonialMessage] = useState('');
  const [newTestimonialRating, setNewTestimonialRating] = useState(5);
  
  // Form state for social link
  const [newSocialPlatform, setNewSocialPlatform] = useState('facebook');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Form state for service area
  const [newServiceArea, setNewServiceArea] = useState('');
  // Drag state
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);

  // Admin booking state
  const [isAdminBookingOpen, setIsAdminBookingOpen] = useState(false);
  const [adminBookingForm, setAdminBookingForm] = useState({
    service: '',
    address: '',
    customerName: '',
    phone: '',
    email: '',
    date: '',
    endDate: '',
    time: '',
    endTime: ''
  });
  
  // Invoice generation state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [showInvoiceErrors, setShowInvoiceErrors] = useState(false);
  const [currentInvoiceBooking, setCurrentInvoiceBooking] = useState<Booking | null>(null);
  
  // View invoice state
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);
  const [viewInvoiceData, setViewInvoiceData] = useState<Invoice | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    validateTimes: false,
    startTime: '',
    endTime: '',
    issueDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ description: '', amount: 0, quantity: 1 }]
  });

  // Booking deletion state
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  // === Recherche réservations ===
  const [bookingSearch, setBookingSearch] = useState('');

  // === Pagination + filtre créneaux ===
  const [availPage, setAvailPage] = useState(1);
  const [availSearch, setAvailSearch] = useState('');
  const AVAIL_PER_PAGE = 10;

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchData();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchData();
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans l'administration.",
        });
      } else {
        setLoginError(data.error || 'Identifiants incorrects');
      }
    } catch (error) {
      setLoginError('Erreur de connexion');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Un seul appel API au lieu de 6 — réduit la charge serveur de 83%
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) return;
      const data = await res.json();

      if (data.blockedDates) setBlockedDates(data.blockedDates);
      if (data.bookings) setBookings(data.bookings);
      if (data.invoices) setInvoices(data.invoices);
      if (data.testimonials) setTestimonials(data.testimonials);
      if (data.socialLinks) setSocialLinks(data.socialLinks);
      if (data.dateAvailabilities) setDateAvailabilities(data.dateAvailabilities);
      if (data.serviceAreas) setServiceAreas(data.serviceAreas);
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  // Date-specific availability functions
  const addDateAvailability = async () => {
    if (!newDateAvail) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une date.", variant: "destructive" });
      return;
    }
    if (newDateAvailStart >= newDateAvailEnd) {
      toast({ title: "Erreur", description: "L'heure de début doit être avant l'heure de fin.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch('/api/date-availabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDateAvail, startTime: newDateAvailStart, endTime: newDateAvailEnd, isActive: true }),
      });
      if (res.ok) {
        const newSlot = await res.json();
        setDateAvailabilities([...dateAvailabilities, newSlot]);
        setNewDateAvail('');
        setNewDateAvailStart('09:00');
        setNewDateAvailEnd('17:00');
        toast({ title: "✅ Créneau par date ajouté", description: `Disponibilité ajoutée pour le ${new Date(newDateAvail + 'T00:00').toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })}.` });
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter le créneau.", variant: "destructive" });
    }
  };

  const toggleDateAvailability = async (slot: DateAvailability) => {
    try {
      const res = await fetch('/api/date-availabilities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slot.id, isActive: !slot.isActive }),
      });
      if (res.ok) {
        setDateAvailabilities(dateAvailabilities.map(s => s.id === slot.id ? { ...s, isActive: !s.isActive } : s));
      }
    } catch (error) {
      console.error('Toggle date availability error:', error);
    }
  };

  const deleteDateAvailability = async (id: string) => {
    try {
      const res = await fetch(`/api/date-availabilities?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDateAvailabilities(dateAvailabilities.filter(s => s.id !== id));
        toast({ title: "Créneau supprimé", description: "Le créneau par date a été supprimé." });
      }
    } catch (error) {
      console.error('Delete date availability error:', error);
    }
  };

  // Blocked dates functions
  const addBlockedDate = async () => {
    if (!newBlockedDate) return;

    try {
      const res = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newBlockedDate,
          reason: newBlockedReason || null,
        }),
      });

      if (res.ok) {
        const newBlocked = await res.json();
        setBlockedDates([...blockedDates, newBlocked]);
        setNewBlockedDate('');
        setNewBlockedReason('');
        toast({
          title: "Date bloquée ajoutée",
          description: "La date a été bloquée avec succès.",
        });
      }
    } catch (error) {
      console.error('Add blocked date error:', error);
    }
  };

  const deleteBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/blocked-dates?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBlockedDates(blockedDates.filter(d => d.id !== id));
        toast({
          title: "Date débloquée",
          description: "La date a été débloquée.",
        });
      }
    } catch (error) {
      console.error('Delete blocked date error:', error);
    }
  };

  // Booking functions

  const handleAdminBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bookings/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminBookingForm,
          serviceName: adminBookingForm.service
        })
      });
      if (res.ok) {
        const newBooking = await res.json();
        setBookings([newBooking, ...bookings]);
        setIsAdminBookingOpen(false);
        setAdminBookingForm({
          service: '', address: '', customerName: '', phone: '', email: '', date: '', endDate: '', time: '', endTime: ''
        });
        toast({ title: "Réservation créée", description: "Le rendez-vous a été ajouté avec succès." });
      } else {
        toast({ title: "Erreur", description: "Impossible de créer la réservation.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowInvoiceErrors(true);

    const hasErrors = invoiceForm.items.some(item => !item.description.trim() || item.amount === 0 || item.amount === '' as any);
    if (hasErrors) return;

    if (!currentInvoiceBooking) return;
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: currentInvoiceBooking.id,
          clientName: currentInvoiceBooking.customerName || 'Client',
          clientEmail: currentInvoiceBooking.email,
          issueDate: invoiceForm.issueDate,
          notes: invoiceForm.notes,
          items: invoiceForm.items
        })
      });
      if (res.ok) {
        const newInvoice = await res.json();
        setInvoices([newInvoice, ...invoices]);
        setBookings(bookings.map(b => b.id === currentInvoiceBooking.id ? { ...b, invoices: [newInvoice] } : b));
        setIsInvoiceOpen(false);
        toast({ title: "Facture générée", description: "La facture a été créée." });
      } else {
        toast({ title: "Erreur", description: "Impossible de générer la facture.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' });
      if (res.ok) {
        const updatedInvoice = await res.json();
        setInvoices(invoices.map(i => i.id === invoiceId ? updatedInvoice : i));
        toast({ title: "Facture envoyée", description: "L'email a été envoyé au client." });
      } else {
        toast({ title: "Erreur", description: "Échec de l'envoi de la facture.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
        toast({
          title: "Statut mis à jour",
          description: "Le statut de la réservation a été modifié.",
        });
      }
    } catch (error) {
      console.error('Update booking error:', error);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
        toast({
          title: "🗑️ Réservation supprimée",
          description: "La réservation a été supprimée définitivement.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la réservation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete booking error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setBookingToDelete(null);
    }
  };

  // Testimonial functions
  const addTestimonial = async () => {
    if (!newTestimonialName || !newTestimonialMessage) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newTestimonialName,
          message: newTestimonialMessage,
          rating: newTestimonialRating,
          isActive: true,
        }),
      });

      if (res.ok) {
        const newTestimonial = await res.json();
        setTestimonials([...testimonials, newTestimonial]);
        setNewTestimonialName('');
        setNewTestimonialMessage('');
        setNewTestimonialRating(5);
        toast({
          title: "Témoignage ajouté",
          description: "Le témoignage a été ajouté avec succès.",
        });
      }
    } catch (error) {
      console.error('Add testimonial error:', error);
    }
  };

  const toggleTestimonialActive = async (testimonial: Testimonial) => {
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testimonial.id,
          isActive: !testimonial.isActive,
        }),
      });

      if (res.ok) {
        setTestimonials(testimonials.map(t => 
          t.id === testimonial.id ? { ...t, isActive: !t.isActive } : t
        ));
      }
    } catch (error) {
      console.error('Toggle testimonial error:', error);
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id));
        toast({
          title: "Témoignage supprimé",
          description: "Le témoignage a été supprimé.",
        });
      }
    } catch (error) {
      console.error('Delete testimonial error:', error);
    }
  };

  // Social links functions
  const addSocialLink = async () => {
    if (!newSocialUrl) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer l'URL du profil.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch('/api/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: newSocialPlatform,
          url: newSocialUrl,
          isActive: true,
        }),
      });

      if (res.ok) {
        const newLink = await res.json();
        setSocialLinks([...socialLinks, newLink]);
        setNewSocialUrl('');
        toast({
          title: "Lien social ajouté",
          description: "Le lien a été ajouté avec succès.",
        });
      }
    } catch (error) {
      console.error('Add social link error:', error);
    }
  };

  const toggleSocialLinkActive = async (link: SocialLink) => {
    try {
      const res = await fetch('/api/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: link.id,
          isActive: !link.isActive,
        }),
      });

      if (res.ok) {
        setSocialLinks(socialLinks.map(l => 
          l.id === link.id ? { ...l, isActive: !l.isActive } : l
        ));
      }
    } catch (error) {
      console.error('Toggle social link error:', error);
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      const res = await fetch(`/api/social-links?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSocialLinks(socialLinks.filter(l => l.id !== id));
        toast({
          title: "Lien supprimé",
          description: "Le lien social a été supprimé.",
        });
      }
    } catch (error) {
      console.error('Delete social link error:', error);
    }
  };

  // Service Area functions
  const addServiceArea = async () => {
    if (!newServiceArea.trim()) {
      toast({ title: "Erreur", description: "Le nom de la zone est requis.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch('/api/service-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServiceArea }),
      });
      if (res.ok) {
        const newArea = await res.json();
        setServiceAreas([...serviceAreas, newArea]);
        setNewServiceArea('');
        toast({ title: "Zone ajoutée", description: "La zone de service a été ajoutée avec succès." });
      } else {
        const error = await res.json();
        toast({ title: "Erreur", description: error.error || "Une erreur est survenue.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Add service area error:', error);
    }
  };

  const toggleServiceAreaActive = async (area: ServiceArea) => {
    try {
      const res = await fetch('/api/service-areas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: area.id, isActive: !area.isActive }),
      });
      if (res.ok) {
        setServiceAreas(serviceAreas.map(a => a.id === area.id ? { ...a, isActive: !a.isActive } : a));
      }
    } catch (error) {
      console.error('Toggle service area error:', error);
    }
  };

  const deleteServiceArea = async (id: string) => {
    try {
      const res = await fetch(`/api/service-areas?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServiceAreas(serviceAreas.filter(a => a.id !== id));
        toast({ title: "Zone supprimée", description: "La zone de service a été supprimée." });
      }
    } catch (error) {
      console.error('Delete service area error:', error);
    }
  };

  // Drag and drop for service areas
  const handleDragStartArea = (e: React.DragEvent, id: string) => {
    setDraggedAreaId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.4';
    }, 0);
  };

  const handleDragEndArea = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedAreaId(null);
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropArea = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedAreaId || draggedAreaId === targetId) return;

    const oldIndex = serviceAreas.findIndex(a => a.id === draggedAreaId);
    const newIndex = serviceAreas.findIndex(a => a.id === targetId);

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedAreas = [...serviceAreas];
    const [movedArea] = updatedAreas.splice(oldIndex, 1);
    updatedAreas.splice(newIndex, 0, movedArea);

    const sortedAreas = updatedAreas.map((area, index) => ({
      ...area,
      order: index
    }));

    setServiceAreas(sortedAreas);

    try {
      await fetch('/api/service-areas/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: sortedAreas.map(a => ({ id: a.id, order: a.order })) }),
      });
    } catch (error) {
      console.error('Erreur réorganisation:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder l'ordre.", variant: "destructive" });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Administration</CardTitle>
            <CardDescription>
              Connectez-vous pour gérer les disponibilités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {loginError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Entrez votre mot de passe"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-cyan-50">
      {/* Header */}
      <header className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-cyan-300">KMI</span> Admin
                </h1>
              </div>
              <Car className="w-8 h-8" />
            </div>
            <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList className="bg-white shadow-md p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="availability" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Clock className="w-4 h-4" />
              Disponibilités
            </TabsTrigger>
            <TabsTrigger value="blocked" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              Dates bloquées
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <CheckCircle className="w-4 h-4" />
              Réservations
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <span className="text-lg">💰</span>
              Factures
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Star className="w-4 h-4" />
              Témoignages
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white hidden lg:flex">
              <Share2 className="w-4 h-4" />
              Réseaux
            </TabsTrigger>
            <TabsTrigger value="service-areas" className="gap-2 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <MapPin className="w-4 h-4" />
              Villes
            </TabsTrigger>
          </TabsList>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-cyan-600" />
                    Ajouter un créneau
                  </CardTitle>
                  <CardDescription>
                    Choisissez une date précise et définissez les horaires de disponibilité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={newDateAvail}
                      onChange={(e) => setNewDateAvail(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heure de début</Label>
                      <Input
                        type="time"
                        value={newDateAvailStart}
                        onChange={(e) => setNewDateAvailStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure de fin</Label>
                      <Input
                        type="time"
                        value={newDateAvailEnd}
                        onChange={(e) => setNewDateAvailEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={addDateAvailability} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le créneau
                  </Button>
                </CardContent>
              </Card>

            {/* Liste des créneaux avec filtre + pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Créneaux configurés ({dateAvailabilities.length})</CardTitle>
                <CardDescription>Disponibilités prévues pour des dates précises</CardDescription>
                {/* Filtre */}
                <Input
                  placeholder="Filtrer : 2026-04-12, 2026-04, 2026..."
                  value={availSearch}
                  onChange={(e) => { setAvailSearch(e.target.value); setAvailPage(1); }}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                {(() => {
                  const filtered = dateAvailabilities
                    .filter(s => s.date.includes(availSearch.trim()))
                    .sort((a, b) => a.date.localeCompare(b.date));
                  const totalPages = Math.max(1, Math.ceil(filtered.length / AVAIL_PER_PAGE));
                  const paginated = filtered.slice((availPage - 1) * AVAIL_PER_PAGE, availPage * AVAIL_PER_PAGE);
                  return (
                    <>
                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {paginated.map(slot => {
                          const [sy, sm, sd] = slot.date.split('-').map(Number);
                          const d = new Date(sy, sm - 1, sd);
                          const today = new Date(); today.setHours(0,0,0,0);
                          const isPast = d < today;
                          return (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                isPast ? 'bg-gray-50 border-gray-200 opacity-60' :
                                slot.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Switch
                                  checked={slot.isActive}
                                  onCheckedChange={() => toggleDateAvailability(slot)}
                                  disabled={isPast}
                                />
                                <div className="min-w-0">
                                  <p className={`font-medium text-sm ${
                                    slot.isActive && !isPast ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                  <p className="text-xs text-gray-500">{slot.startTime} – {slot.endTime}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2 shrink-0">
                                {isPast ? (
                                  <Badge variant="secondary" className="text-xs">Passé</Badge>
                                ) : (
                                  <Badge
                                    className={slot.isActive ? 'bg-green-500 text-xs' : 'text-xs'}
                                    variant={slot.isActive ? 'default' : 'secondary'}
                                  >
                                    {slot.isActive ? 'Actif' : 'Inactif'}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteDateAvailability(slot.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {paginated.length === 0 && (
                          <div className="text-center text-gray-500 py-8">
                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{availSearch ? 'Aucun créneau correspondant' : 'Aucun créneau configuré'}</p>
                          </div>
                        )}
                      </div>
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <Button
                            variant="outline" size="sm"
                            onClick={() => setAvailPage(p => Math.max(1, p - 1))}
                            disabled={availPage === 1}
                          >
                            ← Précédent
                          </Button>
                          <span className="text-sm text-gray-500">
                            Page {availPage} / {totalPages} ({filtered.length} créneaux)
                          </span>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => setAvailPage(p => Math.min(totalPages, p + 1))}
                            disabled={availPage === totalPages}
                          >
                            Suivant →
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Blocked Dates Tab */}
          <TabsContent value="blocked">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Bloquer une date
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date à bloquer</Label>
                    <Input
                      type="date"
                      value={newBlockedDate}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Raison (optionnel)</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Jour férié, Congé annuel..."
                      value={newBlockedReason}
                      onChange={(e) => setNewBlockedReason(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={addBlockedDate} className="w-full bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Bloquer la date
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dates bloquées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {blockedDates.sort((a, b) => a.date.localeCompare(b.date)).map(blocked => (
                      <div
                        key={blocked.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {(() => { const [by, bm, bd] = blocked.date.split('-').map(Number); return new Date(by, bm - 1, bd).toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); })()}
                          </p>
                          {blocked.reason && (
                            <p className="text-sm text-gray-500">{blocked.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBlockedDate(blocked.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {blockedDates.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune date bloquée</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    Demandes de rendez-vous
                  </CardTitle>
                  <CardDescription>
                    Gérez et ajoutez de nouvelles demandes
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button onClick={() => setIsAdminBookingOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Réservation
                  </Button>
                  <Input
                    placeholder="Rechercher par N° (KMI-...), nom, ou date"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-[300px]"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const q = bookingSearch.trim().toLowerCase();
                    const filtered = bookings.filter(b =>
                      !q ||
                      (b.bookingNumber || '').toLowerCase().includes(q) ||
                      (b.customerName || '').toLowerCase().includes(q) ||
                      b.date.includes(q)
                    );
                    return (
                      <>
                        {filtered.map(booking => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {booking.bookingNumber && (
                              <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                                {booking.bookingNumber}
                              </span>
                            )}
                            <Badge variant="outline" className="text-cyan-600 border-cyan-600">
                              {booking.serviceName}
                            </Badge>
                            <Badge className={
                              booking.status === 'pending' ? 'bg-yellow-500' :
                              booking.status === 'confirmed' ? 'bg-green-500' :
                              booking.status === 'completed' ? 'bg-blue-500' :
                              'bg-red-500'
                            }>
                              {booking.status === 'pending' ? 'En attente' :
                               booking.status === 'confirmed' ? 'Confirmé' :
                               booking.status === 'completed' ? 'Terminé' :
                               'Annulé'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {(() => { const [by, bm, bd] = booking.date.split('-').map(Number); return new Date(by, bm - 1, bd).toLocaleDateString('fr-CA'); })()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </span>
                          </div>
                          
                          <div className="text-sm">
                            <strong>Adresse:</strong> {booking.address}
                          </div>
                          
                          {(booking.customerName || booking.phone || booking.email) && (
                            <div className="text-sm flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              <strong>Client:</strong> {booking.customerName || 'Non spécifié'}
                              {booking.phone && <span>📞 {booking.phone}</span>}
                              {booking.email && <span>✉️ {booking.email}</span>}
                            </div>
                          )}
                          
                          {booking.notes && (
                            <div className="text-sm text-gray-500 italic">
                              {booking.notes}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400 mt-1">
                            Soumise le {new Date(booking.createdAt).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })} à {new Date(booking.createdAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirmer
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Marquer terminé
                            </Button>
                          )}
                          {booking.status === 'completed' && (!booking.invoices || booking.invoices.length === 0) && (
                            <Button size="sm" onClick={() => {
                              setCurrentInvoiceBooking(booking);
                              setInvoiceForm(prev => ({
                                ...prev,
                                items: [{ description: booking.serviceName || booking.service, amount: 0, quantity: 1 }]
                              }));
                              setIsInvoiceOpen(true);
                            }} className="bg-purple-600 hover:bg-purple-700 text-white">
                              <span className="mr-1">💰</span> Générer facture
                            </Button>
                          )}
                          {booking.status === 'completed' && booking.invoices && booking.invoices.length > 0 && (
                            <Button size="sm" onClick={() => sendInvoice(booking.invoices![0].id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                              📧 Envoyer facture
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBookingToDelete(booking.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                        ))}

                        {filtered.length === 0 && (
                          <div className="text-center text-gray-500 py-12">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{bookingSearch ? 'Aucune réservation correspondante' : 'Aucune demande de rendez-vous'}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modal Nouvelle Réservation (Admin) */}
          <AlertDialog open={isAdminBookingOpen} onOpenChange={setIsAdminBookingOpen}>
            <AlertDialogContent className="max-w-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Créer une nouvelle réservation</AlertDialogTitle>
                <AlertDialogDescription>
                  Enregistrez manuellement une demande de client.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={handleAdminBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service souhaité *</Label>
                    <Select value={adminBookingForm.service} onValueChange={(val) => setAdminBookingForm({ ...adminBookingForm, service: val })} required>
                      <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="Pack populaire">Pack populaire</SelectItem>
                        <SelectItem value="Pack Déménagement">Pack Déménagement</SelectItem>
                        <SelectItem value="Pack Premium">Pack Premium</SelectItem>

                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 mt-2">Ménage résidentiel</div>
                        <SelectItem value="Nettoyage complet">Nettoyage complet</SelectItem>
                        <SelectItem value="Dépoussiérage">Dépoussiérage</SelectItem>
                        <SelectItem value="Lavage des sols">Lavage des sols</SelectItem>
                        <SelectItem value="Désinfection surfaces">Désinfection surfaces</SelectItem>
                        <SelectItem value="Nettoyage électroménagers">Nettoyage électroménagers</SelectItem>

                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 mt-2">Avant / après location</div>
                        <SelectItem value="Remise à neuf">Remise à neuf</SelectItem>
                        <SelectItem value="Nettoyage après départ">Nettoyage après départ</SelectItem>
                        <SelectItem value="Désinfection complète">Désinfection complète</SelectItem>
                        <SelectItem value="Cuisine + salle de bain">Cuisine + salle de bain</SelectItem>

                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 mt-2">Après chantier</div>
                        <SelectItem value="Enlèvement poussière lourde">Enlèvement poussière lourde</SelectItem>
                        <SelectItem value="Traces de peinture/ciment">Traces de peinture/ciment</SelectItem>
                        <SelectItem value="Lavage vitres (chantier)">Lavage vitres</SelectItem>
                        <SelectItem value="Sols et surfaces (chantier)">Sols et surfaces</SelectItem>

                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 mt-2">Lavage automobile</div>
                        <SelectItem value="Lavage extérieur complet">Lavage extérieur complet</SelectItem>
                        <SelectItem value="Nettoyage intérieur auto">Nettoyage intérieur</SelectItem>
                        <SelectItem value="Nettoyage tableau de bord">Nettoyage tableau de bord</SelectItem>
                        <SelectItem value="Désodorisation auto">Désodorisation</SelectItem>
                        <SelectItem value="Shampoing sièges">Shampoing sièges</SelectItem>
                        <SelectItem value="Traitement des taches auto">Traitement des taches</SelectItem>
                        <SelectItem value="Rénovation plastique intérieur">Rénovation plastique intérieur</SelectItem>
                        <SelectItem value="Finition brillante extérieure">Finition brillante extérieure</SelectItem>

                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 mt-2">Services supplémentaires</div>
                        <SelectItem value="Nettoyage vitres">Nettoyage vitres</SelectItem>
                        <SelectItem value="Nettoyage tapis et moquettes">Nettoyage tapis et moquettes</SelectItem>
                        <SelectItem value="Nettoyage canapé">Nettoyage canapé</SelectItem>
                        <SelectItem value="Désinfection anti-bactérien">Désinfection anti-bactérien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse complète *</Label>
                    <Input required value={adminBookingForm.address} onChange={(e) => setAdminBookingForm({...adminBookingForm, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input required value={adminBookingForm.customerName} onChange={(e) => setAdminBookingForm({...adminBookingForm, customerName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone *</Label>
                    <Input required value={adminBookingForm.phone} onChange={(e) => setAdminBookingForm({...adminBookingForm, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse mail (optionnel mais requis pour facture)</Label>
                    <Input type="email" value={adminBookingForm.email} onChange={(e) => setAdminBookingForm({...adminBookingForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input required type="date" value={adminBookingForm.date} onChange={(e) => setAdminBookingForm({...adminBookingForm, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de début *</Label>
                    <Input required type="time" value={adminBookingForm.time} onChange={(e) => setAdminBookingForm({...adminBookingForm, time: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de fin *</Label>
                    <Input required type="time" value={adminBookingForm.endTime} onChange={(e) => setAdminBookingForm({...adminBookingForm, endTime: e.target.value})} />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">Enregistrer</Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>

          {/* Modal Générer Facture */}
          <AlertDialog open={isInvoiceOpen} onOpenChange={(open) => {
            setIsInvoiceOpen(open);
            if (!open) setShowInvoiceErrors(false);
          }}>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>Générer une facture</AlertDialogTitle>
                <AlertDialogDescription>
                  Créez une facture pour la réservation {currentInvoiceBooking?.bookingNumber}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={handleInvoiceSubmit} className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch id="validate-times" checked={invoiceForm.validateTimes} onCheckedChange={(c) => {
                    setInvoiceForm({
                      ...invoiceForm,
                      validateTimes: c,
                      startTime: c ? (currentInvoiceBooking?.time || '') : '',
                      endTime: c ? (currentInvoiceBooking?.endTime || '') : ''
                    });
                  }} />
                  <Label htmlFor="validate-times">Valider si les heures sont correctes</Label>
                </div>
                
                {invoiceForm.validateTimes && (
                  <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                    <div className="space-y-2">
                      <Label>Heure de début</Label>
                      <Input type="time" value={invoiceForm.startTime} onChange={(e) => setInvoiceForm({...invoiceForm, startTime: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure de fin</Label>
                      <Input type="time" value={invoiceForm.endTime} onChange={(e) => setInvoiceForm({...invoiceForm, endTime: e.target.value})} />
                    </div>
                  </div>
                )}

                <div className="space-y-4 border-t pt-4">
                  <Label className="text-lg font-bold">Services facturés</Label>
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Description <span className="text-red-500">*</span></Label>
                        <Input required value={item.description} onChange={(e) => {
                          const newItems = [...invoiceForm.items];
                          newItems[index].description = e.target.value;
                          setInvoiceForm({...invoiceForm, items: newItems});
                        }} placeholder="Ex: Lavage complet" className={showInvoiceErrors && !item.description.trim() ? "border-red-500" : ""} />
                        {showInvoiceErrors && !item.description.trim() && (
                          <p className="text-xs text-red-500">Ce champ est requis.</p>
                        )}
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>Montant ($) <span className="text-red-500">*</span></Label>
                        <Input required type="number" step="0.01" min="0" value={item.amount === 0 ? '' : item.amount} onChange={(e) => {
                          const newItems = [...invoiceForm.items];
                          newItems[index].amount = e.target.value === '' ? '' as any : (parseFloat(e.target.value) || 0);
                          setInvoiceForm({...invoiceForm, items: newItems});
                        }} className={showInvoiceErrors && (!item.amount || item.amount === 0 || item.amount === '' as any) ? "border-red-500" : ""} />
                        {showInvoiceErrors && (!item.amount || item.amount === 0 || item.amount === '' as any) && (
                          <p className="text-xs text-red-500">Requis.</p>
                        )}
                      </div>
                      <div className="w-20 space-y-2">
                        <Label>Qté</Label>
                        <Input required type="number" min="1" value={item.quantity} onChange={(e) => {
                          const newItems = [...invoiceForm.items];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          setInvoiceForm({...invoiceForm, items: newItems});
                        }} />
                      </div>
                      {invoiceForm.items.length > 1 && (
                        <Button type="button" variant="destructive" size="icon" onClick={() => {
                          const newItems = invoiceForm.items.filter((_, i) => i !== index);
                          setInvoiceForm({...invoiceForm, items: newItems});
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setInvoiceForm({...invoiceForm, items: [...invoiceForm.items, {description: '', amount: 0, quantity: 1}]});
                  }}>
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un service
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Date d'envoi / d'émission</Label>
                    <Input required type="date" value={invoiceForm.issueDate} onChange={(e) => setInvoiceForm({...invoiceForm, issueDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes supplémentaires (optionnel)</Label>
                  <Textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="Merci pour votre confiance !" />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel type="button" className="cursor-pointer">Annuler</AlertDialogCancel>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer text-white">Confirmer la génération</Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>

          {/* Modal Visualiser Facture */}
          <AlertDialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>Facture {viewInvoiceData?.invoiceNumber}</AlertDialogTitle>
                <AlertDialogDescription>
                  Détails de la facture (Lecture seule)
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {viewInvoiceData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date d'émission</p>
                      <p className="font-semibold">{viewInvoiceData.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Statut</p>
                      <Badge className={
                        viewInvoiceData.status === 'sent' ? 'bg-green-500' :
                        viewInvoiceData.status === 'paid' ? 'bg-purple-500' :
                        'bg-yellow-500'
                      }>
                        {viewInvoiceData.status === 'sent' ? 'Envoyée' : viewInvoiceData.status === 'paid' ? 'Payée' : 'Générée'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">Client</p>
                      <p className="font-semibold">{viewInvoiceData.clientName}</p>
                      <p className="text-gray-600">{viewInvoiceData.clientEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Réservation associée</p>
                      <p className="font-mono text-xs">{viewInvoiceData.bookingId}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2 text-center">Qté</th>
                          <th className="px-4 py-2 text-right">Prix Unitaire</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewInvoiceData.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">{item.amount.toFixed(2)} $</td>
                            <td className="px-4 py-2 text-right font-medium">{(item.amount * item.quantity).toFixed(2)} $</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right font-bold">Total Général :</td>
                          <td className="px-4 py-3 text-right font-bold text-cyan-700">{viewInvoiceData.totalAmount.toFixed(2)} $</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {viewInvoiceData.notes && (
                    <div className="text-sm bg-gray-50 p-3 rounded-lg border">
                      <p className="text-gray-500 font-semibold mb-1">Notes :</p>
                      <p className="italic">{viewInvoiceData.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Fermer</AlertDialogCancel>
                <Button onClick={() => {
                  if(viewInvoiceData) sendInvoice(viewInvoiceData.id);
                }} className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white">
                  📧 Envoyer au client
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* AlertDialog de confirmation de suppression */}
          <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Supprimer la réservation ?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Cette action est <strong>irréversible</strong>. La réservation sera définitivement supprimée de la base de données.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => bookingToDelete && deleteBooking(bookingToDelete)}
                  className="bg-red-500 hover:bg-red-600 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          
          {/* Factures Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Gestion des factures
                </CardTitle>
                <CardDescription>
                  Historique des factures et envoi aux clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Numéro</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Réservation (ID)</th>
                        <th className="px-4 py-3">Montant</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            Aucune facture générée.
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-cyan-700">{inv.invoiceNumber}</td>
                            <td className="px-4 py-3">{inv.issueDate}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium">{inv.clientName}</p>
                              <p className="text-xs text-gray-500">{inv.clientEmail}</p>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{inv.bookingId}</td>
                            <td className="px-4 py-3 font-bold">{inv.totalAmount.toFixed(2)} $</td>
                            <td className="px-4 py-3">
                              <Badge className={
                                inv.status === 'sent' ? 'bg-green-500' :
                                inv.status === 'paid' ? 'bg-purple-500' :
                                'bg-yellow-500'
                              }>
                                {inv.status === 'sent' ? 'Envoyée' : inv.status === 'paid' ? 'Payée' : 'Générée'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => {
                                  setViewInvoiceData(inv);
                                  setIsViewInvoiceOpen(true);
                                }} className="cursor-pointer hover:bg-gray-100 text-gray-700">
                                  👁️ Visualiser
                                </Button>
                                <Button size="sm" onClick={() => sendInvoice(inv.id)} className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer text-white">
                                  {inv.status === 'sent' ? 'Renvoyer' : 'Envoyer'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-yellow-600" />
                    Ajouter un témoignage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom du client</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Marie D."
                      value={newTestimonialName}
                      onChange={(e) => setNewTestimonialName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Témoignage</Label>
                    <Textarea
                      placeholder="Le témoignage du client..."
                      value={newTestimonialMessage}
                      onChange={(e) => setNewTestimonialMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewTestimonialRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= newTestimonialRating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={addTestimonial} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le témoignage
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Témoignages existants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {testimonials.map(testimonial => (
                      <div
                        key={testimonial.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          testimonial.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Switch
                              checked={testimonial.isActive}
                              onCheckedChange={() => toggleTestimonialActive(testimonial)}
                            />
                            <span className="font-semibold">{testimonial.customerName}</span>
                            {testimonial.source === 'client' && !testimonial.isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                ⏳ Client · En attente de validation
                              </span>
                            )}
                            {testimonial.source === 'client' && testimonial.isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                ✓ Client · Publié
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{testimonial.message}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTestimonial(testimonial.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    ))}
                    
                    {testimonials.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun témoignage</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Ajouter un réseau social
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Plateforme</Label>
                    <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une plateforme" />
                      </SelectTrigger>
                      <SelectContent>
                        {socialPlatforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL du profil</Label>
                    <Input
                      type="url"
                      placeholder="https://facebook.com/votre-page"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={addSocialLink} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le lien
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Liens configurés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {socialLinks.map(link => (
                      <div
                        key={link.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          link.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={link.isActive}
                            onCheckedChange={() => toggleSocialLinkActive(link)}
                          />
                          <div>
                            <p className="font-medium capitalize">{link.platform}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{link.url}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSocialLink(link.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {socialLinks.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Share2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun lien social configuré</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Areas Tab */}
          <TabsContent value="service-areas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-cyan-600" />
                    Ajouter une zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom de la ville ou zone</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Montréal, Laval..."
                      value={newServiceArea}
                      onChange={(e) => setNewServiceArea(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={addServiceArea} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter la zone
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Zones configurées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {serviceAreas.map(area => (
                      <div
                        key={area.id}
                        draggable
                        onDragStart={(e) => handleDragStartArea(e, area.id)}
                        onDragEnd={handleDragEndArea}
                        onDragOver={handleDragOverArea}
                        onDrop={(e) => handleDropArea(e, area.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          draggedAreaId === area.id ? 'opacity-50' : ''
                        } ${
                          area.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab hover:bg-black/5 p-1 rounded active:cursor-grabbing text-gray-400">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <Switch
                            checked={area.isActive}
                            onCheckedChange={() => toggleServiceAreaActive(area)}
                          />
                          <p className="font-medium">{area.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteServiceArea(area.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {serviceAreas.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune zone de service configurée</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
