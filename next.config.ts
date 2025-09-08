import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zz.jumia.is',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'secoure.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'ihambackend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'cc-prod.scene7.com',
      },
      {
        protocol: 'https',
        hostname: 'www.codeur.com',
      },
      {
        protocol: 'https',
        hostname: 'www.fontainebleau-blog.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
    // Optimisations d'images pour le SEO
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimisations pour le SEO et les performances
  compress: true,
  poweredByHeader: false,
  
  // Généreration statique pour les pages importantes
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },

  // Headers pour le SEO et la sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Redirections pour le SEO
  async redirects() {
    return [
      {
        source: '/category/:path*',
        destination: '/Categorie/:path*',
        permanent: true,
      },
      {
        source: '/categories/:path*',
        destination: '/Categorie/:path*',
        permanent: true,
      },
    ];
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
