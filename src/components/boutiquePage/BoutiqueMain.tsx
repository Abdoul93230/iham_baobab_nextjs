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
  Package,
  TrendingUp,
  Zap,
  Users,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { triggerNavProgress } from "@/components/NavigationProgress";
import QRCodeCardBoutique from "@/components/QRCodeCardBoutique";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

interface BoutiqueMainProps {
  storeName: string;
  sellerId: string;
}

const BoutiqueMain: React.FC<BoutiqueMainProps> = ({ sellerId, storeName }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("home");
  const [sortBy, setSortBy] = useState("best_match");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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

  const [hotDeals, setHotDeals] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  const dispatch = useAppDispatch();
  const likedProducts = useAppSelector((state: any) => state.likes.likedProducts);
  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userEcomme") || "{}")?.id
      : null;

  useEffect(() => {
    if (userId) dispatch(fetchUserLikes(userId) as any);
  }, [userId, dispatch]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("userEcomme") || "{}")?.token
        : null;
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (storeName) fetchStoreData();
  }, [storeName]);

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
    } catch {
      showToast("Une erreur est survenue", "error");
    }
  };

  const fetchStoreData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchSellerInfo(), fetchProducts(), fetchCategories(), fetchBanners()]);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger le magasin" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSellerInfo = async () => {
    const response = await axios.get(`${BackendUrl}/getSellerByNameClients/${storeName}`);
    setSellerInfo(response.data.data);
    setSocialStats({
      followersCount: response.data.data?.followersCount || 0,
      likesCount: response.data.data?.likesCount || 0,
      reviewsCount: response.data.data?.reviewsCount || 0,
      rating: response.data.data?.rating || 0,
    });
  };

  const fetchProducts = async () => {
    const response = await axios.get(`${BackendUrl}/searchProductBySupplierClients/${sellerId}`);
    const pub = response.data.data.filter((p: any) => p.isPublished === "Published");
    setProducts(pub);
    setAllProducts(pub);
    processProductCategories(pub);
  };

  const processProductCategories = (prods: any[]) => {
    setHotDeals([...prods].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 6));
    setNewArrivals(
      [...prods].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
    );
    setPromoProducts(
      prods.filter((p) => p.prix && p.prixPromo && p.prixPromo < p.prix).slice(0, 6)
    );
  };

  const fetchCategories = async () => {
    const response = await axios.get(`${BackendUrl}/getAllTypeBySeller/${sellerId}`);
    setCategories(response.data.data || []);
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${BackendUrl}/api/marketing/Bannerss/${sellerId}`, {
        withCredentials: true,
      });
      if (response.data.success) setBanners(response.data.data || []);
    } catch {}
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast({ variant: "destructive", title: "Connexion requise", description: "Veuillez vous connecter" });
      return;
    }
    setIsFollowing((v) => !v);
    setSocialStats((s) => ({
      ...s,
      followersCount: s.followersCount + (isFollowing ? -1 : 1),
    }));
    showToast(isFollowing ? "Vous ne suivez plus ce vendeur" : "Vous suivez maintenant ce vendeur");
  };

  const handleProductClick = (productId: string) => { triggerNavProgress(); router.push(`/ProduitDetail/${productId}`); };

  const handleCategoryFilter = async (categoryId: string | null, categoryName: string) => {
    setIsLoading(true);
    try {
      if (categoryName === "All") {
        setAllProducts(products);
      } else {
        const response = await axios.get(
          `${BackendUrl}/searchProductByTypeBySeller/${categoryId}/${sellerId}`
        );
        setAllProducts(
          response.data.products.filter((p: any) => p.isPublished === "Published")
        );
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de filtrer" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.marque?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortProducts = (prods: any[]) => {
    switch (sortBy) {
      case "orders":
        return [...prods].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      case "prices":
        return [...prods].sort((a, b) => (a.prixPromo || a.prix) - (b.prixPromo || b.prix));
      case "newest":
        return [...prods].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return prods;
    }
  };

  const calcDiscount = (prix: number, prixPromo: number) => {
    if (!prix || !prixPromo || prix <= prixPromo) return 0;
    return Math.round(((prix - prixPromo) / prix) * 100);
  };

  const fmt = (price: number) => new Intl.NumberFormat("fr-FR").format(price);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-[#30A08B] border-t-transparent animate-spin" />
          </div>
          <p className="mt-4 text-gray-500 text-sm font-medium">Chargement de la boutique…</p>
        </div>
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-600 mb-4">Magasin introuvable</p>
          <button
            onClick={() => router.back()}
            className="bg-[#30A08B] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#1d7a6a] transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ── Mini-card component for product grids ────────────────────────────────
  const MiniCard = ({ product, compact = false }: { product: any; compact?: boolean }) => {
    const disc = calcDiscount(product.prix, product.prixPromo);
    const finalPrice = product.prixPromo || product.prix;
    return (
      <div
        onClick={() => handleProductClick(product._id)}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100"
      >
        <div className={`relative overflow-hidden ${compact ? "h-28" : "h-36 sm:h-44"}`}>
          <Image
            src={product.image1 || product.image || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {disc > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{disc}%
            </span>
          )}
          <button
            onClick={(e) => handleLikeClick(product, e)}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 ${likedProducts.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
          </button>
        </div>
        <div className="p-2.5">
          <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-tight mb-1.5">
            {product.name}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900">{fmt(finalPrice)}</span>
            <span className="text-[10px] text-gray-400">F</span>
            {disc > 0 && (
              <span className="text-[10px] text-gray-400 line-through">{fmt(product.prix)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toast notification */}
      {showNotification && (
        <div
          className={`fixed top-20 right-4 left-4 sm:left-auto sm:w-72 z-[60] px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
            notificationType === "success"
              ? "bg-green-50 border border-green-300 text-green-700"
              : "bg-red-50 border border-red-300 text-red-700"
          }`}
        >
          {notificationMessage}
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* ── Store hero ────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#30A08B] via-[#1d7a6a] to-[#0d5c4e] overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          {sellerInfo.coverImage && (
            <Image
              src={sellerInfo.coverImage}
              alt="cover"
              fill
              className="object-cover opacity-30"
            />
          )}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />

          <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6 flex flex-col items-center text-center gap-4">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-2xl">
              <AvatarImage src={sellerInfo.logo} alt={sellerInfo.storeName} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {(sellerInfo.storeName || sellerInfo.userName2 || "B")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {sellerInfo.storeName || `${sellerInfo.userName2 || ""} ${sellerInfo.name || ""}`}
              </h1>
              {sellerInfo.storeDescription && (
                <p className="text-white/75 text-sm mt-1 max-w-sm line-clamp-2">
                  {sellerInfo.storeDescription}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <div className="text-center">
                <p className="font-black text-xl">{socialStats.followersCount}</p>
                <p className="text-xs text-white/60">Abonnés</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="font-black text-xl">{products.length}</p>
                <p className="text-xs text-white/60">Produits</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <p className="font-black text-xl">{socialStats.rating.toFixed(1)}</p>
                </div>
                <p className="text-xs text-white/60">{socialStats.reviewsCount} avis</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                  isFollowing
                    ? "bg-white/20 text-white border border-white/40 hover:bg-white/30"
                    : "bg-white text-[#30A08B] hover:bg-white/90"
                }`}
              >
                {isFollowing ? "✓ Suivi" : "+ Suivre"}
              </button>
              <button
                onClick={() => router.push(`/ContactSeller/${sellerId}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contacter
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => router.push("/")}>
                    <Home className="mr-2 h-4 w-4" /> Accueil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/Profile_boutiquier/${sellerId}`)}>
                    <Eye className="mr-2 h-4 w-4" /> Voir profil complet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── Contact + info bar ────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            {sellerInfo.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#30A08B]" />
                {sellerInfo.address}
              </span>
            )}
            {sellerInfo.businessPhone && (
              <a href={`tel:${sellerInfo.businessPhone}`} className="flex items-center gap-1.5 hover:text-[#30A08B]">
                <Phone className="w-3.5 h-3.5 text-[#30A08B]" />
                {sellerInfo.businessPhone}
              </a>
            )}
            {sellerInfo.openingHours && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#30A08B]" />
                {sellerInfo.openingHours}
              </span>
            )}
            <div className="flex items-center gap-2">
              {sellerInfo.website && (
                <a href={sellerInfo.website} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                  <Globe className="w-3.5 h-3.5 text-gray-600" />
                </a>
              )}
              {sellerInfo.facebook && (
                <a href={sellerInfo.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                </a>
              )}
              {sellerInfo.instagram && (
                <a href={sellerInfo.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 bg-pink-50 rounded-full flex items-center justify-center hover:bg-pink-100">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Promotion tools ───────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <details className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 select-none">
              <Share2 className="w-4 h-4 text-[#30A08B]" />
              Outils de promotion (QR code &amp; Flyer)
            </summary>
            <div className="px-4 pb-4 pt-2 space-y-4">
              <div className="bg-gradient-to-br from-[#30A08B]/5 to-[#B17236]/5 border border-[#30A08B]/20 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Flyer Complet</p>
                <QRCodeCardBoutique
                  seller={sellerInfo}
                  url={`${process.env.NEXT_PUBLIC_SITE_URL}/boutique/${encodeURIComponent(sellerInfo.storeName)}`}
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                <QRCodeGenerator
                  url={`${process.env.NEXT_PUBLIC_SITE_URL}/boutique/${encodeURIComponent(sellerInfo.storeName)}`}
                  title={sellerInfo.storeName}
                  description="Scannez pour voir cette boutique"
                  size={90}
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">QR Code Simple</p>
                  <p className="text-xs text-gray-500">Pour partage rapide</p>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* ── Tab navigation ────────────────────────────────────────────── */}
        <div className="sticky top-[60px] md:top-[120px] z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex">
              {[
                { id: "home", label: "Accueil", icon: <Home className="w-3.5 h-3.5" /> },
                { id: "all_items", label: `Tous (${products.length})`, icon: <Grid className="w-3.5 h-3.5" /> },
                { id: "new_arrivals", label: `Nouveautés (${newArrivals.length})`, icon: <Zap className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#30A08B] text-[#30A08B]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab content ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

          {/* HOME TAB */}
          {activeTab === "home" && (
            <>
              {/* Banner carousel */}
              {banners.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden shadow-lg h-44 sm:h-64">
                  {banners.map((banner, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-opacity duration-500 ${i === currentBannerIndex ? "opacity-100" : "opacity-0"}`}
                    >
                      <Image src={banner?.image} alt={`Bannière ${i + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
                    </div>
                  ))}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentBannerIndex((p) => (p - 1 + banners.length) % banners.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentBannerIndex((p) => (p + 1) % banners.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {banners.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentBannerIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === currentBannerIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Flash deals */}
              {promoProducts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="font-black text-lg text-gray-800">Offres Flash</h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("all_items")}
                      className="text-xs text-[#30A08B] font-semibold flex items-center gap-1 hover:underline"
                    >
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {promoProducts.slice(0, 4).map((p) => (
                      <MiniCard key={p._id} product={p} compact />
                    ))}
                  </div>
                </section>
              )}

              {/* Best sellers */}
              {hotDeals.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="font-black text-lg text-gray-800">Meilleures ventes</h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("all_items")}
                      className="text-xs text-[#30A08B] font-semibold flex items-center gap-1 hover:underline"
                    >
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {hotDeals.slice(0, 4).map((p) => (
                      <MiniCard key={p._id} product={p} />
                    ))}
                  </div>
                </section>
              )}

              {/* New arrivals */}
              {newArrivals.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <PlayCircle className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="font-black text-lg text-gray-800">Nouveautés</h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("new_arrivals")}
                      className="text-xs text-[#30A08B] font-semibold flex items-center gap-1 hover:underline"
                    >
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {newArrivals.slice(0, 4).map((p) => (
                      <MiniCard key={p._id} product={p} />
                    ))}
                  </div>
                </section>
              )}

              {/* All products */}
              {products.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#30A08B] to-[#1d7a6a] rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-black text-lg text-gray-800">Sélectionné pour vous</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {products.slice(0, 8).map((p) => (
                      <MiniCard key={p._id} product={p} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ALL ITEMS TAB */}
          {activeTab === "all_items" && (
            <div className="space-y-4">
              {/* Search + sort controls */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans cette boutique…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#30A08B] focus:ring-2 focus:ring-[#30A08B]/20"
                  />
                </div>
                {/* Sort + filter row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {[
                      { value: "best_match", label: "Pertinence" },
                      { value: "orders", label: "Plus vendus" },
                      { value: "prices", label: "Prix ↑" },
                      { value: "newest", label: "Récents" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          sortBy === opt.value
                            ? "bg-[#30A08B] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-[#30A08B] hover:text-[#30A08B] bg-white">
                        <Filter className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Catégorie</span>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-800">Filtrer par catégorie</h2>
                        <SheetClose asChild>
                          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </button>
                        </SheetClose>
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleCategoryFilter(null, "All")}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-[#30A08B]/10 hover:text-[#30A08B] transition-colors"
                        >
                          <Grid className="w-4 h-4" /> Tous les produits
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat._id}
                            onClick={() => handleCategoryFilter(cat._id, cat.name)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-[#30A08B]/10 hover:text-[#30A08B] transition-colors capitalize"
                          >
                            <Menu className="w-4 h-4" /> {cat.name}
                          </button>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <p className="text-xs text-gray-400">
                  {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sortProducts(filteredProducts).map((p) => (
                    <MiniCard key={p._id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-semibold">Aucun produit trouvé</p>
                  <button
                    onClick={() => { setSearchTerm(""); setAllProducts(products); }}
                    className="text-sm text-[#30A08B] hover:underline"
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NEW ARRIVALS TAB */}
          {activeTab === "new_arrivals" && (
            <div className="space-y-8">
              {promoProducts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-black text-lg text-gray-800">En promotion</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {promoProducts.map((p) => (
                      <MiniCard key={p._id} product={p} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-black text-lg text-gray-800">Ajoutés récemment</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {newArrivals.map((p) => {
                    const disc = calcDiscount(p.prix, p.prixPromo);
                    return (
                      <div
                        key={p._id}
                        onClick={() => handleProductClick(p._id)}
                        className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden">
                          <Image
                            src={p.image1 || p.image || "/placeholder.jpg"}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                          {disc > 0 && (
                            <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full">
                              -{disc}%
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                              {p.name}
                            </p>
                            {p.marque && (
                              <p className="text-xs text-gray-400 mt-0.5">{p.marque}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-gray-900">
                                {fmt(p.prixPromo || p.prix)}
                              </span>
                              <span className="text-xs text-gray-400">F</span>
                              {disc > 0 && (
                                <span className="text-xs text-gray-400 line-through">{fmt(p.prix)}</span>
                              )}
                            </div>
                            <button
                              onClick={(e) => handleLikeClick(p, e)}
                              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
                            >
                              <Heart
                                className={`w-4 h-4 ${likedProducts.includes(p._id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                              />
                            </button>
                          </div>
                          {p.variants && p.variants.length > 0 && (
                            <div className="flex gap-1 mt-1.5">
                              {p.variants.slice(0, 5).map((v: any, i: number) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: v.colorCode?.replace(/`/g, "") || v.color }}
                                  title={v.color}
                                />
                              ))}
                              {p.variants.length > 5 && (
                                <span className="text-xs text-gray-400">+{p.variants.length - 5}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BoutiqueMain;
