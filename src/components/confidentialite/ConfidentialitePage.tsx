"use client";

import React from "react";
import { Shield, Lock, Eye, UserCheck, Clock, FileText, Globe, AlertTriangle,Phone,Scale,Mail } from "lucide-react";

const ConfidentialitePage = () => {
  const sections = [
    {
      id: "introduction",
      icon: Shield,
      title: "1. Introduction",
      content: `Bienvenue sur la politique de confidentialité d'IhamBaobab. Votre confiance est essentielle pour nous, c'est pourquoi nous nous engageons à protéger rigoureusement la confidentialité de vos données personnelles.

Cette politique explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre site web, nos services ou interagissez avec nous.`,
      color: "from-green-500 to-green-600"
    },
    {
      id: "donnees-collectees",
      icon: FileText,
      title: "2. Données personnelles collectées",
      content: `Nous collectons différents types d'informations pour vous offrir la meilleure expérience possible :

**Données d'identification :**
• Nom complet et prénom
• Adresse e-mail
• Numéro de téléphone
• Adresse postale complète

**Données de commande :**
• Historique des achats
• Préférences produits
• Panier d'achat
• Informations de livraison

**Données techniques :**
• Adresse IP et géolocalisation approximative
• Type de navigateur et système d'exploitation
• Pages visitées et temps passé sur le site
• Cookies et technologies similaires

**Données de paiement :**
• Informations de carte bancaire (cryptées et sécurisées)
• Historique des transactions
• Méthodes de paiement préférées`,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "finalites",
      icon: UserCheck,
      title: "3. Finalités de la collecte",
      content: `Vos données sont utilisées uniquement dans les buts suivants :

**Traitement des commandes :**
• Validation et traitement de vos achats
• Gestion de la livraison et du suivi
• Facturation et comptabilité
• Service après-vente

**Communication client :**
• Envoi de confirmations de commande
• Notifications de livraison
• Support client personnalisé
• Réponse à vos questions et réclamations

**Amélioration de nos services :**
• Analyse des préférences clients
• Optimisation de l'expérience utilisateur
• Développement de nouveaux produits
• Personnalisation des recommandations

**Marketing (avec votre consentement) :**
• Newsletter et offres spéciales
• Promotions personnalisées
• Invitations à des événements
• Sondages de satisfaction`,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "base-legale",
      icon: Scale,
      title: "4. Base légale du traitement",
      content: `Nous traitons vos données personnelles sur les bases légales suivantes :

**Consentement :**
• Newsletter et communications marketing
• Cookies non essentiels
• Géolocalisation précise

**Exécution contractuelle :**
• Traitement et livraison des commandes
• Service client
• Gestion du compte utilisateur

**Intérêt légitime :**
• Amélioration de nos services
• Sécurité du site web
• Analyses statistiques anonymisées

**Obligation légale :**
• Conservation des factures
• Déclarations fiscales
• Respect des réglementations commerciales`,
      color: "from-amber-500 to-amber-600"
    },
    {
      id: "conservation",
      icon: Clock,
      title: "5. Durée de conservation",
      content: `Nous conservons vos données pour les durées suivantes :

**Données de compte :**
• 3 ans après la dernière activité
• Suppression automatique après cette période
• Possibilité de suppression anticipée sur demande

**Données de commande :**
• 10 ans pour les obligations comptables
• Anonymisation des données après 3 ans
• Conservation des factures selon la réglementation

**Données marketing :**
• Jusqu'à retrait de votre consentement
• Nettoyage automatique des listes inactives
• Respect de votre droit à l'effacement

**Données techniques :**
• 13 mois maximum pour les cookies
• Logs de sécurité : 12 mois
• Statistiques anonymes : indéfiniment`,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "droits-utilisateur",
      icon: Eye,
      title: "6. Vos droits",
      content: `Conformément au RGPD et aux lois sur la protection des données, vous disposez des droits suivants :

**Droit d'accès :**
• Obtenir une copie de vos données
• Connaître l'utilisation qui en est faite
• Demander des clarifications

**Droit de rectification :**
• Corriger des données inexactes
• Compléter des informations manquantes
• Mettre à jour vos préférences

**Droit à l'effacement :**
• Demander la suppression de vos données
• "Droit à l'oubli" sous certaines conditions
• Suppression des données non nécessaires

**Droit à la portabilité :**
• Récupérer vos données dans un format standard
• Transférer vos données à un autre prestataire
• Export de votre historique d'achat

**Droit d'opposition :**
• Refuser le traitement à des fins marketing
• S'opposer au profilage commercial
• Retirer votre consentement à tout moment

Pour exercer ces droits, contactez-nous à : **contact@ihambaobab.com**`,
      color: "from-teal-500 to-teal-600"
    },
    {
      id: "securite",
      icon: Lock,
      title: "7. Sécurité des données",
      content: `Nous mettons en place des mesures de sécurité robustes pour protéger vos données :

**Chiffrement et protection :**
• Chiffrement SSL/TLS pour toutes les communications
• Cryptage des données sensibles en base
• Hachage sécurisé des mots de passe
• Tokens d'authentification sécurisés

**Accès et contrôle :**
• Accès limité aux données selon le principe du moindre privilège
• Authentification multi-facteurs pour les employés
• Journalisation de tous les accès aux données
• Audits de sécurité réguliers

**Infrastructure sécurisée :**
• Serveurs hébergés dans des centres de données certifiés
• Sauvegardes chiffrées et géo-répliquées
• Pare-feu et systèmes de détection d'intrusion
• Mise à jour régulière des systèmes de sécurité

**Formation et sensibilisation :**
• Formation régulière du personnel
• Procédures de sécurité documentées
• Tests de sécurité périodiques
• Plan de réponse aux incidents`,
      color: "from-red-500 to-red-600"
    },
    {
      id: "partage-donnees",
      icon: Globe,
      title: "8. Partage des données",
      content: `Nous ne vendons jamais vos données personnelles. Nous ne les partageons qu'avec :

**Prestataires de services essentiels :**
• Services de livraison (nom, adresse uniquement)
• Processeurs de paiement (données cryptées)
• Hébergeurs web sécurisés
• Services de support client

**Obligations légales :**
• Autorités compétentes sur demande judiciaire
• Respect des réglementations locales
• Protection contre la fraude
• Sécurité nationale si requis

**Transferts internationaux :**
• Uniquement vers des pays avec niveau de protection adéquat
• Clauses contractuelles types approuvées
• Garanties de protection équivalentes
• Transparent sur les destinataires

Tous nos partenaires sont contractuellement tenus de respecter la confidentialité de vos données et ne peuvent les utiliser que pour les services demandés.`,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      id: "mises-a-jour",
      icon: AlertTriangle,
      title: "9. Modifications de cette politique",
      content: `Cette politique de confidentialité peut évoluer pour refléter les changements dans nos pratiques ou la réglementation :

**Notification des changements :**
• Notification par e-mail pour les modifications importantes
• Mise en évidence des changements sur le site
• Conservation de l'historique des versions
• Délai de 30 jours avant application des changements majeurs

**Types de modifications :**
• Nouvelles fonctionnalités ou services
• Évolutions réglementaires
• Amélioration de la protection des données
• Clarifications ou précisions

**Votre contrôle :**
• Droit de refuser les nouvelles conditions
• Possibilité de fermer votre compte
• Conservation de vos droits acquis
• Contact direct pour toute question

Date de dernière mise à jour : 15 janvier 2024
Version : 2.1`,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "contact",
      icon: Phone,
      title: "10. Contact et réclamations",
      content: `Pour toute question concernant cette politique ou vos données personnelles :

**Délégué à la Protection des Données (DPO) :**
• E-mail : contact@ihambaobab.com
• Téléphone : +227 87 72 75 01
• Adresse : IhamBaobab SARL, Bobiel, Niamey, Niger

**Service Client :**
• Support général : support@ihambaobab.com
• Urgences : +227 87 72 75 01 (disponible 24/7)
• Chat en direct sur notre site web

**Autorité de contrôle :**
En cas de désaccord avec nos réponses, vous pouvez saisir l'autorité compétente de protection des données de votre pays de résidence.

**Temps de réponse :**
• Accusé de réception : 48h maximum
• Réponse complète : 30 jours maximum
• Urgences traitées en priorité
• Suivi personnalisé de votre demande`,
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#30A08B] via-[#2D9679] to-[#B2905F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16 lg:py-20 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Politique de Confidentialité
          </h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Votre confiance est notre priorité. Découvrez comment nous protégeons et respectons 
            vos données personnelles avec la plus grande transparence.
          </p>
          <div className="mt-8 text-sm opacity-75">
            <p>Dernière mise à jour : 15 janvier 2024 • Version 2.1</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Quick Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-12 border border-blue-100">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
            <FileText className="w-6 h-6" />
            Résumé Exécutif
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Ce que nous collectons :</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Informations de compte et de contact</li>
                <li>• Données de commande et de paiement</li>
                <li>• Préférences et historique d'achat</li>
                <li>• Données techniques de navigation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Vos droits principaux :</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Accès et rectification de vos données</li>
                <li>• Suppression et portabilité</li>
                <li>• Opposition au marketing</li>
                <li>• Contact : contact@ihambaobab.com</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
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
                        <div className="ml-4">
                          {paragraph.split('\n').map((line, lIndex) => (
                            <div key={lIndex} className="flex items-start gap-2 mb-2">
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

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#30A08B] to-[#B2905F] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Des questions sur vos données ?</h2>
          <p className="mb-6 opacity-90">
            Notre équipe de protection des données est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:contact@ihambaobab.com"
              className="inline-flex items-center px-6 py-3 bg-white text-[#30A08B] rounded-lg font-semibold hover:bg-gray-100 transition-colors gap-2"
            >
              <Mail className="w-5 h-5" />
              contact@ihambaobab.com
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

export default ConfidentialitePage;