import { Metadata } from "next";
import LikeProduitContent from '@/components/likeProduit/LikeProduitContent';
import HomeHeader from "@/components/home/HomeHeader";

// Fonction utilitaire pour construire les URLs complètes du site
function getFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

// Fonction utilitaire pour construire l'URL de l'image
function getImageUrl(imageUrl?: string) {
  if (!imageUrl) return getFullUrl('/LogoText.png');
  
  // Si l'image commence par http/https, c'est déjà une URL complète
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Sinon, construire l'URL avec le backend
  return `${process.env.NEXT_PUBLIC_Backend_Url || 'http://localhost:3001'}/uploads/${imageUrl}`;
}

// Métadonnées SEO optimisées pour la page des favoris
export const metadata: Metadata = {
  title: 'Mes Favoris - IhamBaobab Marketplace Niger',
  description: 'Gérez et retrouvez facilement tous vos produits favoris sur IhamBaobab. Sauvegardez vos articles préférés pour un achat ultérieur. Marketplace N°1 au Niger avec livraison rapide à Niamey.',
  
  keywords: [
    'favoris IhamBaobab',
    'mes favoris',
    'liste de souhaits Niger',
    'wishlist marketplace',
    'produits sauvegardés',
    'favoris e-commerce Niger',
    'IhamBaobab favoris',
    'shopping Niger',
    'marketplace Niamey',
    'achats en ligne Niger'
  ].join(', '),
  
  // Open Graph pour les réseaux sociaux
  openGraph: {
    title: 'Mes Favoris - IhamBaobab',
    description: 'Retrouvez tous vos produits favoris sur IhamBaobab, le marketplace N°1 au Niger. Gérez votre liste de souhaits facilement.',
    url: getFullUrl('/like-produit'),
    siteName: 'IhamBaobab',
    images: [
      {
        url: getFullUrl('/LogoText.png'),
        width: 1200,
        height: 630,
        alt: 'IhamBaobab - Mes Favoris Marketplace Niger',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Mes Favoris - IhamBaobab Marketplace',
    description: 'Gérez vos produits favoris sur le marketplace N°1 au Niger. Livraison rapide à Niamey.',
    images: [getFullUrl('/LogoText.png')],
    creator: '@IhamBaobab',
    site: '@IhamBaobab'
  },

  // Balises supplémentaires pour le SEO
  other: {
    'application-name': 'IhamBaobab',
    'apple-mobile-web-app-title': 'IhamBaobab Favoris',
    'msapplication-TileColor': '#30A08B',
    'theme-color': '#30A08B',
  },

  // Configuration des robots
  robots: {
    index: false, // Page privée, pas d'indexation
    follow: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'standard',
      'max-snippet': -1,
    },
  },

  // URL canonique
  alternates: {
    canonical: getFullUrl('/like-produit'),
  },

  // Informations sur l'auteur et l'éditeur
  authors: [{ name: 'IhamBaobab Team' }],
  publisher: 'IhamBaobab Marketplace',
  
  // Catégorie de contenu
  category: 'E-commerce',
  
  // Classification du contenu
  classification: 'Business'
};

// Page principale des favoris
export default function LikeProduitPage() {
  return (
    <>
      {/* Données structurées JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Mes Favoris - IhamBaobab",
            "description": "Page de gestion des produits favoris sur IhamBaobab marketplace",
            "url": getFullUrl('/like-produit'),
            "inLanguage": "fr-FR",
            "isPartOf": {
              "@type": "WebSite",
              "name": "IhamBaobab",
              "url": getFullUrl('/'),
              "description": "Marketplace N°1 au Niger - Achat et vente en ligne",
              "publisher": {
                "@type": "Organization",
                "name": "IhamBaobab",
                "url": getFullUrl('/'),
                "logo": {
                  "@type": "ImageObject",
                  "url": getFullUrl('/LogoText.png')
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "NE",
                  "addressLocality": "Niamey"
                }
              }
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "Liste des favoris utilisateur",
              "description": "Collection personnalisée de produits favoris de l'utilisateur"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Accueil",
                  "item": getFullUrl('/')
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Mon Compte",
                  "item": getFullUrl('/profile')
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Mes Favoris",
                  "item": getFullUrl('/like-produit')
                }
              ]
            },
            "potentialAction": [
              {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": getFullUrl('/search?q={search_term_string}')
                },
                "query-input": "required name=search_term_string"
              },
              {
                "@type": "ViewAction",
                "name": "Voir les favoris",
                "target": getFullUrl('/like-produit')
              }
            ]
          }),
        }}
      />
      
      {/* Composant principal */}
      <HomeHeader/>
      <LikeProduitContent />
    </>
  );
}