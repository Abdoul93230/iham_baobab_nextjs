import { Metadata } from 'next';
import LivraisonContent from '@/components/livraisonPage/LivraisonContent';

// Métadonnées SEO optimisées
export const metadata: Metadata = {
  title: 'Adresse de Livraison | Gérer vos informations - IhamBaobab',
  description: 'Gérez facilement votre adresse de livraison sur IhamBaobab. Modifiez vos informations personnelles, région, quartier et instructions de livraison en quelques clics.',
  keywords: [
    'adresse livraison',
    'IhamBaobab',
    'gérer adresse',
    'livraison domicile',
    'informations livraison',
    'modification adresse',
    'compte utilisateur',
    'e-commerce Niger',
    'livraison Niamey'
  ],
  authors: [{ name: 'IhamBaobab' }],
  creator: 'IhamBaobab',
  publisher: 'IhamBaobab',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'E-commerce',
  classification: 'Gestion de compte',
  
  // Open Graph pour les réseaux sociaux
  openGraph: {
    title: 'Adresse de Livraison - IhamBaobab',
    description: 'Gérez facilement votre adresse de livraison. Modifiez vos informations de contact et instructions de livraison.',
    url: 'https://votre-domaine.com/livraison',
    siteName: 'IhamBaobab',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/images/og-livraison.jpg', // À créer
        width: 1200,
        height: 630,
        alt: 'Gestion adresse de livraison IhamBaobab',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Adresse de Livraison - IhamBaobab',
    description: 'Gérez facilement votre adresse de livraison sur IhamBaobab',
    images: ['/images/twitter-livraison.jpg'], // À créer
    creator: '@IhamBaobab', // Votre handle Twitter
  },
  
  // Robots
  robots: {
    index: false, // Pages de compte utilisateur ne doivent pas être indexées
    follow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Autres métadonnées
  alternates: {
    canonical: 'https://votre-domaine.com/livraison',
  },
  
  verification: {
    google: 'votre-code-verification-google', // À remplacer
  },
  
  // Métadonnées pour l'application
  applicationName: 'IhamBaobab',
  referrer: 'origin-when-cross-origin',
  
  // Métadonnées Apple
  appleWebApp: {
    title: 'IhamBaobab - Livraison',
    statusBarStyle: 'default',
    capable: true,
  },
  
  // Autres
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

// Structure de données JSON-LD pour le SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Adresse de Livraison',
  description: 'Page de gestion des adresses de livraison pour les utilisateurs IhamBaobab',
  url: 'https://votre-domaine.com/livraison',
  isPartOf: {
    '@type': 'WebSite',
    name: 'IhamBaobab',
    url: 'https://votre-domaine.com',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://votre-domaine.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mon Compte',
        item: 'https://votre-domaine.com/compte',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Adresse de Livraison',
        item: 'https://votre-domaine.com/livraison',
      },
    ],
  },
  mainEntity: {
    '@type': 'Service',
    name: 'Gestion Adresse de Livraison',
    description: 'Service permettant aux utilisateurs de gérer leurs informations de livraison',
    provider: {
      '@type': 'Organization',
      name: 'IhamBaobab',
      url: 'https://votre-domaine.com',
    },
  },
};

export default function LivraisonPage() {
  return (
    <>
      {/* Script JSON-LD pour les données structurées */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LivraisonContent />
    </>
  );
}