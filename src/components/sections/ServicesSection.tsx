'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Star } from 'lucide-react';
import { servicesCategories, packsData } from '@/lib/data';

interface ServicesSectionProps {
  onServiceClick: (categoryKey: string, serviceName: string) => void;
}

export default function ServicesSection({ onServiceClick }: ServicesSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-white" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Nos Services</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Cliquez sur un service pour prendre rendez-vous</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {servicesCategories.map((category) => {
            const IconComponent = category.icon;
            if (category.title === "Nos Packs") return null;
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
                      onClick={() => onServiceClick(category.key, item.name)}
                      className="flex items-start gap-3 w-full text-left p-3 rounded-xl hover:bg-white/70 transition-all duration-300 cursor-pointer group/item"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                      <div>
                        <p className="font-medium text-gray-800 group-hover/item:text-cyan-700 transition-colors">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </button>
                  ))}
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

        {/* Packs */}
        <div className="mt-20" id="packs">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Nos Packs Avantageux</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto p-10">
            {packsData.map((pack, index) => {
              const IconComponent = pack.icon;
              return (
                <Card
                  key={index}
                  className={`relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${pack.popular ? 'border-2 border-green-500 shadow-xl scale-105' : 'border border-gray-200'}`}
                  onClick={() => onServiceClick('', pack.name)}
                >
                  {pack.popular && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">POPULAIRE</div>
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
  );
}
