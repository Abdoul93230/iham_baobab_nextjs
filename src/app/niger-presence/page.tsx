"use client";

import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import { MapPin, Users, Truck, Building, Phone, Mail } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";

const nigerPresenceSEOConfig = {
  title: "Présence d'IhamBaobab au Niger - Réseau National de Livraison | Niger",
  description: "Découvrez la présence nationale d'IhamBaobab au Niger : Niamey, Maradi, Zinder, Tahoua, Agadez. Livraison rapide, support local et service client de qualité dans tout le pays.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/niger-presence` : "/niger-presence",
  openGraph: {
    title: "Présence d'IhamBaobab au Niger - Réseau National de Livraison",
    description: "Découvrez la présence nationale d'IhamBaobab au Niger avec un réseau couvrant les principales villes",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/niger-presence` : "/niger-presence",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Présence IhamBaobab au Niger",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "IhamBaobab Niger, présence nationale, livraison Niger, Niamey, Maradi, Zinder, Tahoua, Agadez, e-commerce Niger",
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

export default function NigerPresencePage() {
  const [isClient, setIsClient] = useState(false);

  const colors = {
    teal: "#30A08B",
    brown: "#B2905F",
    darkBrown: "#B17236",
  };

  useEffect(() => {
    setIsClient(true);
    window.scrollTo(0, 0);
  }, []);

  const handleCartChange = () => {
    // Redux gère automatiquement le panier
  };

  const regions = [
    {
      name: "Niamey",
      role: "Siège Principal",
      address: "Quartier Bobiel",
      services: ["Centre logistique", "Support client", "Formation"],
      contact: "+227 87 72 75 01",
      stats: "300+ clients actifs",
    },
    {
      name: "Maradi",
      role: "Hub Commercial",
      address: "Zone Industrielle",
      services: ["Distribution régionale", "Service client local"],
      contact: "+227 87 72 75 01",
      stats: "220+ clients actifs",
    },
    {
      name: "Zinder",
      role: "Centre Régional",
      address: "Centre-ville",
      services: ["Point relais", "Support local"],
      contact: "+227 87 72 75 01",
      stats: "100+ clients actifs",
    },
    {
      name: "Tahoua",
      role: "Point Relais",
      address: "Quartier Central",
      services: ["Distribution", "Support client"],
      contact: "+227 87 72 75 01",
      stats: "200+ clients actifs",
    },
    {
      name: "Agadez",
      role: "Bureau Régional",
      address: "Zone Commerciale",
      services: ["Livraison locale", "Support"],
      contact: "+227 87 72 75 01",
      stats: "80+ clients actifs",
    },
  ];

  const features = [
    {
      title: "Réseau National",
      description: "Présence dans les 5 plus grandes villes du Niger",
      icon: Building,
    },
    {
      title: "Livraison Rapide",
      description: "24-48h dans les zones urbaines",
      icon: Truck,
    },
    {
      title: "Support Local",
      description: "Équipes locales dans chaque région",
      icon: Users,
    },
  ];

  if (!isClient) {
    return (
      <>
        <NextSeo {...nigerPresenceSEOConfig} />
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
      <NextSeo {...nigerPresenceSEOConfig} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "IhamBaobab Niger",
              "description": "Présence nationale d'IhamBaobab au Niger avec réseau de livraison et support local",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "",
              "address": [
                {
                  "@type": "PostalAddress",
                  "addressLocality": "Niamey",
                  "addressRegion": "Niamey",
                  "addressCountry": "NE",
                  "streetAddress": "Quartier Bobiel"
                },
                {
                  "@type": "PostalAddress", 
                  "addressLocality": "Maradi",
                  "addressRegion": "Maradi",
                  "addressCountry": "NE",
                  "streetAddress": "Zone Industrielle"
                },
                {
                  "@type": "PostalAddress",
                  "addressLocality": "Zinder", 
                  "addressRegion": "Zinder",
                  "addressCountry": "NE",
                  "streetAddress": "Centre-ville"
                },
                {
                  "@type": "PostalAddress",
                  "addressLocality": "Tahoua",
                  "addressRegion": "Tahoua", 
                  "addressCountry": "NE",
                  "streetAddress": "Quartier Central"
                },
                {
                  "@type": "PostalAddress",
                  "addressLocality": "Agadez",
                  "addressRegion": "Agadez",
                  "addressCountry": "NE", 
                  "streetAddress": "Zone Commerciale"
                }
              ],
              "telephone": "+227 87 72 75 01",
              "email": "ihambaobab@gmail.com"
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
                <span className="text-[#30A08B] font-medium">Présence au Niger</span>
              </li>
            </ol>
          </div>
        </nav>

        <main role="main"
          className="min-h-screen"
          style={{ backgroundColor: `${colors.teal}10` }}
        >
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
              <h1
                className="text-4xl font-bold mb-6"
                style={{ color: colors.darkBrown }}
              >
                IHAM Partout au Niger
              </h1>
              <p
                className="text-xl max-w-3xl mx-auto"
                style={{ color: colors.brown }}
              >
                Un réseau national au service de nos clients, avec une présence
                locale pour un service personnalisé et efficace.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl text-center"
                  style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
                >
                  <feature.icon
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: colors.teal }}
                  />
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.darkBrown }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.brown }}>{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {regions.map((region, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 transform hover:scale-105 transition-transform"
                  style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
                >
                  <div className="flex items-center mb-4">
                    <MapPin
                      className="w-6 h-6 mr-2"
                      style={{ color: colors.teal }}
                    />
                    <h3
                      className="text-xl font-bold"
                      style={{ color: colors.darkBrown }}
                    >
                      {region.name}
                    </h3>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="font-semibold" style={{ color: colors.brown }}>
                      {region.role}
                    </p>
                    <p className="text-gray-600">
                      <Building className="w-4 h-4 inline mr-2" />
                      {region.address}
                    </p>
                    <div className="space-y-1">
                      {region.services.map((service, idx) => (
                        <p
                          key={idx}
                          className="text-sm"
                          style={{ color: colors.brown }}
                        >
                          • {service}
                        </p>
                      ))}
                    </div>
                    <p
                      className="text-sm font-semibold mt-2"
                      style={{ color: colors.teal }}
                    >
                      {region.stats}
                    </p>
                  </div>

                  <div
                    className="border-t pt-4 mt-4"
                    style={{ borderColor: `${colors.teal}20` }}
                  >
                    <div className="flex items-center gap-4">
                      <Phone className="w-4 h-4" style={{ color: colors.teal }} />
                      <a href={`tel:${region.contact}`} className="text-sm hover:underline">
                        {region.contact}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="text-center bg-white rounded-xl p-8"
              style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: colors.darkBrown }}
              >
                Contact National
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                <div className="flex items-center justify-center">
                  <Phone
                    className="w-5 h-5 mr-2"
                    style={{ color: colors.teal }}
                  />
                  <a href="tel:+22787727501" className="hover:underline">
                    +227 87 72 75 01
                  </a>
                </div>
                <div className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" style={{ color: colors.teal }} />
                  <a href="mailto:ihambaobab@gmail.com" className="hover:underline">
                    ihambaobab@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: colors.darkBrown }}>
                  Horaires d'ouverture
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Lundi - Vendredi :</strong> 8h00 - 18h00</p>
                  <p><strong>Samedi :</strong> 8h00 - 14h00</p>
                  <p><strong>Dimanche :</strong> Fermé</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}