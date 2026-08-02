"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { triggerNavProgress } from "@/components/NavigationProgress";
import {
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Tag,
  ChevronRight,
  Package,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { useSelector } from "react-redux";
import ZoneSelector from "./ZoneSelector";
import { formatCurrency } from "../../lib/utils";
import Alert from "../Alert";
import { RootState } from "@/redux/store";
import { AuthService } from "@/lib/auth";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

interface Zone {
  _id: string;
  name: string;
  type: string;
  fullPath?: string;
  country?: string;
  region?: string;
  city?: string;
  isActive: boolean;
}

interface StoreGroup {
  storeId: string;
  storeName: string;
  storeInfo: any;
  articles: { article: any; originalIndex: number }[];
  totalWeight: number;
  totalValue: number;
  shippingCost: number;
}

interface ShippingCalculation {
  storeId: string;
  totalCost: number;
  fixedCost?: number;
  weightCost?: number;
  costPerKg?: number;
  success?: boolean;
  appliedPolicy?: { zone: string; type: string; error?: string };
}

const PanierPage: React.FC = () => {
  const router = useRouter();

  const [articles, setArticles] = useState<any[]>([]);
  const [codePromo, setCodePromo] = useState("");
  const [reduction, setReduction] = useState(0);
  const [message, setMessage] = useState("");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [rond, setRond] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingCalculations, setShippingCalculations] = useState<Record<string, ShippingCalculation>>({});
  const [unavailableProducts, setUnavailableProducts] = useState<Set<string>>(new Set());
  const [codeP, setCodeP] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "info" | "success" | "warning" | "error" | "warn",
    message: "",
  });

  const { acces } = useSelector((state: RootState) => state.user);

  // Load articles from localStorage
  useEffect(() => {
    const load = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("panier");
        if (stored) setArticles(JSON.parse(stored));
        else setArticles([]);
      }
    };
    load();
    window.addEventListener("storage", load);
    const interval = setInterval(load, 1000);
    return () => {
      window.removeEventListener("storage", load);
      clearInterval(interval);
    };
  }, []);

  // Même logique de poids que le backend : shipping.weight || poids || 0.5
  const calculateProductWeight = useMemo(
    () => (article: any) => (article.shipping?.weight ?? article.poids) || 0.5,
    []
  );

  const getAvailableStock = (article: any) => {
    if (article.stockVariante !== undefined) return article.stockVariante;
    if (article.variants?.length > 0) {
      const variant = article.variants.find((v: any) => v.color === article.colors?.[0]);
      return variant ? variant.quantity || variant.stock || 0 : 0;
    }
    return article.quantite || article.stock || article.quantity_in_stock || 0;
  };

  // Group articles by store — flat array per store (no product sub-grouping)
  const storeGroups = useMemo(() => {
    const groups: Record<string, StoreGroup> = {};
    articles.forEach((article, idx) => {
      const storeId = article.Clefournisseur?._id || "unknown";
      const storeName =
        article.Clefournisseur?.storeName || article.Clefournisseur?.name || "Boutique inconnue";
      if (!groups[storeId]) {
        groups[storeId] = {
          storeId,
          storeName,
          storeInfo: article.Clefournisseur || {},
          articles: [],
          totalWeight: 0,
          totalValue: 0,
          shippingCost: 0,
        };
      }
      const qty = article.quantity || 0;
      const price = article.prixPromo || article.prix || article.price || 0;
      groups[storeId].articles.push({ article, originalIndex: idx });
      groups[storeId].totalWeight += calculateProductWeight(article) * qty;
      groups[storeId].totalValue += price * qty;
    });
    return groups;
  }, [articles, calculateProductWeight]);

  const storeGroupsArray = useMemo(() => Object.values(storeGroups), [storeGroups]);

  // Shipping calculations
  const calculateShippingForStore = async (
    storeId: string,
    totalWeight: number,
    customerZoneId: string
  ) => {
    try {
      const response = await axios.post(
        `${BackendUrl}/api/shipping2/calculate`,
        { sellerId: storeId, customerZoneId, weight: totalWeight },
        { timeout: 10000 }
      );
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          fixedCost: response.data.data.fixedCost || 0,
          weightCost: response.data.data.weightCost || 0,
          costPerKg: response.data.data.costPerKg || 250,
          totalCost: response.data.data.totalCost || 0,
          appliedPolicy: response.data.data.appliedPolicy || { zone: "API", type: "calculated" },
        };
      }
      throw new Error("Invalid API response");
    } catch {
      return {
        success: false,
        fixedCost: 1000,
        costPerKg: 250,
        weightCost: 250 * totalWeight,
        totalCost: 1000 + 250 * totalWeight,
        appliedPolicy: { zone: "Politique par défaut", type: "fallback" },
      };
    }
  };

  const recalculateAllShipping = async (
    grouped: Record<string, StoreGroup>,
    customerZone: Zone
  ) => {
    if (!customerZone) return;
    const calculations: Record<string, any> = {};
    const unavailable = new Set<string>();
    for (const [storeId, storeGroup] of Object.entries(grouped)) {
      const result = await calculateShippingForStore(
        storeId,
        storeGroup.totalWeight,
        customerZone._id
      );
      calculations[storeId] = result;
      if (result.totalCost === 0) {
        storeGroup.articles.forEach(({ article }) =>
          unavailable.add(`${storeId}-${article._id}`)
        );
      }
    }
    setShippingCalculations(calculations);
    setUnavailableProducts(unavailable);
  };

  const showAlert = (
    type: "info" | "success" | "warning" | "error" | "warn",
    msg: string
  ) => {
    setAlert({ visible: true, type, message: msg });
    setTimeout(() => setAlert({ visible: false, type: "info", message: "" }), 5000);
  };

  // IP-based zone detection on mount
  useEffect(() => {
    const detect = async () => {
      setLoading(true);
      try {
        const ip = await axios.get("https://ifconfig.me/ip", { timeout: 5000 });
        const geo = await axios.get(`${BackendUrl}/proxy/ip-api`, {
          headers: { "Client-IP": ip.data },
          timeout: 5000,
        });
        const region = geo.data.regionName || "Niamey";
        const country = geo.data.country || "Niger";
        let zone = null;
        try {
          const r = await axios.get(`${BackendUrl}/api/shipping2/zones/search`, {
            params: { q: region, limit: 1 },
            timeout: 5000,
          });
          if (r.data.success && r.data.data.length > 0) {
            zone = r.data.data[0];
          } else {
            const r2 = await axios.get(`${BackendUrl}/api/shipping2/zones/search`, {
              params: { q: country, limit: 1 },
              timeout: 5000,
            });
            if (r2.data.success && r2.data.data.length > 0) zone = r2.data.data[0];
          }
        } catch {
          showAlert("info", "Sélectionnez votre zone de livraison.");
        }
        setSelectedZone(zone);
        if (zone) await recalculateAllShipping(storeGroups, zone);
      } catch {
        showAlert("warning", "Impossible de détecter votre zone. Veuillez la sélectionner.");
      }
      setLoading(false);
    };
    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedZone && Object.keys(storeGroups).length > 0) {
      const t = setTimeout(() => recalculateAllShipping(storeGroups, selectedZone), 100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone?._id]);

  // Auto-apply promo code from localStorage
  const articlesHash = useMemo(
    () => articles.map((a) => `${a._id}-${a.quantity}`).join(","),
    [articles]
  );
  useEffect(() => {
    const savedCode = localStorage.getItem("appliedPromoCode");
    if (savedCode && articles.length > 0 && !codeP) {
      setCodePromo(savedCode);
      setTimeout(() => appliquerCodePromo(savedCode, true), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length]);
  useEffect(() => {
    const savedCode = codeP?.code || localStorage.getItem("appliedPromoCode");
    if (savedCode && articles.length > 0) {
      const t = setTimeout(() => appliquerCodePromo(savedCode, true), 800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articlesHash]);

  const removeArticle = (idx: number) => {
    const updated = articles.filter((_, i) => i !== idx);
    setArticles(updated);
    localStorage.setItem("panier", JSON.stringify(updated));
    if (selectedZone) setTimeout(() => recalculateAllShipping(storeGroups, selectedZone), 100);
  };

  const updateQuantity = (idx: number, newQty: number) => {
    if (newQty <= 0) { removeArticle(idx); return; }
    const art = articles[idx];
    if (art) {
      const maxStock = getAvailableStock(art);
      if (newQty > maxStock) newQty = maxStock;
    }
    const updated = articles.map((a, i) => (i === idx ? { ...a, quantity: newQty } : a));
    setArticles(updated);
    localStorage.setItem("panier", JSON.stringify(updated));
    if (selectedZone) setTimeout(() => recalculateAllShipping(storeGroups, selectedZone), 100);
  };

  // Totals
  const calculerSousTotal = () =>
    articles.reduce(
      (sum, a) => sum + (a.prixPromo || a.prix || a.price || 0) * (a.quantity || 0),
      0
    );

  const calculerTotalFraisExpedition = () =>
    Object.values(shippingCalculations).reduce((sum, c: any) => sum + (c.totalCost || 0), 0);

  const calculerTotal = () =>
    calculerSousTotal() - reduction + calculerTotalFraisExpedition();

  useEffect(() => {
    const t = calculerTotal();
    if (t !== total) {
      setTotal(t);
      localStorage.setItem("orderTotal", t.toString());
      localStorage.setItem("orderSubtotal", calculerSousTotal().toString());
      localStorage.setItem("orderShippingCost", calculerTotalFraisExpedition().toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length, reduction, Object.keys(shippingCalculations).length]);

  const appliquerCodePromo = async (codeToApply?: string, silent = false) => {
    const finalCode = typeof codeToApply === "string" ? codeToApply : codePromo;
    if (!finalCode?.trim()) {
      if (!silent) showAlert("warn", "Veuillez entrer un code promo");
      return;
    }
    if (!silent) setRond(true);
    try {
      const userData = AuthService.getUserData();
      const userId = userData?.id;
      if (!userId) {
        if (!silent) showAlert("warn", "Veuillez vous connecter pour utiliser un code promo.");
        if (!silent) setRond(false);
        return;
      }
      const orderAmount = calculerSousTotal();
      const productIds = articles.map((a: any) => a._id).filter(Boolean);
      const response = await axios.post(`${BackendUrl}/api/promocodes/validate`, {
        code: finalCode,
        orderAmount,
        userId,
        products: productIds,
      });
      if (!silent) setRond(false);
      if (response.data.valid) {
        const { discount, finalAmount, promoCode } = response.data;
        setReduction(discount);
        setCodeP(response.data);
        if (!codePromo) setCodePromo(promoCode.code);
        localStorage.setItem(
          "orderCodeP",
          JSON.stringify({
            _id: promoCode.id,
            code: promoCode.code,
            type: promoCode.type,
            value: promoCode.value,
            discount,
            finalAmount,
            isValide: true,
          })
        );
        if (!silent) setMessage("Code promo appliqué avec succès !");
        setTimeout(() => calculerTotal(), 100);
      } else {
        if (!silent) showAlert("warn", response.data.message || "Code promo invalide.");
        setReduction(0);
        setCodeP(null);
        setCodePromo("");
        localStorage.removeItem("orderCodeP");
        localStorage.removeItem("appliedPromoCode");
      }
    } catch (error: any) {
      if (!silent)
        showAlert("warn", error?.response?.data?.message || "Ce code promo n'existe pas");
      setReduction(0);
      setCodeP(null);
      setCodePromo("");
      localStorage.removeItem("orderCodeP");
      if (!silent) setRond(false);
    }
  };

  const handleCheckout = () => {
    if (!selectedZone) {
      showAlert("warn", "Veuillez sélectionner votre zone de livraison");
      return;
    }
    if (acces === "non") {
      showAlert("warn", "Veuillez vous connecter d'abord");
      setTimeout(() => router.push("/auth/login?fromCart=true&returnUrl=/order-confirmation"), 1000);
      return;
    }
    localStorage.setItem("orderShippingZone", JSON.stringify(selectedZone));
    localStorage.setItem("orderShippingCalculations", JSON.stringify(shippingCalculations));
    const shippingByStore = Object.entries(storeGroups).map(([storeId, group]) => ({
      storeId,
      storeName: group.storeName,
      shippingCost: shippingCalculations[storeId]?.totalCost || 0,
    }));
    localStorage.setItem("orderShippingByStore", JSON.stringify(shippingByStore));
    router.push("/order-confirmation?fromCart=true");
  };

  const canCheckout =
    articles.length > 0 &&
    !!selectedZone &&
    Object.keys(shippingCalculations).length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#30A08B] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Chargement de votre panier…</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-24 h-24 bg-[#30A08B]/10 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-[#30A08B]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-[#30A08B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#27866f] transition-colors"
        >
          <ShoppingBag size={16} />
          Continuer mes achats
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* Page title */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="w-5 h-5 text-[#30A08B]" />
          <h1 className="text-xl font-bold text-gray-900">
            Mon Panier
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({articles.length} article{articles.length > 1 ? "s" : ""})
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: items list ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery zone */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#30A08B]" />
                <span className="font-semibold text-sm text-gray-800">Zone de livraison</span>
              </div>
              <ZoneSelector
                selectedZone={selectedZone}
                onSelect={setSelectedZone}
                placeholder="Sélectionner votre zone…"
                className="w-full"
              />
              {selectedZone ? (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{selectedZone.fullPath || selectedZone.name}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Sélectionnez votre zone pour calculer les frais d'expédition
                </div>
              )}
            </div>

            {/* Store groups */}
            {storeGroupsArray.map((group) => {
              const shippingCalc = shippingCalculations[group.storeId];
              return (
                <div
                  key={group.storeId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Store header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#30A08B]/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {group.storeInfo.logo ? (
                          <Image
                            src={group.storeInfo.logo}
                            alt={group.storeName}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Store className="w-4 h-4 text-[#30A08B]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-none">{group.storeName}</p>
                        {group.storeInfo.city && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {group.storeInfo.city}, {group.storeInfo.region || "Niger"}
                          </p>
                        )}
                      </div>
                    </div>
                    {shippingCalc ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Truck className="w-3.5 h-3.5 text-[#30A08B]" />
                        <span className="font-medium text-[#30A08B]">
                          {formatCurrency(shippingCalc.totalCost)}
                        </span>
                      </div>
                    ) : loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#30A08B]/30 border-t-[#30A08B] rounded-full animate-spin" />
                    ) : null}
                  </div>

                  {/* Article rows */}
                  <div className="divide-y divide-gray-50">
                    {group.articles.map(({ article, originalIndex }) => {
                      const price = article.prixPromo || article.prix || article.price || 0;
                      const origPrice = article.prix || article.price || 0;
                      const hasPromo = article.prixPromo && article.prixPromo < origPrice;
                      const qty = article.quantity || 0;
                      const stock = getAvailableStock(article);
                      const isUnavailable = unavailableProducts.has(
                        `${group.storeId}-${article._id}`
                      );

                      return (
                        <div
                          key={`${article._id}-${article.colors?.[0]}-${article.sizes?.[0]}-${originalIndex}`}
                          className={`flex gap-3 p-4 ${isUnavailable ? "opacity-50" : ""}`}
                        >
                          {/* Product image */}
                          <div
                            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer"
                            onClick={() => { triggerNavProgress(); router.push(`/ProduitDetail/${article._id}`); }}
                          >
                            {article.image1 || article.imageUrl ? (
                              <Image
                                src={article.image1 || article.imageUrl}
                                alt={article.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                            {hasPromo && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                PROMO
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug cursor-pointer hover:text-[#30A08B] transition-colors"
                              onClick={() => { triggerNavProgress(); router.push(`/ProduitDetail/${article._id}`); }}
                            >
                              {article.name}
                            </p>

                            {/* Variant chips */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {article.colors?.[0] && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                  <span
                                    className="w-2 h-2 rounded-full border border-gray-300"
                                    style={{ backgroundColor: article.colors[0].toLowerCase() }}
                                  />
                                  {article.colors[0]}
                                </span>
                              )}
                              {article.sizes?.[0] && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                  {article.sizes[0]}
                                </span>
                              )}
                              {isUnavailable && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                  Non livrable
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-base font-bold text-gray-900">
                                {formatCurrency(price)}
                              </span>
                              {hasPromo && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatCurrency(origPrice)}
                                </span>
                              )}
                            </div>

                            {/* Qty controls + delete */}
                            <div className="flex items-center justify-between mt-2.5">
                              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
                                <button
                                  className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-[#30A08B] transition-colors disabled:opacity-40"
                                  onClick={() => updateQuantity(originalIndex, qty - 1)}
                                  disabled={qty <= 1}
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-800">
                                  {qty}
                                </span>
                                <button
                                  className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-[#30A08B] transition-colors disabled:opacity-40"
                                  onClick={() => updateQuantity(originalIndex, qty + 1)}
                                  disabled={qty >= stock}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#30A08B]">
                                  {formatCurrency(price * qty)}
                                </span>
                                <button
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                  onClick={() => removeArticle(originalIndex)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Store shipping footer */}
                  {shippingCalc && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#30A08B]/5 border-t border-[#30A08B]/10 text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Truck className="w-3.5 h-3.5 text-[#30A08B]" />
                        Livraison depuis {group.storeName}
                      </span>
                      <span className="font-semibold text-[#30A08B]">
                        {formatCurrency(shippingCalc.totalCost)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Continue shopping link */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-sm text-[#30A08B] hover:underline px-1"
            >
              <ChevronRight size={14} className="rotate-180" />
              Continuer mes achats
            </button>
          </div>

          {/* ── Right: order summary ──────────────────────────────────────── */}
          <div className="lg:sticky lg:top-[100px] h-fit space-y-4">
            {/* Promo code */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#30A08B]" />
                <span className="font-semibold text-sm text-gray-800">Code promo</span>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] uppercase font-semibold tracking-wide placeholder-gray-300 transition-all"
                  type="text"
                  placeholder="BIENVENUE20"
                  value={codePromo}
                  onChange={(e) =>
                    setCodePromo(e.target.value.toUpperCase().replace(/\s/g, ""))
                  }
                  onKeyDown={(e) => e.key === "Enter" && appliquerCodePromo()}
                />
                <button
                  onClick={() => appliquerCodePromo()}
                  disabled={rond}
                  className="px-4 py-2.5 bg-[#30A08B] text-white rounded-xl text-sm font-semibold hover:bg-[#27866f] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {rond ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : null}
                  {rond ? "" : "Appliquer"}
                </button>
              </div>
              {message && (
                <p className="mt-2 text-xs text-green-600 font-medium">{message}</p>
              )}
              {codeP?.promoCode && (
                <div className="mt-2 flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-green-700">
                    {codeP.promoCode.type === "percentage"
                      ? `-${codeP.promoCode.value}%`
                      : `-${formatCurrency(codeP.promoCode.value)}`}{" "}
                    appliqué
                  </p>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base text-gray-900 mb-4">Récapitulatif</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total ({articles.length} article{articles.length > 1 ? "s" : ""})</span>
                  <span className="font-medium text-gray-800">{formatCurrency(calculerSousTotal())}</span>
                </div>

                {reduction > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      Réduction ({codePromo})
                    </span>
                    <span className="font-semibold">-{formatCurrency(reduction)}</span>
                  </div>
                )}

                {Object.keys(shippingCalculations).length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Livraison</span>
                      <span className="font-medium text-gray-800">
                        {formatCurrency(calculerTotalFraisExpedition())}
                      </span>
                    </div>
                    {storeGroupsArray.length > 1 &&
                      storeGroupsArray.map((sg) =>
                        shippingCalculations[sg.storeId] ? (
                          <div
                            key={sg.storeId}
                            className="flex justify-between text-xs text-gray-400 pl-3"
                          >
                            <span className="truncate flex-1">{sg.storeName}</span>
                            <span className="flex-shrink-0 ml-2">
                              {formatCurrency(shippingCalculations[sg.storeId].totalCost)}
                            </span>
                          </div>
                        ) : null
                      )}
                  </div>
                ) : (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Livraison</span>
                    <span className="text-xs">Sélectionnez une zone</span>
                  </div>
                )}

                <div className="h-px bg-gray-100" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-base text-gray-900">Total</span>
                  <span className="font-black text-xl text-[#30A08B]">
                    {formatCurrency(calculerTotal())}
                  </span>
                </div>
              </div>

              {/* Desktop checkout button */}
              <button
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="mt-5 w-full bg-[#30A08B] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#27866f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {!canCheckout && !selectedZone ? (
                  <>
                    <MapPin size={16} />
                    Choisir une zone
                  </>
                ) : (
                  <>
                    Commander · {formatCurrency(calculerTotal())}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              {!selectedZone && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Sélectionnez votre zone pour continuer
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
              {[
                { icon: <Truck size={16} className="text-[#30A08B]" />, label: "Livraison rapide" },
                { icon: <CheckCircle size={16} className="text-[#30A08B]" />, label: "Paiement sécurisé" },
                { icon: <RefreshCw size={16} className="text-[#30A08B]" />, label: "Retour facile" },
              ].map((b) => (
                <div key={b.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center gap-1.5">
                  {b.icon}
                  <span className="leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile fixed checkout bar ─────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">Total à payer</div>
            <div className="text-lg font-black text-[#30A08B] truncate">
              {formatCurrency(calculerTotal())}
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!canCheckout}
            className="flex-shrink-0 bg-[#30A08B] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#27866f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Commander
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ visible: false, type: "info", message: "" })}
        />
      )}
    </div>
  );
};

export default PanierPage;
