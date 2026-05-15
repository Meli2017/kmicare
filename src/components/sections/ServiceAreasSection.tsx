'use client';

import type { ServiceArea } from '@/lib/types';

interface ServiceAreasSectionProps {
  serviceAreas: ServiceArea[];
}

const fallbackCities = ['Montréal', 'Laval', 'Longueuil', 'Brossard', 'Dollard-des-Ormeaux', 'Pointe-Claire', 'Kirkland'];

export default function ServiceAreasSection({ serviceAreas }: ServiceAreasSectionProps) {
  return (
    <section className="py-12 from-slate-50 to-sky-50/60">
      <div className="container mx-auto px-4 text-center">
        <p className="text-[#003366] font-semibold text-lg mb-6">Zones de service principales :</p>
        <div className="flex flex-wrap justify-center gap-3">
          {serviceAreas.length > 0 ? (
            serviceAreas.map((area) => (
              <span key={area.id} className="px-5 py-2 bg-white border border-[#003366]/20 text-[#003366] rounded-full text-sm font-medium shadow-sm hover:shadow-md hover:border-[#003366]/40 transition-all duration-300 cursor-default">
                {area.name}
              </span>
            ))
          ) : (
            fallbackCities.map((city) => (
              <span key={city} className="px-5 py-2 bg-white border border-[#003366]/20 text-[#003366] rounded-full text-sm font-medium shadow-sm opacity-50 cursor-default">
                {city}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
