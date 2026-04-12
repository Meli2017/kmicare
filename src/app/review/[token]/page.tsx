import { Metadata } from 'next';
import { db } from '@/lib/db';
import ReviewFormClient from '@/components/ReviewFormClient';
import { Home, Car, Mail, Phone, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Laisser un témoignage | KMI Home & Car Care',
  description: 'Partagez votre expérience avec KMI Home & Car Care.',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewPage({ params }: PageProps) {
  const { token } = await params;

  // Validate token server-side
  type TokenRecord = {
    id: string; token: string; bookingId: string;
    customerName: string | null; customerEmail: string;
    isUsed: boolean; expiresAt: Date; createdAt: Date; updatedAt: Date;
  };
  let tokenRecord: TokenRecord | null = null;
  let reason: 'invalid' | 'used' | 'expired' | 'valid' = 'invalid';

  try {
    tokenRecord = await db.testimonialToken.findUnique({ where: { token } });
    if (!tokenRecord) {
      reason = 'invalid';
    } else if (tokenRecord.isUsed) {
      reason = 'used';
    } else if (new Date() > tokenRecord.expiresAt) {
      reason = 'expired';
    } else {
      reason = 'valid';
    }
  } catch {
    reason = 'invalid';
  }

  const isValid = reason === 'valid';
  const defaultName = tokenRecord?.customerName || '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#003366]/95 backdrop-blur-sm text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Home className="w-7 h-7" />
              <span className="text-xl font-bold">
                <span className="text-cyan-300">KMI</span> Home &amp; Car Care
              </span>
              <Car className="w-7 h-7" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-xl">
        {isValid ? (
          <div>
            {/* Title */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Votre avis compte !
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                Merci d&apos;avoir choisi KMI Home &amp; Car Care. Partagez votre expérience en quelques mots — cela aide d&apos;autres clients à nous faire confiance.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <ReviewFormClient token={token} defaultName={defaultName} />
            </div>
          </div>
        ) : (
          // Invalid / expired / used token
          <div className="text-center py-16">
            <div className="text-6xl mb-6">
              {reason === 'used' ? '✅' : '⏰'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {reason === 'used'
                ? 'Témoignage déjà soumis'
                : reason === 'expired'
                  ? 'Lien expiré'
                  : 'Lien invalide'}
            </h1>
            <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
              {reason === 'used'
                ? 'Vous avez déjà soumis votre témoignage. Merci infiniment pour votre avis !'
                : reason === 'expired'
                  ? 'Ce lien a expiré après 30 jours. Contactez-nous si vous souhaitez laisser un avis.'
                  : 'Ce lien est invalide. Vérifiez que vous avez copié l\'URL complète depuis votre email.'}
            </p>
            <a
              href="/"
              className="inline-block mt-8 px-8 py-3 bg-[#003366] text-white rounded-full font-semibold hover:bg-[#0055aa] transition-colors duration-200"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-sky-50 text-[#003366] mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold">
                <span className="text-cyan-600">KMI</span>{' '}
                <span className="text-[#003366] font-extrabold">Home &amp; Car Care</span>
              </h3>
              <p className="text-[#003366]/60 text-sm mt-1">Nettoyage professionnel à domicile</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:contact@kmicare.ca" className="flex items-center gap-1 text-sm text-[#003366]/70 hover:text-cyan-600 transition-colors">
                <Mail className="w-4 h-4" />
                contact@kmicare.ca
              </a>
              <a href="tel:18733442040" className="flex items-center gap-1 text-sm text-[#003366]/70 hover:text-cyan-600 transition-colors">
                <Phone className="w-4 h-4" />
                (873) 344-2040
              </a>
              <a href="https://wa.me/18733442040" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#003366]/70 hover:text-cyan-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
          <p className="text-center text-[#003366]/40 text-xs mt-6">
            &copy; {new Date().getFullYear()} KMI Home &amp; Car Care. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
