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
  ArrowRight
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
      id: "paiement-1",
      category: "Paiement",
      question: "Quels sont les modes de paiement acceptés sur votre site ?",
      answer: "Nous acceptons plusieurs modes de paiement pour votre convenance :\n\n• **Cartes bancaires** : Visa, MasterCard (paiement sécurisé SSL)\n• **Mobile Money** : Orange Money, Airtel Money, Moov Money\n• **Paiement à la livraison** : Disponible uniquement à Niamey (frais de 1000 FCFA)\n• **Virement bancaire** : Pour les commandes importantes (sur demande)\n\nTous nos paiements en ligne sont sécurisés et cryptés. Vos données bancaires ne sont jamais stockées sur nos serveurs.",
      tags: ["paiement", "carte", "mobile money", "sécurité"],
      icon: CreditCard,
      popular: true
    },
    {
      id: "livraison-1",
      category: "Livraison",
      question: "Quelle est la politique de livraison et combien de temps cela prendra-t-il ?",
      answer: "Notre service de livraison couvre tout le Niger avec des options flexibles :\n\n**Zones de livraison :**\n• **Niamey** : Livraison en 24-48h (2000 FCFA)\n• **Autres villes principales** : 3-5 jours ouvrés (3500 FCFA)\n• **Zones rurales** : 5-7 jours ouvrés (4500 FCFA)\n• **Livraison gratuite** : Dès 50 000 FCFA d'achat\n\n**Suivi en temps réel :**\n• Notification SMS à chaque étape\n• Tracking en ligne via votre compte\n• Contact direct avec le livreur\n\n**Livraison express disponible** à Niamey (4h-8h) pour 4000 FCFA supplémentaires.",
      tags: ["livraison", "délai", "suivi", "zones"],
      icon: Truck,
      popular: true
    },
    {
      id: "commande-1",
      category: "Commandes",
      question: "Puis-je suivre ma commande en ligne ?",
      answer: "Oui ! Le suivi de commande est entièrement intégré à notre plateforme :\n\n**Étapes du suivi :**\n1. **Confirmée** : Commande validée et en préparation\n2. **Préparée** : Produits emballés et prêts\n3. **Expédiée** : En route vers vous\n4. **En livraison** : Le livreur se dirige vers vous\n5. **Livrée** : Réception confirmée\n\n**Comment suivre :**\n• Connectez-vous à votre compte IhamBaobab\n• Cliquez sur 'Mes Commandes'\n• Sélectionnez votre commande pour voir le détail\n• Recevez des notifications automatiques par SMS et email\n\n**Numéro de tracking** fourni dès l'expédition pour un suivi précis.",
      tags: ["suivi", "tracking", "commande", "statut"],
      icon: Package,
      popular: true
    },
    {
      id: "grossiste-1",
      category: "Ventes",
      question: "Proposez-vous des remises pour les achats en gros ?",
      answer: "Absolument ! Nous encourageons les achats en gros avec des tarifs préférentiels :\n\n**Barème de remises :**\n• **50 000 - 100 000 FCFA** : 5% de remise + livraison gratuite\n• **100 000 - 250 000 FCFA** : 8% de remise + priorité de livraison\n• **250 000 - 500 000 FCFA** : 12% de remise + service client dédié\n• **Plus de 500 000 FCFA** : 15% de remise + conditions sur mesure\n\n**Avantages grossistes :**\n• Compte professionnel avec tarifs spéciaux\n• Paiement échelonné possible\n• Catalogue dédié avec produits exclusifs\n• Support commercial personnalisé\n\n**Contact :** Appelez-nous au +227 87 72 75 01 pour discuter de vos besoins spécifiques.",
      tags: ["grossiste", "remise", "professionnel", "tarifs"],
      icon: Users,
      popular: false
    },
    {
      id: "produits-1",
      category: "Produits",
      question: "D'où viennent vos produits artisanaux ?",
      answer: "Tous nos produits sont 100% authentiques et proviennent directement d'artisans locaux du Niger :\n\n**Régions partenaires :**\n• **Niamey** : Bijoux traditionnels, maroquinerie\n• **Agadez** : Artisanat touareg, travail du cuir et métal\n• **Zinder** : Textiles, teintures naturelles\n• **Tillabéri** : Poterie, vannerie\n• **Dosso** : Sculpture sur bois, instruments de musique\n\n**Garantie d'authenticité :**\n• Traçabilité complète de chaque produit\n• Certificat d'origine fourni\n• Commerce équitable : 70% du prix revient à l'artisan\n• Contrôle qualité rigoureux avant expédition\n\n**Impact social :** Chaque achat soutient directement les communautés d'artisans et préserve les savoir-faire traditionnels.",
      tags: ["origine", "artisans", "authentique", "Niger"],
      icon: Package,
      popular: false
    },
    {
      id: "retour-1",
      category: "Retours",
      question: "Quelle est votre politique de retour ?",
      answer: "Nous offrons une politique de retour flexible et généreuse :\n\n**Délai de retour :** 30 jours calendaires après réception\n\n**Conditions :**\n• Produit en état neuf, avec emballage d'origine\n• Étiquettes et certificats d'authenticité présents\n• Aucune trace d'utilisation ou de dommage\n\n**Procédure simple :**\n1. Contactez notre service client (support@ihambaobab.com)\n2. Recevez une étiquette de retour gratuite\n3. Emballez le produit dans son carton d'origine\n4. Remboursement sous 7 jours après réception\n\n**Exceptions :** Produits personnalisés, bijoux gravés, articles en promotion (sauf défaut).\n\n**Échange gratuit** en cas de défaut ou d'erreur de notre part.",
      tags: ["retour", "échange", "remboursement", "politique"],
      icon: Package,
      popular: false
    },
    {
      id: "compte-1",
      category: "Compte",
      question: "Comment créer un compte et quels sont les avantages ?",
      answer: "Créer un compte IhamBaobab est gratuit et vous offre de nombreux avantages :\n\n**Création en 2 minutes :**\n• Inscription avec email et numéro de téléphone\n• Validation par SMS automatique\n• Accès immédiat à votre espace personnel\n\n**Avantages exclusifs :**\n• **Historique complet** de vos commandes\n• **Suivi en temps réel** de vos livraisons\n• **Adresses sauvegardées** pour commandes rapides\n• **Liste de souhaits** pour vos produits préférés\n• **Offres privilégiées** et ventes privées\n• **Programme de fidélité** : 1 point = 10 FCFA\n• **Support prioritaire** avec historique client\n\n**Sécurité :** Vos données sont protégées par cryptage SSL et conformes RGPD.\n\n**Suppression :** Vous pouvez supprimer votre compte à tout moment.",
      tags: ["compte", "inscription", "avantages", "fidélité"],
      icon: Users,
      popular: false
    },
    {
      id: "qualite-1",
      category: "Qualité",
      question: "Comment garantissez-vous la qualité de vos produits ?",
      answer: "La qualité est notre priorité absolue avec un processus de contrôle rigoureux :\n\n**Sélection des artisans :**\n• Partenariat avec des maîtres artisans reconnus\n• Audit de leurs ateliers et techniques\n• Formation continue aux standards de qualité\n• Certification des savoir-faire traditionnels\n\n**Contrôle qualité multi-étapes :**\n• **Matières premières** : Vérification de l'origine et de la qualité\n• **Fabrication** : Suivi de production avec contrôles intermédiaires\n• **Finition** : Inspection détaillée avant emballage\n• **Expédition** : Vérification finale et emballage protecteur\n\n**Garanties :**\n• **Garantie défaut** : Échange immédiat\n• **Garantie authenticité** : 100% artisanat traditionnel\n• **Garantie satisfaction** : Retour 30 jours\n\n**Certification :** Chaque produit est accompagné d'un certificat d'authenticité et de conseils d'entretien.",
      tags: ["qualité", "contrôle", "garantie", "artisan"],
      icon: Package,
      popular: false
    }
  ];

  const categories = ["all", "Paiement", "Livraison", "Commandes", "Produits", "Retours", "Compte", "Qualité"];
  
  const categoryIcons: { [key: string]: React.ComponentType<any> } = {
    "Paiement": CreditCard,
    "Livraison": Truck,
    "Commandes": ShoppingBag,
    "Produits": Package,
    "Retours": Package,
    "Compte": Users,
    "Qualité": Package
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
              Questions Fréquemment Posées
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Trouvez rapidement les réponses à toutes vos questions sur IhamBaobab. 
              Si vous ne trouvez pas ce que vous cherchez, notre équipe est là pour vous aider.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans les FAQ... (ex: paiement, livraison)"
                className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-6 h-6" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { number: `${faqData.length}+`, label: "Questions traitées" },
                { number: "24/7", label: "Support disponible" },
                { number: "< 5min", label: "Temps de réponse" },
                { number: "98%", label: "Problèmes résolus" },
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
              <h2 className="text-2xl font-bold text-[#B17236]">Questions Populaires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Notre équipe de support est disponible 24/7 pour répondre à toutes vos questions personnalisées
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/centre-aide"
              className="inline-flex items-center px-6 py-3 bg-white text-[#30A08B] rounded-lg font-semibold hover:bg-gray-100 transition-colors gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Centre d&apos;aide complet
            </Link>
            <a
              href="mailto:support@ihambaobab.com"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors gap-2"
            >
              <Mail className="w-5 h-5" />
              Nous contacter
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

export default FrequementQuestion;