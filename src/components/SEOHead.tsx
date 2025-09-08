"use client";

import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}

export default function SEOHead({
  title = "IhamBaobab - Marketplace Africaine",
  description = "Votre marketplace de confiance pour vos achats en ligne au Niger et partout dans le monde",
  keywords = "marketplace, e-commerce, Niger, achats en ligne, IhamBaobab",
  image = "/logo.png",
  url = "",
  noIndex = false,
}: SEOHeadProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "IhamBaobab";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ihambaobab.com";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Métadonnées de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      {process.env.NEXT_PUBLIC_TWITTER_HANDLE && (
        <meta name="twitter:site" content={process.env.NEXT_PUBLIC_TWITTER_HANDLE} />
      )}
      
      {/* Liens canoniques */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Autres métadonnées */}
      <meta name="author" content={siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="Content-Language" content="fr" />
      
      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Données structurées de base */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": fullImageUrl,
            "description": description,
            "sameAs": [
              process.env.NEXT_PUBLIC_FACEBOOK_PAGE,
              process.env.NEXT_PUBLIC_INSTAGRAM_PAGE,
            ].filter(Boolean),
          }),
        }}
      />
    </Head>
  );
}
