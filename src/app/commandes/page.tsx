"use client";

import CommandePage from "@/components/orders/CommandePage";
import HomeHeader from "@/components/home/HomeHeader";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Configuration SEO statique
const commandesSEOConfig = {
  title: "Mes Commandes - IhamBaobab | Suivi de Commandes",
  description: "Consultez et suivez toutes vos commandes IhamBaobab. Commandes en cours, reçues et annulées. Suivi en temps réel de vos achats au Niger.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
  openGraph: {
    title: "Mes Commandes - IhamBaobab",
    description: "Suivi de vos commandes IhamBaobab - En cours, reçues et annulées",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Page de commandes IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "commandes, suivi commande, historique commandes, IhamBaobab, Niger, Niamey, livraison, statut commande",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "noindex, nofollow", // Page privée
    },
    {
      name: "geo.region",
      content: "NE-8",
    },
    {
      name: "geo.placename",
      content: "Niamey, Niger",
    },
  ],
  additionalLinkTags: [
    {
      rel: "preload",
      href: "/icon_user.png",
      as: "image",
    },
    {
      rel: "dns-prefetch",
      href: process.env.NEXT_PUBLIC_BACKEND_URL || "https://secoure.onrender.com",
    },
  ],
};

export default function CommandeSuivi() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fonction vide pour compatibilité
  const handleCartChange = () => {
    // Géré par Redux ou context
  };

  // SEO dynamique basé sur l'utilisateur connecté
  const dynamicSEO = {
    ...commandesSEOConfig,
    title: user?.name
      ? `Commandes de ${user.name} - IhamBaobab`
      : commandesSEOConfig.title,
    description: user?.name
      ? `Consultez et suivez toutes les commandes de ${user.name} sur IhamBaobab.`
      : commandesSEOConfig.description,
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...commandesSEOConfig} />
        <Head>
          <link rel="preload" href="/icon_user.png" as="image" />
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BACKEND_URL || "https://secoure.onrender.com"} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos commandes...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      {/* SEO Configuration */}
      <NextSeo {...dynamicSEO} />

      {/* Head additionnels */}
      <Head>
        {/* Métadonnées spécifiques aux commandes */}
        <meta name="theme-color" content="#30A08B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* En-têtes HTTP de sécurité */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Schema.org pour les données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Page de Commandes",
              "description": "Page de suivi des commandes utilisateur IhamBaobab",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "/",
                "description": "Plateforme IhamBaobab au Niger"
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
                    "name": "Mes Commandes"
                  }
                ]
              }
            }),
          }}
        />
      </Head>

      {/* Contenu principal avec structure sémantique */}
      <div itemScope itemType="https://schema.org/WebPage">
        <header role="banner">
          <HomeHeader/>
          {/* <HomeHeader acces={acces} paniernbr={paniernbr} /> */}
        </header>

        <main 
          role="main" 
          aria-label="Contenu principal des commandes"
          itemProp="mainContentOfPage"
        >
          <CommandePage />
        </main>
      </div>
    </ProtectedRoute>
  );
}