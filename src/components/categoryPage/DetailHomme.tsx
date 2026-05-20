"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, X, SlidersHorizontal, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserLikes } from "@/redux/likesSlice";
import Image from "next/image";
import axios from "axios";
import { ProductCard, ProductCardData } from "@/components/ProduitDetail/ProduitPage";
import { triggerNavProgress } from "@/components/NavigationProgress";

interface DetailHommeProps {
  acces: boolean;
  categoryParam: string;
}

const SORT_OPTIONS = [
  { value: "default", label: "Pertinence" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "promo", label: "Promotions" },
];

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

const DetailHomme: React.FC<DetailHommeProps> = ({ categoryParam }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Local data (independent from Redux)
  const [clefCate, setClefCate] = useState<any>(null);
  const [typesInCategory, setTypesInCategory] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { likedProducts } = useAppSelector((state: any) => state.likes);
  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userEcomme") || "{}")?.id
      : null;

  const decodedCategoryParam = decodeURIComponent(categoryParam);

  useEffect(() => {
    if (userId) dispatch(fetchUserLikes(userId) as any);
  }, [userId, dispatch]);

  // Fetch category → types → products
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      setAllProducts([]);
      setTypesInCategory([]);
      setClefCate(null);
      window.scrollTo(0, 0);

      try {
        const [catRes, typeRes] = await Promise.all([
          axios.get(`${BackendUrl}/getAllCategories`),
          axios.get(`${BackendUrl}/getAllType`),
        ]);

        const categories: any[] = catRes.data?.data || [];
        const types: any[] = typeRes.data?.data || [];

        const category = categories.find(
          (c: any) => c.name.toLowerCase() === decodedCategoryParam.toLowerCase()
        );

        if (!category) {
          if (!cancelled) { setNotFound(true); setIsLoading(false); }
          return;
        }

        const catTypes = types.filter((t: any) => t.clefCategories === category._id);

        if (!cancelled) {
          setClefCate(category);
          setTypesInCategory(catTypes);
        }

        if (catTypes.length === 0) {
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Fetch products for all types in parallel (up to 100 per type)
        const results = await Promise.all(
          catTypes.map((t: any) =>
            axios
              .get(`${BackendUrl}/searchProductByType/${t._id}?limit=100`)
              .then((r) => r.data?.products ?? r.data?.data ?? [])
              .catch(() => [])
          )
        );

        if (!cancelled) {
          // Deduplicate by _id
          const map = new Map<string, ProductCardData>();
          results.flat().forEach((p: any) => map.set(p._id, p));
          setAllProducts(Array.from(map.values()));
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [categoryParam]);

  // Search suggestions
  useEffect(() => {
    if (search.length >= 2 && allProducts.length > 0) {
      const s = allProducts
        .filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, allProducts]);

  const getFilteredProducts = (): ProductCardData[] => {
    let list = allProducts;
    if (activeType !== "all") list = list.filter((p: any) => p.ClefType === activeType);
    if (search) list = list.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "price_asc") list = [...list].sort((a: any, b: any) => (a.prixPromo || a.prix || 0) - (b.prixPromo || b.prix || 0));
    if (sortBy === "price_desc") list = [...list].sort((a: any, b: any) => (b.prixPromo || b.prix || 0) - (a.prixPromo || a.prix || 0));
    if (sortBy === "promo") list = list.filter((p: any) => p.prixPromo > 0);
    return list;
  };

  const filteredProducts = getFilteredProducts();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#30A08B] animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (notFound || !clefCate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Catégorie non trouvée</h2>
          <p className="text-gray-500 text-sm mb-6">
            La catégorie "{decodedCategoryParam}" n'existe pas.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#30A08B] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#27866f] transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero / category header ──────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#30A08B] to-[#1d7a6a] overflow-hidden">
        {clefCate.image && (
          <div className="absolute inset-0">
            <Image
              src={
                clefCate.image.startsWith("http")
                  ? clefCate.image
                  : `${process.env.NEXT_PUBLIC_Backend_Url}/uploads/${clefCate.image}`
              }
              alt={clefCate.name}
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
          </div>
        )}
        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10 flex flex-col items-center gap-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
            {clefCate.name}
          </h1>
          <p className="text-white/75 text-sm font-medium">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
          </p>

          {/* Search bar */}
          <div className="relative w-full max-w-lg">
            <input
              type="search"
              placeholder={`Rechercher dans ${clefCate.name}…`}
              className="w-full py-3.5 pl-5 pr-12 rounded-full text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-white/40 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
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
              <Search className="w-4 h-4 text-[#30A08B]" />
            </div>

            {/* Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-20">
                {suggestions.map((s: any) => (
                  <button
                    key={s._id}
                    onClick={() => { triggerNavProgress(); router.push(`/ProduitDetail/${s._id}`); setShowSuggestions(false); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 text-left transition-colors"
                  >
                    {s.image1 && (
                      <Image src={s.image1} alt={s.name} width={40} height={40} className="rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-[#30A08B] font-semibold">
                        {(s.prixPromo || s.prix || 0).toLocaleString()} F
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Type filter strip ───────────────────────────────────────────── */}
      <div className="sticky top-[60px] md:top-[120px] z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setActiveType("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeType === "all"
                  ? "bg-[#30A08B] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tous
            </button>
            {typesInCategory.map((type: any) => (
              <button
                key={type._id}
                onClick={() => setActiveType(type._id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeType === type._id
                    ? "bg-[#30A08B] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type.name}
              </button>
            ))}

            {/* Sort button — right aligned */}
            <div className="flex-shrink-0 ml-auto relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#30A08B] hover:text-[#30A08B] transition-colors bg-white"
              >
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline">Trier</span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 w-44 z-30 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.value
                          ? "bg-[#30A08B]/10 text-[#30A08B] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
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

      {/* ── Product grid ────────────────────────────────────────────────── */}
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
              <Star className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">Aucun produit trouvé</p>
              <p className="text-sm text-gray-400 mt-1">
                {search ? `Aucun résultat pour "${search}"` : "Essayez un autre filtre"}
              </p>
            </div>
            {(search || activeType !== "all") && (
              <button
                onClick={() => { setSearch(""); setActiveType("all"); setSortBy("default"); }}
                className="text-sm text-[#30A08B] hover:underline font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailHomme;
