"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin, Truck, ShieldCheck, Minus, Plus, Share2, Heart,
  Store, MessageCircle, X, ZoomIn, ZoomOut, ChevronRight,
  ChevronLeft, Star, Package, RefreshCw, BadgeCheck,
  ShoppingCart, ChevronDown,
} from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import ProduitSimilaires from "./ProduitSimilaires";
import CommentaireProduit from "./CommentaireProduit";
import CountryPage from "./CountryPage";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { shuffle } from "lodash";
import Alert from "./Alert";
import AppPromo from "./AppPromo";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import { setProducts, Variant } from "@/redux/productsSlice";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProduitDetailMainProps {
  panierchg?: () => void;
  productId: string;
  serverData?: any;
}

function ProduitDetailMain({ panierchg, productId, serverData }: ProduitDetailMainProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeImage, setSelectedSizeImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [Allcommente, setAllCommente] = useState<any[]>([]);
  const [categorie, setCategorie] = useState<any>(null);
  const [products, setProductsState] = useState<any[]>([]);
  const [productsAutres, setProductsAutres] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const westAfricanCountries = [
    "benin","burkina faso","cap-vert","côte d'ivoire","gambie","ghana",
    "guinee","guinee-bissau","liberia","mali","niger","nigeria","senegal",
    "sierra leone","togo",
  ];

  const [regionClient, setRegionClient] = useState("Niamey");
  const [pays, setPays] = useState("Niger");
  const [alert, setAlert] = useState<{ visible: boolean; type: "error" | "success" | "warn" | "info"; message: string }>({
    visible: false, type: "success", message: "",
  });

  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

  const dispatch = useAppDispatch();
  const DATA_Products = useAppSelector((state) => state.products.data);
  const DATA_Types = useAppSelector((state) => state.products.types);
  const DATA_Categories = useAppSelector((state) => state.products.categories);
  const likedProducts = useAppSelector((state) => state.likes.likedProducts);

  const [immediateProducts, setImmediateProducts] = useState<any[]>([]);
  const [immediateProduct, setImmediateProduct] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("userEcomme");
        if (raw) { const d = JSON.parse(raw); setUser(d); setUserId(d?.id); }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (serverData) {
      if (serverData.product) setImmediateProduct(serverData.product);
      const all = [
        ...(serverData.product ? [serverData.product] : []),
        ...serverData.similarProducts,
        ...serverData.allProducts,
      ];
      setImmediateProducts(all);
    }
  }, [serverData]);

  const effectiveProducts = immediateProducts.length > 0 ? immediateProducts : DATA_Products;
  const produit = immediateProduct || (effectiveProducts as any[]).find((p) => p._id === productId);
  const [selectedVariant, setSelectedVariant] = useState<any>(produit?.variants?.[0]);

  useEffect(() => {
    if (userId) dispatch(fetchUserLikes(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    if (productId && BackendUrl) {
      axios.get(`${BackendUrl}/getAllCommenteProduitById/${productId}`)
        .then((r) => setAllCommente(r.data.data))
        .catch(() => {});
    }
  }, [productId, BackendUrl]);

  useEffect(() => {
    const filtered = DATA_Products.filter((i: any) => i.ClefType === produit?.ClefType);
    const type = DATA_Types.find((i: any) => i._id === produit?.ClefType);
    const cat = DATA_Categories.find((i: any) => i._id === type?.clefCategories);
    setCategorie(cat);
    const rnd = (arr: any[], n: number) => shuffle(arr).slice(0, n);
    setProductsState(rnd(filtered, 12));
    setProductsAutres(rnd(DATA_Products as any[], 12));
  }, [DATA_Products, produit, DATA_Types, DATA_Categories]);

  useEffect(() => {
    setSelectedSize(null);
    setSelectedVariant(produit?.variants?.[0]);
    setActiveImageIndex(0);
    setQuantity(1);
  }, [productId, produit]);

  // IP-based country detection
  useEffect(() => {
    if (!BackendUrl) return;
    (async () => {
      try {
        const ip = await axios.get("https://ifconfig.me/ip");
        const r = await axios.get(`${BackendUrl}/proxy/ip-api`, { headers: { "Client-IP": ip.data } });
        setRegionClient((r.data.regionName || "Niamey").toLowerCase());
        setPays((r.data.country || "Niger").toLowerCase());
      } catch {}
    })();
  }, [BackendUrl]);

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => setAlert({ visible: false, type: "success", message: "" }), 4000);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const getAllImages = () => {
    const base = [produit?.image1, produit?.image2, produit?.image3]
      .filter((i): i is string => !!i && i.startsWith("http"));
    const variantImgs = Array.isArray(produit?.variants)
      ? produit.variants.map((v: any) => v?.imageUrl).filter(Boolean)
      : [];
    return [...base, ...variantImgs];
  };
  const allImages = getAllImages();
  const originalPrice = produit?.prix || 0;
  const discountedPrice = produit?.prixPromo || 0;
  const activePrice = discountedPrice > 0 ? discountedPrice : originalPrice;
  const discount = originalPrice > 0 && discountedPrice > 0
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
  const isLiked = produit?._id ? likedProducts.includes(produit._id) : false;

  const getAvailableStock = () => {
    if (produit?.variants?.length > 0) {
      return selectedVariant ? (selectedVariant.stock || 0)
        : produit.variants.reduce((t: number, v: any) => t + (v.stock || 0), 0);
    }
    return produit?.quantite || 0;
  };
  const stock = getAvailableStock();

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setSelectedSize(null);
    const idx = allImages.findIndex((img) => img === variant.imageUrl);
    if (idx !== -1) setActiveImageIndex(idx);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) { router.push("/auth/login"); return; }
    if (isLiking) return;
    setIsLiking(true);
    try { await dispatch(toggleLike({ userId, product: produit })).unwrap(); } catch {}
    setIsLiking(false);
  };

  const buildCartItem = () => ({
    ...produit,
    colors: selectedVariant ? [selectedVariant.color] : [],
    sizes: selectedSize ? [selectedSize] : [],
    quantity,
    _id: produit?._id,
    imageUrl: selectedVariant ? selectedVariant.imageUrl : produit?.image1,
    price: activePrice,
    prixPromo: discountedPrice,
    ...(selectedVariant && { stockVariante: selectedVariant.quantity || selectedVariant.stock || 0 }),
  });

  const validateCart = () => {
    if (!westAfricanCountries.includes(pays?.toLowerCase())) {
      showAlert("warn", `Produit non livrable au ${pays}`); return false;
    }
    if (produit?.variants?.length >= 2 && !selectedVariant) {
      showAlert("warn", `Choisissez un modèle`); return false;
    }
    const hasMultiSizes = produit?.variants?.some((v: any) => v.sizes?.length >= 1);
    if (hasMultiSizes && !selectedSize) {
      showAlert("warn", "Veuillez sélectionner une taille"); return false;
    }
    if (stock <= 0) { showAlert("warn", "Rupture de stock"); return false; }
    return true;
  };

  const addToCart = (redirect = false) => {
    if (!produit || !validateCart()) return;
    const existing = JSON.parse(localStorage.getItem("panier") || "[]");
    const idx = existing.findIndex((p: any) => {
      if (!produit.variants?.length) return p._id === produit._id;
      return p._id === produit._id && p.colors?.[0] === selectedVariant?.color && p.sizes?.[0] === selectedSize;
    });
    let updated;
    if (idx !== -1) {
      updated = existing.map((p: any, i: number) => i === idx ? { ...p, quantity: p.quantity + quantity } : p);
    } else {
      updated = [...existing, buildCartItem()];
    }
    localStorage.setItem("panier", JSON.stringify(updated));
    showAlert("success", redirect ? "Redirection vers le panier…" : `${quantity} article(s) ajouté(s) au panier !`);
    panierchg?.();
    if (redirect) setTimeout(() => router.push("/Panier"), 600);
  };

  const handleWhatsApp = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const msg = `Bonjour, je suis intéressé(e) par *${produit?.name}*.\n${url}`;
    window.open(`https://wa.me/22787727501?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim().length < 3) { showAlert("warn", "Commentaire trop court (min 3 caractères)"); return; }
    if (rating === 0) { showAlert("warn", "Veuillez noter le produit"); return; }
    if (!user) { showAlert("warn", "Connectez-vous pour publier un avis"); return; }
    if (!BackendUrl) return;
    axios.post(`${BackendUrl}/createCommenteProduit`, {
      description: commentText, clefProduct: produit?._id,
      clefType: produit?.ClefType, etoil: rating, userName: user?.name,
    }).then(() => {
      showAlert("success", "Commentaire ajouté !");
      setIsCommentOpen(false); setCommentText(""); setRating(0);
      axios.get(`${BackendUrl}/getAllCommenteProduitById/${productId}`)
        .then((r) => setAllCommente(r.data.data)).catch(() => {});
    }).catch((err) => showAlert("warn", err.response?.data || "Erreur"));
  };

  // Lightbox mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    const sx = e.clientX - imagePosition.x, sy = e.clientY - imagePosition.y;
    const onMove = (me: MouseEvent) => {
      if (!imageRef.current || !containerRef.current) return;
      const r = imageRef.current.getBoundingClientRect();
      const cr = containerRef.current.getBoundingClientRect();
      const mx = (r.width * zoomLevel - cr.width) / 2;
      const my = (r.height * zoomLevel - cr.height) / 2;
      setImagePosition({
        x: Math.min(Math.max(me.clientX - sx, -mx), mx),
        y: Math.min(Math.max(me.clientY - sy, -my), my),
      });
    };
    const onUp = () => { setIsDragging(false); document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (!produit) return null;

  const avgRating = Allcommente.length > 0
    ? (Allcommente.reduce((s: number, c: any) => s + (c.etoil || 0), 0) / Allcommente.length).toFixed(1)
    : "4.8";

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-4">

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <button onClick={() => router.push("/")} className="hover:text-[#30A08B]">Accueil</button>
          <ChevronRight size={12} />
          {categorie && (
            <>
              <button onClick={() => router.push(`/Categorie/${categorie.name}`)} className="hover:text-[#30A08B] capitalize">{categorie.name}</button>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{produit.name}</span>
        </nav>

        {/* ── Main 2-col layout ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xl:gap-8">

          {/* ── LEFT: Gallery ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
              className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm aspect-square cursor-zoom-in select-none"
              onClick={() => setIsLightboxOpen(true)}
            >
              {allImages[activeImageIndex] ? (
                <Image
                  src={allImages[activeImageIndex]}
                  alt={produit.name}
                  fill
                  className="object-contain transition-all duration-300"
                  sizes="(max-width:1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ShoppingCart size={40} className="text-gray-300" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
                {stock > 0 && stock <= 5 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Plus que {stock} !
                  </span>
                )}
              </div>

              {/* Like */}
              <button
                onClick={(e) => { e.stopPropagation(); handleLike(e); }}
                disabled={isLiking}
                className={cn(
                  "absolute top-3 right-3 z-10 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all",
                  isLiked ? "bg-red-50 border border-red-200" : "bg-white/90 border border-gray-200 hover:bg-red-50"
                )}
              >
                <Heart size={17} className={isLiked ? "text-red-500 fill-red-500" : "text-gray-400"} />
              </button>

              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex((p) => (p - 1 + allImages.length) % allImages.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 transition-all z-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex((p) => (p + 1) % allImages.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 transition-all z-10"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 z-10 bg-black/30 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                <ZoomIn size={10} /> Agrandir
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                      activeImageIndex === i ? "border-[#30A08B] shadow-md" : "border-gray-200 hover:border-[#30A08B]/50"
                    )}
                  >
                    <Image src={img} alt={`Vue ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Title + rating */}
            <div>
              {discount > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                  🔥 Offre limitée
                </span>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{produit.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13}
                      className={parseFloat(avgRating) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{avgRating} ({Allcommente.length} avis)</span>
                </div>
                {produit.Clefournisseur?.isvalid && (
                  <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                    <BadgeCheck size={12} /> Boutique vérifiée
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#B17236]">
                  {activePrice.toLocaleString()} F
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-base text-gray-400 line-through">{originalPrice.toLocaleString()} F</span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Prix hors taxes · 2+ pièces: extra -5%</p>

              {/* Stock indicator */}
              <div className="mt-3">
                {stock > 5 ? (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> En stock ({stock} disponibles)
                  </span>
                ) : stock > 0 ? (
                  <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse" />
                    Derniers {stock} en stock !
                  </span>
                ) : (
                  <span className="text-xs text-red-600 font-medium">Rupture de stock</span>
                )}
              </div>
            </div>

            {/* Variants */}
            {produit.variants?.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Couleur : <span className="text-gray-900 normal-case font-semibold">{selectedVariant?.color || "—"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {produit.variants.map((v: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleVariantChange(v)}
                        className={cn(
                          "w-14 h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                          selectedVariant?.color === v.color
                            ? "border-[#30A08B] shadow-md ring-2 ring-[#30A08B]/30"
                            : "border-gray-200 hover:border-[#30A08B]/50"
                        )}
                      >
                        <Image src={v.imageUrl} alt={v.color} width={56} height={56} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {selectedVariant?.sizes?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Taille : <span className="text-gray-900 normal-case font-semibold">{selectedSize || "Sélectionner"}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVariant.sizes.map((size: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[52px] px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                            selectedSize === size
                              ? "border-[#30A08B] bg-[#f0faf7] text-[#30A08B]"
                              : "border-gray-200 text-gray-700 hover:border-[#30A08B]/50"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity + CTA (desktop) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Quantité</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-700 hover:border-[#30A08B] hover:text-[#30A08B] transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => { if (quantity < stock) setQuantity((q) => q + 1); else showAlert("warn", `Max ${stock}`); }}
                    className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-700 hover:border-[#30A08B] hover:text-[#30A08B] transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA buttons — desktop */}
              <div className="hidden md:flex flex-col gap-2.5">
                <button
                  onClick={() => addToCart(true)}
                  disabled={stock <= 0}
                  className="w-full py-3.5 rounded-xl font-black text-base bg-[#30A08B] hover:bg-[#268070] text-white transition-all hover:shadow-lg active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stock <= 0 ? "Rupture de stock" : "Acheter maintenant"}
                </button>
                <button
                  onClick={() => addToCart(false)}
                  disabled={stock <= 0}
                  className="w-full py-3.5 rounded-xl font-bold text-base border-2 border-[#30A08B] text-[#30A08B] hover:bg-[#f0faf7] transition-all active:scale-[.98] disabled:opacity-50"
                >
                  <ShoppingCart size={16} className="inline mr-2" />
                  Ajouter au panier
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, label: "Livraison", sub: "Partout au Niger" },
                { icon: ShieldCheck, label: "Paiement sécurisé", sub: "Mobile Money" },
                { icon: RefreshCw, label: "Retour", sub: "Sous 7 jours" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-xl p-3 flex flex-col items-center gap-1 border border-gray-100 text-center shadow-sm">
                  <Icon size={18} className="text-[#30A08B]" />
                  <p className="text-[10px] font-bold text-gray-700 leading-tight">{label}</p>
                  <p className="text-[9px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Truck size={15} className="text-[#30A08B]" /> Livraison vers
                </h3>
                <button
                  onClick={() => setIsCountryOpen(true)}
                  className="flex items-center gap-1 text-xs text-[#30A08B] font-semibold hover:underline"
                >
                  <MapPin size={12} /> {pays.toUpperCase()}
                </button>
              </div>
              {!westAfricanCountries.includes(pays.toLowerCase()) ? (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">
                  Cet article ne peut pas être livré à cette adresse.
                </p>
              ) : (
                <p className="text-xs text-green-600">✓ Livraison disponible dans votre zone</p>
              )}
            </div>

            {/* Seller info */}
            {produit.Clefournisseur && (
              <button
                onClick={() => router.push(`/boutique/${produit.Clefournisseur.storeName}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:border-[#30A08B]/40 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                  {produit.Clefournisseur.logo ? (
                    <Image src={produit.Clefournisseur.logo} alt="logo" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={20} className="m-auto mt-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {produit.Clefournisseur.storeName || produit.Clefournisseur.name}
                  </p>
                  {produit.Clefournisseur.city && (
                    <p className="text-xs text-gray-400">{produit.Clefournisseur.city}</p>
                  )}
                  {produit.Clefournisseur.isvalid && (
                    <span className="text-[10px] text-green-600 font-medium">✓ Boutique vérifiée</span>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              </button>
            )}

            {/* Quick actions */}
            <div className="flex gap-2">
              {[
                { icon: FaWhatsapp, label: "WhatsApp", color: "bg-green-50 text-green-600 border-green-200", action: handleWhatsApp },
                { icon: Share2, label: "Partager", color: "bg-blue-50 text-blue-600 border-blue-200", action: () => setIsShareOpen(true) },
                { icon: MessageCircle, label: "Avis", color: "bg-[#f0faf7] text-[#30A08B] border-[#30A08B]/20", action: () => setIsCommentOpen(true) },
              ].map(({ icon: Icon, label, color, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className={cn("flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border font-medium text-xs transition-all hover:shadow-sm", color)}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>

            {/* QR Code / Flyer */}
            {produit && typeof window !== "undefined" && (
              <div className="mt-3">
                <QRCodeGenerator
                  url={window.location.href}
                  title={produit.name || "Produit"}
                  description={`${(produit.prixPromo || produit.prix || 0).toLocaleString()} F CFA`}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Description ──────────────────────────────────────────────────── */}
        <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">Description du produit</h2>
          <div className={cn("text-sm text-gray-600 leading-relaxed overflow-hidden transition-all", descExpanded ? "max-h-none" : "max-h-32")}>
            <div dangerouslySetInnerHTML={{ __html: produit.description || "<p>Aucune description disponible.</p>" }} />
          </div>
          {produit.description && produit.description.length > 300 && (
            <button
              onClick={() => setDescExpanded((e) => !e)}
              className="mt-2 text-[#30A08B] text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              {descExpanded ? "Réduire" : "Lire plus"}
              <ChevronDown size={14} className={cn("transition-transform", descExpanded && "rotate-180")} />
            </button>
          )}
        </div>

        {/* ── Similar products ─────────────────────────────────────────────── */}
        <div className="mt-6">
          <ProduitSimilaires titre="Articles similaires" produits={products} userId={userId} onLike={(p: any, e: any) => handleLike(e)} />
        </div>

        <AppPromo />

        <div className="mt-4">
          <ProduitSimilaires titre="Autres articles" produits={productsAutres} userId={userId} onLike={(p: any, e: any) => handleLike(e)} />
        </div>

        <CommentaireProduit
          name={produit.name}
          img={[produit.image1, produit.image2, produit.image3].filter(Boolean)}
          coments={Allcommente}
          categorie={categorie}
        />
      </div>

      {/* ── Mobile sticky CTA ───────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-2xl">
        <button
          onClick={() => addToCart(false)}
          disabled={stock <= 0}
          className="flex-1 py-3 rounded-xl border-2 border-[#30A08B] text-[#30A08B] font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#f0faf7] transition-all disabled:opacity-50"
        >
          <ShoppingCart size={16} /> Panier
        </button>
        <button
          onClick={() => addToCart(true)}
          disabled={stock <= 0}
          className="flex-1 py-3 rounded-xl bg-[#30A08B] text-white font-black text-sm hover:bg-[#268070] transition-all disabled:opacity-50"
        >
          {stock <= 0 ? "Rupture" : "Acheter"}
        </button>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => { setIsLightboxOpen(false); setZoomLevel(1); setImagePosition({ x: 0, y: 0 }); }}
        >
          <div className="relative w-full max-w-3xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              {[{ icon: ZoomOut, action: () => setZoomLevel((z) => Math.max(1, z - 0.5)) }, { icon: ZoomIn, action: () => setZoomLevel((z) => Math.min(5, z + 0.5)) }]
                .map(({ icon: Icon, action }) => (
                  <button key={action.toString()} onClick={action}
                    className="bg-white/20 hover:bg-white/40 p-2 rounded-full transition-all">
                    <Icon size={20} className="text-white" />
                  </button>
                ))}
            </div>
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveImageIndex((p) => (p - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 p-2 rounded-full">
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button onClick={() => setActiveImageIndex((p) => (p + 1) % allImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 p-2 rounded-full">
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}
            <div ref={containerRef} className="flex items-center justify-center w-full h-full overflow-hidden"
              onWheel={(e) => { e.preventDefault(); setZoomLevel((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 1), 5)); }}>
              <img
                ref={imageRef}
                src={allImages[activeImageIndex]}
                alt="Zoom"
                onMouseDown={handleMouseDown}
                className={cn("transition-transform duration-200", zoomLevel > 1 ? "cursor-move" : "cursor-zoom-in")}
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                  userSelect: "none", pointerEvents: isDragging ? "none" : "auto",
                }}
              />
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setActiveImageIndex(i)}
                  className={cn("w-2 h-2 rounded-full transition-all", i === activeImageIndex ? "bg-white w-5" : "bg-white/40")}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Share modal ─────────────────────────────────────────────────────── */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsShareOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-72 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4 text-center">Partager ce produit</h3>
            <div className="flex justify-around">
              {[
                { icon: FaFacebook, color: "text-blue-600", href: `https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                { icon: FaWhatsapp, color: "text-green-500", href: `https://wa.me/?text=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                { icon: FaLinkedin, color: "text-blue-700", href: `https://www.linkedin.com/shareArticle?mini=true&url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                { icon: FaInstagram, color: "text-pink-600", href: "https://www.instagram.com/" },
              ].map(({ icon: Icon, color, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className={cn("w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:scale-110 transition-transform", color)}>
                  <Icon size={22} />
                </a>
              ))}
            </div>
            <button onClick={() => setIsShareOpen(false)} className="mt-4 w-full py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Comment modal ───────────────────────────────────────────────────── */}
      {isCommentOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setIsCommentOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4 text-center">Laisser un avis</h3>
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star size={28} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"} />
                </button>
              ))}
            </div>
            <form onSubmit={submitComment} className="space-y-3">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#30A08B] resize-none"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Partagez votre expérience…"
              />
              <button type="submit" className="w-full py-3 rounded-xl bg-[#30A08B] text-white font-bold text-sm hover:bg-[#268070] transition-all">
                Publier l'avis
              </button>
            </form>
            <button onClick={() => setIsCommentOpen(false)} className="mt-2 w-full py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-700">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── Country picker ──────────────────────────────────────────────────── */}
      <CountryPage isOpen={isCountryOpen} setIsCountryOpen={setIsCountryOpen} onClose={() => setIsCountryOpen(false)} setPays={setPays} />

      {alert.visible && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ visible: false, type: "success", message: "" })} />
      )}
    </div>
  );
}

export default ProduitDetailMain;
