import type { Testimonial } from './types';
import { Home, Car, Sparkles, Building, Wrench, SprayCan, Star, CheckCircle } from 'lucide-react';

export const servicesCategories = [
  {
    key: 'pack',
    title: "Nos Packs",
    icon: Sparkles,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    items: [
      { name: "Pack populaire", desc: "Maison + voiture" },
      { name: "Pack Déménagement", desc: "Nettoyage complet" },
      { name: "Pack Premium", desc: "Maison + voiture + canapé" },
    ],
    prices: [
      { size: "Pack populaire", price: "150 – 220 $" },
      { size: "Pack Déménagement", price: "180 – 300 $" },
      { size: "Pack Premium", price: "200 – 350 $" },
    ],
  },
  {
    key: 'residential',
    title: "Entretien ménager résidentiel",
    icon: Home,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    items: [
      { name: "Nettoyage complet", desc: "Salon, chambres, cuisine, salle de bain" },
      { name: "Dépoussiérage", desc: "Surfaces et meubles" },
      { name: "Lavage des sols", desc: "Tous types de revêtements" },
      { name: "Désinfection surfaces", desc: "Produits sécuritaires" },
      { name: "Nettoyage électroménagers", desc: "Intérieur et extérieur" },
    ],
    prices: [
      { size: "1 ½ – 2 ½", price: "80 – 120 $" },
      { size: "3 ½ – 4 ½", price: "100 – 150 $" },
      { size: "5 ½ et +", price: "130 – 200 $" },
      { size: "Nettoyage profond", price: "+50 à 100 $" },
    ],
  },
  {
    key: 'rental',
    title: "Nettoyage avant / après location",
    icon: Building,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    items: [
      { name: "Remise à neuf", desc: "Avant entrée locataire" },
      { name: "Nettoyage après départ", desc: "Remise en état complète" },
      { name: "Désinfection complète", desc: "Normes sanitaires" },
      { name: "Cuisine + salle de bain", desc: "Nettoyage en profondeur" },
    ],
    prices: [
      { size: "Petit logement", price: "120 – 180 $" },
      { size: "Moyen", price: "150 – 250 $" },
      { size: "Grande maison", price: "200 – 350 $" },
    ],
  },
  {
    key: 'construction',
    title: "Nettoyage après chantier",
    icon: Wrench,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    items: [
      { name: "Enlèvement poussière lourde", desc: "Toutes surfaces" },
      { name: "Traces de peinture/ciment", desc: "Nettoyage spécialisé" },
      { name: "Lavage vitres", desc: "Intérieur et extérieur" },
      { name: "Sols et surfaces", desc: "Remise en état" },
    ],
    prices: [
      { size: "Petit chantier", price: "150 – 250 $" },
      { size: "Moyen", price: "250 – 400 $" },
      { size: "Grand chantier", price: "400 $ +" },
    ],
  },
  {
    key: 'carWash',
    title: "Lavage automobile à domicile",
    icon: Car,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    items: [
      { name: "Lavage extérieur complet", desc: "Carrosserie, jantes" },
      { name: "Nettoyage intérieur", desc: "Aspiration, sièges, tapis" },
      { name: "Nettoyage tableau de bord", desc: "Détails et finitions" },
      { name: "Désodorisation", desc: "Traitement anti-odeurs" },
    ],
    prices: [
      { size: "Lavage extérieur", price: "30 – 50 $" },
      { size: "Nettoyage intérieur", price: "50 – 80 $" },
      { size: "Complet (int + ext)", price: "80 – 120 $" },
    ],
  },
  {
    key: 'carPremium',
    title: "Service « Voiture comme neuve »",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    items: [
      { name: "Shampoing sièges", desc: "Nettoyage en profondeur" },
      { name: "Traitement des taches", desc: "Élimination complète" },
      { name: "Rénovation plastique intérieur", desc: "Redonne l'éclat" },
      { name: "Finition brillante extérieure", desc: "Protection et brillance" },
    ],
    prices: [
      { size: "Shampoing sièges", price: "80 – 120 $" },
      { size: "Traitement complet", price: "120 – 180 $" },
    ],
  },
  {
    key: 'additional',
    title: "Services supplémentaires",
    icon: SprayCan,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    items: [
      { name: "Nettoyage vitres", desc: "Toutes dimensions" },
      { name: "Nettoyage tapis et moquettes", desc: "Shampoing professionnel" },
      { name: "Nettoyage canapé", desc: "Tous types de tissus" },
      { name: "Désinfection anti-bactérien", desc: "Traitement complet" },
    ],
    prices: [
      { size: "Nettoyage canapé", price: "60 – 120 $" },
      { size: "Nettoyage tapis", price: "40 – 100 $" },
      { size: "Vitres", price: "50 – 150 $" },
    ],
  },
];

export const packsData = [
  { key: 'pack', name: "Pack populaire", description: "Maison + voiture", price: "150 – 220 $", popular: true, icon: Star },
  { key: 'pack', name: "Pack Déménagement", description: "Nettoyage complet", price: "180 – 300 $", popular: false, icon: Building },
  { key: 'pack', name: "Pack Premium", description: "Maison + voiture + canapé", price: "250 – 400 $", popular: false, icon: Sparkles },
];

export const defaultTestimonials: Testimonial[] = [
  { id: 'default-1', customerName: "Sarah M.", message: "Rapide et soigné. Mon appartement n'a jamais été aussi propre ! Je recommande à 100%.", rating: 5 },
  { id: 'default-2', customerName: "Karim B.", message: "Ma voiture est comme neuve. Service impeccable et très professionnel. Équipe ponctuelle et efficace.", rating: 5 },
  { id: 'default-3', customerName: "Léa D.", message: "Enfin un service fiable le samedi. Je recommande à 100% ! Le rapport qualité-prix est excellent.", rating: 5 },
];
