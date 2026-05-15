'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, MessageCircle } from 'lucide-react';

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmedBookingNumber: string;
  onOpenWhatsApp: () => void;
}

export default function WhatsAppDialog({ open, onOpenChange, confirmedBookingNumber, onOpenWhatsApp }: WhatsAppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Réservation confirmée ! 🎉</DialogTitle>
          {confirmedBookingNumber && (
            <div className="mt-3 mx-auto bg-amber-50 border-2 border-amber-400 rounded-xl px-6 py-3">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-widest mb-1">Votre numéro de demande</p>
              <p className="text-2xl font-black text-amber-900 font-mono tracking-wider">{confirmedBookingNumber}</p>
              <p className="text-xs text-amber-600 mt-1">Conservez ce numéro pour tout suivi</p>
            </div>
          )}
          <DialogDescription className="text-base text-gray-600 mt-3">
            Votre réservation a bien été enregistrée. Voulez-vous envoyer un message WhatsApp à l&apos;équipe KMI pour confirmer les détails ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-12 rounded-xl font-semibold border-gray-300 text-gray-700 hover:bg-gray-50">
            Non, merci
          </Button>
          <Button onClick={onOpenWhatsApp} className="flex-1 h-12 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Oui, envoyer via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
