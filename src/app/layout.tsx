import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kmicare.ca'),
  title: {
    default: "KMI Home & Car Care | Nettoyage Professionnel à Domicile",
    template: "%s | KMI Home & Car Care",
  },
  description: "Services de nettoyage professionnel à domicile pour maisons, appartements et véhicules. Lavage auto, nettoyage avant/après location, après chantier. Réservation en ligne 7j/7.",
  keywords: ["nettoyage à domicile", "lavage auto", "nettoyage professionnel Montréal", "KMI Care", "Home Care", "Car Care", "ménage Montréal", "nettoyage voiture à domicile", "après chantier", "avant location"],
  authors: [{ name: "KMI Home & Car Care" }],
  creator: "KMI Home & Car Care",
  publisher: "KMI Home & Car Care",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: "KMI Home & Car Care | Nettoyage Professionnel",
    description: "Réservez en ligne votre nettoyage à domicile — maison, voiture, après chantier. Service professionnel, partout à Montréal.",
    type: "website",
    locale: "fr_CA",
    url: "https://kmicare.ca",
    siteName: "KMI Home & Car Care",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "KMI Home & Car Care Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "KMI Home & Car Care",
    description: "Nettoyage professionnel à domicile - Maison & Voiture",
    images: ["/favicon.png"],
  },
  alternates: {
    canonical: "https://kmicare.ca",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
