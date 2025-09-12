"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  CreditCard, 
  Truck, 
  Package, 
  Users,
  Search,
  Phone,
  Mail,
  MessageCircle,
  ShoppingBag,
  Clock,
  ArrowRight,
  Store,
  Shield,
  Star,
  Globe
} from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  icon: React.ComponentType<any>;
  popular: boolean;
}

const FrequementQuestion = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    {
      id: "marketplace-1",
      category: "Marketplace",
      question: "Comment fonctionne IhamBaobab en tant que marketplace ?",
      answer: "IhamBaobab est une marketplace qui connecte des milliers de vendeurs avec des acheteurs à travers le Niger :\n\n**Notre modèle :**\n• **Multiples boutiques** : Des milliers de vendeurs créent leurs boutiques sur notre plateforme\n• **Produits variés** : Artisanat traditionnel, produits locaux, services divers\n• **Paiement sécurisé** : Tous les paiements transitent par IhamBaobab pour votre sécurité\n• **Livraison coordonnée** : Nous gérons la logistique même pour des commandes multi-boutiques\n\n**Avantages pour vous :**\n• Un seul compte pour acheter chez tous les vendeurs\n• Protection des achats garantie\n• Support client unifié\n• Comparaison facile des prix et produits\n\n**Comment ça marche :** Parcourez les produits, ajoutez au panier depuis différentes boutiques, payez en une fois, et recevez vos commandes selon la disponibilité de chaque vendeur.",
      tags: ["marketplace", "boutiques", "vendeurs", "fonctionnement"],
      icon: Globe,
      popular: true
    },
    {
      id: "commande-multi-1",
      category: "Commandes",
      question: "Comment sont gérées les commandes provenant de plusieurs boutiques ?",
      answer: "Votre panier peut contenir des produits de différentes boutiques, voici comment nous gérons cela :\n\n**Système de commandes séparées :**\n• Votre panier se divise automatiquement par boutique au moment du paiement\n• Chaque boutique reçoit SA commande spécifique\n• Vous recevez un numéro de suivi pour chaque commande\n• Chaque vendeur traite sa partie de manière indépendante\n\n**Exemple concret :**\n• Produits de la Boutique A : Commande #001-A\n• Produits de la Boutique B : Commande #001-B\n• Produits de la Boutique C : Commande #001-C\n\n**Avantages :**\n• **Un seul paiement** pour toutes vos commandes\n• **Suivi individuel** de chaque commande\n• **Livraisons flexibles** selon la rapidité de chaque vendeur\n• **Support unifié** pour tous vos achats\n\n**Dans votre compte :** Vous voyez toutes vos commandes regroupées avec le détail par boutique.",
      tags: ["commandes", "multi-boutiques", "panier", "gestion"],
      icon: ShoppingBag,
      popular: true
    },
    {
      id: "paiement-1",
      category: "Paiement",
      question: "Comment fonctionne le système de paiement centralisé ?",
      answer: "Tous les paiements passent exclusivement par IhamBaobab pour garantir votre sécurité :\n\n**Modes de paiement acceptés :**\n• **Cartes bancaires** : Visa, MasterCard (SSL sécurisé)\n• **Mobile Money** : Orange Money, Airtel Money, Moov Money\n• **Paiement à la livraison** : Disponible à Niamey (frais 1000 FCFA)\n• **Virement bancaire** : Pour les gros montants\n\n**Sécurité renforcée :**\n• **Aucun paiement direct** aux vendeurs autorisé\n• **Fonds sécurisés** jusqu'à la livraison confirmée\n• **Protection acheteur** : Remboursement garanti en cas de problème\n• **Cryptage SSL** : Vos données bancaires protégées\n\n**Redistribution aux vendeurs :**\n• Les vendeurs reçoivent leur paiement après livraison confirmée\n• IhamBaobab retient sa commission de service\n• Transparence totale sur les frais\n\n**Pourquoi ce système ?** Éviter les conflits, garantir la livraison, protéger acheteurs ET vendeurs.",
      tags: ["paiement", "sécurité", "centralisé", "protection"],
      icon: CreditCard,
      popular: true
    },
    {
      id: "livraison-1",
      category: "Livraison",
      question: "Comment sont organisées les livraisons multi-boutiques ?",
      answer: "Notre système de livraison s'adapte aux commandes provenant de plusieurs boutiques :\n\n**Options de livraison :**\n• **Livraison groupée** : Si les vendeurs sont dans la même zone (économique)\n• **Livraisons séparées** : Chaque boutique expédie indépendamment\n• **Livraison coordonnée** : Nous synchronisons quand possible\n\n**Zones et délais :**\n• **Niamey** : 24-48h par commande (2000 FCFA/boutique)\n• **Autres villes** : 3-5 jours (3500 FCFA/boutique)\n• **Zones rurales** : 5-7 jours (4500 FCFA/boutique)\n\n**Optimisation des frais :**\n• **Livraison gratuite** dès 50 000 FCFA au total\n• **Réduction** si plusieurs boutiques de la même zone\n• **Frais transparents** calculés automatiquement\n\n**Suivi avancé :**\n• Tracking séparé pour chaque commande\n• Notifications pour chaque livraison\n• Possibilité de livraison partielle\n\n**Express disponible** : Livraison rapide coordonnée à Niamey (supplément 4000 FCFA).",
      tags: ["livraison", "multi-boutiques", "coordination", "suivi"],
      icon: Truck,
      popular: true
    },
    {
      id: "vendeurs-1",
      category: "Vendeurs",
      question: "Comment IhamBaobab sélectionne et vérifie ses vendeurs ?",
      answer: "La qualité de notre marketplace repose sur une sélection rigoureuse des vendeurs :\n\n**Processus de validation :**\n• **Inscription** : Dossier complet avec pièces d'identité\n• **Vérification** : Contrôle des informations et références\n• **Évaluation** : Test de qualité des premiers produits\n• **Formation** : Accompagnement aux standards IhamBaobab\n\n**Critères de sélection :**\n• **Authenticité** : Produits genuins et de qualité\n• **Professionnalisme** : Respect des délais et service client\n• **Réputation** : Avis positifs et historique clean\n• **Conformité** : Respect des lois et régulations\n\n**Suivi continu :**\n• **Évaluations clients** : Note moyenne maintenue > 4/5\n• **Contrôles qualité** : Audits réguliers des produits\n• **Support dédié** : Accompagnement permanent\n• **Sanctions** : Suspension en cas de non-conformité\n\n**Garanties pour vous :**\n• Tous nos vendeurs sont certifiés IhamBaobab\n• Protection complète de vos achats\n• Médiation en cas de conflit\n• Remboursement garanti si problème",
      tags: ["vendeurs", "sélection", "qualité", "vérification"],
      icon: Store,
      popular: false
    },
    {
      id: "protection-1",
      category: "Protection",
      question: "Quelle protection ai-je en tant qu'acheteur sur la marketplace ?",
      answer: "IhamBaobab offre une protection complète à tous ses acheteurs :\n\n**Protection des paiements :**\n• **Fonds sécurisés** : Argent bloqué jusqu'à livraison confirmée\n• **Remboursement garanti** : 100% si produit non conforme\n• **Pas de paiement direct** : Aucun risque d'arnaque\n• **Assurance** : Couverture des achats jusqu'à 500 000 FCFA\n\n**Garanties produits :**\n• **30 jours de retour** : Remboursement ou échange\n• **Garantie authenticité** : Produits certifiés conformes\n• **Contrôle qualité** : Vérification avant expédition\n• **Service après-vente** : Support continu\n\n**Résolution de conflits :**\n• **Médiation gratuite** : Équipe dédiée aux litiges\n• **Processus rapide** : Résolution sous 48-72h\n• **Preuves acceptées** : Photos, vidéos, témoignages\n• **Décision finale** : IhamBaobab tranche en faveur du client si doute\n\n**Support prioritaire :**\n• Chat en direct 24/7\n• Numéro d'urgence dédié\n• Suivi personnalisé de chaque dossier\n• Escalation vers la direction si nécessaire",
      tags: ["protection", "garantie", "sécurité", "remboursement"],
      icon: Shield,
      popular: false
    },
    {
      id: "evaluation-1",
      category: "Évaluations",
      question: "Comment fonctionne le système d'évaluations et d'avis ?",
      answer: "Notre système d'évaluations garantit la transparence et aide vos décisions d'achat :\n\n**Système d'avis :**\n• **Avis vérifiés** : Seuls les acheteurs réels peuvent noter\n• **Note globale** : /5 étoiles par boutique et par produit\n• **Commentaires détaillés** : Expérience complète partagée\n• **Photos clients** : Images réelles des produits reçus\n\n**Critères d'évaluation :**\n• **Qualité du produit** : Conformité à la description\n• **Service client** : Réactivité et professionnalisme\n• **Livraison** : Respect des délais et état du colis\n• **Communication** : Clarté et disponibilité du vendeur\n\n**Fiabilité :**\n• **Modération active** : Suppression des faux avis\n• **Algorithme anti-fraude** : Détection des manipulations\n• **Historique complet** : Toutes les évaluations consultables\n• **Badges de qualité** : Reconnaissance des meilleurs vendeurs\n\n**Votre impact :**\n• Vos avis aident la communauté\n• Récompenses pour les évaluations utiles\n• Amélioration continue de la plateforme\n• Influence directe sur la sélection des vendeurs",
      tags: ["évaluations", "avis", "notes", "transparence"],
      icon: Star,
      popular: false
    },
    {
      id: "compte-1",
      category: "Compte",
      question: "Quels sont les avantages d'un compte IhamBaobab ?",
      answer: "Créer un compte IhamBaobab transforme votre expérience d'achat sur la marketplace :\n\n**Gestion centralisée :**\n• **Toutes vos commandes** : Historique complet multi-boutiques\n• **Suivi unifié** : Toutes vos livraisons en un endroit\n• **Adresses sauvegardées** : Livraison rapide à vos adresses habituelles\n• **Moyens de paiement** : Cartes enregistrées en sécurité\n\n**Programme de fidélité :**\n• **Points IhamBaobab** : 1 point = 10 FCFA sur tous vos achats\n• **Niveaux VIP** : Bronze, Argent, Or avec avantages croissants\n• **Cashback** : Jusqu'à 5% sur vos achats fréquents\n• **Offres exclusives** : Accès anticipé aux promotions\n\n**Services personnalisés :**\n• **Recommandations** : Produits suggérés selon vos goûts\n• **Alertes prix** : Notification de baisse sur vos favoris\n• **Liste de souhaits** : Sauvegarde multi-boutiques\n• **Support premium** : Service client prioritaire\n\n**Sécurité renforcée :**\n• **Authentification 2FA** : Protection maximale\n• **Historique des connexions** : Surveillance de votre compte\n• **Contrôle parental** : Options pour les familles",
      tags: ["compte", "fidélité", "avantages", "personnalisation"],
      icon: Users,
      popular: false
    },
    {
      id: "retour-1",
      category: "Retours",
      question: "Comment gérez-vous les retours sur une marketplace multi-vendeurs ?",
      answer: "Notre système de retours est adapté à la complexité de notre marketplace :\n\n**Processus unifié :**\n• **Demande centralisée** : Toutes vos demandes via votre compte IhamBaobab\n• **Évaluation rapide** : Notre équipe statue sous 24h\n• **Médiation** : Nous gérons les échanges avec les vendeurs\n• **Solution garantie** : Remboursement ou échange assuré\n\n**Délais et conditions :**\n• **30 jours** pour initier un retour\n• **État neuf** : Produit non utilisé avec emballage\n• **Exceptions** : Produits personnalisés (sauf défaut)\n• **Preuves** : Photos requises pour les réclamations\n\n**Prise en charge :**\n• **Frais de retour** : Pris en charge par IhamBaobab si défaut\n• **Étiquette gratuite** : Envoi d'une étiquette prépayée\n• **Collecte possible** : Service de collecte à domicile (Niamey)\n• **Traitement rapide** : Remboursement sous 7 jours\n\n**Protection maximale :**\n• **Remboursement garanti** : Même si le vendeur refuse\n• **Frais avancés** : IhamBaobab se charge de récupérer auprès du vendeur\n• **Pas de perte** : Votre satisfaction avant tout\n• **Médiation professionnelle** : Résolution équitable des conflits",
      tags: ["retours", "remboursement", "médiation", "protection"],
      icon: Package,
      popular: false
    }
  ];

  const categories = ["all", "Marketplace", "Commandes", "Paiement", "Livraison", "Vendeurs", "Protection", "Évaluations", "Compte", "Retours"];
  
  const categoryIcons: { [key: string]: React.ComponentType<any> } = {
    "Marketplace": Globe,
    "Commandes": ShoppingBag,
    "Paiement": CreditCard,
    "Livraison": Truck,
    "Vendeurs": Store,
    "Protection": Shield,
    "Évaluations": Star,
    "Compte": Users,
    "Retours": Package
  };

  // Filter FAQ items based on search and category
  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Popular questions
  const popularFAQ = faqData.filter(item => item.popular);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#30A08B] via-[#2D9679] to-[#B2905F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Centre d'Aide IhamBaobab
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Découvrez comment profiter pleinement de notre marketplace qui connecte 
              des milliers de vendeurs avec des acheteurs à travers tout le Niger.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'aide... (ex: paiement, livraison, marketplace)"
                className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-6 h-6" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { number: "1000+", label: "Boutiques actives" },
                { number: "24/7", label: "Support disponible" },
                { number: "< 5min", label: "Temps de réponse" },
                { number: "98%", label: "Satisfaction client" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm opacity-75">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer par catégorie</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => {
              const IconComponent = category === "all" ? HelpCircle : categoryIcons[category] || Package;
              const count = category === "all" ? faqData.length : faqData.filter(item => item.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-[#30A08B] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category === "all" ? "Toutes" : category}</span>
                  <span className="text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Questions */}
        {searchQuery === "" && selectedCategory === "all" && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#B17236]">Questions les Plus Fréquentes</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {popularFAQ.map(item => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#30A08B]/10 flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#30A08B]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#30A08B]/10 text-[#30A08B] font-medium">
                          {item.category}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                          Populaire
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3 leading-snug">
                        {item.question}
                      </h3>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="inline-flex items-center gap-2 text-[#30A08B] hover:text-[#30A08B]/80 font-medium text-sm transition-colors"
                      >
                        Voir la réponse
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#B17236]">
              {searchQuery || selectedCategory !== "all" ? "Résultats de recherche" : "Toutes les questions"}
            </h2>
            <div className="text-sm text-gray-600">
              {filteredFAQ.length} question{filteredFAQ.length > 1 ? "s" : ""} trouvée{filteredFAQ.length > 1 ? "s" : ""}
            </div>
          </div>

          {filteredFAQ.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQ.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-[#30A08B]/10 flex-shrink-0">
                          <item.icon className="w-6 h-6 text-[#30A08B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#30A08B]/10 text-[#30A08B] font-medium">
                              {item.category}
                            </span>
                            {item.popular && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                                Populaire
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.question}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-400 flex-shrink-0 transform transition-transform duration-200 ${
                          expandedItems.includes(item.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedItems.includes(item.id) && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="ml-16 pl-4 border-l-2 border-[#30A08B]/20">
                        <div className="prose prose-gray max-w-none">
                          {item.answer.split('\n\n').map((paragraph, index) => (
                            <div key={index} className="mb-4">
                              {paragraph.startsWith('•') ? (
                                <div className="space-y-2">
                                  {paragraph.split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex} className="flex items-start gap-2">
                                      {line.startsWith('•') && (
                                        <>
                                          <div className="w-2 h-2 bg-[#30A08B] rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-gray-700">
                                            {line.substring(2).split('**').map((part, partIndex) => 
                                              partIndex % 2 === 1 ? (
                                                <strong key={partIndex} className="font-semibold text-gray-900">
                                                  {part}
                                                </strong>
                                              ) : (
                                                <span key={partIndex}>{part}</span>
                                              )
                                            )}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                                <h4 className="text-base font-semibold text-gray-900 mb-2 mt-4">
                                  {paragraph.slice(2, -2)}
                                </h4>
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
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Nous n&apos;avons pas trouvé de questions correspondant à votre recherche. 
                Essayez d&apos;autres mots-clés ou contactez notre support.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="inline-flex items-center px-6 py-3 bg-[#30A08B] text-white rounded-lg hover:bg-[#30A08B]/90 transition-colors"
              >
                Voir toutes les questions
              </button>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-[#30A08B] to-[#B2905F] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Une question spécifique ?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Notre équipe de support spécialisée marketplace est disponible 24/7 pour vous accompagner 
            dans tous vos achats multi-boutiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/centre-aide"
              className="inline-flex items-center px-6 py-3 bg-white text-[#30A08B] rounded-lg font-semibold hover:bg-gray-100 transition-colors gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Guide complet marketplace
            </Link>
            <a
              href="mailto:support@ihambaobab.com"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors gap-2"
            >
              <Mail className="w-5 h-5" />
              Support marketplace
            </a>
            <a
              href="tel:+22787727501"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors gap-2"
            >
              <Phone className="w-5 h-5" />
              +227 87 72 75 01
            </a>
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <Store className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-medium">Problème avec un vendeur ?</div>
                <div className="text-xs opacity-75">Notre médiation est gratuite</div>
              </div>
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-medium">Protection acheteur</div>
                <div className="text-xs opacity-75">Remboursement garanti</div>
              </div>
              <div>
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-medium">Chat en direct</div>
                <div className="text-xs opacity-75">Réponse instantanée</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequementQuestion;