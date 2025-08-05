import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
