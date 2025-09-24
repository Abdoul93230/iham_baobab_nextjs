"use client";

import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import MessagerieMain from "@/components/messagerie/MessagerieMain";
import HomeHeader from "@/components/home/HomeHeader";

const messagesSEOConfig = {
  title: "Messages - IhamBaobab | Messagerie Boutique",
  description: "Communiquez directement avec les vendeurs IhamBaobab. Posez vos questions, négociez et suivez vos commandes en temps réel.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/messages` : "/messages",
  openGraph: {
    title: "Messagerie - IhamBaobab",
    description: "Communication directe avec les vendeurs pour tous vos besoins d'achat",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/messages` : "/messages",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Messagerie IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "messagerie, chat, vendeurs, communication, support client, Niger, Niamey, boutique en ligne",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "noindex, nofollow",
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
      href: process.env.NEXT_PUBLIC_BACKEND_URL || "https://ihambackend.onrender.com",
    },
  ],
};

export default function MessagesPage() {
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCartChange = () => {
    // Redux gère automatiquement
  };

  const dynamicSEO = {
    ...messagesSEOConfig,
    title: user?.name 
      ? `Messages de ${user.name} - IhamBaobab` 
      : messagesSEOConfig.title,
    description: user?.name
      ? `Messagerie de ${user.name} - Communiquez avec les vendeurs IhamBaobab.`
      : messagesSEOConfig.description,
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...messagesSEOConfig} />
        <Head>
          <link rel="preload" href="/logo.png" as="image" />
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BACKEND_URL || "https://ihambackend.onrender.com"} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Chargement de vos messages...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <NextSeo {...dynamicSEO} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' wss: https:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Messagerie IhamBaobab",
              "description": "Application de messagerie pour communiquer avec les vendeurs",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/messages` : "/messages",
              "applicationCategory": "CommunicationApplication",
              "operatingSystem": "Web",
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "/"
              }
            }),
          }}
        />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <header role="banner" className="hidden md:block flex-shrink-0">
          <HomeHeader chg={handleCartChange} />
        </header>

        <main role="main" className="flex-1 flex flex-col md:mt-0 min-h-0">
          <MessagerieMain />
        </main>
      </div>
    </ProtectedRoute>
  );
}