import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/_next/',
          '/panier',
          '/Panier',
          '/checkout',
          '/profile',
          '/commandes',
          '/commandesReference',
          '/suivi/',
          '/livreur',
          '/seller/',
          '/dashboard',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/panier',
          '/Panier',
          '/checkout',
          '/profile',
          '/commandes',
          '/commandesReference',
          '/suivi/',
          '/livreur',
          '/seller/',
          '/dashboard',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
