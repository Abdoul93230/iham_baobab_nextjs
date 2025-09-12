"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import { AlertCircle, Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import OrderConfirmation from "@/components/panier/OrderConfirmation";
import HomeHeader from "@/components/home/HomeHeader";
import LoadingIndicator from "@/components/LoadingIndicator";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// Configuration SEO
const orderConfirmationSEOConfig = {
  title: "Confirmation de Commande - IhamBaobab | Finalisation de Votre Achat",
  description: "Finalisez votre commande sur IhamBaobab. Sélectionnez votre mode de paiement, confirmez vos informations de livraison et validez votre achat en toute sécurité au Niger.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation` : "/order-confirmation",
  noindex: true, // Page privée
  nofollow: true,
  openGraph: {
    title: "Confirmation de Commande - IhamBaobab",
    description: "Finalisez votre commande en toute sécurité avec IhamBaobab",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation` : "/order-confirmation",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Confirmation de commande IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "commande, paiement, livraison, e-commerce Niger, confirmation achat, paiement sécurisé, Mobile Money, carte bancaire, livraison Niamey",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "noindex, nofollow", // Page de commande privée
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
      href: "/logo.png",
      as: "image",
    },
    {
      rel: "dns-prefetch",
      href: process.env.NEXT_PUBLIC_Backend_Url || "https://ihambackend.onrender.com",
    },
  ],
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les données de commande
  const [total, setTotal] = useState(0);
  const [codeP, setCodeP] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Charger les données de commande depuis localStorage
  const loadOrderData = useCallback(() => {
    try {
      // Vérifier si on vient du panier
      const fromCart = searchParams.get("fromCart");
      
      if (!fromCart) {
        // Si on n'arrive pas du panier, vérifier s'il y a des données de commande
        const savedOrderData = localStorage.getItem("pendingOrder");
        if (!savedOrderData) {
          router.push("/Panier");
          return;
        }
      }

      // Charger le total de la commande
      const savedTotal = localStorage.getItem("orderTotal");
      if (savedTotal) {
        setTotal(parseFloat(savedTotal));
      }

      // Charger le code promo
      const savedCodeP = localStorage.getItem("orderCodeP");
      if (savedCodeP) {
        try {
          setCodeP(JSON.parse(savedCodeP));
        } catch (e) {
          console.warn("Erreur lors du chargement du code promo:", e);
        }
      }

      // Charger les données de commande
      const savedOrder = localStorage.getItem("pendingOrder");
      if (savedOrder) {
        try {
          setOrderData(JSON.parse(savedOrder));
        } catch (e) {
          console.warn("Erreur lors du chargement des données de commande:", e);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données de commande:", error);
      setError("Erreur lors du chargement de la commande");
      setLoading(false);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (isClient && isAuthenticated) {
      loadOrderData();
    } else if (isClient && !isAuthenticated) {
      router.push("/auth/login?redirect=/order-confirmation");
    }
  }, [isClient, isAuthenticated, loadOrderData]);

  // Fonction pour gérer les changements du panier (pour HomeHeader)
  const handleCartChange = () => {
    // Le panier est maintenant géré par Redux, pas besoin d'action spéciale
  };

  // SEO dynamique basé sur l'utilisateur et la commande
  const dynamicSEO = {
    ...orderConfirmationSEOConfig,
    title: total > 0 
      ? `Confirmation de Commande ${total.toLocaleString('fr-FR')} FCFA - IhamBaobab`
      : orderConfirmationSEOConfig.title,
    description: user?.name
      ? `${user.name}, finalisez votre commande sur IhamBaobab. Paiement sécurisé et livraison rapide au Niger.`
      : orderConfirmationSEOConfig.description,
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...orderConfirmationSEOConfig} />
        <Head>
          <link rel="preload" href="/logo.png" as="image" />
          <link rel="dns-prefetch" href={BackendUrl} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre commande...</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <NextSeo {...dynamicSEO} />
        <Head>
          <meta name="theme-color" content="#30A08B" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';" />
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CheckoutPage",
                "name": "Page de Confirmation de Commande",
                "description": "Finalisation et confirmation de commande IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation` : "/order-confirmation",
                "inLanguage": "fr-FR",
                "isPartOf": {
                  "@type": "WebSite",
                  "name": "IhamBaobab",
                  "url": process.env.NEXT_PUBLIC_SITE_URL || "/",
                  "description": "Plateforme e-commerce IhamBaobab au Niger"
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
                      "name": "Panier",
                      "item": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/Panier` : "/Panier"
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": "Confirmation de Commande"
                    }
                  ]
                }
              }),
            }}
          />
        </Head>
        <LoadingIndicator 
          text="Chargement de votre commande..."
          loading={true}
        >
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
              <p className="text-gray-600">Préparation de votre commande...</p>
            </div>
          </div>
        </LoadingIndicator>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NextSeo {...dynamicSEO} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/Panier"
              className="inline-flex items-center px-4 py-2 bg-[#30A08B] text-white rounded-lg hover:bg-[#30A08B]/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au panier
            </Link>
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* En-têtes HTTP de sécurité */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; connect-src 'self' https:;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Schema.org pour les données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CheckoutPage",
              "name": "Confirmation de Commande IhamBaobab",
              "description": "Page de finalisation de commande avec paiement sécurisé",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation` : "/order-confirmation",
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "/",
                "description": "Plateforme e-commerce au Niger"
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
                    "name": "Panier",
                    "item": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/Panier` : "/Panier"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Confirmation de Commande"
                  }
                ]
              },
              "potentialAction": {
                "@type": "OrderAction",
                "name": "Finaliser la commande",
                "description": "Confirmer et payer la commande"
              }
            }),
          }}
        />
      </Head>

      {/* Contenu principal avec structure sémantique */}
      <div itemScope itemType="https://schema.org/CheckoutPage">
        <header role="banner">
          <HomeHeader chg={handleCartChange} />
        </header>

        {/* Fil d'Ariane pour navigation et SEO */}
        <nav aria-label="Fil d'Ariane" className="bg-gray-50 py-2 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-[#30A08B] transition-colors duration-200"
                  aria-label="Retour à l'accueil"
                >
                  Accueil
                </Link>
              </li>
              <li className="flex items-center">
                <svg 
                  className="mx-2 h-4 w-4 text-gray-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link
                  href="/Panier"
                  className="text-gray-600 hover:text-[#30A08B] transition-colors duration-200"
                >
                  Panier
                </Link>
              </li>
              <li className="flex items-center">
                <svg 
                  className="mx-2 h-4 w-4 text-gray-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[#30A08B] font-medium" aria-current="page">
                  Confirmation
                </span>
              </li>
            </ol>
          </div>
        </nav>

        <main 
          role="main" 
          aria-label="Contenu principal de la page de confirmation de commande"
          itemProp="mainContentOfPage"
        >
          <OrderConfirmation
            acces={isAuthenticated ? "oui" : "non"}
            total={total}
            codeP={codeP}
            setCodeP={setCodeP}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}