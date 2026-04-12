'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react';

interface ReviewFormClientProps {
  token: string;
  defaultName: string;
}

export default function ReviewFormClient({ token, defaultName }: ReviewFormClientProps) {
  const [customerName, setCustomerName] = useState(defaultName);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Veuillez entrer votre nom.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Votre témoignage doit contenir au moins 10 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, customerName: customerName.trim(), message: message.trim(), rating }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Impossible de soumettre. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Merci {customerName.split(' ')[0]} ! 🎉</h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
          Votre témoignage a bien été reçu. Il sera publié sur notre site après validation par notre équipe.
        </p>
        <div className="mt-8 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-8 h-8 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <a
          href="/"
          className="inline-block mt-8 px-8 py-3 bg-[#003366] text-white rounded-full font-semibold hover:bg-[#0055aa] transition-colors duration-200"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating stars */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          ⭐ Votre note <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoveredRating(s)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform duration-100 hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-10 h-10 transition-colors duration-150 ${
                  s <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-3 self-center text-sm text-gray-500 font-medium">
            {rating === 1 ? 'Décevant' :
             rating === 2 ? 'Passable' :
             rating === 3 ? 'Bien' :
             rating === 4 ? 'Très bien' : 'Excellent !'}
          </span>
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2">
          👤 Votre nom <span className="text-red-500">*</span>
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Prénom Nom"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
          💬 Votre témoignage <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre expérience avec KMI Home & Car Care..."
          rows={5}
          required
          minLength={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-colors resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {message.length} caractère{message.length !== 1 ? 's' : ''} (min. 10)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !customerName.trim() || message.trim().length < 10}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#003366] hover:bg-[#0055aa] text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Soumettre mon témoignage
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Votre témoignage sera visible sur le site après validation par notre équipe.
      </p>
    </form>
  );
}
