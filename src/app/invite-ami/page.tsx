"use client";

import InviteAmiPage from "@/components/invite-ami/InviteAmiPage";
import HomeHeader from "@/components/home/HomeHeader";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
// import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

const inviteAmiSEOConfig = {
  title: "Inviter des Amis - IhamBaobab | Partagez avec vos Proches",
  description: "Invitez vos amis et famille à découvrir IhamBaobab. Partagez facilement par email, WhatsApp ou réseaux sociaux et faites profiter vos proches de nos produits exceptionnels.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/invite-ami` : "/invite-ami",
  openGraph: {
    title: "Inviter des Amis - IhamBaobab",
    description: "Partagez IhamBaobab avec vos amis et famille",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/invite-ami` : "/invite-ami",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Inviter des amis sur IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "inviter amis, partager, IhamBaobab, Niger, Niamey, parrainage, recommandation, email, WhatsApp, réseaux sociaux",
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

export default function InviteAmiPageWrapper() {
  const [isClient, setIsClient] = useState(false);
//   const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCartChange = () => {
    // Redux gère automatiquement le panier
  };

//   const dynamicSEO = {
//     ...inviteAmiSEOConfig,
//     title: user?.name 
//       ? `${user.name} vous invite sur IhamBaobab` 
//       : inviteAmiSEOConfig.title,
//   };

  if (!isClient) {
    return (
      <>
        <NextSeo {...inviteAmiSEOConfig} />
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
    <ProtectedRoute requireAuth={true}>
      {/* <NextSeo {...dynamicSEO} /> */}
      <NextSeo {...inviteAmiSEOConfig} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Inviter des Amis",
              "description": "Page d'invitation pour partager IhamBaobab avec vos amis",
              "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/invite-ami` : "/invite-ami",
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "IhamBaobab",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "/",
              },
            }),
          }}
        />
      </Head>

      <div>
        <header role="banner">
          <HomeHeader chg={handleCartChange} />
        </header>

        <main role="main">
          <InviteAmiPage />
        </main>
      </div>
    </ProtectedRoute>
  );
}