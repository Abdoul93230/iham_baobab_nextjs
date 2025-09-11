"use client";

import ServicePage from "@/components/centre-aide/ServicePage";
import HomeHeader from "@/components/home/HomeHeader";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";

const centreDaideSEOConfig = {
  title: "Centre d'Aide - IhamBaobab | Support Client et FAQ",
  description: "Trouvez rapidement des réponses à toutes vos questions sur IhamBaobab. Support client 24/7, FAQ détaillée, guides d'utilisation et contact direct pour une assistance personnalisée.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/centre-aide` : "/centre-aide",
  openGraph: {
    title: "Centre d'Aide - IhamBaobab",
    description: "Support client et assistance pour tous vos besoins IhamBaobab",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/centre-aide` : "/centre-aide",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Centre d'aide IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "support client, aide, FAQ, assistance, centre d'aide, IhamBaobab, Niger, commandes, livraison, paiement",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "index, follow",
    },
  ],
};

export default function CentreAidePageWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCartChange = () => {
    // Redux gère automatiquement le panier
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...centreDaideSEOConfig} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NextSeo {...centreDaideSEOConfig} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Centre d'Aide IhamBaobab",
              "description": "Centre d'assistance et FAQ pour IhamBaobab",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/centre-aide` : "/centre-aide",
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
                    "name": "Centre d'Aide"
                  }
                ]
              }
            }),
          }}
        />
      </Head>

      <div>
        <header role="banner">
          <HomeHeader chg={handleCartChange} />
        </header>

        <nav aria-label="Fil d'Ariane" className="bg-gray-50 py-2 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-[#30A08B] transition-colors duration-200"
                >
                  Accueil
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="mx-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[#30A08B] font-medium">Centre d&apos;Aide</span>
              </li>
            </ol>
          </div>
        </nav>

        <main role="main">
          <ServicePage />
        </main>
      </div>
    </>
  );
}