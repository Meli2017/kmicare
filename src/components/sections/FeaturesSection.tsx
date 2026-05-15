'use client';

import { Clock, Shield, CheckCircle, Heart } from 'lucide-react';

const features = [
  { icon: Clock, title: "Disponible 7j/7", desc: "Intervention rapide" },
  { icon: Shield, title: "Produits sécuritaires", desc: "Écologiques et efficaces" },
  { icon: CheckCircle, title: "Travail professionnel", desc: "Résultat impeccable" },
  { icon: Heart, title: "Prix compétitifs", desc: "Forfaits avantageux" },
];

export default function FeaturesSection() {
  return (
    <section className="p-10 py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
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
  );
}
