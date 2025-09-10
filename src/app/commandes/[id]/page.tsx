"use client";

import CommandeSuivi from "@/components/orders/CommandeSuivi";
import HomeHeader from "@/components/home/HomeHeader";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";

// Configuration SEO statique
const suiviCommandeSEOConfig = {
  title: "Suivi de Commande - IhamBaobab | Détails et Statut",
  description: "Suivez en détail votre commande IhamBaobab. Consultez le statut de livraison, les informations de paiement et communiquez avec le livreur.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
  openGraph: {
    title: "Suivi de Commande - IhamBaobab",
    description: "Suivi détaillé de votre commande IhamBaobab",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Suivi de commande IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "suivi commande, détail commande, statut livraison, IhamBaobab, Niger, tracking",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "noindex, nofollow", // Page privée
    },
  ],
};

export default function SuiviCommand() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fonction vide pour compatibilité
  const handleCartChange = () => {
    // Géré par Redux ou context
  };

  // SEO dynamique
  const dynamicSEO = {
    ...suiviCommandeSEOConfig,
    title: orderId
      ? `Commande #${orderId.slice(0, 7)} - Suivi IhamBaobab`
      : suiviCommandeSEOConfig.title,
    canonical: process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes/${orderId}` 
      : `/commandes/${orderId}`,
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...suiviCommandeSEOConfig} />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails de la commande...</p>
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
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Schema.org pour les données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Suivi de Commande",
              "description": "Page de suivi détaillé d'une commande IhamBaobab",
              "url": process.env.NEXT_PUBLIC_SITE_URL 
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes/${orderId}` 
                : `/commandes/${orderId}`,
              "inLanguage": "fr-FR",
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
                    "name": "Mes Commandes",
                    "item": process.env.NEXT_PUBLIC_SITE_URL 
                      ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes`
                      : "/commandes"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": `Commande #${orderId?.slice(0, 7) || 'N/A'}`
                  }
                ]
              }
            }),
          }}
        />
      </Head>

      {/* Contenu principal */}
      <div itemScope itemType="https://schema.org/WebPage">
        <header role="banner">
          {/* <HomeHeader acces={acces} paniernbr={paniernbr} /> */}
          <HomeHeader/>
        </header>

        <main 
          role="main" 
          aria-label="Contenu principal du suivi de commande"
          itemProp="mainContentOfPage"
        >
          <CommandeSuivi />
        </main>
      </div>
    </ProtectedRoute>
  );
}