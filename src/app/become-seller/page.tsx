"use client";

import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import {
  Store,
  ShoppingCart,
  DollarSign,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";

const becomeSellerSEOConfig = {
  title: "Devenez Vendeur sur IhamBaobab - Rejoignez Notre Marketplace | Niger",
  description: "Rejoignez la marketplace IhamBaobab et développez votre business au Niger. Accès à un large marché, revenus supplémentaires, support communautaire. Inscription simple et rapide.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/become-seller` : "/become-seller",
  openGraph: {
    title: "Devenez Vendeur sur IhamBaobab - Rejoignez Notre Marketplace",
    description: "Rejoignez la marketplace IhamBaobab et développez votre business au Niger",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/become-seller` : "/become-seller",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Devenez Vendeur IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "devenir vendeur Niger, marketplace Niger, vendre en ligne Niger, e-commerce Niger, business en ligne, IhamBaobab vendeur",
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

export default function BecomeSellerPage() {
  const [isClient, setIsClient] = useState(false);

  const colors = {
    teal: "#30A08B",
    brown: "#B2905F",
    darkBrown: "#B17236",
    lightTeal: "#E6F2EF",
  };

  useEffect(() => {
    setIsClient(true);
    window.scrollTo(0, 0);
  }, []);

  const handleCartChange = () => {
    // Redux gère automatiquement le panier
  };

  const sellerBenefits = [
    {
      icon: ShoppingCart,
      title: "Accès à un Large Marché",
      description: "Touchez des clients dans toute l'Afrique de l'Ouest",
    },
    {
      icon: DollarSign,
      title: "Revenus Supplémentaires",
      description: "Monétisez vos produits avec des commissions attractives",
    },
    {
      icon: Users,
      title: "Support Communautaire",
      description: "Accompagnement et formation continue",
    },
  ];

  const sellerRequirements = [
    "Produits de qualité",
    "Capacité de livraison",
    "Documentation professionnelle",
    "Engagement envers la satisfaction client",
  ];

  const handleSellerPortal = () => {
    // Redirection vers le portail des vendeurs
    window.location.href = "https://habou227-seller.onrender.com";
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...becomeSellerSEOConfig} />
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
      <NextSeo {...becomeSellerSEOConfig} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Programme Vendeur IhamBaobab",
              "description": "Rejoignez notre marketplace et développez votre business en ligne au Niger",
              "provider": {
                "@type": "Organization",
                "name": "IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL || ""
              },
              "areaServed": {
                "@type": "Country",
                "name": "Niger"
              },
              "offers": {
                "@type": "Offer",
                "description": "Accès gratuit à la marketplace pour les vendeurs qualifiés"
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
                <span className="text-[#30A08B] font-medium">Devenir Vendeur</span>
              </li>
            </ol>
          </div>
        </nav>

        <main role="main"
          className="min-h-screen p-8"
          style={{ backgroundColor: colors.lightTeal }}
        >
          <div className="container mx-auto">
            <h1
              className="text-4xl font-bold mb-8 text-center"
              style={{ color: colors.darkBrown }}
            >
              Devenez Vendeur
            </h1>

            {/* Avantages Vendeurs */}
            <div
              className="bg-white rounded-xl p-8 mb-8"
              style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
            >
              <h2
                className="text-2xl font-bold mb-6 text-center"
                style={{ color: colors.teal }}
              >
                <Store className="inline-block mr-2" />
                Pourquoi Devenir Vendeur
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {sellerBenefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <benefit.icon
                      size={48}
                      className="mx-auto mb-4"
                      color={colors.teal}
                    />
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ color: colors.darkBrown }}
                    >
                      {benefit.title}
                    </h3>
                    <p style={{ color: colors.brown }}>{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Critères de Sélection */}
            <div
              className="bg-white rounded-xl p-8 mb-8"
              style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
            >
              <h2
                className="text-2xl font-bold mb-6 text-center"
                style={{ color: colors.teal }}
              >
                Critères Requis
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sellerRequirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: colors.lightTeal,
                      color: colors.darkBrown,
                    }}
                  >
                    {requirement}
                  </div>
                ))}
              </div>
            </div>

            {/* Portail Vendeurs */}
            <div
              className="bg-white rounded-xl p-8 text-center w-full"
              style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: colors.darkBrown }}
              >
                Commencez Votre Aventure
              </h2>
              <div className="flex justify-center items-center">
                <Award size={48} className="mr-4" color={colors.teal} />
                <button
                  onClick={handleSellerPortal}
                  className="flex items-center px-6 py-3 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundColor: colors.teal,
                  }}
                >
                  Accéder au Portail Vendeurs
                  <ArrowRight className="ml-2" />
                </button>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Processus simple :</strong>
                </p>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Créez votre compte vendeur</li>
                  <li>Soumettez vos documents</li>
                  <li>Validation par notre équipe (24-48h)</li>
                  <li>Formation et accompagnement</li>
                  <li>Commencez à vendre !</li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}