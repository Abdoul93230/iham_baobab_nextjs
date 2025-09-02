import { Metadata } from "next";
import { Suspense } from "react";
import PanierPageWrapper from "./PanierPageWrapper"
import PanierPageSkeleton from "./PanierPageSkeleton"

// Métadonnées SEO optimisées pour la page panier
export const metadata: Metadata = {
  title: "Mon Panier - IhamBaobab | Finalisez vos achats",
  description: "Consultez votre panier d'achats, gérez vos articles et procédez au paiement sécurisé. Livraison disponible partout en Afrique de l'Ouest.",
  keywords: [
    "panier",
    "achats",
    "e-commerce",
    "paiement sécurisé",
    "livraison",
    "Niger",
    "Afrique de l'Ouest",
    "IhamBaobab",
    "commande en ligne"
  ].join(", "),
  
  // Open Graph pour les réseaux sociaux
  openGraph: {
    title: "Mon Panier - IhamBaobab",
    description: "Finalisez vos achats sur IhamBaobab, la marketplace africaine de confiance",
    type: "website",
    siteName: "IhamBaobab",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "IhamBaobab - Votre panier d'achats"
      }
    ]
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Mon Panier - IhamBaobab",
    description: "Finalisez vos achats sur IhamBaobab, la marketplace africaine de confiance",
    images: ["/logo.png"]
  },

  // Robots et indexation
  robots: {
    index: false, // Le panier ne doit pas être indexé pour la confidentialité
    follow: true,
    noarchive: true,
    nosnippet: true
  },

  // Métadonnées techniques
  other: {
    "theme-color": "#30A08B",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no"
  }
};

// JSON-LD structuré pour le SEO (schema.org)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Panier d'achats",
  "description": "Page de panier pour finaliser vos achats sur IhamBaobab",
  "url": `${process.env.NEXT_PUBLIC_SITE_URL}/panier`,
  "mainEntity": {
    "@type": "ShoppingCart",
    "provider": {
      "@type": "Organization",
      "name": "IhamBaobab",
      "url": process.env.NEXT_PUBLIC_SITE_URL
    }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": process.env.NEXT_PUBLIC_SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Mon Panier"
      }
    ]
  }
};

export default function Panier() {
  return (
    <>
      {/* JSON-LD Schema.org pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Contenu avec Suspense pour le loading optimal */}
      <Suspense fallback={<PanierPageSkeleton />}>
        <PanierPageWrapper />
      </Suspense>
    </>
  );
}

// Configuration des performances et cache
export const dynamic = 'force-dynamic'; // Le panier change selon l'utilisateur
export const revalidate = 0; // Pas de cache pour les données personnelles