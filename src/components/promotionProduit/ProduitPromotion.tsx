"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, X, SlidersHorizontal, Flame, Tag, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserLikes } from "@/redux/likesSlice";
import Image from "next/image";
import { ProductCard, ProductCardData } from "@/components/ProduitDetail/ProduitPage";
import { triggerNavProgress } from "@/components/NavigationProgress";

interface ProduitPromotionProps {
  acces?: boolean;
}

const SORT_OPTIONS = [
  { value: "discount", label: "Meilleure remise" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name", label: "Nom (A-Z)" },
];

export default function ProduitPromotion({ acces = true }: ProduitPromotionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("discount");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const DATA_Products = useAppSelector((state: any) => state.products.data);
  const DATA_Categories = useAppSelector((state: any) => state.products.categories);
  const DATA_Types = useAppSelector((state: any) => state.products.types);

  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userEcomme") || "{}")?.id
      : null;

  useEffect(() => {
    if (userId) dispatch(fetchUserLikes(userId) as any);
  }, [userId, dispatch]);

  const filteredCategories = useMemo(
    () => DATA_Categories?.filter((c: any) => c.name !== "all") || [],
    [DATA_Categories]
  );

  // Promo products: must have prixPromo set and lower than prix
  const produitsEnPromo: ProductCardData[] = useMemo(() => {
    if (!DATA_Products?.length) return [];
    return DATA_Products.filter(
      (p: any) => p.prixPromo && p.prixPromo > 0 && p.prixPromo < p.prix
    );
  }, [DATA_Products]);

  // Best discount percentage for hero display
  const bestDiscount = useMemo(() => {
    if (!produitsEnPromo.length) return 0;
    return Math.max(
      ...produitsEnPromo.map((p: any) =>
        Math.round(((p.prix - p.prixPromo) / p.prix) * 100)
      )
    );
  }, [produitsEnPromo]);

  // Search suggestions
  useEffect(() => {
    if (search.length >= 2 && produitsEnPromo.length > 0) {
      const s = produitsEnPromo
        .filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, produitsEnPromo]);

  const filteredProducts: ProductCardData[] = useMemo(() => {
    let list: any[] = produitsEnPromo;

    if (activeCategory !== "all") {
      const cat = DATA_Categories?.find((c: any) => c._id === activeCategory);
      if (cat) {
        list = list.filter((p: any) => {
          const type = DATA_Types?.find((t: any) => t._id === p.ClefType);
          return type && type.clefCategories === cat._id;
        });
      }
    }

    if (search.trim()) {
      list = list.filter((p: any) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return [...list].sort((a: any, b: any) => {
      if (sortBy === "discount") {
        const discA = ((a.prix - a.prixPromo) / a.prix) * 100;
        const discB = ((b.prix - b.prixPromo) / b.prix) * 100;
        return discB - discA;
      }
      if (sortBy === "price_asc") return (a.prixPromo || a.prix || 0) - (b.prixPromo || b.prix || 0);
      if (sortBy === "price_desc") return (b.prixPromo || b.prix || 0) - (a.prixPromo || a.prix || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });
  }, [produitsEnPromo, activeCategory, search, sortBy, DATA_Categories, DATA_Types]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#e63946] via-[#c1121f] to-[#B17236] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14 flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full">
            <Flame size={13} />
            OFFRES SPÉCIALES
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg leading-tight">
            Promotions Exclusives
          </h1>
          <div className="flex items-center gap-4 text-white/90 text-sm sm:text-base">
            <span>
              <span className="font-black text-2xl sm:text-3xl">{filteredProducts.length}</span>{" "}
              produit{filteredProducts.length !== 1 ? "s" : ""} en promo
            </span>
            {bestDiscount > 0 && (
              <>
                <span className="w-px h-5 bg-white/30" />
                <span>
                  Jusqu&apos;à{" "}
                  <span className="font-black text-yellow-300">-{bestDiscount}%</span>
                </span>
              </>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full max-w-lg">
            <input
              type="search"
              placeholder="Rechercher dans les promotions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              className="w-full py-3.5 pl-5 pr-12 rounded-full text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-white/40 text-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {search && (
                <button
                  onClick={() => { setSearch(""); setShowSuggestions(false); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
              <Search className="w-4 h-4 text-red-500" />
            </div>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-20">
                {suggestions.map((s: any) => {
                  const disc = s.prix
                    ? Math.round(((s.prix - s.prixPromo) / s.prix) * 100)
                    : 0;
                  return (
                    <button
                      key={s._id}
                      onClick={() => { triggerNavProgress(); router.push(`/ProduitDetail/${s._id}`); setShowSuggestions(false); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 text-left"
                    >
                      {s.image1 && (
                        <Image src={s.image1} alt={s.name} width={40} height={40} className="rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-red-500 font-semibold">
                            {(s.prixPromo || 0).toLocaleString()} F
                          </p>
                          {disc > 0 && (
                            <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                              -{disc}%
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {["🔥 Prix cassés", "⏰ Offres limitées", "✨ Qualité premium", "🔒 Paiement sécurisé"].map((b) => (
              <span key={b} className="bg-white/15 text-white px-3 py-1 rounded-full font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter strip ──────────────────────────────────────────────── */}
      <div className="sticky top-[60px] md:top-[120px] z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === "all"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tous
            </button>
            {filteredCategories.map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap capitalize ${
                  activeCategory === cat._id
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <div className="flex-shrink-0 ml-auto relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors bg-white"
              >
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline">Trier</span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 w-48 z-30 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.value ? "bg-red-50 text-red-500 font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Tag className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">Aucune promotion trouvée</p>
              <p className="text-sm text-gray-400 mt-1">
                {search ? `Aucun résultat pour "${search}"` : "Aucune promotion disponible pour le moment"}
              </p>
            </div>
            {(search || activeCategory !== "all") && (
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); setSortBy("discount"); }}
                className="text-sm text-red-500 hover:underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
