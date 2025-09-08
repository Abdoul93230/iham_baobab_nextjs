"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Bell,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePanierSync } from "@/hooks/usePanierSync";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface DetailHommeProps {
  acces: boolean;
  categoryParam: string;
}

const DetailHomme: React.FC<DetailHommeProps> = ({ 
  acces,
  categoryParam 
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Utiliser notre hook de synchronisation du panier
  const { panierCount } = usePanierSync();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const swiperRef = useRef(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [testSearch, setTextSearch] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [ptAll, setPtAll] = useState([]);
  const [showFixedSearch, setShowFixedSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dynamicKeywords, setDynamicKeywords] = useState<string[]>([]);

  // Redux selectors
  const DATA_Products = useAppSelector((state: any) => state.products.data);
  const DATA_Types = useAppSelector((state: any) => state.products.types);
  const DATA_Categories = useAppSelector((state: any) => state.products.categories);
  const DATA_Commentes = useAppSelector(
    (state: any) => state.products.products_Commentes
  )?.data;
  const DATA_Products_pubs = useAppSelector(
    (state: any) => state.products.products_Pubs
  );

//   console.log({DATA_Products, DATA_Types, DATA_Categories, DATA_Commentes, DATA_Products_pubs});

  // Likes state from Redux
  const { likedProducts, loading: likesLoading } = useAppSelector((state: any) => state.likes);

  const userId = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id 
    : null;

  // Décoder le paramètre d'URL pour gérer les caractères spéciaux
  const decodedCategoryParam = decodeURIComponent(categoryParam);

  // Trouver la catégorie basée sur le paramètre d'URL décodé
  const ClefCate = DATA_Categories
    ? DATA_Categories.find((item: any) => item.name === decodedCategoryParam)
    : null;

  // Debug des catégories disponibles si la catégorie n'est pas trouvée
  useEffect(() => {
    if (DATA_Categories && !ClefCate) {
      console.log("🚨 Catégorie non trouvée:", categoryParam);
      console.log("📋 Catégories disponibles:", DATA_Categories.map((cat: any) => cat.name));
    }
  }, [DATA_Categories, ClefCate, categoryParam]);

  const typeesInCategory = DATA_Types?.filter(
    (type: any) => type.clefCategories === ClefCate?._id
  );

  const filterComments =
    DATA_Commentes?.filter((comments: any) =>
      typeesInCategory?.some((type: any) => type._id === comments.clefType)
    ) || [];

  // Charger les likes au montage du composant
  useEffect(() => {
    if (userId && typeof dispatch === 'function') {
      dispatch(fetchUserLikes(userId) as any);
    }
  }, [userId, dispatch]);

  // Filtrer les produits quand les données changent
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // S'assurer que toutes les données nécessaires sont disponibles
    if (DATA_Products && DATA_Types && ClefCate) {
      console.log("🔍 Filtrage des produits pour la catégorie:", ClefCate.name);
      console.log("📊 Produits disponibles:", DATA_Products.length);
      console.log("📊 Types disponibles:", DATA_Types.length);
      
      const filteredProducts = DATA_Products.filter((item: any) =>
        DATA_Types.some(
          (type: any) =>
            type.clefCategories === ClefCate._id &&
            item.ClefType === type._id
        )
      );
      
      console.log("✅ Produits filtrés trouvés:", filteredProducts.length);
      setPtAll(filteredProducts);
    } else {
      console.log("⚠️ Données manquantes pour le filtrage:", {
        products: !!DATA_Products,
        types: !!DATA_Types,
        category: !!ClefCate,
        decodedParam: decodedCategoryParam,
        originalParam: categoryParam
      });
    }
  }, [decodedCategoryParam, activeCategory, DATA_Products, DATA_Types, ClefCate]);

  // Gérer l'affichage de la barre de recherche fixe au scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 400; // Hauteur approximative de la hero section
      setShowFixedSearch(scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Générer des suggestions de recherche
  useEffect(() => {
    if (testSearch.length >= 2 && ptAll.length > 0) {
      const suggestions = ptAll
        .filter((product: any) => 
          product.name.toLowerCase().includes(testSearch.toLowerCase())
        )
        .slice(0, 5)
        .map((product: any) => ({
          id: product._id,
          name: product.name,
          image: product.image1,
          prix: product.prix,
          prixPromo: product.prixPromo
        }));
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [testSearch, ptAll]);

  // Générer des mots-clés dynamiques basés sur les produits de la catégorie
  useEffect(() => {
    if (ptAll.length > 0) {
      const keywords = generateDynamicKeywords(ptAll);
      setDynamicKeywords(keywords);
    }
  }, [ptAll]);

  // Fonction pour générer des mots-clés à partir des noms de produits
  const generateDynamicKeywords = (products: any[]) => {
    const allWords: string[] = [];
    const brands: string[] = [];
    
    // Extraire tous les mots des noms de produits et les marques
    products.forEach((product: any) => {
      // Extraire les mots des noms de produits
      const words = product.name
        .toLowerCase()
        .split(/[\s-_,()]+/) // Séparer par espaces, tirets, virgules, parenthèses
        .filter((word: string) => word.length > 2) // Garder seulement les mots de plus de 2 caractères
        .map((word: string) => word.trim());
      
      allWords.push(...words);

      // Ajouter la marque si elle existe et n'est pas "inconnue"
      if (product.marque && product.marque !== 'inconu' && product.marque !== 'inconnue') {
        brands.push(product.marque.toLowerCase());
      }
    });

    // Compter la fréquence des mots
    const wordFrequency: { [key: string]: number } = {};
    allWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Compter la fréquence des marques
    const brandFrequency: { [key: string]: number } = {};
    brands.forEach(brand => {
      brandFrequency[brand] = (brandFrequency[brand] || 0) + 1;
    });

    // Mots à exclure (mots courants qui ne sont pas utiles)
    const stopWords = [
      'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'par', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une',
      'et', 'ou', 'mais', 'car', 'donc', 'que', 'qui', 'quoi', 'dont', 'où', 'très', 'plus', 'moins',
      'bien', 'mal', 'bon', 'bonne', 'petit', 'petite', 'grand', 'grande', 'new', 'nouveau', 'nouvelle',
      'produit', 'article', 'item', 'piece', 'unité', 'modèle'
    ];

    // Trier par fréquence et prendre les plus populaires (excluant les stop words)
    const topWords = Object.entries(wordFrequency)
      .filter(([word]) => !stopWords.includes(word) && word.length > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4) // Prendre les 4 mots les plus fréquents
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    // Ajouter les marques populaires
    const topBrands = Object.entries(brandFrequency)
      .filter(([brand]) => brand.length > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2) // Prendre les 2 marques les plus fréquentes
      .map(([brand]) => brand.charAt(0).toUpperCase() + brand.slice(1));

    // Combiner les mots et les marques
    const allKeywords = [...topWords, ...topBrands];
    
    // Retourner maximum 6 mots-clés
    return allKeywords.slice(0, 6);
  };

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fonction pour gérer la recherche avec effet
  const handleSearchChange = (value: string) => {
    setTextSearch(value);
    setIsSearching(true);
    
    // Simuler un délai de recherche
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const showToast = (message: string, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLikeClick = async (product: any) => {
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
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // S'assurer que toutes les données nécessaires sont disponibles
    if (DATA_Products && DATA_Types && ClefCate) {
      console.log("🔍 Filtrage des produits pour la catégorie:", ClefCate.name);
      console.log("📊 Produits disponibles:", DATA_Products.length);
      console.log("📊 Types disponibles:", DATA_Types.length);
      
      const filteredProducts = DATA_Products.filter((item: any) =>
        DATA_Types.some(
          (type: any) =>
            type.clefCategories === ClefCate._id &&
            item.ClefType === type._id
        )
      );
      
      console.log("✅ Produits filtrés trouvés:", filteredProducts.length);
      setPtAll(filteredProducts);
    } else {
      console.log("⚠️ Données manquantes pour le filtrage:", {
        products: !!DATA_Products && DATA_Products.length,
        types: !!DATA_Types && DATA_Types.length,
        category: !!ClefCate,
        categoryParam
      });
      
      // Si les données ne sont pas encore chargées, on remet ptAll à vide
      setPtAll([]);
    }
  }, [categoryParam, activeCategory, DATA_Products, DATA_Types, ClefCate]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsMenuOpen(false);
  };

  const handleReviewClick = (product: any) => {
    setSelectedProduct(product);
    setShowReviewForm(true);
  };

  const getFilteredProducts = () => {
    if (activeCategory === "all") {
      return (
        ptAll?.filter((prod: any) =>
          prod?.name.toLowerCase().includes(testSearch.toLowerCase())
        ) || []
      );
    }
    return (
      ptAll
        .filter((product: any) => product.ClefType === activeCategory)
        ?.filter((prod: any) =>
          prod?.name.toLowerCase().includes(testSearch.toLowerCase())
        ) || []
    );
  };

  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (product: any) => {
    setIsAnimating(true);
    handleLikeClick(product);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const filteredProducts = getFilteredProducts();

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const CommentCard = ({ comment, product }: { comment: any; product: any }) => (
    <div className="p-2 border rounded-md" ref={swiperRef}>
      <div className="flex items-center mb-2">
        <div
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
          className="w-10 h-10 bg-pink-100 rounded-full mr-2"
        >
          {comment.userName
            ?.split(" ")
            .map((word: string) => word.charAt(0))
            .join("")}
        </div>
        <div className="flex">
          {[...Array(comment.etoil)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-2">
        {comment.userName ? comment.userName : ""}
      </p>
      <p className="text-gray-800 mb-4">{comment.description}</p>
      <div className="grid grid-cols-6 gap-2 mb-4">

        {[product?.image1, product?.image2, product?.image3].map(
          (image: string, index: number) => (
            <div
              key={index}
              className="bg-gray-200 h-22 border overflow-hidden rounded-md"
            >
              <Image 
                src={image} 
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover" 
                width={80}
                height={80}
              />
            </div>
          )
        )}
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {product.name.slice(0, 20)}... | {formatDate(comment.date)}
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
      {/* Vérification de la disponibilité des données */}
      {!DATA_Products || !DATA_Types || !DATA_Categories ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données de la catégorie...</p>
          </div>
        </div>
      ) : !ClefCate ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Catégorie non trouvée
            </h2>
            <p className="text-gray-600 mb-4">
              La catégorie "{decodedCategoryParam}" n'existe pas ou n'est pas disponible.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#30A08B] text-white px-6 py-2 rounded-lg hover:bg-[#268070] transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Notification Toast */}
          {showNotification && (
            <div
              className={cn(
                "fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg transition-all duration-300",
                notificationType === "success"
                  ? "bg-green-100 border-green-400 text-green-700"
                  : "bg-red-100 border-red-400 text-red-700"
              )}
              style={{ zIndex: 100 }}
            >
              <p className="text-sm">{notificationMessage}</p>
            </div>
          )}

          {/* Top Banner */}
          <div className="bg-[#30A08B] text-white text-center py-2 text-sm lg:text-base">
            Livraison gratuite pour toute commande supérieure ou égale à 30 000 F
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
                onClick={() => handleCategoryClick("all")}
                className={`text-white-900 hover:text-[#30A08B] transition-colors text-sm lg:text-base ${
                  activeCategory === "all"
                    ? "font-bold text-[#30A08B]"
                    : "text-[#B17236]"
                }`}
              >
                Tous les produits
              </button>

              {DATA_Types?.filter(
                (para: any) => para.clefCategories === ClefCate?._id
              ).map((category: any) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
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
                <button
                  onClick={() => router.push("/Like-produit")}
                  className="transition-colors rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl"
                >
                  <div className="relative text-amber-800 hover:text-[#30A08B]">
                    <Heart className="h-6 w-6" />
                    <span className="absolute -top-2 -right-1 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {likedProducts?.length || 0}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/Panier")}
                  className="relative transition-colors rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl"
                >
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-amber-800 hover:text-[#30A08B] transition-colors" />
                  <span className="absolute -top-2 -right-1 bg-[#30A08B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {panierCount || 0}
                  </span>
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
                onClick={() => {
                  handleCategoryClick("all");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base hover:bg-gray-50 hover:text-[#30A08B] transition-colors"
              >
                Tous les produits
              </button>
              {DATA_Types?.filter(
                (para: any) => para.clefCategories === ClefCate?._id
              ).map((category: any) => (
                <button
                  key={category._id}
                  onClick={() => {
                    setActiveCategory(category._id);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base hover:bg-gray-50 hover:text-[#30A08B] transition-colors"
                >
                  {category.name}
                </button>
              ))}
              <div className="flex w-full items-center justify-around gap-4 py-4 border-t">
                <button className="flex flex-col items-center text-gray-600">
                  <User className="w-6 h-6" />
                  <span className="text-xs mt-1">Compte</span>
                </button>
                <button 
                  onClick={() => router.push("/Like-produit")}
                  className="flex flex-col items-center text-gray-600"
                >
                  <Heart className="w-6 h-6" />
                  <span className="text-xs mt-1">Favoris</span>
                </button>
                <button 
                  onClick={() => router.push("/Panier")}
                  className="flex flex-col items-center text-gray-600"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-xs mt-1">Panier</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Barre de recherche fixe (apparaît au scroll) */}
      <div 
        className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg transition-all duration-300 ${
          showFixedSearch ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo mini */}
            <div className="flex-shrink-0">
              <span 
                onClick={() => router.push("/")}
                className="text-lg font-bold text-[#30A08B] cursor-pointer"
              >
                IhamBaobab
              </span>
            </div>
            
            {/* Barre de recherche compacte */}
            <div className="flex-1 relative">
              <div className="relative group">
                <input
                  type="search"
                  placeholder={`Rechercher dans ${ClefCate?.name || 'cette catégorie'}...`}
                  className="w-full py-2.5 pl-10 pr-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-200"
                  value={testSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                  isSearching ? 'text-[#30A08B]' : 'text-gray-400'
                }`} />
                
                {testSearch && (
                  <button
                    onClick={() => setTextSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Panier mini */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => router.push("/Panier")}
                className="relative p-2 text-gray-600 hover:text-[#30A08B] transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {panierCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {panierCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
            //   { label: "Catégories", href: "/categories" },
              { 
                label: `Catégories : ${ClefCate?.name}` || `Catégories : ${decodedCategoryParam}`, 
                href: `/Categorie/${categoryParam}`, 
                current: true 
              },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#30A08B] to-[#B2905F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="text-center">
            {/* Image de la catégorie si disponible */}
            {ClefCate?.image && (
              <div className="mb-6 flex justify-center">
                <Image
                  src={
                    ClefCate.image.startsWith('http://') || ClefCate.image.startsWith('https://') 
                      ? ClefCate.image 
                      : `${process.env.NEXT_PUBLIC_Backend_Url || 'http://localhost:3001'}/uploads/${ClefCate.image}`
                  }
                  alt={`Catégorie ${ClefCate.name}`}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    // En cas d'erreur, cacher l'image
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-4">
              {ClefCate?.name || "Collection"}
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Découvrez notre collection exclusive de {ClefCate?.name?.toLowerCase()}
            </p>
            
            {/* Barre de recherche moderne */}
            <div className="relative max-w-2xl mx-auto search-container">
              <div className="relative group">
                {/* Container principal avec gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                
                {/* Input principal */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
                  <div className="flex items-center">
                    {/* Icône de recherche à gauche */}
                    <div className="pl-6 pr-3">
                      <Search className={`w-5 h-5 transition-all duration-300 ${
                        isSearching 
                          ? 'text-[#30A08B] animate-pulse' 
                          : 'text-gray-400 group-hover:text-[#30A08B]'
                      }`} />
                    </div>
                    
                    {/* Input */}
                    <input
                      type="search"
                      placeholder="Que recherchez-vous aujourd'hui ?"
                      className="flex-1 py-4 pr-6 text-gray-800 placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 text-base md:text-lg font-medium"
                      value={testSearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                    />
                    
                    {/* Bouton de recherche */}
                    {testSearch && (
                      <div className="pr-3">
                        <button
                          onClick={() => {
                            // Logique de recherche ici
                            console.log("Recherche:", testSearch);
                          }}
                          className="bg-gradient-to-r from-[#30A08B] to-[#268070] text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                        >
                          Rechercher
                        </button>
                      </div>
                    )}
                    
                    {/* Bouton clear */}
                    {testSearch && (
                      <div className="pr-3">
                        <button
                          onClick={() => setTextSearch("")}
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
              </div>
              
              {/* Suggestions de recherche populaires */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-white/80 text-sm">
                  {dynamicKeywords.length > 0 ? 'Populaire dans cette catégorie:' : 'Recherche populaire:'}
                </span>
                {(dynamicKeywords.length > 0 ? dynamicKeywords : ['Chaussures', 'Sacs', 'Vêtements', 'Accessoires']).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTextSearch(tag)}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="fixed bottom-50 left-3 flex flex-col gap-2 z-2">
          <button
            className="p-3 bg-gradient-to-r from-[#30A08B] to-[#B2905F] rounded-full shadow-lg animate-bounce"
            onClick={() => handleReviewClick(selectedProduct)}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Produits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {filteredProducts.map((product: any) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="relative flex-grow">
                <Image
                  onClick={() => router.push(`/ProduitDetail/${product._id}`)}
                  src={product.image1}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
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

                {product.prixPromo > 0 && (
                  <span className="absolute top-2 right-2 bg-[#62aca2bb] text-white text-xs font-bold py-1 px-2 rounded-full">
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
                  {product.name.slice(0, 30)}...
                </h3>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {product.prixPromo > 0 ? (
                      <>
                        <p className="text-lg md:text-xl font-bold text-[#B17236] line-through">
                          F {product.prix.toLocaleString()}
                        </p>
                        <p className="text-lg md:text-xl font-bold text-[#30A08B]">
                          F {product.prixPromo.toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg md:text-xl font-bold text-[#B17236]">
                        F {product.prix.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#B2905F]">★</span>
                    <span className="ml-1 text-sm text-gray-600">
                      {4.8} (
                      {
                        DATA_Commentes?.filter(
                          (item: any) => item.clefProduct === product._id
                        )?.length || 0
                      }
                      )
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/ProduitDetail/${product._id}`)}
                  className="mt-2 flex justify-around items-center w-full bg-[#30A08B] text-white py-2
                       rounded-full hover:bg-opacity-90 transition-colors duration-200 text-sm md:text-base shadow-md hover:shadow-lg"
                >
                  Ajouter au panier
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts?.length <= 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-lg font-semibold text-gray-600">
                Aucun produit correspondant trouvé pour ce type. Veuillez essayer
                un autre type.
              </p>
            </div>
          )}
        </div>

        {/* Formulaire de commentaire */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-[#B17236]">
                  Tous les avis
                </h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="overflow-y-auto flex-grow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterComments?.map((comment: any) => (
                    <CommentCard
                      key={comment._id}
                      product={DATA_Products?.find(
                        (item: any) => item._id === comment.clefProduct
                      )}
                      comment={comment}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
        </>
      )}
    </div>
  );
};

export default DetailHomme;