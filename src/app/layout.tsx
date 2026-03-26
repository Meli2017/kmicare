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
  title: "KMI Home & Car Care | Nettoyage à Domicile Professionnel",
  description: "Services de nettoyage professionnel à domicile pour maisons, appartements et véhicules. Lavage auto, nettoyage avant/après location, après chantier. Service 7j/7 à Montréal.",
  keywords: ["nettoyage", "ménager", "lavage auto", "domicile", "Montréal", "KMI", "Home Care", "Car Care", "nettoyage professionnel"],
  authors: [{ name: "KMI Home & Car Care" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "KMI Home & Car Care",
    description: "Nettoyage professionnel à domicile - Maison & Voiture",
    type: "website",
    locale: "fr_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
