"use client";

import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import {
  Globe,
  ShoppingCart,
  Smartphone,
  Target,
  Users,
  Award,
  CheckCircle,
  Network,
  MapPin,
  Star,
  Truck,
  Shield,
  Leaf,
  Lock,
} from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";

const aboutSEOConfig = {
  title: "À Propos d'IhamBaobab - Notre Histoire et Mission | Marketplace Niger",
  description: "Découvrez l'histoire d'IhamBaobab, la marketplace panafricaine qui révolutionne le commerce électronique au Niger. Notre vision, nos valeurs et notre impact social depuis 2023.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/about` : "/about",
  openGraph: {
    title: "À Propos d'IhamBaobab - Notre Histoire et Mission",
    description: "Découvrez l'histoire d'IhamBaobab, la marketplace panafricaine qui révolutionne le commerce électronique au Niger",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/about` : "/about",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "À Propos d'IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "IhamBaobab, histoire, mission, marketplace Niger, commerce électronique, impact social, innovation Afrique",
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

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeSection, setActiveSection] = useState("story");

  useEffect(() => {
    setIsClient(true);
    window.scrollTo(0, 0);
  }, []);

  const handleCartChange = () => {
    // Redux gère automatiquement le panier
  };

  const sections = [
    {
      id: "story",
      title: "Notre Histoire",
      icon: <Award color="#30A08B" size={48} />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
          <div className="space-y-4 sm:space-y-6">
            <h3
              className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4"
              style={{ color: "#30A08B" }}
            >
              Une Vision Panafricaine
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Fondée en 2023 par un groupe d'entrepreneurs africains
              visionnaires, IhamBaobab est née de la conviction que le commerce
              électronique peut être un puissant moteur de développement
              économique et culturel.
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Notre parcours a commencé dans un petit bureau à Niamey, avec
              l'ambition de créer une plateforme qui transcende les frontières
              géographiques et commerciales traditionnelles.
            </p>
          </div>
          <div className="bg-[#f5f5f5] p-4 sm:p-8 rounded-xl">
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {[
                { value: "1+", label: "Années d'innovation" },
                { value: "2", label: "Pays africains" },
                { value: "20+", label: "Partenaires" },
                { value: "1k+", label: "Clients satisfaits" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold text-[#B17236]">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-base text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "impact",
      title: "Impact Social",
      icon: <Users color="#30A08B" size={48} />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
          <div className="space-y-4 sm:space-y-6">
            <h3
              className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4"
              style={{ color: "#30A08B" }}
            >
              Notre Engagement Social
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Chaque achat sur IhamBaobab soutient directement des communautés
              locales et des artisans indépendants à travers l'Afrique.
            </p>
            <div className="space-y-2 sm:space-y-4">
              {[
                "Plus de 20 artisans et petites entreprises soutenus",
                "10% de nos bénéfices réinvestis dans des programmes éducatifs locaux",
                "Promotion de l'entrepreneuriat féminin et jeune",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle color="#B17236" size={20} />
                  <span className="text-sm sm:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {[
              { value: "20+", label: "Artisans Soutenus" },
              { value: "10%", label: "Réinvestis" },
              { value: "60%", label: "Femmes Entrepreneurs" },
              { value: "2", label: "Programmes Éducatifs" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-[#f5f5f5] p-3 sm:p-6 rounded-xl text-center"
              >
                <div className="text-2xl sm:text-4xl font-bold text-[#B17236] mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const featuresData = [
    {
      icon: <Shield color="#B17236" size={40} className="mr-2 sm:mr-4" />,
      title: "Sécurité Garantie",
      description:
        "Systèmes de paiement sécurisés et protection des données personnelles",
    },
    {
      icon: <Truck color="#B17236" size={40} className="mr-2 sm:mr-4" />,
      title: "Livraison Rapide",
      description:
        "Réseau logistique performant couvrant tout le Niger et au-delà",
    },
    {
      icon: <Leaf color="#B17236" size={40} className="mr-2 sm:mr-4" />,
      title: "Durabilité",
      description:
        "Engagement pour des pratiques commerciales éco-responsables",
    },
  ];

  if (!isClient) {
    return (
      <>
        <NextSeo {...aboutSEOConfig} />
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
      <NextSeo {...aboutSEOConfig} />
      
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "IhamBaobab",
              "description": "Marketplace panafricaine révolutionnant le commerce électronique au Niger",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "",
              "foundingDate": "2023",
              "location": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "NE",
                  "addressLocality": "Niamey"
                }
              },
              "sameAs": [
                "https://www.facebook.com/ihambaobab",
                "https://www.instagram.com/ihambaobab"
              ]
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
                <span className="text-[#30A08B] font-medium">À Propos</span>
              </li>
            </ol>
          </div>
        </nav>

        <main role="main" className="bg-white min-h-screen">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="text-center mb-8 sm:mb-16">
              <h1
                className="text-3xl sm:text-6xl font-bold"
                style={{ color: "#30A08B" }}
              >
                IhamBaobab
              </h1>
              <p className="text-base sm:text-2xl text-gray-600 mt-2 sm:mt-4">
                La marketplace panafricaine qui révolutionne le commerce
                électronique
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-16">
              {[
                {
                  icon: <ShoppingCart size={isClient && window.innerWidth < 640 ? 48 : 72} color="#B17236" />,
                  title: "Diversité des Produits",
                  description:
                    "Une marketplace unique proposant une gamme exceptionnelle : artisanat traditionnel, électronique de pointe, mode, produits alimentaires, services digitaux et bien plus encore.",
                },
                {
                  icon: <Network size={isClient && window.innerWidth < 640 ? 48 : 72} color="#B17236" />,
                  title: "Réseau de Fournisseurs",
                  description:
                    "Partenariats stratégiques avec plus de 50 fournisseurs dans 2 pays africains, garantissant une qualité et une authenticité exceptionnelles.",
                },
                {
                  icon: <Smartphone size={isClient && window.innerWidth < 640 ? 48 : 72} color="#B17236" />,
                  title: "Innovation Technologique",
                  description:
                    "Solutions technologiques de pointe : intelligence artificielle, recommandations personnalisées, paiement mobile sécurisé et expérience utilisateur optimale.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-lg p-4 sm:p-8 text-center hover:shadow-xl transition-shadow duration-300"
                  style={{ borderColor: "#B2905F", borderWidth: "2px" }}
                >
                  <div className="mx-auto mb-3 sm:mb-6 flex justify-center">
                    {item.icon}
                  </div>
                  <h2
                    className="text-xl sm:text-3xl font-semibold mb-2 sm:mb-6"
                    style={{ color: "#30A08B" }}
                  >
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-gray-700">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 sm:p-12 mb-8 sm:mb-16">
              <div className="flex flex-col items-center mb-6 sm:mb-12">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-8 mb-4 sm:mb-8">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        flex items-center gap-2 sm:gap-3 
                        py-2 px-3 sm:py-3 sm:px-6 
                        rounded-lg text-sm sm:text-lg 
                        transition-all duration-300 
                        ${
                          activeSection === section.id
                            ? "bg-[#30A08B] text-white shadow-lg transform scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {section.icon}
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="transition-all duration-300">
                {
                  sections.find((section) => section.id === activeSection)
                    ?.content
                }
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {featuresData.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-4">
                  {feature.icon}
                  <div>
                    <h3
                      className="font-bold text-base sm:text-xl"
                      style={{ color: "#30A08B" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-base text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}