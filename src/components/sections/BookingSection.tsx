'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Clock, MessageCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { servicesCategories } from '@/lib/data';
import type { BlockedDate, DateAvailability } from '@/lib/types';

interface BookingSectionProps {
  bookingRef: React.RefObject<HTMLDivElement | null>;
  selectedDate: Date | undefined;
  setSelectedDate: (d: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  selectedService: string;
  setSelectedService: (s: string) => void;
  address: string;
  setAddress: (a: string) => void;
  customerName: string;
  setCustomerName: (n: string) => void;
  email: string;
  setEmail: (e: string) => void;
  phone: string;
  setPhone: (p: string) => void;
  notes: string;
  setNotes: (n: string) => void;
  availableTimeSlots: { start: string; end: string }[];
  isLoading: boolean;
  isDateAvailable: (date: Date) => boolean;
  onBook: () => void;
}

export default function BookingSection({
  bookingRef, selectedDate, setSelectedDate, selectedTime, setSelectedTime,
  selectedService, setSelectedService, address, setAddress,
  customerName, setCustomerName, email, setEmail, phone, setPhone,
  notes, setNotes, availableTimeSlots, isLoading, isDateAvailable, onBook,
}: BookingSectionProps) {
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-cyan-50" id="booking" ref={bookingRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Prendre Rendez-vous</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Choisissez votre service, la date et l&apos;heure qui vous conviennent</p>
        </div>

        <Card className="max-w-5xl mx-auto shadow-2xl border-0">
          <CardContent className="p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Calendar + Time */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold text-gray-900 mb-4 block">📅 Sélectionnez une date</Label>
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
                    <Label className="text-lg font-semibold text-gray-900 mb-4 block">⏰ Choisissez un horaire</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableTimeSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === `${slot.start} - ${slot.end}` ? "default" : "outline"}
                          size="lg"
                          onClick={() => setSelectedTime(`${slot.start} - ${slot.end}`)}
                          className={`h-14 text-lg font-medium rounded-xl transition-all duration-300 ${selectedTime === `${slot.start} - ${slot.end}` ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105" : "hover:border-green-500 hover:text-green-600"}`}
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
                          <div className="px-3 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg mb-1">{category.title}</div>
                          {category.items.map((item, index) => (
                            <SelectItem key={`${category.key}-${index}`} value={item.name} className="text-base py-2">{item.name}</SelectItem>
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
                  <Input id="address" placeholder="Saisir votre adresse complète" value={address} onChange={(e) => setAddress(e.target.value)} className="h-14 rounded-xl text-lg placeholder:text-gray-400" />
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
                    {customerName === '' && address && <p className="text-red-500 text-xs mt-1">Le nom est requis</p>}
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
                    {phone && phone.length !== 10 && <p className="text-red-500 text-xs mt-1">Le numéro doit contenir exactement 10 chiffres ({phone.length}/10)</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold text-gray-900 mb-2 block">✉️ Adresse mail (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-12 rounded-xl placeholder:text-gray-400 ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <p className="text-red-500 text-xs mt-1">Format invalide (ex: nom@domaine.com)</p>}
                </div>

                <div>
                  <Label htmlFor="notes" className="text-base font-semibold text-gray-900 mb-2 block">📝 Notes</Label>
                  <Textarea id="notes" placeholder="Instructions particulières..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-xl placeholder:text-gray-400" />
                </div>

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
                  onClick={onBook}
                  disabled={!selectedDate || !selectedTime || !selectedService || !address || !phone || !customerName || isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                >
                  <MessageCircle className="w-6 h-6 mr-2" />
                  {isLoading ? "Envoi en cours..." : "Réserver"}
                </Button>

                {showInfoTooltip && <div className="fixed inset-0 z-40" onClick={() => setShowInfoTooltip(false)} />}
                <div className="flex justify-end mt-1">
                  <div className="relative inline-flex items-center gap-1.5 cursor-pointer">
                    <button type="button" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-600 transition-colors focus:outline-none" onClick={() => setShowInfoTooltip((v) => !v)}>
                      <Info className="w-3.5 h-3.5" />
                      <span>Service non listé ?</span>
                    </button>
                    <div className={`absolute bottom-6 right-0 z-50 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed transition-all duration-200 ${showInfoTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                      <p className="font-semibold mb-1">💡 Astuce :</p>
                      <p>Si votre besoin n&apos;est pas dans la liste, choisissez la rubrique la plus proche et décrivez votre demande dans la section <strong>Notes</strong>.</p>
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
  );
}
