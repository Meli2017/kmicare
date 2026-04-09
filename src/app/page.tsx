import { db } from '@/lib/db';
import LandingPageClient from '@/components/LandingPageClient';

// Mise en cache Server-Side: La page est régénérée toutes les 60 secondes en arrière-plan.
// Cela signifie 0 requête serveur/BD supplémentaire si des centaines d'utilisateurs visitent dans cette minute !
export const revalidate = 60;

export default async function Page() {
  // Exécute toutes les requêtes SQL nécessaires en parallèle directement depuis le serveur
  const [dbBlockedDates, dbTestimonials, dbSocialLinks, dbDateAvailabilities, dbServiceAreas] = await Promise.all([
    db.blockedDate.findMany(),
    db.testimonial.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    db.socialLink.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    db.dateAvailability.findMany({ where: { isActive: true } }),
    db.serviceArea.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  ]);

  // Sérialisation propre et légère pour passer uniquement les données nécessaires au composant Client
  const blockedDates = dbBlockedDates.map(b => ({ id: b.id, date: b.date, reason: b.reason }));
  const testimonials = dbTestimonials.map(t => ({ id: t.id, customerName: t.customerName, message: t.message, rating: t.rating }));
  const socialLinks = dbSocialLinks.map(s => ({ id: s.id, platform: s.platform, url: s.url }));
  const dateAvailabilities = dbDateAvailabilities.map(d => ({ 
    id: d.id, date: d.date, startTime: d.startTime, endTime: d.endTime, isActive: d.isActive 
  }));
  const serviceAreas = dbServiceAreas.map(s => ({ id: s.id, name: s.name, isActive: s.isActive, order: s.order }));

  return (
    <LandingPageClient 
      initialBlockedDates={blockedDates}
      initialTestimonials={testimonials}
      initialSocialLinks={socialLinks}
      initialDateAvailabilities={dateAvailabilities}
      initialServiceAreas={serviceAreas}
    />
  );
}
