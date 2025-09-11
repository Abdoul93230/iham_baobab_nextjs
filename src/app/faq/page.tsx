"use client";

import FrequementQuestion from "@/components/faq/FrequementQuestion";
import HomeHeader from "@/components/home/HomeHeader";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";

const faqSEOConfig = {
  title: "FAQ - Questions Fréquentes | IhamBaobab Niger",
  description: "Trouvez rapidement des réponses aux questions les plus fréquentes sur IhamBaobab : paiement, livraison, produits artisanaux, commandes et plus encore.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/faq` : "/faq",
  openGraph: {
    title: "FAQ - Questions Fréquentes | IhamBaobab",
    description: "Réponses aux questions fréquentes sur IhamBaobab",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/faq` : "/faq",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "FAQ IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "FAQ, questions fréquentes, aide, support, IhamBaobab, Niger, artisanat, paiement, livraison",
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

export default function FAQPageWrapper() {
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
        <NextSeo {...faqSEOConfig} />
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
      <NextSeo {...faqSEOConfig} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "name": "Questions Fréquemment Posées - IhamBaobab",
              "description": "FAQ complète pour IhamBaobab Niger",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/faq` : "/faq",
              "inLanguage": "fr-FR",
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
                <span className="text-[#30A08B] font-medium">FAQ</span>
              </li>
            </ol>
          </div>
        </nav>

        <main role="main">
          <FrequementQuestion />
        </main>
      </div>
    </>
  );
}