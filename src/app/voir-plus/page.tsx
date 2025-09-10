// Composant principal avec "use client"
import VoirPlusPageContent from '@/components/voir-plus/VoirPlusPageContent';
import { Metadata } from 'next';

// Configuration SEO pour la page Voir Plus
export const metadata: Metadata = {
  title: "Toutes les Catégories - IhamBaobab | Catalogue Complet des Produits",
  description: "Découvrez toutes les catégories de produits disponibles sur IhamBaobab. Naviguez facilement parmi notre large gamme de produits locaux et artisanaux du Niger.",
  keywords: "catégories, produits Niger, artisanat local, IhamBaobab, catalogue produits, shopping Niger, Niamey",
  openGraph: {
    title: "Toutes les Catégories - IhamBaobab",
    description: "Explorez notre catalogue complet de produits locaux et artisanaux",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/voir-plus`,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Catégories IhamBaobab",
      },
    ],
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/voir-plus`,
  },
};

export default function VoirPlusPage() {
  return <VoirPlusPageContent />;
}
