import React from "react";
import ProduitPromotion from "@/components/promotionProduit/ProduitPromotion";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { Metadata } from "next";

// Métadonnées pour la page des promotions
export const metadata: Metadata = {
  title: "🔥 Promotions Exceptionnelles - Jusqu'à 70% de réduction | IhamBaobab",
  description: "Découvrez nos meilleures offres et promotions exceptionnelles ! Profitez de réductions allant jusqu'à 70% sur une large sélection de produits de qualité : électronique, mode, beauté, maison et plus encore. Livraison gratuite dès 50000 F.",
  keywords: [
    "promotions",
    "réductions",
    "offres spéciales", 
    "soldes",
    "prix cassés",
    "bons plans",
    "IhamBaobab",
    "e-commerce",
    "shopping en ligne",
    "livraison gratuite",
    "électronique promotion",
    "mode promotion",
    "beauté promotion",
    "jusqu'à 70%"
  ],
  openGraph: {
    title: "🔥 Promotions Exceptionnelles - Jusqu'à 70% | IhamBaobab",
    description: "Ne ratez pas nos promotions exceptionnelles ! Des réductions allant jusqu'à 70% sur des milliers de produits de qualité. Livraison gratuite dès 50000 F.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Promotions IhamBaobab - Réductions exceptionnelles",
      },
    ],
    type: "website",
    locale: "fr_SN",
  },
  twitter: {
    card: "summary_large_image",
    title: "🔥 Promotions Exceptionnelles - Jusqu'à 70% | IhamBaobab",
    description: "Découvrez nos meilleures offres avec des réductions allant jusqu'à 70% ! Livraison gratuite dès 50000 F.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/promotion",
  },
  other: {
    "price:currency": "XOF",
    "product:availability": "in stock",
    "product:condition": "new",
  },
};

export default function PromotionPage() {
  const acces = true;
  return (
    <>
      {/* Schema.org structured data pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Promotions Exceptionnelles - IhamBaobab",
            "description": "Découvrez nos meilleures offres et promotions exceptionnelles avec des réductions allant jusqu'à 70%",
            "url": "https://ihambaobab.com/promotion",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Produits en Promotion",
              "description": "Liste des produits actuellement en promotion sur IhamBaobab",
              "numberOfItems": "variable"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Accueil",
                  "item": "https://ihambaobab.com"
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": "Promotions",
                  "item": "https://ihambaobab.com/promotion"
                }
              ]
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ihambaobab.com/promotion?search={search_term}",
              "query-input": "required name=search_term"
            },
            "provider": {
              "@type": "Organization",
              "name": "IhamBaobab",
              "url": "https://ihambaobab.com",
              "logo": "https://ihambaobab.com/logo.png"
            }
          }),
        }}
      />
      
      <HomeHeader />
      <ProduitPromotion acces={acces} />
      <HomeFooter />
    </>
  );
}