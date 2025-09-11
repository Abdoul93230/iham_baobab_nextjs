"use client";

import React from "react";
import { 
  Building2, 
  FileText, 
  Shield, 
  Cookie, 
  ShoppingCart, 
  RotateCcw, 
  Copyright, 
  AlertTriangle, 
  Scale,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  CreditCard,
  Truck,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

const InformationPage = () => {
  const legalSections = [
    {
      id: "mentions-legales",
      icon: Building2,
      title: "1. Mentions légales",
      content: `**Raison sociale :** IhamBaobab SARL
**Forme juridique :** Société à Responsabilité Limitée (SARL)
**Capital social :** 5.000.000 FCFA
**Siège social :** Quartier Bobiel, Niamey, République du Niger
**Numéro d'immatriculation :** NE-2023-B-12345 (Registre du Commerce et du Crédit Mobilier de Niamey)
**Numéro fiscal :** 123456789A
**Code APE/NAF :** 4791Z - Vente à distance sur catalogue spécialisé

**Directeur de la publication :** Abdoul Razak HASSAN
**Responsable éditorial :** Équipe IhamBaobab

**Contact :**
• Adresse postale : BP 1234, Niamey, Niger
• Téléphone : +227 87 72 75 01
• Email général : contact@ihambaobab.com
• Email commercial : commercial@ihambaobab.com
• Site web : https://ihambaobab.com

**Hébergement du site :**
• Hébergeur : Render Inc.
• Adresse : 525 Brannan Street, San Francisco, CA 94107, USA
• Site : https://render.com`,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "cgu",
      icon: FileText,
      title: "2. Conditions Générales d'Utilisation (CGU)",
      content: `En utilisant le site IhamBaobab.com, vous acceptez pleinement les présentes conditions générales d'utilisation.

**Objet du site :**
Le site IhamBaobab.com est une plateforme de commerce électronique spécialisée dans la vente d'artisanat traditionnel nigérien. Nous proposons des produits authentiques fabriqués par des artisans locaux.

**Accès au site :**
• L'accès au site est gratuit pour tous les utilisateurs
• Une inscription est nécessaire pour passer commande
• Nous nous réservons le droit de suspendre temporairement l'accès pour maintenance
• Les mineurs de moins de 16 ans doivent avoir l'autorisation parentale

**Utilisation acceptable :**
Il est strictement interdit de :
• Utiliser le site à des fins illégales ou frauduleuses
• Tenter d'accéder à des zones non autorisées
• Diffuser des virus ou codes malveillants
• Copier ou reproduire le contenu sans autorisation
• Usurper l'identité d'autres utilisateurs

**Propriété intellectuelle :**
Tous les éléments du site (textes, images, logos, designs) sont protégés par les droits de propriété intellectuelle et appartiennent à IhamBaobab SARL ou à ses partenaires.`,
      color: "from-green-500 to-green-600"
    },
    {
      id: "politique-confidentialite",
      icon: Shield,
      title: "3. Politique de Confidentialité",
      content: `IhamBaobab s'engage à respecter et protéger la confidentialité de vos données personnelles conformément au RGPD et aux lois nigériennes en vigueur.

**Données collectées :**
• Données d'identification (nom, email, téléphone)
• Adresses de livraison et de facturation
• Historique de commandes et préférences
• Données de navigation (cookies, logs)

**Utilisation des données :**
• Traitement et suivi de vos commandes
• Communication commerciale (avec votre consentement)
• Amélioration de nos services
• Respect des obligations légales et comptables

**Conservation des données :**
• Données de compte : 3 ans après la dernière activité
• Données de commande : 10 ans (obligations comptables)
• Données marketing : jusqu'à désinscription

**Vos droits :**
Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Contactez privacy@ihambaobab.com pour exercer ces droits.

**Sécurité :**
Nous utilisons des technologies de cryptage SSL et des serveurs sécurisés pour protéger vos données personnelles et financières.`,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "politique-cookies",
      icon: Cookie,
      title: "4. Politique de Cookies",
      content: `Notre site utilise des cookies pour améliorer votre expérience de navigation et nous permettre d'analyser l'utilisation du site.

**Types de cookies utilisés :**

**Cookies essentiels :**
• Gestion du panier d'achat
• Authentification utilisateur
• Préférences de langue
• Sécurité de la session

**Cookies analytiques :**
• Google Analytics (anonymisé)
• Statistiques de fréquentation
• Analyse du comportement utilisateur
• Optimisation des performances

**Cookies marketing :** (avec votre consentement)
• Publicités personnalisées
• Remarketing
• Réseaux sociaux
• Suivi des conversions

**Gestion des cookies :**
Vous pouvez à tout moment :
• Accepter ou refuser les cookies via notre bandeau
• Configurer vos préférences dans les paramètres
• Supprimer les cookies via votre navigateur
• Désactiver le suivi publicitaire

**Durée de conservation :**
• Cookies de session : supprimés à la fermeture du navigateur
• Cookies persistants : 13 mois maximum
• Cookies marketing : 6 mois avec possibilité de retrait

**Cookies tiers :**
Nous utilisons des services tiers (Google, Facebook) qui peuvent déposer leurs propres cookies. Consultez leurs politiques respectives pour plus d'informations.`,
      color: "from-amber-500 to-amber-600"
    },
    {
      id: "conditions-vente",
      icon: ShoppingCart,
      title: "5. Conditions Générales de Vente (CGV)",
      content: `Les présentes conditions régissent toutes les ventes effectuées sur le site IhamBaobab.com.

**Formation du contrat :**
• La commande est confirmée après validation du paiement
• Un email de confirmation est envoyé dans les 2h
• Le contrat est formé à la date de confirmation
• Toute commande constitue un engagement ferme

**Prix et paiement :**
• Prix exprimés en Francs CFA (FCFA) TTC
• Prix susceptibles d'évoluer sans préavis
• Paiement requis avant expédition
• Moyens acceptés : CB, Mobile Money, paiement à la livraison

**Disponibilité des produits :**
• Tous nos produits sont soumis à disponibilité
• En cas de rupture, nous vous proposons un produit équivalent ou le remboursement
• Les articles artisanaux peuvent présenter de légères variations (fait main)

**Livraison :**
• Délais : 24h-48h à Niamey, 3-7 jours ailleurs au Niger
• Frais de port : 2000 FCFA (gratuit dès 50000 FCFA)
• Livraison internationale : nous consulter
• Risques transférés à la réception

**Droit de rétractation :**
Conformément à la réglementation, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation, sauf pour :
• Les produits personnalisés ou confectionnés selon vos spécifications
• Les produits périssables ou d'hygiène personnelle
• Les articles soldés ou promotionnels spécifiquement exclus`,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "politique-retour",
      icon: RotateCcw,
      title: "6. Politique de Retour et Remboursement",
      content: `IhamBaobab offre une politique de retour généreuse pour garantir votre satisfaction.

**Délai de retour :** 30 jours calendaires à compter de la réception

**Conditions de retour :**
• Produit en parfait état, non utilisé
• Emballage d'origine conservé
• Étiquettes et certificats d'authenticité présents
• Facture ou bon de livraison joint

**Procédure de retour :**
1. **Demande** : Contactez support@ihambaobab.com
2. **Autorisation** : Recevez votre numéro de retour (RMA)
3. **Emballage** : Emballez soigneusement le produit
4. **Expédition** : Utilisez l'étiquette de retour gratuite fournie
5. **Réception** : Nous inspectons le produit sous 48h
6. **Remboursement** : Traité sous 7 jours ouvrés

**Modalités de remboursement :**
• Remboursement sur le moyen de paiement d'origine
• Mobile Money : remboursement sous 24h
• Carte bancaire : 3-5 jours ouvrés selon la banque
• Les frais de retour sont gratuits (étiquette fournie)

**Exceptions :**
• Produits personnalisés ou gravés
• Articles en promotion spécifique
• Bijoux pour raisons d'hygiène (sauf défaut)

**Échange :**
Échange gratuit en cas d'erreur de notre part ou de défaut produit. Pour un changement de taille/couleur, les frais de renvoi sont à votre charge.

**Garantie :**
• Garantie légale de conformité : 2 ans
• Garantie contre les vices cachés
• Garantie constructeur spécifique selon produits`,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      id: "propriete-intellectuelle",
      icon: Copyright,
      title: "7. Droits d'Auteur et Propriété Intellectuelle",
      content: `Tous les éléments présents sur IhamBaobab.com sont protégés par les droits de propriété intellectuelle.

**Propriété du site :**
• Le site, sa structure, son design et son contenu sont la propriété exclusive d'IhamBaobab SARL
• Toute reproduction, même partielle, est interdite sans autorisation écrite
• Les marques, logos et signes distinctifs sont déposés

**Contenu protégé :**
• **Textes** : descriptions, articles, guides d'utilisation
• **Images** : photographies de produits, illustrations, bannières
• **Vidéos** : présentations produits, tutoriels
• **Base de données** : catalogue produits, avis clients
• **Code informatique** : architecture, fonctionnalités, algorithmes

**Droits des artisans partenaires :**
• Les créations artisanales conservent leurs droits d'auteur originaux
• IhamBaobab dispose d'une licence d'exploitation commerciale
• Les techniques traditionnelles sont respectées et valorisées
• Attribution appropriée des créateurs pour chaque produit

**Utilisation autorisée :**
Vous pouvez uniquement :
• Consulter le site pour votre usage personnel
• Imprimer des pages pour votre usage privé
• Partager des liens vers notre site (pas de copie du contenu)

**Signalement de violations :**
Si vous constatez une violation de nos droits, contactez legal@ihambaobab.com avec :
• Description détaillée de la violation
• Localisation du contenu concerné
• Vos coordonnées complètes
• Preuve de votre identité`,
      color: "from-red-500 to-red-600"
    },
    {
      id: "responsabilite",
      icon: AlertTriangle,
      title: "8. Limitation de Responsabilité",
      content: `IhamBaobab SARL met tout en œuvre pour assurer la fiabilité de ses services, mais certaines limitations s'appliquent.

**Disponibilité du service :**
• Nous ne garantissons pas un fonctionnement ininterrompu du site 24h/24
• Des maintenances programmées peuvent affecter l'accès temporairement
• Nous ne sommes pas responsables des pannes liées aux réseaux internet
• Un préavis sera donné pour les maintenances longues

**Exactitude des informations :**
• Nous nous efforçons de maintenir les informations à jour et exactes
• Les caractéristiques des produits artisanaux peuvent légèrement varier
• Les couleurs peuvent différer selon l'écran utilisé
• En cas d'erreur manifeste (prix, description), nous nous réservons le droit d'annuler la commande

**Limitation des dommages :**
Notre responsabilité est limitée au montant de la commande concernée. Nous ne sommes pas responsables des :
• Dommages indirects ou immatériels
• Pertes de profits ou d'exploitation
• Préjudices liés à l'utilisation des produits
• Dommages causés par des tiers (transporteur, etc.)

**Force majeure :**
Nous ne sommes pas responsables des retards ou défaillances dus à :
• Catastrophes naturelles
• Grèves, conflits sociaux
• Décisions gouvernementales
• Pannes informatiques majeures
• Guerre, terrorisme, épidémies

**Assurance :**
IhamBaobab dispose d'une assurance responsabilité civile professionnelle couvrant son activité commerciale.`,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "clause-non-responsabilite",
      icon: Scale,
      title: "9. Clause de Non-responsabilité",
      content: `Les informations fournies sur IhamBaobab.com sont données à titre indicatif et ne constituent pas un conseil professionnel.

**Nature des informations :**
• **Descriptions produits** : Basées sur les informations fournies par les artisans
• **Conseils d'entretien** : Recommandations générales, non exhaustives
• **Informations culturelles** : À caractère informatif et éducatif
• **Prix et disponibilité** : Susceptibles de modifications sans préavis

**Utilisation des produits :**
• Les produits sont destinés à l'usage normal prévu
• Lisez attentivement les instructions d'entretien fournies
• En cas de doute, contactez notre service client
• Certains produits peuvent ne pas convenir aux enfants de moins de 3 ans

**Conseils personnalisés :**
Pour des besoins spécifiques :
• Contactez notre équipe de conseillers produits
• Demandez l'avis d'un spécialiste si nécessaire
• Vérifiez la compatibilité avec vos contraintes personnelles

**Liens externes :**
• Notre site peut contenir des liens vers des sites tiers
• Nous ne sommes pas responsables du contenu de ces sites
• Ces liens sont fournis pour votre commodité uniquement
• Consultez les conditions d'utilisation de ces sites

**Évolution du service :**
• Nos services peuvent évoluer sans préavis
• Nouvelles fonctionnalités, modifications d'interface
• Nous nous efforçons d'améliorer continuellement votre expérience`,
      color: "from-teal-500 to-teal-600"
    },
    {
      id: "droit-applicable",
      icon: Globe,
      title: "10. Droit Applicable et Résolution des Conflits",
      content: `Les présentes conditions sont régies par le droit nigérien et les conventions internationales applicables.

**Droit applicable :**
• **Loi nationale** : République du Niger
• **Commerce électronique** : Loi nigérienne sur les télécommunications et le commerce électronique
• **Protection des données** : Loi nigérienne relative à la protection des données personnelles
• **Conventions internationales** : Convention de Vienne sur la vente internationale

**Médiation et conciliation :**
En cas de différend, nous privilégions la résolution amiable :

**1. Contact direct :**
• Service client : support@ihambaobab.com
• Téléphone : +227 87 72 75 01
• Délai de réponse : 48h maximum

**2. Médiation :**
• Recours possible à un médiateur agréé
• Médiation de la consommation du Niger
• Processus gratuit pour le consommateur
• Durée maximale : 90 jours

**3. Tribunal compétent :**
En cas d'échec de la médiation :
• **Consommateurs résidant au Niger** : Tribunal de Commerce de Niamey
• **Professionnels** : Tribunal de Commerce de Niamey
• **Résidents étrangers** : Tribunal de Commerce de Niamey ou juridiction du pays de résidence selon conventions

**Langue :**
• Les présentes conditions sont rédigées en français
• En cas de traduction, la version française fait foi
• Tous les échanges se font en français

**Modifications :**
• Toute modification sera notifiée 30 jours à l'avance
• Les nouvelles conditions s'appliquent aux commandes futures
• Votre droit de résiliation demeure pour refus des modifications

Date d'entrée en vigueur : 1er janvier 2024
Version : 3.2`,
      color: "from-pink-500 to-pink-600"
    }
  ];

  const companyInfo = {
    name: "IhamBaobab SARL",
    address: "Quartier Bobiel, Niamey, Niger",
    phone: "+227 87 72 75 01",
    email: "contact@ihambaobab.com",
    website: "https://ihambaobab.com",
    founded: "2023",
    employees: "15-50",
    capital: "5.000.000 FCFA"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#30A08B] via-[#2D9679] to-[#B2905F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <Scale className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Informations Légales
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Retrouvez toutes les informations légales, conditions générales de vente, 
              mentions légales et politiques qui régissent l&apos;utilisation d&apos;IhamBaobab.
            </p>
            <div className="text-sm opacity-75">
              <p>Dernière mise à jour : 1er janvier 2024 • Version 3.2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-12">
          <div className="text-center mb-8">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-[#30A08B]" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#B17236] mb-4">
              IhamBaobab SARL
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Société spécialisée dans la valorisation et la commercialisation de l&apos;artisanat traditionnel nigérien
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Adresse", value: companyInfo.address },
              { icon: Phone, label: "Téléphone", value: companyInfo.phone },
              { icon: Mail, label: "Email", value: companyInfo.email },
              { icon: Globe, label: "Site web", value: companyInfo.website },
              { icon: Calendar, label: "Fondée en", value: companyInfo.founded },
              { icon: Users, label: "Équipe", value: `${companyInfo.employees} employés` },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 rounded-lg bg-[#30A08B]/10">
                  <item.icon className="w-5 h-5 text-[#30A08B]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                  <div className="font-medium text-gray-900">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Sections */}
        <div className="space-y-8">
          {legalSections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className={`h-2 bg-gradient-to-r ${section.color}`}></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} text-white flex-shrink-0`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#30A08B] mb-4">
                      {section.title}
                    </h2>
                  </div>
                </div>
                
                <div className="prose prose-gray max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-4">
                      {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                          {paragraph.slice(2, -2)}
                        </h3>
                      ) : paragraph.startsWith('•') ? (
                        <div className="ml-4 space-y-2">
                          {paragraph.split('\n').map((line, lIndex) => (
                            <div key={lIndex} className="flex items-start gap-2">
                              {line.startsWith('•') && (
                                <>
                                  <div className="w-2 h-2 bg-[#30A08B] rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700">{line.substring(2)}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph.split('**').map((part, partIndex) => 
                            partIndex % 2 === 1 ? (
                              <strong key={partIndex} className="font-semibold text-gray-900">
                                {part}
                              </strong>
                            ) : (
                              <span key={partIndex}>{part}</span>
                            )
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Confidentialité", desc: "Politique de protection des données", link: "/confidentialite" },
            { icon: HelpCircle, title: "Centre d'aide", desc: "Support et questions fréquentes", link: "/centre-aide" },
            { icon: MessageCircle, title: "Contact", desc: "Nous contacter directement", link: "/contact" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-[#30A08B]/10 group-hover:bg-[#30A08B] transition-colors">
                  <item.icon className="w-6 h-6 text-[#30A08B] group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#30A08B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Contact Footer */}
        <div className="mt-12 bg-gradient-to-r from-[#30A08B] to-[#B2905F] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Questions juridiques ?</h2>
          <p className="mb-6 opacity-90">
            Notre équipe juridique est disponible pour clarifier tous les aspects légaux
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:legal@ihambaobab.com"
              className="inline-flex items-center px-6 py-3 bg-white text-[#30A08B] rounded-lg font-semibold hover:bg-gray-100 transition-colors gap-2"
            >
              <Mail className="w-5 h-5" />
              legal@ihambaobab.com
            </a>
            <a
              href="tel:+22787727501"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors gap-2"
            >
              <Phone className="w-5 h-5" />
              +227 87 72 75 01
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationPage;