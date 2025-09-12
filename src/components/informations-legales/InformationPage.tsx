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
  HelpCircle,
  Store,
  Package,
  Handshake
} from "lucide-react";
import Link from "next/link";

const InformationPage = () => {
  const legalSections = [
    {
      id: "mentions-legales",
      icon: Building2,
      title: "1. Mentions légales",
      content: `**Raison sociale             { icon: Calendar, label: "Fondée en", value: companyInfo.founded, color: "text-[#30A08B]" },
            { icon: Store, label: "Envergure", value: "Afrique & International", color: "text-[#B17236]" },
            { icon: Users, label: "Vendeurs", value: companyInfo.sellers, color: "text-[#30A08B]" }, IhamBaobab SARL
**Forme juridique :** Société à Responsabilité Limitée (SARL)
**Capital social :** 1 000 000 FCFA
**Siège social :** Niamey, République du Niger
**Numéro d'immatriculation :** [En cours d'enregistrement]
**Numéro fiscal :** [En cours d'attribution]
**Code APE/NAF :** 4791Z - Commerce électronique et marketplace

**Directeur de la publication :** Direction IhamBaobab
**Responsable éditorial :** Équipe IhamBaobab

**Contact de la plateforme :**
• Adresse postale : Niamey, Niger
• Téléphone : +227 87 72 75 01
• Email général : contact@ihambaobab.com
• Support technique : support@ihambaobab.com
• Site web : https://ihambaobab.com

**Nature de l'activité :**
IhamBaobab est une marketplace (place de marché électronique) panafricaine qui met en relation des vendeurs professionnels et particuliers à travers l'Afrique avec des acheteurs du monde entier pour la vente de produits variés incluant l'artisanat, la mode, l'électronique, les accessoires et bien d'autres catégories.

**Hébergement du site :**
• Hébergeur : Render
• Localisation des serveurs : Conforme aux réglementations internationales`,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "cgu",
      icon: FileText,
      title: "2. Conditions Générales d'Utilisation (CGU)",
      content: `En utilisant la marketplace IhamBaobab.com, vous acceptez les présentes conditions générales d'utilisation.

**Objet de la plateforme :**
IhamBaobab est une marketplace diversifiée d'envergure africaine proposant une large gamme de produits. Nous connectons des milliers de vendeurs et commerçants à travers l'Afrique avec des clients internationaux, facilitant ainsi la découverte et l'achat de produits variés dans de nombreuses catégories.

**Fonctionnement de la marketplace :**
• **Pour les acheteurs** : Parcourez les boutiques, comparez les produits, passez vos commandes
• **Pour les vendeurs** : Créez votre boutique, listez vos produits, gérez vos ventes
• **Paiements centralisés** : Tous les paiements transitent par notre plateforme sécurisée
• **Commandes multiples** : Votre panier peut contenir des produits de différentes boutiques

**Inscription et accès :**
• L'inscription est gratuite pour les acheteurs
• Les vendeurs s'inscrivent selon nos conditions marchands
• Vérification d'identité requise pour les transactions
• Accès réservé aux personnes majeures ou avec autorisation parentale

**Utilisation acceptable :**
Il est strictement interdit de :
• Vendre des produits illégaux ou contrefaits
• Utiliser la plateforme pour des activités frauduleuses
• Contourner notre système de paiement
• Créer de faux avis ou manipuler les évaluations
• Violer les droits de propriété intellectuelle

**Responsabilité des utilisateurs :**
• **Acheteurs** : Utilisation conforme des services, respect des vendeurs
• **Vendeurs** : Conformité des produits, respect des délais, service client
• **Tous** : Respect mutuel et des lois en vigueur`,
      color: "from-green-500 to-green-600"
    },
    {
      id: "politique-confidentialite",
      icon: Shield,
      title: "3. Politique de Confidentialité",
      content: `IhamBaobab s'engage à protéger la confidentialité de vos données personnelles conformément aux réglementations locales et internationales.

**Données collectées sur la marketplace :**
• **Utilisateurs** : Identité, coordonnées, pays de résidence, préférences de navigation
• **Acheteurs** : Historique de commandes, adresses de livraison internationales, moyens de paiement
• **Vendeurs** : Informations commerciales, données fiscales selon pays, performance des ventes
• **Navigation** : Cookies, logs de connexion, interactions avec la plateforme

**Utilisation des données :**
• Faciliter les transactions entre acheteurs et vendeurs africains et internationaux
• Traitement des paiements et commandes à l'échelle mondiale
• Prévention de la fraude et sécurisation des échanges internationaux
• Amélioration de l'expérience utilisateur multiculturelle
• Communication de service (notifications de commandes, alertes sécurité)
• Marketing personnalisé adapté aux régions (avec votre consentement)

**Partage des données :**
• **Entre utilisateurs** : Informations nécessaires aux transactions (nom, adresse de livraison internationale)
• **Partenaires de paiement** : Données nécessaires au traitement sécurisé multi-devises
• **Transporteurs internationaux** : Informations de livraison pour l'Afrique et le monde
• **Autorités** : Sur réquisition légale selon juridictions applicables

**Conservation des données :**
• Comptes actifs : Durée de vie du compte + 1 an
• Données de transaction : 10 ans (obligations comptables)
• Données marketing : Jusqu'à désinscription
• Données de prévention fraude : 5 ans maximum

**Vos droits :**
Contactez contact@ihambaobab.com pour exercer vos droits d'accès, rectification, effacement, portabilité et opposition.

**Sécurité :**
Chiffrement SSL/TLS, serveurs sécurisés, authentification multi-facteurs pour les transactions sensibles.`,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "politique-cookies",
      icon: Cookie,
      title: "4. Politique de Cookies",
      content: `Notre marketplace utilise des cookies pour optimiser votre expérience d'achat et de vente.

**Types de cookies utilisés :**

**Cookies essentiels de la marketplace :**
• Gestion du panier multi-boutiques
• Authentification des comptes acheteurs/vendeurs
• Sécurisation des sessions de paiement
• Préférences de langue et région
• Anti-fraude et protection des transactions

**Cookies de performance :**
• Analyse du parcours d'achat
• Optimisation des pages produits
• Mesure de performance des boutiques
• Statistiques de fréquentation par catégorie
• Amélioration des recommandations produits

**Cookies de personnalisation :**
• Recommandations basées sur vos intérêts
• Historique de navigation par catégories
• Produits favoris et listes de souhaits
• Alertes de prix et disponibilité
• Suggestions de boutiques similaires

**Cookies marketing :** (avec consentement)
• Publicités personnalisées pour acheteurs/vendeurs
• Remarketing pour produits consultés
• Campagnes promotionnelles ciblées
• Suivi des conversions et ventes
• Intégration réseaux sociaux

**Gestion des cookies :**
• Paramétrage via notre centre de préférences
• Acceptation/refus par catégorie
• Modification possible à tout moment
• Suppression via les paramètres du navigateur

**Cookies tiers marketplace :**
• Processeurs de paiement (sécurité)
• Services de livraison (suivi colis)
• Outils d'analyse (anonymisés)
• Réseaux sociaux (partage de produits)
• Services de chat client

**Durée de conservation :**
• Session : Supprimés à la fermeture du navigateur
• Fonctionnels : 12 mois maximum
• Marketing : 6 mois avec opt-out possible
• Analytiques : 24 mois anonymisés`,
      color: "from-amber-500 to-amber-600"
    },
    {
      id: "conditions-vente",
      icon: ShoppingCart,
      title: "5. Conditions Générales de Vente (CGV)",
      content: `Les présentes conditions régissent les ventes effectuées sur la marketplace IhamBaobab.com.

**Nature de la marketplace :**
IhamBaobab est un intermédiaire technique qui facilite les transactions entre vendeurs indépendants et acheteurs. Chaque vente constitue un contrat direct entre l'acheteur et le vendeur de la boutique concernée.

**Formation du contrat :**
• Le contrat de vente se forme entre l'acheteur et chaque vendeur individuellement
• Une commande peut inclure des produits de plusieurs boutiques
• Chaque boutique traite sa partie de commande de manière indépendante
• Confirmation de commande envoyée pour chaque boutique
• IhamBaobab facilite la transaction mais n'est pas vendeur

**Système de paiement centralisé :**
• **Tous les paiements transitent exclusivement par IhamBaobab**
• Sécurisation des transactions pour acheteurs et vendeurs
• Répartition automatique des montants aux boutiques concernées
• Rétention temporaire pour garantie de livraison
• Aucun paiement direct autorisé en dehors de la plateforme

**Prix et tarification :**
• Prix fixés librement par chaque boutique en FCFA TTC
• Frais de service IhamBaobab inclus dans le prix affiché
• Commission marketplace prélevée sur chaque vente
• Promotions et réductions à la discrétion des boutiques

**Gestion des commandes multi-boutiques :**
• Panier unifié mais commandes séparées par boutique
• Traitement indépendant par chaque vendeur
• Délais de livraison variables selon les boutiques
• Suivi individualisé pour chaque partie de commande
• Communication directe avec chaque boutique via la plateforme

**Livraison et frais de port :**
• **Frais calculés selon les politiques de chaque boutique**
• Facteurs : poids du produit, zone de livraison, distance
• Zones de livraison définies par chaque vendeur
• Tarifs transparents affichés avant validation
• Livraison gratuite selon conditions des boutiques
• Délais variables : Niger (24-48h), Afrique de l'Ouest (3-7j), autres pays africains (5-14j), international (10-30j)

**Disponibilité des produits :**
• Stock géré individuellement par chaque boutique
• Mise à jour en temps réel sur la plateforme
• Notification immédiate en cas de rupture
• Remboursement automatique si indisponible
• Possibilité de produit de remplacement selon le vendeur`,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "politique-retour",
      icon: RotateCcw,
      title: "6. Politique de Retour et Remboursement",
      content: `Notre politique de retour s'adapte au fonctionnement de marketplace tout en protégeant acheteurs et vendeurs.

**Principes généraux :**
• Chaque boutique définit sa propre politique de retour
• Délai minimum garanti : 14 jours (droit légal de rétractation)
• IhamBaobab assure l'intermédiation en cas de litige
• Remboursements toujours traités via la plateforme

**Délais de retour par boutique :**
• **Standard** : 14 jours minimum (délai légal)
• **Étendu** : Certaines boutiques offrent jusqu'à 30 jours
• **Personnalisé** : Produits sur-mesure selon conditions spécifiques
• **Affiché** : Politique clairement indiquée sur chaque fiche produit

**Procédure de retour centralisée :**
1. **Demande** : Via votre espace client sur la plateforme
2. **Évaluation** : IhamBaobab et la boutique examinent la demande
3. **Autorisation** : Numéro de retour (RMA) généré si accepté
4. **Expédition** : Étiquette de retour fournie selon les cas
5. **Inspection** : Réception et vérification du produit
6. **Remboursement** : Traitement via IhamBaobab sous 5-7 jours

**Conditions de retour :**
• **État neuf** : Produit non utilisé, emballage d'origine
• **Étiquettes** : Toutes les étiquettes et certificats conservés
• **Accessoires** : Tous les accessoires et documentation inclus
• **Preuve d'achat** : Facture IhamBaobab jointe

**Modalités de remboursement :**
• **Via IhamBaobab uniquement** : Même moyen de paiement utilisé
• **Mobile Money** : 24-48h
• **Carte bancaire** : 3-7 jours ouvrés
• **Frais de retour** : Selon la politique de la boutique et le motif
• **Erreur vendeur/défaut** : Frais pris en charge

**Exceptions par catégorie :**
• **Produits personnalisés** : Retour limité aux défauts
• **Hygiène personnelle** : Produits d'hygiène et de beauté
• **Périssables** : Produits alimentaires et à durée limitée
• **Promotions spéciales** : Conditions particulières selon l'offre

**Médiation IhamBaobab :**
En cas de désaccord entre acheteur et vendeur :
• Intervention de notre équipe de médiation
• Analyse équitable du cas avec preuves
• Décision finale si pas d'accord amiable
• Protection de la réputation des bonnes boutiques`,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      id: "propriete-intellectuelle",
      icon: Copyright,
      title: "7. Droits d'Auteur et Propriété Intellectuelle",
      content: `La marketplace IhamBaobab respecte et protège les droits de propriété intellectuelle de tous les acteurs.

**Propriété de la plateforme :**
• **Interface IhamBaobab** : Design, fonctionnalités, logo, marque
• **Technologie** : Code source, algorithmes, base de données
• **Contenu éditorial** : Descriptions, guides, contenus informatifs
• **Outils vendeurs** : Interfaces de gestion, tableaux de bord

**Droits des vendeurs sur leurs contenus :**
• **Produits** : Articles et descriptions produits
• **Photos** : Images de produits téléchargées par les vendeurs
• **Marques** : Noms de boutiques et identités commerciales
• **Propriété intellectuelle** : Droits sur leurs créations et contenus

**Licence d'exploitation :**
En utilisant IhamBaobab, les vendeurs accordent :
• Licence d'affichage sur la marketplace
• Droit de reproduction pour la promotion
• Utilisation dans les communications marketing (avec accord)
• Archivage pour historique des transactions

**Protection des produits et créations :**
• **Authenticité garantie** : Vérification de la conformité des produits
• **Attribution** : Mention des marques et origines des produits
• **Valorisation commerciale** : Respect des droits de propriété
• **Lutte contre la contrefaçon** : Signalement et retrait des copies

**Obligations des vendeurs :**
• **Originalité** : Ne vendre que des produits légitimes et conformes
• **Autorisation** : Avoir tous les droits sur les produits listés
• **Respect** : Ne pas utiliser d'images ou contenus piratés
• **Transparence** : Indiquer clairement l'origine et la nature des produits

**Signalement de violations :**
• **Contrefaçon** : Signalement via contact@ihambaobab.com
• **Vol de contenu** : Procédure de réclamation DMCA
• **Usurpation** : Protection des identités de marque
• **Procédure** : Retrait rapide des contenus litigieux

**Protection des acheteurs :**
• Garantie d'authenticité et de conformité des produits
• Traçabilité des produits et de leurs vendeurs
• Recours en cas de non-conformité aux descriptions
• Respect des normes et réglementations applicables`,
      color: "from-red-500 to-red-600"
    },
    {
      id: "responsabilite",
      icon: AlertTriangle,
      title: "8. Limitation de Responsabilité",
      content: `IhamBaobab, en tant qu'intermédiaire technique, définit clairement le périmètre de ses responsabilités.

**Rôle d'intermédiaire :**
• **Facilitation** : IhamBaobab facilite les transactions sans être vendeur
• **Plateforme technique** : Mise à disposition d'outils de vente/achat
• **Paiement sécurisé** : Traitement et sécurisation des transactions
• **Médiation** : Résolution des conflits entre utilisateurs

**Responsabilités d'IhamBaobab :**
• **Sécurité de la plateforme** : Protection des données et paiements
• **Disponibilité du service** : Maintenance et fonctionnement du site
• **Médiation équitable** : Traitement impartial des litiges
• **Respect de la réglementation** : Conformité aux lois applicables

**Responsabilités des vendeurs :**
• **Qualité des produits** : Conformité aux descriptions et photos
• **Légalité** : Respect des réglementations sur leurs produits
• **Délais de livraison** : Respect des engagements pris
• **Service après-vente** : Gestion des retours et réclamations

**Limitations de responsabilité d'IhamBaobab :**
• **Produits défectueux** : Responsabilité du vendeur
• **Retards de livraison** : Dus aux vendeurs ou transporteurs
• **Litiges commerciaux** : Entre acheteurs et vendeurs
• **Contenu des annonces** : Créé par les vendeurs

**Cas de force majeure :**
• **Pannes techniques** : Maintenance ou incidents serveurs
• **Catastrophes naturelles** : Impact sur les livraisons
• **Conflits sociaux** : Grèves affectant les services
• **Décisions gouvernementales** : Réglementations d'urgence

**Assurance et garanties :**
• **Assurance RC professionnelle** : Couverture de l'activité marketplace
• **Garantie paiement** : Protection des transactions via la plateforme
• **Fonds de garantie** : Protection des acheteurs en cas de défaillance vendeur
• **Médiation gratuite** : Service de résolution des conflits

**Limitation des dommages :**
La responsabilité d'IhamBaobab est limitée au montant de la transaction concernée. Sont exclus les dommages indirects, pertes de profits, ou préjudices liés à l'utilisation commerciale des produits achetés.`,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "clause-non-responsabilite",
      icon: Scale,
      title: "9. Clause de Non-responsabilité",
      content: `IhamBaobab fournit une plateforme de mise en relation et précise les limites de son intervention.

**Nature des informations :**
• **Descriptions produits** : Fournies par les vendeurs sous leur responsabilité
• **Photos et visuels** : Représentations non contractuelles, variations possibles
• **Prix et disponibilité** : Gérés par chaque boutique, susceptibles d'évoluer
• **Délais de livraison** : Estimations basées sur les déclarations vendeurs

**Responsabilité des vendeurs :**
• **Exactitude** : Les vendeurs garantissent l'exactitude de leurs annonces
• **Conformité** : Respect des réglementations sur leurs produits
• **Qualité** : Engagement sur la qualité des produits vendus
• **Service** : Prise en charge du service client pour leurs produits

**Variations des produits :**
• **Fabrication** : Certains produits peuvent présenter des variations
• **Matériaux** : Couleurs et textures peuvent différer selon les lots
• **Spécificités** : Chaque produit peut avoir ses particularités
• **Conformité** : Garantie de conformité générale mais variations d'aspect possibles

**Conseils et recommandations :**
• **Usage prévu** : Les vendeurs indiquent l'usage recommandé
• **Entretien** : Conseils fournis par les vendeurs
• **Spécificités** : Informations sur les caractéristiques des produits
• **Personnalisation** : Communication directe avec le vendeur via la plateforme

**Liens et services tiers :**
• **Transporteurs** : Services de livraison indépendants
• **Paiements** : Processeurs externes sécurisés
• **Réseaux sociaux** : Liens vers les boutiques des vendeurs
• **Services complémentaires** : Assurance, emballage cadeau selon disponibilité

**Évolution de la marketplace :**
• **Nouvelles fonctionnalités** : Amélioration continue des services
• **Politiques** : Adaptation selon l'évolution réglementaire
• **Boutiques** : Entrée et sortie libre des vendeurs de la plateforme
• **Catégories** : Extension possible à de nouvelles catégories de produits

**Recommandations aux utilisateurs :**
• **Vérification** : Consultez les évaluations et avis des autres acheteurs
• **Communication** : N'hésitez pas à contacter les vendeurs avant achat
• **Comparaison** : Comparez les offres de différentes boutiques
• **Signalement** : Signalez tout problème via support@ihambaobab.com`,
      color: "from-teal-500 to-teal-600"
    },
    {
      id: "droit-applicable",
      icon: Globe,
      title: "10. Droit Applicable et Résolution des Conflits",
      content: `Les relations sur la marketplace IhamBaobab sont régies par le droit nigérien et les principes du commerce électronique.

**Droit applicable :**
• **Loi nationale** : République du Niger (siège social)
• **Commerce électronique** : Réglementation nigérienne des TIC et standards internationaux
• **Protection des données** : Lois nigériennes et standards internationaux (RGPD compatible)
• **Relations commerciales** : Code du commerce et protection des consommateurs à l'échelle africaine

**Types de litiges et résolution :**

**1. Litiges Acheteur-Vendeur :**
• **Première étape** : Dialogue direct via la messagerie plateforme
• **Médiation IhamBaobab** : Intervention de notre équipe sous 48h
• **Expertise** : Évaluation technique si nécessaire (produits défectueux)
• **Arbitrage interne** : Décision finale d'IhamBaobab si pas d'accord

**2. Litiges avec la plateforme :**
• **Service client** : support@ihambaobab.com (réponse sous 24h)
• **Escalade** : Responsable juridique pour questions complexes
• **Médiation externe** : Recours aux instances nigériennes de médiation
• **Juridiction compétente** : Tribunaux de Niamey

**Procédure de médiation IhamBaobab :**
• **Saisine gratuite** : Accessible à tous les utilisateurs
• **Impartialité** : Évaluation objective des faits
• **Rapidité** : Résolution sous 7 jours maximum
• **Contraignante** : Décisions appliquées via contrôle des paiements

**Protection des utilisateurs :**
• **Acheteurs** : Garantie de remboursement via la plateforme
• **Vendeurs** : Protection contre les réclamations abusives
• **Données personnelles** : Respect strict de la confidentialité
• **Réputation** : Système d'évaluation équitable et transparente

**Sanctions et exclusions :**
• **Vendeurs** : Suspension/exclusion pour non-respect des conditions
• **Acheteurs** : Limitation d'accès pour usage abusif
• **Remboursement** : Traitement des soldes en cours avant exclusion
• **Appel** : Procédure de contestation des sanctions

**Juridictions compétentes :**
• **Consommateurs africains** : Tribunaux du pays de résidence ou tribunaux de Niamey selon choix
• **Professionnels** : Tribunal de commerce du siège social (Niamey) 
• **Utilisateurs internationaux** : Selon conventions internationales et accords bilatéraux
• **Arbitrage** : Centre d'arbitrage de Niamey ou arbitrage international selon montant du litige

**Évolution réglementaire :**
• **Adaptation** : Mise à jour selon l'évolution du droit nigérien et des standards africains/internationaux
• **Notification** : Information des utilisateurs 30 jours avant changements
• **Transition** : Période d'adaptation pour les nouvelles obligations
• **Formation** : Accompagnement des vendeurs africains sur les réglementations applicables

Date de dernière mise à jour : 15 janvier 2024
Version : 4.0 - Adaptation Marketplace
Révision prévue : Trimestrielle ou selon évolutions réglementaires`,
      color: "from-pink-500 to-pink-600"
    }
  ];

  const companyInfo = {
    name: "IhamBaobab SARL",
    address: "Niamey, République du Niger",
    phone: "+227 87 72 75 01",
    email: "contact@ihambaobab.com",
    website: "https://ihambaobab.com",
    founded: "2024",
    model: "Marketplace généraliste",
    sellers: "Milliers de vendeurs"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#30A08B] via-[#2D9679] to-[#B2905F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/5 rounded-full"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-8">
              <Scale className="w-16 h-16 opacity-90" />
              <Store className="w-12 h-12 opacity-75" />
              <Handshake className="w-14 h-14 opacity-80" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Informations Légales
            </h1>
            <p className="text-xl sm:text-2xl opacity-90 max-w-4xl mx-auto mb-8 leading-relaxed">
              Découvrez le cadre légal qui régit notre marketplace e-commerce africaine, 
              les droits et obligations des acheteurs et vendeurs, ainsi que nos 
              politiques de protection et de médiation à l'échelle internationale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm opacity-75">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Milliers de boutiques</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Paiements sécurisés</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Médiation gratuite</span>
              </div>
            </div>
            <div className="mt-6 text-sm opacity-75">
              <p>Dernière mise à jour : 15 janvier 2024 • Version 4.0 Marketplace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-12">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-3 mb-6">
              <div className="p-3 bg-[#30A08B]/10 rounded-2xl">
                <Building2 className="w-8 h-8 text-[#30A08B]" />
              </div>
              <div className="p-3 bg-[#B17236]/10 rounded-2xl">
                <Store className="w-8 h-8 text-[#B17236]" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#B17236] mb-4">
              IhamBaobab Marketplace
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              La marketplace africaine de référence multi-catégories. 
              Nous connectons des milliers de vendeurs talentueux à travers l'Afrique avec des clients du monde entier, 
              créant un écosystème commercial équitable et sécurisé.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, label: "Siège social", value: companyInfo.address, color: "text-[#30A08B]" },
              { icon: Phone, label: "Téléphone", value: companyInfo.phone, color: "text-[#B17236]" },
              { icon: Mail, label: "Email", value: companyInfo.email, color: "text-[#30A08B]" },
              { icon: Globe, label: "Site web", value: companyInfo.website, color: "text-[#B17236]" },
              { icon: Calendar, label: "Fondée en", value: companyInfo.founded, color: "text-[#30A08B]" },
              { icon: Store, label: "Modèle", value: companyInfo.model, color: "text-[#B17236]" },
              { icon: Users, label: "Vendeurs", value: companyInfo.sellers, color: "text-[#30A08B]" },
              { icon: CreditCard, label: "Paiements", value: "Centralisés & Sécurisés", color: "text-[#B17236]" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col gap-3 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className={`p-3 rounded-xl bg-gray-100 self-start ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{item.label}</div>
                  <div className="font-semibold text-gray-900 mt-1">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Marketplace Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#30A08B]/5 to-[#30A08B]/10 rounded-2xl">
              <Package className="w-12 h-12 text-[#30A08B] mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Multi-Boutiques Africaines</h3>
              <p className="text-gray-600 text-sm">
                Un panier, plusieurs boutiques à travers l'Afrique. Chaque commande est traitée individuellement par chaque vendeur.
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#B17236]/5 to-[#B17236]/10 rounded-2xl">
              <CreditCard className="w-12 h-12 text-[#B17236] mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Paiement Multi-Devises</h3>
              <p className="text-gray-600 text-sm">
                Paiements sécurisés en FCFA, USD, EUR et autres devises selon les pays des vendeurs.
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#30A08B]/5 to-[#30A08B]/10 rounded-2xl">
              <Handshake className="w-12 h-12 text-[#30A08B] mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Médiation Internationale</h3>
              <p className="text-gray-600 text-sm">
                Notre équipe multilingue intervient pour résoudre tout conflit entre acheteurs et vendeurs africains/internationaux.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Sections */}
        <div className="space-y-8">
          {legalSections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className={`h-2 bg-gradient-to-r ${section.color}`}></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${section.color} text-white flex-shrink-0 shadow-lg`}>
                    <section.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#30A08B] mb-2">
                      {section.title}
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#30A08B] to-[#B17236] rounded-full"></div>
                  </div>
                </div>
                
                <div className="prose prose-gray max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-6">
                      {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                        <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8 pb-2 border-b-2 border-[#30A08B]/20">
                          {paragraph.slice(2, -2)}
                        </h3>
                      ) : paragraph.startsWith('•') ? (
                        <div className="ml-6 space-y-3">
                          {paragraph.split('\n').map((line, lIndex) => (
                            <div key={lIndex}>
                              {line.startsWith('•') && (
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-[#30A08B] rounded-full mt-3 flex-shrink-0"></div>
                                  <span className="text-gray-700 leading-relaxed">{line.substring(2)}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-base">
                          {paragraph.split('**').map((part, partIndex) => 
                            partIndex % 2 === 1 ? (
                              <strong key={partIndex} className="font-semibold text-[#30A08B]">
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
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              icon: Shield, 
              title: "Centre de Confidentialité", 
              desc: "Gestion de vos données personnelles et préférences de confidentialité", 
              link: "/confidentialite",
              color: "from-purple-500 to-purple-600"
            },
            { 
              icon: HelpCircle, 
              title: "Centre d'Aide", 
              desc: "Support pour acheteurs et vendeurs, guides et questions fréquentes", 
              link: "/centre-aide",
              color: "from-blue-500 to-blue-600"
            },
            { 
              icon: MessageCircle, 
              title: "Support Marketplace", 
              desc: "Assistance technique et médiation pour tous vos besoins", 
              link: "/contact",
              color: "from-green-500 to-green-600"
            },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${item.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#30A08B] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Seller Resources */}
        <div className="mt-12 bg-gradient-to-r from-[#B17236]/5 via-white to-[#30A08B]/5 rounded-3xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <Store className="w-16 h-16 mx-auto mb-4 text-[#B17236]" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#B17236] mb-4">
              Ressources pour les Vendeurs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Guides, outils et support dédiés pour optimiser votre présence sur notre marketplace africaine
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, title: "Guide du Vendeur", desc: "Comment créer et gérer votre boutique" },
              { icon: CreditCard, title: "Politique de Paiement", desc: "Modalités et délais de versement" },
              { icon: Truck, title: "Gestion Livraison", desc: "Définir vos zones et tarifs" },
              { icon: Users, title: "Support Vendeurs", desc: "Assistance dédiée 7j/7" },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-white rounded-xl border border-gray-100 text-center hover:shadow-lg transition-all duration-300">
                <div className="p-3 bg-[#B17236]/10 rounded-lg w-fit mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-[#B17236]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Footer */}
        <div className="mt-16 bg-gradient-to-br from-[#30A08B] via-[#2D9679] to-[#B2905F] rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative text-center">
            <Scale className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Questions Légales ou Litiges ?</h2>
            <p className="mb-8 opacity-90 max-w-2xl mx-auto">
              Notre équipe juridique et de médiation multilingue est à votre disposition pour clarifier 
              tous les aspects légaux et résoudre amiablement tout conflit sur la marketplace, que vous soyez en Afrique ou à l'international.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:contact@ihambaobab.com"
                className="inline-flex items-center px-8 py-4 bg-white text-[#30A08B] rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 gap-3 shadow-lg hover:shadow-xl"
              >
                <Mail className="w-6 h-6" />
                contact@ihambaobab.com
              </a>
              <a
                href="mailto:support@ihambaobab.com"
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                Support Marketplace
              </a>
            </div>
            <div className="mt-6 text-sm opacity-75">
              <p>Médiation gratuite • Réponse sous 24h • Service 7j/7 • Support multilingue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationPage;