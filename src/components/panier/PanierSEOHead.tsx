"use client";

import Head from 'next/head';
import { useMemo } from 'react';

interface PanierSEOHeadProps {
  articles: any[];
  selectedZone?: any;
  totalValue: number;
}

export default function PanierSEOHead({ articles, selectedZone, totalValue }: PanierSEOHeadProps) {
  const seoData = useMemo(() => {
    const totalItems = articles.reduce((sum, article) => sum + article.quantity, 0);
    const storeCount = new Set(articles.map(article => 
      article.Clefournisseur?._id || "unknown"
    )).size;

    const productNames = articles.slice(0, 3).map(article => article.name).join(', ');
    
    const title = totalItems > 0 
      ? `Panier (${totalItems}) - IhamBaobab | ${totalValue.toLocaleString()} XOF`
      : "Mon Panier - IhamBaobab | Marketplace Africaine";

    const description = totalItems > 0
      ? `Votre panier contient ${totalItems} article(s) pour ${totalValue.toLocaleString()} XOF. ${productNames && productNames + '. '}Finalisez votre commande avec livraison sécurisée en Afrique de l'Ouest.`
      : "Consultez votre panier d'achats sur IhamBaobab, ajoutez vos produits favoris et procédez au paiement sécurisé avec livraison partout en Afrique de l'Ouest.";

    // Schema.org JSON-LD pour le SEO
    const jsonLD: any = {
      "@context": "https://schema.org",
      "@type": "ShoppingCart",
      "name": "Panier IhamBaobab",
      "description": description,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/panier`,
      "provider": {
        "@type": "Organization",
        "name": "IhamBaobab",
        "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        "url": process.env.NEXT_PUBLIC_SITE_URL,
        "sameAs": [
          "https://facebook.com/ihambaobab",
          "https://twitter.com/ihambaobab"
        ]
      },
      "numberOfItems": totalItems,
      "potentialAction": {
        "@type": "CheckoutAction",
        "target": `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        "name": "Procéder au paiement"
      }
    };

    if (totalItems > 0) {
      jsonLD.totalPaymentDue = {
        "@type": "MonetaryAmount",
        "currency": "XOF",
        "value": totalValue
      };
    }

    if (selectedZone) {
      jsonLD.deliveryAddress = {
        "@type": "PostalAddress",
        "addressCountry": selectedZone.country,
        "addressRegion": selectedZone.region || selectedZone.name
      };
    }

    return { title, description, jsonLD };
  }, [articles, selectedZone, totalValue]);

  return (
    <Head>
      {/* Titre dynamique */}
      <title>{seoData.title}</title>
      
      {/* Meta description dynamique */}
      <meta name="description" content={seoData.description} />
      
      {/* Meta keywords pertinents */}
      <meta name="keywords" content="panier, e-commerce, achats en ligne, paiement sécurisé, livraison Afrique, marketplace Niger, IhamBaobab" />
      
      {/* Robots - ne pas indexer le panier pour la confidentialité */}
      <meta name="robots" content="noindex, follow, noarchive, nosnippet" />
      
      {/* Open Graph pour les réseaux sociaux */}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/panier`} />
      <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`} />
      <meta property="og:site_name" content="IhamBaobab" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`} />
      
      {/* Métadonnées mobiles */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#30A08B" />
      
      {/* Apple métadonnées */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="IhamBaobab Panier" />
      
      {/* Préchargement des ressources critiques */}
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_Backend_Url} />
      <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_Backend_Url} />
      
      {/* Préchargement des polices */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* JSON-LD structuré pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoData.jsonLD)
        }}
      />
      
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": process.env.NEXT_PUBLIC_SITE_URL
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Mon Panier"
              }
            ]
          })
        }}
      />
    </Head>
  );
}
