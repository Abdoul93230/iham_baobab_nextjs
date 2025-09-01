"use client";

import Profile from "@/components/Profile";
import HomeHeader from "@/components/home/HomeHeader";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import useAuth from "@/hooks/useAuth";

// Configuration SEO statique adaptée à votre situation
// Configuration SEO statique adaptée à votre situation
const profileSEOConfig = {
  title: "Mon Profil - IhamBaobab | Gestion de Compte Utilisateur",
  description: "Gérez votre profil utilisateur IhamBaobab. Modifiez vos informations personnelles, votre photo de profil, vos coordonnées et paramètres de compte en toute sécurité.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/profile` : "/profile",
  openGraph: {
    title: "Mon Profil - IhamBaobab",
    description: "Espace personnel pour gérer vos informations de compte IhamBaobab",
    type: "profile",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/profile` : "/profile",
    images: [
      {
        url: "../../../public/logo.png", // Utilisez votre propre image
        width: 1200,
        height: 630,
        alt: "Page de profil IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  // Pas de Twitter pour le moment - sera ajouté plus tard
  additionalMetaTags: [
    {
      name: "keywords",
      content: "profil utilisateur, compte IhamBaobab, gestion profil, informations personnelles, paramètres compte, sécurité utilisateur, Niger, Niamey",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "noindex, nofollow", // Important pour les pages privées !
    },
    {
      name: "geo.region",
      content: "NE-8", // Code ISO pour Niamey, Niger
    },
    {
      name: "geo.placename",
      content: "Niamey, Niger",
    },
    // Retirer httpEquiv car il n'est pas supporté par NextSeo pour ce type
    // Les en-têtes CSP sont mieux gérées dans next.config.js ou via des composants Head séparés
  ],
  // Ajouter les en-têtes supplémentaires séparément
  additionalLinkTags: [
    {
      rel: "preload",
      href: "/icon_user.png",
      as: "image",
    },
    {
      rel: "dns-prefetch",
      href: "https://ihambackend.onrender.com",
    },
  ],
};

export default function ProfilePage() {
  const [paniernbr, setPaniernbr] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    setIsClient(true);
    
    // Gestion sécurisée du panier
    const updateCartCount = () => {
      try {
        const local = localStorage.getItem("panier");
        if (local) {
          const parsedPanier = JSON.parse(local);
          setPaniernbr(Array.isArray(parsedPanier) ? parsedPanier.length : 0);
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du panier:", error);
        setPaniernbr(0);
      }
    };

    updateCartCount();
  }, []);

  const handleCartChange = () => {
    try {
      const local = localStorage.getItem("panier");
      if (local) {
        const parsedPanier = JSON.parse(local);
        setPaniernbr(Array.isArray(parsedPanier) ? parsedPanier.length : 0);
      }
    } catch (error) {
      console.error("Erreur lors de la lecture du panier:", error);
      setPaniernbr(0);
    }
  };

  // SEO dynamique basé sur l'utilisateur connecté
  const dynamicSEO = {
    ...profileSEOConfig,
    title: user?.name 
      ? `Profil de ${user.name} - IhamBaobab` 
      : profileSEOConfig.title,
    description: user?.name
      ? `Gérez le profil de ${user.name} sur IhamBaobab. Modifiez vos informations personnelles et paramètres de compte.`
      : profileSEOConfig.description,
  };

  // Si pas encore côté client, afficher un placeholder SEO
  if (!isClient) {
    return (
      <>
        <NextSeo {...profileSEOConfig} />
        <Head>
          <link rel="preload" href="/icon_user.png" as="image" />
          <link rel="dns-prefetch" href="https://ihambackend.onrender.com" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre profil...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO Configuration */}
      <NextSeo {...dynamicSEO} />
      
{/* Head additionnels */}
      <Head>
        {/* Métadonnées spécifiques au profil */}
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
        
        {/* Cache control pour les ressources */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Schema.org pour les données structurées - Sans informations sensibles */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "name": "Page de Profil Utilisateur",
              "description": "Page de profil utilisateur IhamBaobab - Gestion des informations personnelles",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/profile` : "/profile",
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
                    "name": "Mon Profil"
                  }
                ]
              }
              // Pas d'informations utilisateur sensibles dans les données structurées
            }),
          }}
        />
      </Head>

      {/* Contenu principal avec structure sémantique */}
      <div itemScope itemType="https://schema.org/ProfilePage">
        <header role="banner">
          <HomeHeader paniernbr={paniernbr} chg={handleCartChange} />
        </header>

        {/* Fil d'Ariane pour navigation */}
        <nav aria-label="Fil d'Ariane" className="bg-gray-50 py-2 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a 
                  href="/" 
                  className="text-gray-600 hover:text-[#30A08B] transition-colors duration-200"
                  aria-label="Retour à l'accueil"
                >
                  Accueil
                </a>
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
                  Mon Profil
                </span>
              </li>
            </ol>
          </div>
        </nav>

        <main 
          role="main" 
          aria-label="Contenu principal de la page profil"
          itemProp="mainContentOfPage"
        >
          <Profile />
        </main>
      </div>
    </>
  );
}