'use client';

import { Star, Quote, Verified, Shield, Heart } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Ils recommandent</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Découvrez ce que nos clients disent de nos services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 relative overflow-hidden group hover:-translate-y-2">
              <div className="absolute top-6 left-6 text-cyan-500/20">
                <Quote className="w-12 h-12" />
              </div>
              <div className="relative z-10 pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg italic">&quot;{testimonial.message}&quot;</p>
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
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-tl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

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
  );
}
