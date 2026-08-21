"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { Search, SlidersHorizontal, X, ShoppingCart, Heart, ChevronDown } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { triggerNavProgress } from "@/components/NavigationProgress";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const allProducts = useSelector((state: any) => state.products.data || []);

  const [sortBy, setSortBy] = useState<"pertinence" | "prix_asc" | "prix_desc" | "nouveau">("pertinence");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const results = allProducts
    .filter((p: any) => {
      if (!p) return false;
      const q = query.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    })
    .filter((p: any) =>
      selectedCategory === "all" || p.category === selectedCategory
    )
    .sort((a: any, b: any) => {
      if (sortBy === "prix_asc") return (a.prix || 0) - (b.prix || 0);
      if (sortBy === "prix_desc") return (b.prix || 0) - (a.prix || 0);
      if (sortBy === "nouveau") return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      return 0;
    });

  const categories = ["all", ...Array.from(new Set(
    allProducts.filter((p: any) => p?.category).map((p: any) => p.category)
  ))] as string[];

  const price = (p: any) => p.prixPromo && p.prixPromo < p.prix ? p.prixPromo : p.prix;
  const hasPromo = (p: any) => p.prixPromo && p.prixPromo < p.prix;

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-4">

        {/* Résumé de la recherche */}
        {query && (
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{results.length}</span> résultat{results.length !== 1 ? "s" : ""} pour
            </p>
            <span className="flex items-center gap-1 bg-[#30A08B]/10 text-[#30A08B] font-semibold text-sm px-3 py-0.5 rounded-full">
              "{query}"
              <button onClick={() => router.push("/Search")} className="ml-1 hover:text-[#268070]">
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {/* Filters + Sort bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-200 text-sm text-gray-700 rounded-full pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#30A08B] cursor-pointer"
            >
              <option value="pertinence">Pertinence</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="nouveau">Nouveauté</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Category pills */}
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                selectedCategory === cat
                  ? "bg-[#30A08B] text-white border-[#30A08B]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#30A08B] hover:text-[#30A08B]"
              }`}
            >
              {cat === "all" ? "Tout" : cat}
            </button>
          ))}
        </div>

        {/* Results grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {results.map((product: any) => (
              <div
                key={product._id}
                onClick={() => { triggerNavProgress(); router.push(`/ProduitDetail/${product._id}`); }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.image1 ? (
                    <img
                      src={product.image1}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart size={32} />
                    </div>
                  )}
                  {hasPromo(product) && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      Promo
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-xs text-gray-500 truncate mb-0.5">{product.category}</p>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1.5">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-[#30A08B]">
                      {price(product)?.toLocaleString()} F
                    </span>
                    {hasPromo(product) && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.prix?.toLocaleString()} F
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              {query ? `Aucun résultat pour "${query}"` : "Faites une recherche"}
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              {query
                ? "Essayez un autre mot-clé ou vérifiez l'orthographe."
                : "Tapez un mot-clé dans la barre de recherche ci-dessus."}
            </p>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#30A08B]" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
