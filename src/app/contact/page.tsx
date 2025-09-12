"use client";

import React, { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Users,
  MessageCircle,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";

// Configuration SEO optimisée
const contactPageSEOConfig = {
  title: "Contactez-Nous - IhamBaobab | Support Client et Informations",
  description: "Contactez l'équipe IhamBaobab au Niger. Support client 7j/7, assistance technique, équipe commerciale. Téléphone: +227 87 72 75 01, Email: ihambaobab@gmail.com. Bureaux à Niamey, quartier Bobiel.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/contact` : "/contact",
  openGraph: {
    title: "Contactez IhamBaobab - Support Client au Niger",
    description: "Contactez notre équipe pour toute assistance. Support personnalisé, conseils et solutions sur mesure au Niger.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/contact` : "/contact",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Contactez IhamBaobab au Niger",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  twitter: {
    handle: "@IhamBaobab", // À adapter selon vos réseaux sociaux
    site: "@IhamBaobab",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "contact IhamBaobab, support client Niger, assistance technique, équipe commerciale, Niamey, Bobiel, +227 87 72 75 01, ihambaobab@gmail.com, chat en ligne, service client",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    },
    {
      name: "geo.region",
      content: "NE-8", // Code ISO pour Niamey, Niger
    },
    {
      name: "geo.placename",
      content: "Niamey, Niger",
    },
    {
      name: "geo.position",
      content: "13.5137;2.1098", // Coordonnées approximatives de Niamey
    },
    {
      name: "ICBM",
      content: "13.5137, 2.1098",
    },
    {
      name: "business:contact_data:street_address",
      content: "Bobiel, Pharmacie Goroual",
    },
    {
      name: "business:contact_data:locality",
      content: "Niamey",
    },
    {
      name: "business:contact_data:region",
      content: "Niger",
    },
    {
      name: "business:contact_data:postal_code",
      content: "8000", // Code postal de Niamey
    },
    {
      name: "business:contact_data:country_name",
      content: "Niger",
    },
  ],
  additionalLinkTags: [
    {
      rel: "preload",
      href: "/logo.png",
      as: "image",
    },
  ],
};

// Données de contact structurées
const contactData = {
  phone: "+227 87 72 75 01",
  email: "ihambaobab@gmail.com",
  address: {
    street: "Bobiel, Pharmacie Goroual",
    city: "Niamey",
    region: "Niger",
    coordinates: {
      lat: 13.5137,
      lng: 2.1098
    }
  },
  businessHours: {
    weekdays: "8h - 20h",
    saturday: "9h - 15h",
    sunday: "Support en ligne uniquement"
  }
};

type ContactSectionKey = "support" | "commercial" | "technique";

export default function ContactPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeSection, setActiveSection] = useState<ContactSectionKey>("support");

  useEffect(() => {
    setIsClient(true);
    // Faire défiler vers le haut lors du chargement
    window.scrollTo(0, 0);
  }, []);

  const colors = {
    teal: "#30A08B",
    brown: "#B2905F",
    darkBrown: "#B17236",
    lightTeal: "#E6F2EF",
    softBlue: "#E6F2F8",
  };

  const contactSections = {
    support: {
      icon: HelpCircle,
      title: "Support Client",
      details: [
        "Assistance personnalisée",
        "Résolution rapide des problèmes",
        "Disponible 7j/7 de 8h à 20h",
      ],
    },
    commercial: {
      icon: Users,
      title: "Équipe Commerciale",
      details: [
        "Conseils personnalisés",
        "Solutions sur mesure",
        "Partenariats stratégiques",
      ],
    },
    technique: {
      icon: Globe,
      title: "Support Technique",
      details: [
        "Expertise technologique",
        "Résolution des problèmes complexes",
        "Innovation continue",
      ],
    },
  };

  const contactChannels = [
    {
      icon: Phone,
      title: "Téléphone",
      info: contactData.phone,
      description: "Support immédiat et personnalisé",
      href: `tel:${contactData.phone}`,
    },
    {
      icon: Mail,
      title: "Email",
      info: contactData.email,
      description: "Réponse sous 24h garantie",
      href: `mailto:${contactData.email}`,
    },
    {
      icon: MessageCircle,
      title: "Chat en Ligne",
      info: "Disponible sur le site",
      description: "Assistance instantanée",
      href: "#chat", // Lien vers votre système de chat
    },
  ];

  const CurrentSectionIcon = contactSections[activeSection].icon;

  // Fonction pour gérer les changements du panier (pour HomeHeader)
  const handleCartChange = () => {
    // Le panier est maintenant géré par Redux
  };

  // Schema.org structuré pour la page contact
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": ["ContactPage", "LocalBusiness"],
    "name": "IhamBaobab",
    "alternateName": "Contact IhamBaobab",
    "description": "Page de contact pour IhamBaobab - Support client, assistance technique et équipe commerciale au Niger",
    "url": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/contact` : "/contact",
    "inLanguage": "fr-FR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contactData.address.street,
      "addressLocality": contactData.address.city,
      "addressRegion": contactData.address.region,
      "addressCountry": "NE",
      "postalCode": "8000"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": contactData.address.coordinates.lat,
      "longitude": contactData.address.coordinates.lng
    },
    "telephone": contactData.phone,
    "email": contactData.email,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": contactData.phone,
        "contactType": "customer service",
        "areaServed": "NE",
        "availableLanguage": ["fr"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "20:00"
        }
      },
      {
        "@type": "ContactPoint",
        "email": contactData.email,
        "contactType": "technical support",
        "areaServed": "NE",
        "availableLanguage": ["fr"]
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "15:00"
      }
    ],
    "isPartOf": {
      "@type": "WebSite",
      "name": "IhamBaobab",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "/",
      "description": "Plateforme e-commerce au Niger"
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
          "name": "Contact"
        }
      ]
    }
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...contactPageSEOConfig} />
        <Head>
          <link rel="preload" href="/logo.png" as="image" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
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
      {/* SEO Configuration */}
      <NextSeo {...contactPageSEOConfig} />
      
      {/* Head additionnels */}
      <Head>
        {/* Métadonnées spécifiques au contact */}
        <meta name="theme-color" content="#30A08B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* En-têtes HTTP de sécurité */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Cache control pour optimiser les performances */}
        <meta httpEquiv="Cache-Control" content="public, max-age=3600" />
        
        {/* Schema.org pour les données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactSchema),
          }}
        />

        {/* Preconnect pour optimiser les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      {/* Contenu principal avec structure sémantique */}
      <div itemScope itemType="https://schema.org/ContactPage">
        <header role="banner">
          <HomeHeader chg={handleCartChange} />
        </header>

        {/* Fil d'Ariane pour navigation et SEO */}
        <nav aria-label="Fil d'Ariane" className="bg-gray-50 py-2 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-[#30A08B] transition-colors duration-200"
                  aria-label="Retour à l'accueil"
                >
                  Accueil
                </Link>
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
                  Contact
                </span>
              </li>
            </ol>
          </div>
        </nav>

        <main 
          role="main"
          aria-label="Contenu principal de la page contact"
          itemProp="mainContentOfPage"
          className="min-h-screen p-4 sm:p-8"
          style={{ backgroundColor: colors.lightTeal }}
        >
          <div className="container mx-auto max-w-7xl">
            <header className="text-center mb-6 sm:mb-8">
              <h1
                className="text-2xl sm:text-4xl font-bold mb-4"
                style={{ color: colors.darkBrown }}
                itemProp="headline"
              >
                Contactez-Nous
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Notre équipe est là pour vous accompagner. Choisissez le canal qui vous convient le mieux.
              </p>
            </header>

            {/* Contact Sections Selector - Responsive Scrolling */}
            <section aria-labelledby="contact-sections-title" className="mb-6 sm:mb-12">
              <h2 id="contact-sections-title" className="sr-only">Sections de contact</h2>
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {Object.entries(contactSections).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key as ContactSectionKey)}
                    className={`
                      flex-shrink-0 flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all 
                      ${
                        activeSection === key
                          ? "text-white"
                          : "bg-white text-gray-700"
                      }
                    `}
                    style={{
                      backgroundColor:
                        activeSection === key ? colors.teal : "white",
                      color: activeSection === key ? "white" : colors.darkBrown,
                    }}
                    aria-pressed={activeSection === key}
                    aria-describedby={`section-${key}-description`}
                  >
                    <section.icon className="mr-1 sm:mr-2 w-4 h-4 sm:w-auto sm:h-auto" aria-hidden="true" />
                    <span className="text-sm sm:text-base">{section.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Active Section Details - Responsive Layout */}
            <section 
              aria-labelledby={`active-section-title`}
              className="bg-white rounded-xl p-4 sm:p-8 mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8"
              style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
            >
              <div>
                <h2
                  id="active-section-title"
                  className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
                  style={{ color: colors.teal }}
                >
                  {contactSections[activeSection].title}
                </h2>
                <ul className="space-y-2 sm:space-y-3" role="list">
                  {contactSections[activeSection].details.map((detail, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm sm:text-base"
                      style={{ color: colors.brown }}
                    >
                      <div
                        className="w-2 h-2 mr-2 sm:mr-3 rounded-full"
                        style={{ backgroundColor: colors.teal }}
                        aria-hidden="true"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <CurrentSectionIcon
                  size={80}
                  className="opacity-20"
                  color={colors.teal}
                  aria-hidden="true"
                />
              </div>
            </section>

            {/* Contact Channels - Responsive Grid */}
            <section aria-labelledby="contact-channels-title" className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <h2 id="contact-channels-title" className="sr-only">Canaux de contact</h2>
              {contactChannels.map((channel, index) => (
                <article
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300"
                  style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
                  itemScope
                  itemType="https://schema.org/ContactPoint"
                >
                  {channel.href ? (
                    <a 
                      href={channel.href}
                      className="block hover:opacity-80 transition-opacity"
                      itemProp="url"
                      aria-label={`Contacter par ${channel.title.toLowerCase()}: ${channel.info}`}
                    >
                      <channel.icon
                        size={40}
                        className="mx-auto mb-3 sm:mb-4"
                        color={colors.teal}
                        aria-hidden="true"
                      />
                      <h3
                        className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                        style={{ color: colors.darkBrown }}
                        itemProp="contactType"
                      >
                        {channel.title}
                      </h3>
                      <p
                        className="mb-1 sm:mb-2 font-semibold text-sm sm:text-base"
                        style={{ color: colors.brown }}
                        itemProp={channel.title === "Email" ? "email" : channel.title === "Téléphone" ? "telephone" : "name"}
                      >
                        {channel.info}
                      </p>
                      <p
                        className="text-sm sm:text-base"
                        style={{ color: colors.brown }}
                        itemProp="description"
                      >
                        {channel.description}
                      </p>
                    </a>
                  ) : (
                    <>
                      <channel.icon
                        size={40}
                        className="mx-auto mb-3 sm:mb-4"
                        color={colors.teal}
                        aria-hidden="true"
                      />
                      <h3
                        className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                        style={{ color: colors.darkBrown }}
                        itemProp="contactType"
                      >
                        {channel.title}
                      </h3>
                      <p
                        className="mb-1 sm:mb-2 font-semibold text-sm sm:text-base"
                        style={{ color: colors.brown }}
                        itemProp="name"
                      >
                        {channel.info}
                      </p>
                      <p
                        className="text-sm sm:text-base"
                        style={{ color: colors.brown }}
                        itemProp="description"
                      >
                        {channel.description}
                      </p>
                    </>
                  )}
                </article>
              ))}
            </section>

            {/* Location and Hours - Responsive Layout */}
            <section aria-labelledby="location-hours-title" className="mt-6 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <h2 id="location-hours-title" className="sr-only">Localisation et horaires</h2>
              
              <article
                className="bg-white rounded-xl p-4 sm:p-6"
                style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
                itemScope
                itemType="https://schema.org/LocalBusiness"
              >
                <h3
                  className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center"
                  style={{ color: colors.teal }}
                >
                  <MapPin className="inline-block mr-1 sm:mr-2 w-4 h-4 sm:w-auto sm:h-auto" aria-hidden="true" />
                  Nos Bureaux
                </h3>
                <address
                  className="text-sm sm:text-base not-italic"
                  style={{ color: colors.brown }}
                  itemProp="address"
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                >
                  <div itemProp="streetAddress">{contactData.address.street}</div>
                  <div>
                    <span itemProp="addressLocality">{contactData.address.city}</span> / 
                    <span itemProp="addressRegion"> {contactData.address.region}</span>
                  </div>
                </address>
              </article>

              <article
                className="bg-white rounded-xl p-4 sm:p-6"
                style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}
              >
                <h3
                  className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center"
                  style={{ color: colors.teal }}
                >
                  <Clock className="inline-block mr-1 sm:mr-2 w-4 h-4 sm:w-auto sm:h-auto" aria-hidden="true" />
                  Heures d'Ouverture
                </h3>
                <dl
                  className="text-sm sm:text-base space-y-1"
                  style={{ color: colors.brown }}
                >
                  <div className="flex justify-between">
                    <dt>Lundi - Vendredi :</dt>
                    <dd>{contactData.businessHours.weekdays}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Samedi :</dt>
                    <dd>{contactData.businessHours.saturday}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Dimanche :</dt>
                    <dd>{contactData.businessHours.sunday}</dd>
                  </div>
                </dl>
              </article>
            </section>

            {/* Call to Action Section */}
            <section className="mt-12 text-center bg-white rounded-xl p-6 sm:p-8" style={{ boxShadow: `0 4px 20px ${colors.teal}20` }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: colors.darkBrown }}>
                Besoin d'aide immédiate ?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Notre équipe de support est disponible pour répondre à toutes vos questions et vous accompagner dans vos achats.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href={`tel:${contactData.phone}`}
                  className="inline-flex items-center px-6 py-3 bg-[#30A08B] text-white rounded-lg hover:bg-[#30A08B]/90 transition-colors font-semibold"
                >
                  <Phone className="h-5 w-5 mr-2" aria-hidden="true" />
                  Appeler maintenant
                </a>
                <a
                  href={`mailto:${contactData.email}`}
                  className="inline-flex items-center px-6 py-3 border border-[#30A08B] text-[#30A08B] rounded-lg hover:bg-[#30A08B]/10 transition-colors font-semibold"
                >
                  <Mail className="h-5 w-5 mr-2" aria-hidden="true" />
                  Envoyer un email
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}