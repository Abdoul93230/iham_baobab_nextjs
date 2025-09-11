"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ShoppingBag,
  CreditCard,
  User,
  Clock,
  Star,
  BarChart,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Truck,
  Shield,
  Gift,
  MapPin,
  Headphones,
  ArrowRight,
  ThumbsUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Article {
  title: string;
  content: string;
  tags: string[];
  category: string;
  type: string;
  lastUpdated: string;
  popularity: number;
  section?: string;
  relevanceScore?: number;
}

const ServicePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const filterOptions = {
    categories: ["Commandes", "Paiement", "Compte", "Livraison", "Produits", "Retours"],
    type: ["FAQ", "Guide", "Tutoriel", "Information"],
    importance: ["Essentiel", "Recommandé", "Optionnel"],
  };

  const sortOptions = [
    { id: "relevance", label: "Pertinence", icon: Star },
    { id: "recent", label: "Plus récent", icon: Clock },
    { id: "popular", label: "Plus populaire", icon: BarChart },
  ];

  // Déplacer helpData dans useMemo pour qu'il soit stable
  const helpData = useMemo(() => [
    {
      id: "commandes",
      title: "Gestion des Commandes",
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      articles: [
        {
          title: "Comment passer une commande ?",
          content: "Parcourez notre catalogue, ajoutez les produits souhaités au panier, puis suivez les étapes de commande. Un compte utilisateur facilite le processus.",
          tags: ["commander", "panier", "achat", "étapes"],
          category: "Commandes",
          type: "Guide",
          lastUpdated: "2024-01-15",
          popularity: 98,
        },
        {
          title: "Suivre ma commande en temps réel",
          content: "Connectez-vous à votre compte pour voir l'état de votre commande. Vous recevrez des notifications SMS et email à chaque étape : préparation, expédition, livraison.",
          tags: ["suivi", "commande", "tracking", "livraison", "notifications"],
          category: "Commandes",
          type: "FAQ",
          lastUpdated: "2024-01-15",
          popularity: 95,
        },
        {
          title: "Modifier ou annuler ma commande",
          content: "Les modifications sont possibles dans les 2h suivant la validation. Passé ce délai, contactez notre service client pour les commandes non expédiées.",
          tags: ["modifier", "annuler", "commande", "délai"],
          category: "Commandes",
          type: "Information",
          lastUpdated: "2024-01-14",
          popularity: 88,
        },
        {
          title: "Délais de traitement des commandes",
          content: "Nos commandes sont traitées sous 24h ouvrées. La préparation prend 1-2 jours selon la disponibilité des produits artisanaux.",
          tags: ["délai", "traitement", "préparation", "temps"],
          category: "Commandes",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 82,
        },
      ],
    },
    {
      id: "livraison",
      title: "Livraison & Expédition",
      icon: Truck,
      color: "from-green-500 to-green-600",
      articles: [
        {
          title: "Zones de livraison disponibles",
          content: "Nous livrons dans tout Niamey et les principales villes du Niger. Livraison internationale disponible sur demande pour certains produits.",
          tags: ["zone", "livraison", "Niamey", "Niger", "international"],
          category: "Livraison",
          type: "Information",
          lastUpdated: "2024-01-16",
          popularity: 92,
        },
        {
          title: "Délais et frais de livraison",
          content: "Niamey : 24-48h (2000 FCFA). Autres villes : 3-5 jours (3000 FCFA). Livraison gratuite dès 50000 FCFA d'achat.",
          tags: ["délai", "frais", "livraison", "gratuite", "prix"],
          category: "Livraison",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 89,
        },
        {
          title: "Que faire si je ne reçois pas ma commande ?",
          content: "Contactez-nous immédiatement si votre commande n'arrive pas dans les délais. Nous garantissons le remboursement ou un renvoi gratuit.",
          tags: ["retard", "problème", "livraison", "garantie"],
          category: "Livraison",
          type: "FAQ",
          lastUpdated: "2024-01-14",
          popularity: 76,
        },
      ],
    },
    {
      id: "paiement",
      title: "Paiement & Facturation",
      icon: CreditCard,
      color: "from-purple-500 to-purple-600",
      articles: [
        {
          title: "Moyens de paiement acceptés",
          content: "Carte bancaire (Visa, MasterCard), Mobile Money (Orange, Airtel, Moov), paiement à la livraison disponible à Niamey.",
          tags: ["paiement", "carte", "mobile money", "livraison"],
          category: "Paiement",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 94,
        },
        {
          title: "Sécurité des paiements en ligne",
          content: "Tous nos paiements sont sécurisés SSL. Nous ne stockons jamais vos données bancaires. Système de paiement certifié PCI-DSS.",
          tags: ["sécurité", "SSL", "protection", "données"],
          category: "Paiement",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 87,
        },
        {
          title: "Problème lors du paiement",
          content: "En cas d'échec de paiement, vérifiez vos informations bancaires, votre solde, ou contactez votre banque. Notre équipe peut vous aider.",
          tags: ["erreur", "échec", "paiement", "problème", "support"],
          category: "Paiement",
          type: "FAQ",
          lastUpdated: "2024-01-14",
          popularity: 85,
        },
      ],
    },
    {
      id: "compte",
      title: "Mon Compte",
      icon: User,
      color: "from-amber-500 to-amber-600",
      articles: [
        {
          title: "Créer et gérer mon compte",
          content: "Créez votre compte en 2 minutes avec votre email. Accédez à votre historique, gérez vos adresses et suivez vos commandes facilement.",
          tags: ["compte", "inscription", "gestion", "profil"],
          category: "Compte",
          type: "Guide",
          lastUpdated: "2024-01-15",
          popularity: 96,
        },
        {
          title: "Récupérer mon mot de passe",
          content: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Vous recevrez un lien de réinitialisation par email sous 5 minutes.",
          tags: ["mot de passe", "oublié", "récupérer", "reset"],
          category: "Compte",
          type: "FAQ",
          lastUpdated: "2024-01-13",
          popularity: 89,
        },
        {
          title: "Modifier mes informations personnelles",
          content: "Connectez-vous à votre compte, allez dans 'Mon Profil' pour modifier vos informations, adresses de livraison et préférences.",
          tags: ["profil", "modifier", "informations", "adresse"],
          category: "Compte",
          type: "Guide",
          lastUpdated: "2024-01-12",
          popularity: 78,
        },
      ],
    },
    {
      id: "produits",
      title: "Produits & Qualité",
      icon: Gift,
      color: "from-red-500 to-red-600",
      articles: [
        {
          title: "Origine et authenticité de nos produits",
          content: "Tous nos produits sont fabriqués par des artisans locaux du Niger. Chaque pièce est unique et certifiée authentique avec traçabilité complète.",
          tags: ["origine", "authenticité", "artisan", "Niger", "qualité"],
          category: "Produits",
          type: "Information",
          lastUpdated: "2024-01-16",
          popularity: 93,
        },
        {
          title: "Guide des tailles et mesures",
          content: "Consultez notre guide détaillé des tailles pour chaque type de produit. En cas de doute, contactez-nous pour des conseils personnalisés.",
          tags: ["taille", "mesure", "guide", "conseil"],
          category: "Produits",
          type: "Guide",
          lastUpdated: "2024-01-14",
          popularity: 81,
        },
        {
          title: "Entretien et conservation",
          content: "Instructions d'entretien spécifiques pour chaque matériau : cuir, textile, bois, métal. Prolongez la durée de vie de vos produits artisanaux.",
          tags: ["entretien", "conservation", "matériau", "durée"],
          category: "Produits",
          type: "Guide",
          lastUpdated: "2024-01-13",
          popularity: 74,
        },
      ],
    },
    {
      id: "retours",
      title: "Retours & Remboursements",
      icon: Shield,
      color: "from-teal-500 to-teal-600",
      articles: [
        {
          title: "Politique de retour 30 jours",
          content: "Retour gratuit sous 30 jours si vous n'êtes pas satisfait. Produit dans son état d'origine avec emballage. Remboursement sous 7 jours.",
          tags: ["retour", "30 jours", "remboursement", "politique"],
          category: "Retours",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 90,
        },
        {
          title: "Comment retourner un produit ?",
          content: "Contactez notre service client pour obtenir une étiquette de retour gratuite. Emballez le produit et envoyez-le à l'adresse indiquée.",
          tags: ["retourner", "étiquette", "emballage", "procédure"],
          category: "Retours",
          type: "Guide",
          lastUpdated: "2024-01-14",
          popularity: 83,
        },
        {
          title: "Échange et remplacnement",
          content: "Échange gratuit en cas de défaut ou d'erreur de notre part. Pour un changement de taille ou couleur, frais de port à votre charge.",
          tags: ["échange", "remplacement", "défaut", "erreur"],
          category: "Retours",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 77,
        },
      ],
    },
  ], []);

  // Utiliser useCallback pour stabiliser la fonction
  const searchAndFilterContent = useCallback((query: string, filters: string[], sortType: string, category: string) => {
    const results: Article[] = [];
    const searchTerm = query.toLowerCase();

    helpData.forEach((section) => {
      section.articles.forEach((article) => {
        let score = 0;
        let matches = false;

        if (searchTerm) {
          if (article.title.toLowerCase().includes(searchTerm)) score += 3;
          if (article.content.toLowerCase().includes(searchTerm)) score += 1;
          if (article.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
            score += 2;
          matches = score > 0;
        } else {
          matches = true;
        }

        if (category !== "all") {
          matches = matches && article.category === category;
        }

        if (matches) {
          results.push({
            ...article,
            relevanceScore: score,
            section: section.title,
          });
        }
      });
    });

    switch (sortType) {
      case "recent":
        results.sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        break;
      case "popular":
        results.sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        if (searchTerm) {
          results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        } else {
          results.sort((a, b) => b.popularity - a.popularity);
        }
    }

    return results;
  }, [helpData]);

  // Maintenant le useEffect ne se déclenche que quand les dépendances changent vraiment
  useEffect(() => {
    const results = searchAndFilterContent(
      searchQuery,
      activeFilters,
      sortBy,
      selectedCategory
    );
    setSearchResults(results);
  }, [searchQuery, activeFilters, sortBy, selectedCategory, searchAndFilterContent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#30A08B] via-[#2D9679] to-[#B2905F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-8">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Centre d&apos;Aide IhamBaobab
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Trouvez rapidement des réponses à toutes vos questions. Notre équipe est là pour vous accompagner dans votre expérience d&apos;achat.
            </p>
          </div>

          {/* Search Section */}
          <div id="search-container" className="relative max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Rechercher une réponse... (ex: suivre ma commande)"
                  className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-300 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-16 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-6 h-6" />
              </div>

              <button
                onClick={() => setIsSearchFocused(!isSearchFocused)}
                className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 text-white"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtres</span>
              </button>
            </div>

            {/* Search Results Panel */}
            {isSearchFocused && (
              <div className="absolute w-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] flex flex-col">
                {/* Filters Header */}
                <div className="border-b border-gray-100 p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-[#B17236] font-semibold text-lg">Filtres & Tri</h3>
                    {(selectedCategory !== "all" || searchQuery) && (
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSearchQuery("");
                        }}
                        className="text-sm text-gray-500 hover:text-[#30A08B] transition-colors self-start sm:self-auto"
                      >
                        Réinitialiser tout
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mt-4 mb-4">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedCategory === "all"
                          ? "bg-[#30A08B] text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Toutes les catégories
                    </button>
                    {filterOptions.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedCategory === category
                            ? "bg-[#30A08B] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Sort Options */}
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          sortBy === option.id
                            ? "bg-[#30A08B] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      <div className="p-4 bg-gray-50 border-b">
                        <p className="text-sm text-gray-600">
                          <strong>{searchResults.length}</strong> résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                          {searchQuery && (
                            <span> pour &quot;<strong>{searchQuery}</strong>&quot;</span>
                          )}
                        </p>
                      </div>
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#30A08B]/10 text-[#30A08B] font-medium">
                                  {result.category}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600">
                                  {result.type}
                                </span>
                                <span className="flex items-center text-xs text-gray-500">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {result.popularity}%
                                </span>
                              </div>
                              <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                                {result.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                {result.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(result.lastUpdated).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {result.section}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2 font-medium">Aucun résultat trouvé</p>
                      <p className="text-sm mb-6">
                        Essayez de modifier vos critères de recherche ou parcourez nos catégories ci-dessous
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setIsSearchFocused(false);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-[#30A08B] text-white rounded-lg hover:bg-[#30A08B]/90 transition-colors"
                      >
                        Parcourir toutes les catégories
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-12 max-w-4xl mx-auto">
            {[
              { number: "24/7", label: "Support disponible" },
              { number: "2min", label: "Temps de réponse moyen" },
              { number: "98%", label: "Clients satisfaits" },
              { number: "500+", label: "Questions résolues" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm sm:text-base opacity-75">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpData.map((section) => (
            <div key={section.id} className="group">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === section.id ? null : section.id)
                }
                className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105"
              >
                <div className={`h-2 bg-gradient-to-r ${section.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} text-white`}>
                      <section.icon className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {section.articles.length} article{section.articles.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Cliquez pour explorer
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                        expandedSection === section.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded Articles */}
              {expandedSection === section.id && (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  {section.articles.map((article, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#30A08B] hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-[#30A08B] flex-1 pr-4">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{article.popularity}%</span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {article.content}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{article.tags.length - 3} autres
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(article.lastUpdated).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100">
          <div className="text-center mb-12">
            <Headphones className="w-16 h-16 mx-auto mb-6 text-[#30A08B]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B17236] mb-4">
              Besoin d&apos;une aide personnalisée ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Notre équipe d&apos;experts est disponible 24/7 pour répondre à toutes vos questions 
              et vous accompagner dans votre expérience IhamBaobab
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: "Appelez-nous",
                info: "+227 87 72 75 01",
                desc: "Support téléphonique immédiat",
                color: "from-green-500 to-green-600",
                action: "tel:+22787727501"
              },
              {
                icon: Mail,
                title: "Écrivez-nous",
                info: "support@ihambaobab.com",
                desc: "Réponse garantie sous 2h",
                color: "from-blue-500 to-blue-600",
                action: "mailto:support@ihambaobab.com"
              },
              {
                icon: MessageCircle,
                title: "Chat en direct",
                info: "Démarrer une conversation",
                desc: "Assistance en temps réel",
                color: "from-purple-500 to-purple-600",
                action: "/messagerie"
              },
            ].map((contact, index) => (
              <Link
                key={index}
                href={contact.action}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden hover:scale-105"
              >
                <div className={`h-2 bg-gradient-to-r ${contact.color}`}></div>
                <div className="p-6">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${contact.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <contact.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#B17236] mb-3 group-hover:text-[#30A08B] transition-colors">
                    {contact.title}
                  </h3>
                  <p className="text-gray-600 mb-2 font-medium">
                    {contact.desc}
                  </p>
                  <p className="text-[#30A08B] font-semibold text-lg flex items-center gap-2">
                    {contact.info}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Vous pouvez également consulter nos ressources utiles :
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/faq"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ Complète
                </Link>
                <Link
                  href="/guide-utilisation"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Guide d&apos;utilisation
                </Link>
                <Link
                  href="/politique-retour"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Politique de retour
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;