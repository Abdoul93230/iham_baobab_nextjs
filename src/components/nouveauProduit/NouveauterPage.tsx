"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Bell,
  Heart,
  Star,
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePanierSync } from "@/hooks/usePanierSync";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface NouveauterPageProps {
  paniernbr?: any[];
  acces?: boolean;
}

export default function NouveauterPage({ paniernbr = [], acces = true }: NouveauterPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Utiliser notre hook de synchronisation du panier
  const { panierCount } = usePanierSync();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous les produits");
  const swiperRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryName, setCategoryName] = useState("mode et divers sous un même toit");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [showFixedSearch, setShowFixedSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [dynamicKeywords, setDynamicKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  // Redux selectors
  const DATA_Products = useAppSelector((state: any) => state.products.data);
  const DATA_Types = useAppSelector((state: any) => state.products.types);
  const DATA_Categories = useAppSelector((state: any) => state.products.categories);
  const { likedProducts, loading: likesLoading } = useAppSelector((state: any) => state.likes);
  
  const userId = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id 
    : null;

  // Memoized calculations
  const filteredCategories = useMemo(() => 
    DATA_Categories?.filter((c: any) => c.name !== "all") || []
  , [DATA_Categories]);

  // Filtrer et trier les nouveaux produits (10 derniers produits ajoutés)
  const nouveauxProduits = useMemo(() => {
    if (!DATA_Products?.length) return [];
    
    // Créer une copie et trier par date de création (plus récent en premier)
    const sortedProducts = [...DATA_Products].sort((a, b) => {
      const dateA = new Date(a.createdAt || a._id).getTime();
      const dateB = new Date(b.createdAt || b._id).getTime();
      return dateB - dateA;
    });
    
    // Prendre les 10 plus récents
    return sortedProducts.slice(0, 10);
  }, [DATA_Products]);

  // Générer des suggestions de recherche avec useMemo
  const searchSuggestionsList = useMemo(() => {
    if (searchTerm.length >= 2 && nouveauxProduits.length > 0) {
      return nouveauxProduits
        .filter((product: any) => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
        .map((product: any) => ({
          id: product._id,
          name: product.name,
          image: product.image1,
          prix: product.prix,
          prixPromo: product.prixPromo
        }));
    }
    return [];
  }, [searchTerm, nouveauxProduits]);

  // Fonction optimisée pour filtrer les produits
  const getFilteredProducts = useMemo(() => {
    let filtered = nouveauxProduits;

    // Filtrer par catégorie si ce n'est pas "Tous les produits"
    if (activeCategory !== "Tous les produits") {
      const selectedCategory = DATA_Categories?.find((cat: any) => cat._id === activeCategory);
      
      if (selectedCategory) {
        filtered = nouveauxProduits.filter((product: any) => {
          const productType = DATA_Types?.find((type: any) => type._id === product.ClefType);
          return productType && productType.clefCategories === selectedCategory._id;
        });
      }
    }

    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      filtered = filtered.filter((prod: any) =>
        prod?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Appliquer le tri
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const priceA = parseFloat(a.prixPromo) || parseFloat(a.prix);
          const priceB = parseFloat(b.prixPromo) || parseFloat(b.prix);
          return priceA - priceB;
        case 'price-high':
          const priceHighA = parseFloat(a.prixPromo) || parseFloat(a.prix);
          const priceHighB = parseFloat(b.prixPromo) || parseFloat(b.prix);
          return priceHighB - priceHighA;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          const dateA = new Date(a.createdAt || a._id).getTime();
          const dateB = new Date(b.createdAt || b._id).getTime();
          return dateB - dateA;
      }
    });
  }, [nouveauxProduits, activeCategory, searchTerm, sortBy, DATA_Categories, DATA_Types]);

  const filteredProducts = getFilteredProducts;

  // Générer des mots-clés dynamiques basés sur les nouveaux produits
  const generateDynamicKeywords = useCallback((products: any[]) => {
    const allWords: string[] = [];
    
    products.forEach((product: any) => {
      const words = product.name
        .toLowerCase()
        .split(/[\s-_,()]+/)
        .filter((word: string) => word.length > 2)
        .map((word: string) => word.trim());
      
      allWords.push(...words);
    });

    const wordFrequency: { [key: string]: number } = {};
    allWords.forEach((word: string) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    return Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }, []);

  // Effects
  React.useEffect(() => {
    if (userId && typeof dispatch === 'function') {
      dispatch(fetchUserLikes(userId) as any);
    }
  }, [userId, dispatch]);

  React.useEffect(() => {
    setSearchSuggestions(searchSuggestionsList);
    setShowSuggestions(searchSuggestionsList.length > 0 && searchTerm.length >= 2);
  }, [searchSuggestionsList, searchTerm]);

  React.useEffect(() => {
    if (nouveauxProduits.length > 0) {
      const keywords = generateDynamicKeywords(nouveauxProduits);
      setDynamicKeywords(keywords);
    }
  }, [nouveauxProduits, generateDynamicKeywords]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 400;
      setShowFixedSearch(scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Callback functions
  const showToast = useCallback((message: string, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  }, []);

  const handleLikeClick = useCallback(async (product: any) => {
    if (!userId) {
      showToast("Veuillez vous connecter pour ajouter des favoris", "error");
      return;
    }

    try {
      await dispatch(toggleLike({ userId, product }) as any).unwrap();
      
      const isCurrentlyLiked = likedProducts.includes(product._id);
      if (isCurrentlyLiked) {
        showToast("Produit retiré des favoris");
      } else {
        showToast("Produit ajouté aux favoris");
      }
    } catch (error) {
      showToast("Une erreur est survenue", "error");
      console.error("Erreur:", error);
    }
  }, [userId, dispatch, likedProducts, showToast]);

  const handleCategoryClick = useCallback((categoryId: string, name: string) => {
    setActiveCategory(categoryId);
    setCategoryName(name);
    setIsMenuOpen(false);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setIsLoading(true);
    setSortBy(value);
    
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Produits triés par ${
        value === 'price-low' ? 'prix croissant' :
        value === 'price-high' ? 'prix décroissant' :
        value === 'name' ? 'nom alphabétique' :
        'plus récent'
      }`);
    }, 300);
  }, [showToast]);

  const getRandomIntBetween3and5 = useCallback(() => {
    return Math.floor(Math.random() * (5 - 3 + 1)) + 3;
  }, []);

  const CommentCard = ({ comment }: { comment: any }) => (
    <div className="p-2 border rounded-md" ref={swiperRef}>
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-pink-100 rounded-full mr-2"></div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-2">
        Color: {comment.color} | Shoe Size: {comment.size}
      </p>
      <p className="text-gray-800 mb-4">{comment.review}</p>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {comment.images?.map((image: string, index: number) => (
          <div
            key={index}
            className="bg-gray-200 h-22 border overflow-hidden rounded-md"
          >
            <Image 
              src={image} 
              className="w-full h-full object-cover" 
              alt={`Comment image ${index + 1}`}
              width={80}
              height={80}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {comment.name} | {comment.date}
        </span>
        <div className="flex text-nowrap cursor-pointer items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Serviable (0)</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-bounce ${
          notificationType === "success" ? "bg-green-500" : "bg-red-500"
        } text-white font-medium`}>
          {notificationMessage}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#30A08B] text-white text-center py-2 text-sm lg:text-base">
        Livraison gratuite pour toute commande supérieure à 50000 F
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-amber-100 to-amber-300 shadow-md sticky py-2 top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <span
              className="text-2xl w-24 h-16 font-extrabold text-amber-900 tracking-widest p-1
           bg-gradient-to-r from-amber-100 to-amber-300 shadow-md rounded-xl cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Image
                src="/LogoText.png"
                className="w-auto h-full object-contain transition-opacity duration-300 hover:opacity-90"
                alt="Logo"
                width={96}
                height={64}
              />
            </span>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              <button
                key="all-products"
                onClick={() => {
                  handleCategoryClick(
                    "Tous les produits",
                    "mode et divers sous un même toit"
                  );
                  window.scrollTo(0, 0);
                }}
                className={`text-white-900 hover:text-[#30A08B] transition-colors text-sm lg:text-base ${
                  activeCategory === "Tous les produits"
                    ? "font-bold text-[#30A08B]"
                    : "text-[#B17236]"
                }`}
              >
                Tous les produits
              </button>

              {filteredCategories?.slice(0, 4)?.map((category: any) => (
                <button
                  key={category._id}
                  onClick={() => {
                    handleCategoryClick(category._id, category?.name);
                    window.scrollTo(0, 0);
                  }}
                  className={`text-white-900 hover:text-[#30A08B] transition-colors text-sm lg:text-base ${
                    activeCategory === category._id
                      ? "font-bold text-[#30A08B]"
                      : "text-[#B17236]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <button className="transition-colors rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl">
                  <div
                    className="relative text-amber-800 hover:text-[#30A08B]"
                    aria-label="Notifications"
                    onClick={() => router.push("/NotificationHeader")}
                  >
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 bg-[#30A08B] rounded-full w-4 h-4 text-xs text-white flex items-center justify-center">
                      0
                    </span>
                  </div>
                </button>
                <button className="transition-colors rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl">
                  <div className="relative text-amber-800 hover:text-[#30A08B]">
                    <Heart
                      onClick={() => router.push("/like-produit")}
                      className="h-6 w-6"
                    />
                    <span className="absolute -top-2 -right-1 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {likedProducts?.length || 0}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/panier")}
                  className="relative transition-colors rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl"
                >
                  <div className="relative text-amber-800 hover:text-[#30A08B]">
                    <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 transition-colors" />
                    <span className="absolute -top-2 -right-1 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {panierCount || 0}
                    </span>
                  </div>
                </button>
              </div>
              <button
                className="md:hidden ml-4"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-[#30A08B]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#30A08B]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              <button
                key="all-products-mobile"
                onClick={() => {
                  handleCategoryClick(
                    "Tous les produits",
                    "mode et divers sous un même toit"
                  );
                  setActiveCategory("Tous les produits");
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={`text-white-900 hover:text-[#30A08B] transition-colors text-sm lg:text-base ${
                  activeCategory === "Tous les produits"
                    ? "font-bold text-[#30A08B]"
                    : "text-[#B17236]"
                }`}
              >
                Tous les produits
              </button>
              {filteredCategories?.slice(0, 4)?.map((category: any) => (
                <button
                  key={category._id}
                  onClick={() => {
                    handleCategoryClick(category._id, category?.name);
                    setIsMenuOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className="block w-full text-left px-3 py-2 text-base hover:bg-gray-50 hover:text-[#30A08B] transition-colors"
                >
                  {category.name}
                </button>
              ))}
              <div className="grid grid-cols-4 gap-4 py-4 border-t">
                <button
                  onClick={() => router.push("/NotificationHeader")}
                  className="flex flex-col items-center text-gray-600 relative"
                >
                  <div className="relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      0
                    </span>
                  </div>
                  <span className="text-xs mt-1">Notifications</span>
                </button>
                <button
                  onClick={() => router.push("/like-produit")}
                  className="flex flex-col items-center text-gray-600 relative"
                >
                  <div className="relative">
                    <Heart className="w-6 h-6" />
                    {likedProducts?.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {likedProducts.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">Favoris</span>
                </button>
                <button
                  onClick={() => router.push("/panier")}
                  className="flex flex-col items-center text-gray-600 relative"
                >
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    {panierCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {panierCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">Panier</span>
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="flex flex-col items-center text-gray-600"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs mt-1">Compte</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#30A08B] to-[#B2905F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ✨ Nouveaux Produits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Découvrez nos derniers arrivages et restez à la pointe des tendances
            </p>
            
            {/* Barre de recherche moderne dans le hero */}
            <div className="relative max-w-4xl mx-auto mb-8 search-container">
              <div className="group relative">
                <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02] overflow-hidden">
                  {/* Icône de recherche */}
                  <div className="pl-6 pr-2">
                    <Search className={`w-6 h-6 transition-colors duration-300 ${
                      searchTerm ? 'text-[#30A08B]' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Input */}
                  <input
                    type="search"
                    placeholder="Rechercher dans nos nouveaux produits..."
                    className="flex-1 py-4 pr-6 text-gray-800 placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 text-base md:text-lg font-medium"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                  />
                  
                  {/* Bouton de recherche */}
                  {searchTerm && (
                    <div className="pr-3">
                      <button
                        onClick={() => {
                          console.log("Recherche:", searchTerm);
                        }}
                        className="bg-gradient-to-r from-[#30A08B] to-[#268070] text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                      >
                        Rechercher
                      </button>
                    </div>
                  )}
                  
                  {/* Bouton clear */}
                  {searchTerm && (
                    <div className="pr-3">
                      <button
                        onClick={() => setSearchTerm("")}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Barre de progression sous l'input */}
                <div className="h-1 bg-gradient-to-r from-[#30A08B] via-[#B2905F] to-[#30A08B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
              
              {/* Suggestions de recherche populaires */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-white/80 text-sm">
                  {dynamicKeywords.length > 0 ? 'Nouveautés populaires:' : 'Recherche populaire:'}
                </span>
                {(dynamicKeywords.length > 0 ? dynamicKeywords : ['Mode', 'Électronique', 'Accessoires', 'Beauté', 'Sport', 'Maison']).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-105"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              {/* Suggestions de recherche dynamiques */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 overflow-hidden z-10">
                  <div className="p-2">
                    <div className="text-xs text-gray-600 font-semibold mb-2 px-2">
                      Suggestions ({searchSuggestions.length})
                    </div>
                    {searchSuggestions.map((suggestion: any) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          router.push(`/ProduitDetail/${suggestion.id}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-left"
                      >
                        <Image
                          src={suggestion.image}
                          alt={suggestion.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">
                            {suggestion.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {suggestion.prixPromo ? (
                              <>
                                <span className="text-red-500 font-semibold">
                                  {suggestion.prixPromo} F
                                </span>
                                <span className="text-gray-400 line-through">
                                  {suggestion.prix} F
                                </span>
                              </>
                            ) : (
                              <span className="text-[#30A08B] font-semibold">
                                {suggestion.prix} F
                              </span>
                            )}
                          </div>
                        </div>
                        <Search className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base mb-6">
              <span className="bg-white/20 px-4 py-2 rounded-full">🆕 Nouveautés exclusives</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">🚚 Livraison rapide</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">💎 Qualité premium</span>
            </div>

            {/* Statistiques des nouveaux produits */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{filteredProducts.length}</div>
                <div className="text-sm md:text-base text-white/80">Nouveaux</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">100%</div>
                <div className="text-sm md:text-base text-white/80">Récents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">24h</div>
                <div className="text-sm md:text-base text-white/80">Ajoutés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">⭐</div>
                <div className="text-sm md:text-base text-white/80">Tendance</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Barre de recherche fixe (apparaît au scroll) */}
      {showFixedSearch && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-lg border-b animate-fade-in-down search-container">
          <div className="max-w-4xl mx-auto p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des nouveaux produits..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#30A08B]/20 focus:border-[#30A08B] outline-none transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb 
            items={[
              { label: "Accueil", href: "/" },
              { label: "Nouveaux Produits", href: "/nouveaux-produits", current: true }
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* En-tête de la section produits */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              {searchTerm ? (
                <>Résultats pour "{searchTerm}" ({filteredProducts.length})</>
              ) : (
                <>Nouveaux Produits ({filteredProducts.length})</>
              )}
              {sortBy !== 'newest' && (
                <span className="text-sm font-normal bg-[#30A08B] text-white px-2 py-1 rounded-full">
                  {sortBy === 'price-low' && 'Prix ↗'}
                  {sortBy === 'price-high' && 'Prix ↘'}
                  {sortBy === 'name' && 'A-Z'}
                </span>
              )}
            </h2>
            <p className="text-gray-600">
              {searchTerm ? 
                `${filteredProducts.length} produit(s) trouvé(s)` : 
                'Découvrez nos derniers arrivages et nouveautés exclusives'
              }
              {sortBy !== 'newest' && (
                <span className="ml-2 text-sm text-[#30A08B]">
                  • Trié par {
                    sortBy === 'price-low' ? 'prix croissant' :
                    sortBy === 'price-high' ? 'prix décroissant' :
                    sortBy === 'name' ? 'nom alphabétique' : ''
                  }
                </span>
              )}
            </p>
          </div>
          
          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select 
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                disabled={isLoading}
                className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#30A08B]/20 focus:border-[#30A08B] outline-none transition-all duration-200 hover:border-[#30A08B] cursor-pointer ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="newest">Plus récent</option>
                <option value="price-low">Prix croissant</option>
                <option value="price-high">Prix décroissant</option>
                <option value="name">Nom (A-Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* Produits Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}>
          {isLoading ? (
            // Indicateur de chargement
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 sm:h-56 md:h-64 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts?.map((product: any) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative flex-grow">
                  <Image
                    onClick={() => router.push(`/ProduitDetail/${product?._id}`)}
                    src={product?.image1}
                    alt={product?.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    width={400}
                    height={300}
                  />

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeClick(product);
                    }}
                    className={cn(
                      "absolute top-3 left-3 p-2 rounded-full shadow-lg transition-all duration-300 z-20",
                      likedProducts.includes(product._id)
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-white hover:bg-emerald-50"
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        likedProducts.includes(product._id)
                          ? "text-red-500 fill-red-500"
                          : "text-emerald-600"
                      )}
                    />
                  </button>

                  <button className="absolute top-2 right-4 py-1 px-2 text-white rounded-full shadow-md bg-[#62aca2bb] transition-colors text-xs font-bold">
                    nouveau
                  </button>

                  {product?.prixPromo && product?.prixPromo > 0 && (
                    <span className="absolute bottom-2 left-2 bg-[#62aca2bb] text-white text-xs font-bold py-1 px-2 rounded-full">
                      -{" "}
                      {Math.round(
                        ((product.prix - product.prixPromo) / product.prix) * 100
                      )}{" "}
                      %
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base md:text-lg font-medium mb-2 text-gray-800">
                    {product?.name}
                  </h3>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {product?.prixPromo && product?.prixPromo > 0 ? (
                        <>
                          <p className="text-lg md:text-xl font-bold text-[#B17236] line-through">
                            F {product?.prix?.toLocaleString()}
                          </p>
                          <p className="text-lg md:text-xl font-bold text-[#30A08B]">
                            F {product?.prixPromo?.toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg md:text-xl font-bold text-[#B17236]">
                          F {product?.prix?.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-[#B2905F]">★</span>
                      <span className="ml-1 text-sm text-gray-600">
                        ({getRandomIntBetween3and5()})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/ProduitDetail/${product?._id}`)}
                    className="w-full bg-[#30A08B] text-white py-2 rounded-md hover:bg-[#B2905F] transition-colors text-sm md:text-base"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? 'Aucun résultat trouvé' : 'Aucun nouveau produit'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? (
                    <>
                      Aucun produit ne correspond à votre recherche "<strong>{searchTerm}</strong>".
                      <br />Essayez avec d'autres mots-clés.
                    </>
                  ) : (
                    'Il n\'y a actuellement aucun nouveau produit dans cette catégorie.'
                  )}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-[#30A08B] text-white px-6 py-2 rounded-lg hover:bg-[#B2905F] transition-colors"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
