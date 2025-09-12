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
  Store,
  Users,
  Package,
  ShoppingCart,
} from "lucide-react";
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

  const filterOptions = {
    categories: ["Commandes", "Paiement", "Boutiques", "Compte", "Livraison", "Produits", "Retours", "Vendeurs"],
    type: ["FAQ", "Guide", "Tutoriel", "Information"],
    importance: ["Essentiel", "Recommandé", "Optionnel"],
  };

  const sortOptions = [
    { id: "relevance", label: "Pertinence", icon: Star },
    { id: "recent", label: "Plus récent", icon: Clock },
    { id: "popular", label: "Plus populaire", icon: BarChart },
  ];

  const helpData = useMemo(() => [
    {
      id: "commandes",
      title: "Gestion des Commandes",
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      articles: [
        {
          title: "Comment passer une commande sur la marketplace ?",
          content: "Explorez les produits de différentes boutiques, ajoutez-les à votre panier. Même si vous sélectionnez des produits de boutiques différentes, ils seront automatiquement regroupés par boutique lors de la commande. Chaque boutique traitera sa partie de commande individuellement.",
          tags: ["commander", "panier", "boutiques", "marketplace", "achat"],
          category: "Commandes",
          type: "Guide",
          lastUpdated: "2024-01-15",
          popularity: 98,
        },
        {
          title: "Suivre mes commandes multi-boutiques",
          content: "Connectez-vous pour voir toutes vos commandes. Si vous avez commandé dans plusieurs boutiques, vous verrez une commande séparée pour chaque boutique avec son propre suivi. Chaque vendeur gère sa propre expédition et vous recevrez des notifications pour chacune.",
          tags: ["suivi", "multi-boutiques", "tracking", "vendeurs", "notifications"],
          category: "Commandes",
          type: "FAQ",
          lastUpdated: "2024-01-15",
          popularity: 95,
        },
        {
          title: "Modifier ou annuler une commande marketplace",
          content: "Les modifications dépendent de chaque boutique. Généralement possible dans les 2h après validation. Si votre panier contient des produits de plusieurs boutiques, vous devrez contacter chaque vendeur séparément via notre système de messagerie intégré.",
          tags: ["modifier", "annuler", "commande", "vendeurs", "marketplace"],
          category: "Commandes",
          type: "Information",
          lastUpdated: "2024-01-14",
          popularity: 88,
        },
        {
          title: "Comprendre les délais par boutique",
          content: "Chaque boutique a ses propres délais de traitement (1-3 jours généralement). Si vous commandez dans plusieurs boutiques, vos colis arriveront séparément selon les délais de chaque vendeur. La plateforme coordonne mais chaque boutique expédie indépendamment.",
          tags: ["délai", "boutiques", "traitement", "vendeurs", "coordination"],
          category: "Commandes",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 82,
        },
      ],
    },
    {
      id: "boutiques",
      title: "Boutiques & Vendeurs",
      icon: Store,
      color: "from-indigo-500 to-indigo-600",
      articles: [
        {
          title: "Comment identifier une boutique fiable ?",
          content: "Vérifiez les évaluations des boutiques (étoiles), lisez les avis clients, regardez depuis quand la boutique est active. Les boutiques certifiées ont un badge spécial. Consultez les politiques de retour de chaque boutique avant d'acheter.",
          tags: ["fiabilité", "évaluations", "avis", "certification", "boutiques"],
          category: "Boutiques",
          type: "Guide",
          lastUpdated: "2024-01-16",
          popularity: 94,
        },
        {
          title: "Contacter un vendeur directement",
          content: "Utilisez le système de messagerie intégré sur chaque page produit ou boutique. Vos conversations sont sécurisées et archivées. Les vendeurs s'engagent à répondre sous 24h. En cas de non-réponse, contactez le support IhamBaobab.",
          tags: ["contact", "messagerie", "vendeur", "communication", "support"],
          category: "Boutiques",
          type: "FAQ",
          lastUpdated: "2024-01-15",
          popularity: 89,
        },
        {
          title: "Signaler un problème avec une boutique",
          content: "Utilisez le système de signalement sur la page boutique ou contactez le support. Nous médions les conflits entre acheteurs et vendeurs. En cas de problème grave, nous pouvons suspendre une boutique et protéger les acheteurs.",
          tags: ["signalement", "problème", "médiation", "protection", "conflit"],
          category: "Boutiques",
          type: "Information",
          lastUpdated: "2024-01-14",
          popularity: 85,
        },
        {
          title: "Politiques des boutiques individuelles",
          content: "Chaque boutique définit ses propres conditions (délais, retours, garanties). Ces informations sont affichées sur chaque page boutique. En cas de contradiction avec nos conditions générales, les règles de la plateforme prévalent pour la protection des acheteurs.",
          tags: ["politiques", "conditions", "boutiques", "règles", "protection"],
          category: "Boutiques",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 78,
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
          title: "Livraisons multiples : comment ça marche ?",
          content: "Si vous commandez dans plusieurs boutiques, vous recevrez plusieurs colis selon les délais de chaque vendeur. Niamey : 1-3 jours, autres villes : 2-7 jours selon la boutique. Frais calculés par boutique, optimisés quand possible.",
          tags: ["livraisons multiples", "colis", "délais", "frais", "boutiques"],
          category: "Livraison",
          type: "Guide",
          lastUpdated: "2024-01-16",
          popularity: 92,
        },
        {
          title: "Frais de livraison par boutique",
          content: "Chaque boutique fixe ses frais de livraison. Si vous commandez dans 3 boutiques, vous paierez 3 frais de livraison. Certaines boutiques offrent la livraison gratuite dès un certain montant. Regroupez vos achats par boutique pour économiser.",
          tags: ["frais", "livraison", "boutiques", "économies", "regroupement"],
          category: "Livraison",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 89,
        },
        {
          title: "Suivi des colis multiples",
          content: "Chaque colis de chaque boutique a son propre numéro de suivi. Vous recevez les informations de suivi par SMS/email pour chaque expédition. Consultez votre compte pour voir tous vos suivis en un seul endroit.",
          tags: ["suivi", "colis multiples", "numéros", "tracking", "compte"],
          category: "Livraison",
          type: "FAQ",
          lastUpdated: "2024-01-14",
          popularity: 87,
        },
        {
          title: "Problème avec une livraison spécifique",
          content: "Identifiez d'abord quelle boutique est concernée. Contactez le vendeur via la messagerie. Si pas de réponse sous 48h, le support IhamBaobab intervient. Nous garantissons la livraison ou le remboursement pour tous les achats sur la plateforme.",
          tags: ["problème", "livraison", "vendeur", "support", "garantie"],
          category: "Livraison",
          type: "FAQ",
          lastUpdated: "2024-01-13",
          popularity: 84,
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
          title: "Paiement sécurisé centralisé",
          content: "TOUS les paiements passent par IhamBaobab pour votre sécurité. Même si vous achetez dans plusieurs boutiques, un seul paiement sécurisé. Nous redistribuons ensuite aux vendeurs après livraison confirmée. Carte bancaire, Mobile Money (Orange, Airtel, Moov).",
          tags: ["paiement centralisé", "sécurité", "redistribution", "vendeurs", "mobile money"],
          category: "Paiement",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 96,
        },
        {
          title: "Protection des paiements marketplace",
          content: "Vos paiements sont bloqués jusqu'à confirmation de livraison. Si un vendeur ne livre pas ou si le produit ne correspond pas, remboursement automatique. Cette garantie s'applique à tous les vendeurs de la plateforme sans exception.",
          tags: ["protection", "remboursement", "garantie", "livraison", "sécurité"],
          category: "Paiement",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 94,
        },
        {
          title: "Facturation multi-boutiques",
          content: "Une seule facture IhamBaobab avec le détail par boutique. TVA et taxes gérées automatiquement. Pour les entreprises, possibilité de factures séparées par boutique si nécessaire pour la comptabilité.",
          tags: ["facturation", "TVA", "entreprises", "comptabilité", "détail"],
          category: "Paiement",
          type: "Information",
          lastUpdated: "2024-01-14",
          popularity: 87,
        },
        {
          title: "Problèmes de paiement et litiges",
          content: "En cas d'échec de paiement ou de litige avec un vendeur, le support IhamBaobab intervient immédiatement. Nous gérons tous les remboursements et conflits. Vos droits sont protégés même si le vendeur devient injoignable.",
          tags: ["litiges", "remboursements", "protection", "support", "conflits"],
          category: "Paiement",
          type: "FAQ",
          lastUpdated: "2024-01-13",
          popularity: 91,
        },
      ],
    },
    {
      id: "compte",
      title: "Mon Compte Acheteur",
      icon: User,
      color: "from-amber-500 to-amber-600",
      articles: [
        {
          title: "Tableau de bord unifié",
          content: "Votre compte centralise tous vos achats de toutes les boutiques. Historique complet, suivi des commandes, conversations avec les vendeurs, avis laissés, tout est regroupé pour une gestion simplifiée de votre expérience marketplace.",
          tags: ["tableau de bord", "centralisation", "historique", "conversations", "avis"],
          category: "Compte",
          type: "Guide",
          lastUpdated: "2024-01-15",
          popularity: 96,
        },
        {
          title: "Gérer mes adresses et préférences",
          content: "Sauvegardez plusieurs adresses de livraison. Configurez vos préférences par type de produit. Définissez vos boutiques favorites pour recevoir leurs nouveautés. Paramétrez vos notifications pour chaque type d'événement.",
          tags: ["adresses", "préférences", "boutiques favorites", "notifications", "configuration"],
          category: "Compte",
          type: "Guide",
          lastUpdated: "2024-01-14",
          popularity: 88,
        },
        {
          title: "Historique et évaluations",
          content: "Consultez tous vos achats par boutique et par période. Laissez des avis sur les produits ET les boutiques. Vos évaluations aident la communauté et améliorent la qualité de la marketplace. Système de points de fidélité basé sur vos achats.",
          tags: ["historique", "évaluations", "avis", "communauté", "fidélité"],
          category: "Compte",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 82,
        },
        {
          title: "Sécurité et confidentialité",
          content: "Authentification à deux facteurs disponible. Vos données personnelles ne sont jamais partagées avec les vendeurs (seulement les infos de livraison). Contrôlez qui peut voir vos avis et votre activité sur la plateforme.",
          tags: ["sécurité", "confidentialité", "authentification", "données", "contrôle"],
          category: "Compte",
          type: "Information",
          lastUpdated: "2024-01-12",
          popularity: 90,
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
          title: "Vérification de la qualité des produits",
          content: "IhamBaobab vérifie tous les vendeurs avant inscription. Système de notation produits et boutiques. Signalement rapide des contrefaçons. Chaque produit indique clairement sa boutique d'origine et ses certifications éventuelles.",
          tags: ["vérification", "qualité", "notation", "contrefaçons", "certifications"],
          category: "Produits",
          type: "Information",
          lastUpdated: "2024-01-16",
          popularity: 93,
        },
        {
          title: "Comparer les produits entre boutiques",
          content: "Utilisez nos outils de comparaison pour les produits similaires de différentes boutiques. Comparez prix, délais, évaluations boutiques, conditions de retour. Filtrez par localisation du vendeur pour optimiser les délais.",
          tags: ["comparaison", "prix", "délais", "évaluations", "localisation"],
          category: "Produits",
          type: "Guide",
          lastUpdated: "2024-01-15",
          popularity: 85,
        },
        {
          title: "Authenticité et origine des produits",
          content: "Chaque boutique certifie l'origine de ses produits. Labels 'Artisan Local Niger' pour les créations locales. Système de traçabilité pour les produits importés. Signalement communautaire des produits suspects avec vérification rapide.",
          tags: ["authenticité", "origine", "artisan local", "traçabilité", "signalement"],
          category: "Produits",
          type: "Information",
          lastUpdated: "2024-01-14",
          popularity: 88,
        },
        {
          title: "Garanties et conformité",
          content: "Garantie plateforme minimum 30 jours même si la boutique propose moins. Vérification de conformité pour les produits sensibles (alimentaire, cosmétique). Médiation automatique en cas de produit non-conforme.",
          tags: ["garanties", "conformité", "vérification", "médiation", "protection"],
          category: "Produits",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 87,
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
          title: "Politique de retour unifiée",
          content: "Retour possible 30 jours minimum sur tous les produits de toutes les boutiques. Si une boutique propose mieux, vous en bénéficiez. Retour gratuit en cas de défaut ou erreur vendeur. IhamBaobab gère tous les remboursements pour votre protection.",
          tags: ["retour unifié", "30 jours", "remboursement", "protection", "gratuit"],
          category: "Retours",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 92,
        },
        {
          title: "Processus de retour multi-boutiques",
          content: "Un seul formulaire pour tous vos retours. Sélectionnez les produits à retourner (même de boutiques différentes). Étiquettes de retour générées automatiquement. Remboursement central par IhamBaobab même si le vendeur refuse initialement.",
          tags: ["processus unifié", "formulaire", "étiquettes", "remboursement central", "protection"],
          category: "Retours",
          type: "Guide",
          lastUpdated: "2024-01-14",
          popularity: 89,
        },
        {
          title: "Médiation des litiges vendeur-acheteur",
          content: "En cas de désaccord avec un vendeur, IhamBaobab intervient comme médiateur neutre. Service de résolution de conflits avec délai maximum 7 jours. Décision finale contraignante pour les vendeurs inscrits sur la plateforme.",
          tags: ["médiation", "litiges", "résolution", "neutre", "contraignant"],
          category: "Retours",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 86,
        },
        {
          title: "Remboursements et délais",
          content: "Remboursement automatique 5-7 jours après réception du retour. Pas d'attente de l'accord vendeur. Pour les paiements Mobile Money, remboursement immédiat. Historique complet des remboursements dans votre compte.",
          tags: ["remboursement automatique", "délais", "mobile money", "historique", "immédiat"],
          category: "Retours",
          type: "FAQ",
          lastUpdated: "2024-01-12",
          popularity: 91,
        },
      ],
    },
    {
      id: "vendeurs",
      title: "Devenir Vendeur",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      articles: [
        {
          title: "Créer ma boutique sur IhamBaobab",
          content: "Inscription gratuite en 10 minutes. Vérification d'identité obligatoire. Créez votre vitrine, ajoutez vos produits, fixez vos conditions. Formation en ligne gratuite pour optimiser vos ventes. Support dédié aux nouveaux vendeurs.",
          tags: ["inscription", "boutique", "vérification", "formation", "support"],
          category: "Vendeurs",
          type: "Guide",
          lastUpdated: "2024-01-16",
          popularity: 88,
        },
        {
          title: "Commission et paiements vendeurs",
          content: "Commission de 5% sur les ventes réalisées. Paiement automatique 7 jours après livraison confirmée. Paiement par Mobile Money ou virement bancaire. Tableau de bord détaillé des revenus et commissions. Pas de frais cachés.",
          tags: ["commission", "5%", "paiement automatique", "mobile money", "transparent"],
          category: "Vendeurs",
          type: "Information",
          lastUpdated: "2024-01-15",
          popularity: 94,
        },
        {
          title: "Outils de gestion pour vendeurs",
          content: "Interface complète : gestion stock, commandes, messagerie clients, statistiques de vente. Application mobile pour gérer votre boutique partout. Outils marketing : promotions, codes de réduction, mise en avant produits.",
          tags: ["outils gestion", "interface", "mobile", "marketing", "promotions"],
          category: "Vendeurs",
          type: "Information",
          lastUpdated: "2024-01-14",
          popularity: 85,
        },
        {
          title: "Support et formation vendeurs",
          content: "Centre de formation en ligne gratuit. Webinaires hebdomadaires sur les ventes en ligne. Support technique dédié. Conseils personnalisés pour développer votre activité. Communauté de vendeurs pour échanger bonnes pratiques.",
          tags: ["formation", "webinaires", "support", "conseils", "communauté"],
          category: "Vendeurs",
          type: "Information",
          lastUpdated: "2024-01-13",
          popularity: 82,
        },
      ],
    },
  ], []);

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
            <div className="flex justify-center items-center gap-4 mb-6">
              <HelpCircle className="w-16 h-16 opacity-90" />
              <Store className="w-12 h-12 opacity-75" />
              <ShoppingCart className="w-12 h-12 opacity-75" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Centre d&apos;Aide IhamBaobab
            </h1>
            <div className="text-lg sm:text-xl opacity-90 max-w-4xl mx-auto mb-4">
              <p className="mb-2">La marketplace qui connecte des milliers de vendeurs nigériens avec leurs clients</p>
              <p className="text-base opacity-75">Une plateforme, mille boutiques, une expérience d&apos;achat sécurisée et unifiée</p>
            </div>
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
                  placeholder="Rechercher une réponse... (ex: paiement sécurisé, livraison multi-boutiques)"
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