import React from "react";
import NouveauterPage from "@/components/nouveauProduit/NouveauterPage";
import HomeFooter from "@/components/home/HomeFooter";
import { Metadata } from "next";

// Métadonnées optimisées pour le SEO
export const metadata: Metadata = {
  title: "✨ Nouveaux Produits - Dernières Tendances & Nouveautés | IhamBaobab",
  description: "Découvrez nos tout nouveaux produits ! Les dernières tendances en mode, électronique, beauté et accessoires. Restez à la pointe avec nos nouveautés exclusives. Livraison gratuite dès 50000 F.",
  keywords: [
    "nouveaux produits",
    "nouveautés",
    "dernières tendances",
    "nouvelles collections",
    "produits récents",
    "innovations",
    "IhamBaobab",
    "mode nouvelle collection",
    "électronique récente",
    "beauté nouveauté",
    "accessoires tendance",
    "shopping en ligne",
    "livraison gratuite",
    "produits exclusifs",
    "derniers arrivages"
  ],
  openGraph: {
    title: "✨ Nouveaux Produits - Dernières Tendances | IhamBaobab",
    description: "Explorez nos tout nouveaux produits et restez à la pointe des tendances ! Nouvelles collections exclusives en mode, électronique, beauté et plus encore.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Nouveaux Produits IhamBaobab - Dernières Tendances",
      },
    ],
    type: "website",
    locale: "fr_SN",
    siteName: "IhamBaobab",
  },
  twitter: {
    card: "summary_large_image",
    title: "✨ Nouveaux Produits - Dernières Tendances | IhamBaobab",
    description: "Découvrez nos tout nouveaux produits ! Les dernières tendances exclusives vous attendent.",
    images: ["/logo.png"],
    creator: "@ihambaobab",
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
    canonical: "/nouveaux-produits",
  },
  other: {
    "price:currency": "XOF",
    "product:availability": "in stock",
    "product:condition": "new",
    "og:updated_time": new Date().toISOString(),
  },
  category: "shopping",
  classification: "ecommerce",
};

export default function NouveauxProduitsPage() {
  return (
    <>
      {/* Schema.org structured data pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Nouveaux Produits - IhamBaobab",
            "description": "Découvrez nos tout nouveaux produits et les dernières tendances exclusives",
            "url": "https://ihambaobab.com/nouveaux",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Nouveaux Produits",
              "description": "Liste des produits récemment ajoutés sur IhamBaobab",
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
                  "name": "Nouveaux Produits",
                  "item": "https://ihambaobab.com/nouveaux"
                }
              ]
            },
            "potentialAction": [
              {
                "@type": "SearchAction",
                "target": "https://ihambaobab.com/nouveaux?search={search_term}",
                "query-input": "required name=search_term"
              },
              {
                "@type": "ViewAction",
                "target": "https://ihambaobab.com/nouveaux",
                "name": "Voir tous les nouveaux produits"
              }
            ],
            "provider": {
              "@type": "Organization",
              "name": "IhamBaobab",
              "url": "https://ihambaobab.com",
              "logo": "https://ihambaobab.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["French"]
              },
              "sameAs": [
                "https://facebook.com/ihambaobab",
                "https://instagram.com/ihambaobab",
                "https://twitter.com/ihambaobab"
              ]
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "consumers interested in new products and latest trends"
            },
            "about": [
              {
                "@type": "Thing",
                "name": "Nouveaux produits",
                "description": "Produits récemment ajoutés"
              },
              {
                "@type": "Thing",
                "name": "Tendances mode",
                "description": "Dernières tendances vestimentaires"
              },
              {
                "@type": "Thing",
                "name": "Nouveautés électronique",
                "description": "Derniers gadgets et appareils électroniques"
              }
            ],
            "specialty": "New product discovery and trend shopping",
            "datePublished": new Date().toISOString(),
            "dateModified": new Date().toISOString(),
            "inLanguage": "fr-FR",
            "isAccessibleForFree": true
          }),
        }}
      />
      
      {/* Schema.org pour la page produit e-commerce */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Nouveaux Produits",
            "description": "Collection des nouveaux produits sur IhamBaobab",
            "url": "https://ihambaobab.com/nouveaux",
            "isPartOf": {
              "@type": "WebSite",
              "name": "IhamBaobab",
              "url": "https://ihambaobab.com"
            },
            "hasPart": [
              {
                "@type": "WebPageElement",
                "name": "Filtre de recherche",
                "description": "Outil pour filtrer les nouveaux produits"
              },
              {
                "@type": "WebPageElement", 
                "name": "Grille de produits",
                "description": "Affichage des nouveaux produits disponibles"
              }
            ]
          }),
        }}
      />

      {/* Meta tags additionnels pour les réseaux sociaux */}
      <meta property="product:retailer_item_id" content="nouveaux-produits" />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="new" />
      <meta property="business:contact_data:street_address" content="Dakar, Sénégal" />
      <meta property="business:contact_data:locality" content="Dakar" />
      <meta property="business:contact_data:region" content="Dakar" />
      <meta property="business:contact_data:country_name" content="Sénégal" />
      
      {/* Composant principal */}
      <main>
        <NouveauterPage />
        <HomeFooter />
      </main>
    </>
  );
}