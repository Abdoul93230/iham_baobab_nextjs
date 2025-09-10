"use client";

import React from "react";
import VoirPlus from "./VoirPlus";
import HomeHeader from "@/components/home/HomeHeader";
import { NextSeo } from "next-seo";
import Head from "next/head";

export default function VoirPlusPageContent() {
  // Fonction pour la gestion du panier (si nécessaire)
  const handleCartChange = () => {
    // Logique de gestion du panier via Redux ou context
  };

  return (
    <>
      <NextSeo
        additionalMetaTags={[
          {
            name: "geo.region",
            content: "NE-8",
          },
          {
            name: "geo.placename", 
            content: "Niamey, Niger",
          },
        ]}
        additionalLinkTags={[
          {
            rel: "preload",
            href: "/logo.png",
            as: "image",
          },
        ]}
      />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Schema.org données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Catégories de Produits IhamBaobab",
              "description": "Collection complète des catégories de produits disponibles sur IhamBaobab",
              "url": `${process.env.NEXT_PUBLIC_SITE_URL}/voir-plus`,
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "/",
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Accueil",
                    "item": process.env.NEXT_PUBLIC_SITE_URL || "/"
                  },
                  {
                    "@type": "ListItem", 
                    "position": 2,
                    "name": "Catégories"
                  }
                ]
              }
            }),
          }}
        />
      </Head>

      <div itemScope itemType="https://schema.org/CollectionPage">
        <header role="banner">
          <HomeHeader chg={handleCartChange} />
        </header>

        <main 
          role="main" 
          aria-label="Toutes les catégories de produits"
          itemProp="mainContentOfPage"
        >
          <VoirPlus />
        </main>
      </div>
    </>
  );
}