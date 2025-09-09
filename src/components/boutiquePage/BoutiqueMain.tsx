"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  ShoppingBag,
  X,
  Home,
  User,
  ArrowRight,
  Grid,
  MessageCircle,
  Menu,
  MoreVertical,
  Star,
  Feather,
  Eye,
  Share2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  Shield,
  Award,
  Instagram,
  Facebook,
  Globe,
  Filter,
  SortAsc,
  PlayCircle,
  Bookmark,
  ExternalLink,
  Package,
  TrendingUp,
  Zap,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Image from "next/image";

// Composants UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
// import socialService from "./socialService"; // Vous devrez adapter ce service

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface BoutiqueMainProps {
  sellerId: string;
}

const AdvancedECommercePage: React.FC<BoutiqueMainProps> = ({ sellerId }) => {
  const router = useRouter();
  const { toast } = useToast();

  // États principaux
  const [activeTab, setActiveTab] = useState("home");
  const [sortBy, setSortBy] = useState("best_match");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Données du store
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [socialStats, setSocialStats] = useState({
    followersCount: 0,
    likesCount: 0,
    reviewsCount: 0,
    rating: 0,
  });

  // Produits filtrés et triés
  const [hotDeals, setHotDeals] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);

  // État de suivi
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const dispatch = useAppDispatch();
  const likedProducts = useAppSelector((state: any) => state.likes.likedProducts);
  const userId = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id 
    : null;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserLikes(userId) as any);
    }
  }, [userId, dispatch]);

  // Carrousel automatique des bannières
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Vérification de l'authentification
  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.token 
      : null;
    setIsAuthenticated(!!token);
  }, []);

  // Récupération des données au chargement
  useEffect(() => {
    if (sellerId) {
      fetchStoreData();
    }
  }, [sellerId]);

  const showToast = (message: string, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLikeClick = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!userId) {
      showToast("Veuillez vous connecter pour ajouter des favoris", "error");
      return;
    }

    try {
      await dispatch(toggleLike({ userId, product }) as any).unwrap();
      showToast(
        likedProducts.includes(product._id)
          ? "Produit retiré des favoris"
          : "Produit ajouté aux favoris"
      );
    } catch (error) {
      showToast("Une erreur est survenue", "error");
      console.error("Erreur:", error);
    }
  };

  // Fonction principale de récupération des données
  const fetchStoreData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSellerInfo(),
        fetchProducts(),
        fetchCategories(),
        fetchBanners(),
        fetchSuivi(),
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du magasin",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Récupération des informations du vendeur
  const fetchSellerInfo = async () => {
    try {
      const response = await axios.get(`${BackendUrl}/getSeller/${sellerId}`);
      setSellerInfo(response.data.data);
      setSocialStats({
        followersCount: response.data.data?.followersCount || 0,
        likesCount: response.data.data?.likesCount || 0,
        reviewsCount: response.data.data?.reviewsCount || 0,
        rating: response.data.data?.rating || 0,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des infos vendeur:", error);
    }
  };

  // Récupération des produits
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BackendUrl}/searchProductBySupplier/${sellerId}`);
      const publishedProducts = response.data.data.filter(
        (product: any) => product.isPublished === "Published"
      );

      setProducts(publishedProducts);
      setAllProducts(publishedProducts);

      // Traitement des différentes catégories de produits
      processProductCategories(publishedProducts);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };

  // Traitement des catégories de produits
  const processProductCategories = (products: any[]) => {
    // Hot deals - produits avec le plus de ventes
    const sortedBySales = [...products]
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 6);
    setHotDeals(sortedBySales);

    // Nouveaux arrivants - produits les plus récents
    const sortedByDate = [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
    setNewArrivals(sortedByDate);

    // Produits en promotion
    const promoItems = products.filter(product =>
      product.prix && product.prixPromo && product.prixPromo < product.prix
    ).slice(0, 6);
    setPromoProducts(promoItems);
  };

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BackendUrl}/getAllTypeBySeller/${sellerId}`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    }
  };

  // Récupération des bannières
  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${BackendUrl}/api/marketing/Bannerss/${sellerId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setBanners(response.data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des bannières:", error);
    }
  };

  const fetchSuivi = async () => {
    try {
      // Cette fonction nécessitera l'adaptation de votre socialService
      // const followersResponse = await socialService.getSellerFollowers(sellerId);
      // const isUserFollowing = followersResponse.data.followers.some(
      //   (follower: any) => follower._id === userId
      // );
      // setIsFollowing(isUserFollowing);
    } catch (error) {
      console.error("Erreur lors de la récupération de suivi:", error);
    }
  };

  // Gestion du suivi
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter pour suivre ce vendeur",
      });
      return;
    }

    try {
      if (isFollowing) {
        // await socialService.unfollowSeller(sellerId);
        setIsFollowing(false);
        setSocialStats({
          ...socialStats,
          followersCount: socialStats.followersCount - 1,
        });
        showToast("Vous ne suivez plus ce vendeur", "success");
      } else {
        // await socialService.followSeller(sellerId);
        setIsFollowing(true);
        setSocialStats({
          ...socialStats,
          followersCount: socialStats.followersCount + 1,
        });
        showToast("Vous suivez maintenant ce vendeur", "success");
      }
    } catch (error) {
      showToast("Impossible de modifier le suivi", "error");
    }
  };

  // Navigation vers les détails du produit
  const handleProductClick = (productId: string) => {
    router.push(`/ProduitDetail/${productId}`);
  };

  // Filtrage par catégorie
  const handleCategoryFilter = async (categoryId: string | null, categoryName: string) => {
    setIsLoading(true);
    try {
      if (categoryName === "All") {
        setAllProducts(products);
      } else {
        const response = await axios.get(
          `${BackendUrl}/searchProductByTypeBySeller/${categoryId}/${sellerId}`
        );
        const publishedProducts = response.data.products.filter(
          (product: any) => product.isPublished === "Published"
        );
        setAllProducts(publishedProducts);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de filtrer par catégorie",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Recherche de produits
  const filteredProducts = allProducts.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marque?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tri des produits
  const sortProducts = (products: any[]) => {
    switch (sortBy) {
      case "orders":
        return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      case "prices":
        return [...products].sort((a, b) => (a.prixPromo || a.prix) - (b.prixPromo || b.prix));
      case "newest":
        return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return products;
    }
  };

  // Calcul du pourcentage de réduction
  const calculateDiscount = (prix: number, currentPrice: number) => {
    if (!prix || !currentPrice || prix <= currentPrice) return 0;
    return Math.round(((prix - currentPrice) / prix) * 100);
  };

  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Navigation vers bannière précédente/suivante
  const goToPrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  // Composant bouton d'onglet
  const TabButton = ({ isActive, onClick, children }: { 
    isActive: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
  }) => (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all border-b-2 relative whitespace-nowrap ${
        isActive
          ? "border-red-500 text-red-600 bg-red-50"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="block sm:inline">{children}</span>
      {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>}
    </button>
  );

  // Composant carte produit améliorée
  const ProductCard = ({ product, isCompact = false, showRanking = false }: {
    product: any;
    isCompact?: boolean;
    showRanking?: boolean;
  }) => {
    const discount = calculateDiscount(product.prix, product.prixPromo);
    const finalPrice = product.prixPromo || product.prix;

    return (
      <Card
        className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02] ${
          isCompact ? 'w-full' : ''
        }`}
        onClick={() => handleProductClick(product._id)}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <Image
              src={product.image1 || product.image}
              alt={product.name}
              className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isCompact ? 'h-24' : 'h-40 sm:h-48'
              }`}
              width={400}
              height={isCompact ? 96 : 192}
            />
            
            {/* Badges */}
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1">
              {showRanking && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg text-xs">
                  #{hotDeals.indexOf(product) + 1}
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg text-xs">
                  -{discount}%
                </Badge>
              )}
              {product.quantite < 5 && product.quantite > 0 && (
                <Badge className="bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg text-xs">
                  Stock faible
                </Badge>
              )}
            </div>

            {/* Bouton cœur */}
            {!isCompact && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 sm:top-2 right-1 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
                onClick={(e) => handleLikeClick(product, e)}
              >
                <Heart
                  className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
                    likedProducts.includes(product._id) 
                      ? "fill-red-500 text-red-500" 
                      : "text-slate-600 hover:text-red-500"
                  }`}
                />
              </Button>
            )}

            {/* Overlay info rapide */}
            {!isCompact && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center text-white text-xs">
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Stock: {product.quantite}
                  </span>
                  {product.soldCount && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {product.soldCount} vendus
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contenu de la carte */}
          <div className="p-2 sm:p-3 space-y-2">
            {/* Marque */}
            {product.marque && (
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide truncate">
                {product.marque}
              </p>
            )}

            {/* Nom du produit */}
            <h3 className={`font-medium text-slate-800 line-clamp-2 leading-tight ${
              isCompact ? 'text-sm' : 'text-sm sm:text-base'
            }`}>
              {product.name}
            </h3>

            {/* Prix */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <p className="font-bold text-base sm:text-lg text-slate-900">
                  {formatPrice(finalPrice)} <span className="text-xs font-normal">XOF</span>
                </p>
                {product.prix && product.prix > finalPrice && (
                  <p className="text-xs sm:text-sm text-slate-500 line-through">
                    {formatPrice(product.prix)} XOF
                  </p>
                )}
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="flex justify-between items-center text-xs text-slate-500">
              {product.soldCount ? (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {product.soldCount} vendus
                </span>
              ) : (
                <span>Nouveau</span>
              )}
            </div>

            {/* Variantes de couleur */}
            {product.variants && product.variants.length > 0 && !isCompact && (
              <div className="flex gap-1">
                {product.variants.slice(0, 3).map((variant: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-slate-300 shadow-sm"
                    style={{ 
                      backgroundColor: variant.colorCode?.replace(/`/g, '') || variant.color 
                    }}
                    title={variant.color}
                  />
                ))}
                {product.variants.length > 3 && (
                  <span className="text-xs text-slate-500 ml-1">+{product.variants.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Composant bouton de tri
  const SortButton = ({ isActive, onClick, children, icon }: {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
        isActive
          ? "bg-red-500 text-white shadow-lg"
          : "text-slate-600 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
      <span className="sm:hidden">{typeof children === 'string' ? children.split(' ')[0] : children}</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-4 border-red-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 sm:mt-6 text-slate-600 font-medium text-sm sm:text-base">Chargement du magasin...</p>
        </div>
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400" />
          </div>
          <p className="text-slate-600 text-base sm:text-lg mb-4">Magasin introuvable</p>
          <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showNotification && (
        <div
          className={cn(
            "fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-[60] px-4 py-3 rounded-lg shadow-xl transition-all duration-300 backdrop-blur-sm",
            notificationType === "success"
              ? "bg-green-100/90 border border-green-400 text-green-700"
              : "bg-red-100/90 border border-red-400 text-red-700"
          )}
        >
          <p className="text-sm font-medium">{notificationMessage}</p>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* En-tête fixe avec design mobile optimisé */}
        <header className="inset-x-0 flex justify-center z-50">
          <div className="px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between max-w-6xl mx-auto gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full flex-shrink-0"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full flex-shrink-0"
                  >
                    <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-xl border-0 bg-white/95 backdrop-blur-lg">
                  <DropdownMenuItem onClick={() => router.push("/")}>
                    <Home className="mr-3 h-4 w-4" />
                    Accueil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="mr-3 h-4 w-4" />
                    Liste de souhaits
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-3 h-4 w-4" />
                    Mon compte
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/Profile_boutiquier/${sellerId}`)}>
                    <Eye className="mr-3 h-4 w-4" />
                    Voir le profil complet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="pt-16 sm:pt-20 pb-6 px-3 sm:px-4 max-w-6xl mx-auto" style={{ marginTop: -64 }}>
          {/* Section informations du magasin optimisée mobile */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-200">
            {/* Header mobile-first avec avatar et infos principales */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-xl flex-shrink-0">
                <AvatarImage src={sellerInfo.logo} alt={sellerInfo.storeName} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white text-lg sm:text-xl font-bold">
                  {sellerInfo.storeName?.[0] || sellerInfo.userName2?.[0]}{sellerInfo.name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2 line-clamp-2">
                  {sellerInfo.storeName || `${sellerInfo.userName2} ${sellerInfo.name}`}
                </h1>

                {/* Stats compactes sur mobile */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-semibold">{socialStats.followersCount}</span>
                    <span className="hidden sm:inline">abonnés</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                    <span className="font-semibold">{socialStats.rating.toFixed(1)}</span>
                    <span className="hidden sm:inline">({socialStats.reviewsCount} avis)</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs px-2 py-1">
                    {sellerInfo.category}
                  </Badge>
                </div>

                {/* Description sur mobile */}
                {sellerInfo.storeDescription && (
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 mb-3">
                    {sellerInfo.storeDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Bouton suivre centré sur mobile */}
            <div className="flex justify-center sm:justify-end mb-4">
              <Button
                className={`rounded-full px-6 sm:px-8 py-2 sm:py-3 font-semibold transition-all text-sm sm:text-base ${
                  isFollowing
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
                }`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? "✓ Suivi" : "Suivre"}
              </Button>
            </div>

            {/* Informations de contact optimisées mobile */}
            <div className="pt-4 border-t border-slate-200">
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                {/* Adresse */}
                {sellerInfo.address && (
                  <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span className="line-clamp-2 sm:line-clamp-1">{sellerInfo.address}</span>
                  </div>
                )}

                {/* Téléphone */}
                {sellerInfo.businessPhone && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span>{sellerInfo.businessPhone}</span>
                  </div>
                )}

                {/* Heures d'ouverture */}
                {sellerInfo.openingHours && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{sellerInfo.openingHours}</span>
                  </div>
                )}

                {/* Liens sociaux */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {sellerInfo.website && (
                    <a
                      href={sellerInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                    </a>
                  )}
                  {sellerInfo.facebook && (
                    <a
                      href={sellerInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Facebook className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </a>
                  )}
                  {sellerInfo.instagram && (
                    <a
                      href={sellerInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-pink-50 hover:bg-pink-100 rounded-full transition-colors"
                    >
                      <Instagram className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Barre de progression de confiance */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="text-slate-600 font-medium">Niveau de confiance</span>
                <span className="font-bold text-slate-800">{Math.round(socialStats.rating * 20)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round(socialStats.rating * 20)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Nouveau vendeur</span>
                <span>Vendeur de confiance</span>
              </div>
            </div>
          </div>

          {/* Onglets optimisés mobile */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-6 border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto">
              <TabButton
                isActive={activeTab === "home"}
                onClick={() => setActiveTab("home")}
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Accueil</span>
              </TabButton>
              <TabButton
                isActive={activeTab === "all_items"}
                onClick={() => setActiveTab("all_items")}
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Tous ({products.length})</span>
              </TabButton>
              <TabButton
                isActive={activeTab === "new_arrivals"}
                onClick={() => setActiveTab("new_arrivals")}
              >
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Nouveautés ({newArrivals.length})</span>
              </TabButton>
            </div>
          </div>

          {/* Contenu selon l'onglet actif */}
          {activeTab === "home" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Carrousel de bannières optimisé mobile */}
              {banners.length > 0 && (
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl h-48 sm:h-64 md:h-80">
                  <div className="relative w-full h-full">
                    {banners.map((banner, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          index === currentBannerIndex
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-105'
                        }`}
                      >
                        <Image
                          src={banner?.image}
                          alt={`Bannière ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={800}
                          height={400}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
                      </div>
                    ))}
                  </div>

                  {/* Navigation du carrousel */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevBanner}
                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </button>
                      <button
                        onClick={goToNextBanner}
                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </button>
                    </>
                  )}

                  {/* Indicateurs */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                            index === currentBannerIndex
                              ? 'bg-white scale-110'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* CTA overlay optimisé mobile */}
                  <div className="absolute bottom-4 sm:bottom-6 left-3 sm:left-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg hover:bg-white transition-all cursor-pointer">
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">DÉCOUVRIR</span>
                      <div className="bg-red-500 text-white rounded-full p-1 sm:p-1.5">
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section promotions mobile-first */}
              {promoProducts.length > 0 && (
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-red-500 text-white rounded-full p-1">
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold text-slate-800">Offres Flash</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Économisez jusqu'à {Math.max(...promoProducts.map(p => calculateDiscount(p.prix, p.prixPromo)))}% sur une sélection de produits
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 shadow-lg w-full sm:w-auto"
                        onClick={() => setActiveTab("all_items")}
                      >
                        Voir tout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {promoProducts.slice(0, 4).map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          isCompact
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Meilleures ventes responsive */}
              {hotDeals.length > 0 && (
                <section>
                  <div
                    className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer group"
                    onClick={() => setActiveTab("all_items")}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1.5 sm:p-2">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h2 className="text-lg sm:text-2xl font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                        Meilleures ventes
                      </h2>
                    </div>
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {hotDeals.slice(0, 6).map((product, index) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        showRanking
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Nouveautés responsive */}
              {newArrivals.length > 0 && (
                <section>
                  <div
                    className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer group"
                    onClick={() => setActiveTab("new_arrivals")}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full p-1.5 sm:p-2">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <h2 className="text-lg sm:text-2xl font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                        Nouveautés
                      </h2>
                    </div>
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {newArrivals.slice(0, 6).map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Sélection pour vous responsive */}
              <section>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-full p-1.5 sm:p-2">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Sélectionné pour vous</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "all_items" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Barre de tri et filtres mobile-first */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
                <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
                  {/* Boutons de tri sur mobile */}
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <SortButton
                      isActive={sortBy === "best_match"}
                      onClick={() => setSortBy("best_match")}
                      icon={<Feather className="h-3 w-3 sm:h-4 sm:w-4" />}
                    >
                      Pertinence
                    </SortButton>
                    <SortButton
                      isActive={sortBy === "orders"}
                      onClick={() => setSortBy("orders")}
                      icon={<TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />}
                    >
                      Plus vendus
                    </SortButton>
                    <SortButton
                      isActive={sortBy === "prices"}
                      onClick={() => setSortBy("prices")}
                      icon={<SortAsc className="h-3 w-3 sm:h-4 sm:w-4" />}
                    >
                      Prix croissant
                    </SortButton>
                    <SortButton
                      isActive={sortBy === "newest"}
                      onClick={() => setSortBy("newest")}
                      icon={<Zap className="h-3 w-3 sm:h-4 sm:w-4" />}
                    >
                      Plus récents
                    </SortButton>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-2 sm:px-3 py-1 text-xs">
                      {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                    </Badge>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                          Catégories
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-lg font-semibold">Filtrer par catégorie</h2>
                          <SheetClose asChild>
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </SheetClose>
                        </div>
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-l-4 hover:border-red-500 transition-all"
                            onClick={() => handleCategoryFilter(null, "All")}
                          >
                            <Grid className="mr-3 h-4 w-4" />
                            Tous les produits
                          </Button>
                          {categories.map((category) => (
                            <Button
                              key={category._id}
                              variant="ghost"
                              className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-l-4 hover:border-red-500 transition-all"
                              onClick={() => handleCategoryFilter(category._id, category.name)}
                            >
                              <Menu className="mr-3 h-4 w-4" />
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>

              {/* Grille de produits responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {sortProducts(filteredProducts).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>

              {/* Message si aucun produit */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">Aucun produit trouvé</h3>
                  <p className="text-sm sm:text-base text-slate-600">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "new_arrivals" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Section promotions responsive */}
              {promoProducts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-full p-1.5 sm:p-2">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">En promotion</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {promoProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Produits récents avec layout mobile optimisé */}
              <section>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-full p-1.5 sm:p-2">
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Ajoutés récemment</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {newArrivals.map((product) => (
                    <Card
                      key={product._id}
                      className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex gap-3 sm:gap-6">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={product.image1 || product.image}
                              alt={product.name}
                              className="w-20 h-20 sm:w-32 sm:h-32 object-cover rounded-lg sm:rounded-xl shadow-md"
                              width={128}
                              height={128}
                            />
                            {calculateDiscount(product.prix, product.prixPromo) > 0 && (
                              <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg text-xs">
                                -{calculateDiscount(product.prix, product.prixPromo)}%
                              </Badge>
                            )}
                          </div>

                          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                            {product.marque && (
                              <Badge variant="outline" className="text-xs font-medium">
                                {product.marque}
                              </Badge>
                            )}

                            <h4 className="text-sm sm:text-lg font-semibold text-slate-800 line-clamp-2 leading-tight">
                              {product.name}
                            </h4>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <p className="text-lg sm:text-2xl font-bold text-slate-900">
                                  {formatPrice(product.prixPromo || product.prix)} <span className="text-xs sm:text-sm font-normal">XOF</span>
                                </p>
                                {product.prix && product.prix > (product.prixPromo || product.prix) && (
                                  <p className="text-sm sm:text-lg text-slate-500 line-through">
                                    {formatPrice(product.prix)} XOF
                                  </p>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                                onClick={(e) => handleLikeClick(product, e)}
                              >
                                <Heart
                                  className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                                    likedProducts.includes(product._id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-slate-400 hover:text-red-500"
                                  }`}
                                />
                              </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-slate-500">
                              <div className="flex items-center gap-3 sm:gap-4">
                                {product.soldCount && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {product.soldCount} vendus
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  Stock: {product.quantite}
                                </span>
                              </div>
                            </div>

                            {/* Variantes de couleur */}
                            {product.variants && product.variants.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Couleurs:</span>
                                <div className="flex gap-2">
                                  {product.variants.slice(0, 5).map((variant: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                      style={{
                                        backgroundColor: variant.colorCode?.replace(/`/g, '') || variant.color
                                      }}
                                      title={variant.color}
                                    />
                                  ))}
                                  {product.variants.length > 5 && (
                                    <span className="text-sm text-slate-500 ml-1">
                                      +{product.variants.length - 5} autres
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Bouton flottant pour les messages */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl hover:shadow-3xl transition-all z-40"
          onClick={() => router.push(`/ContactSeller/${sellerId}`)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

export default AdvancedECommercePage;