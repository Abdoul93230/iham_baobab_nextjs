"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, ShoppingCart, ChevronDown, Loader2 } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { track } from "@/lib/analytics";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
const PAGE_SIZE = 24;
type Sort = "relevance" | "price_asc" | "price_desc" | "newest";

/** Recherche dans tout le catalogue (côté serveur), triée par pertinence par défaut */
function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = (searchParams.get("q") || "").trim();

  const [sortBy, setSortBy] = useState<Sort>("relevance");
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setItems([]); setTotal(0); return; }
    let alive = true;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort: sortBy });
    fetch(`${BackendUrl}/searchProductByName/${encodeURIComponent(query)}?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (!alive) return;
        const list = Array.isArray(d?.data) ? d.data : [];
        setItems((prev) => (page === 1 ? list : [...prev, ...list.filter((p: any) => !prev.some((x) => x._id === p._id))]));
        setTotal(Number(d?.total) || list.length);
        setPages(Number(d?.pages) || 1);
        if (page === 1) track("search", {});
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [query, sortBy, page]);

  const price = (p: any) => (p.prixPromo && p.prixPromo < p.prix ? p.prixPromo : p.prix);
  const hasPromo = (p: any) => !!(p.prixPromo && p.prixPromo < p.prix);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-4">
        {query && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{loading && page === 1 ? "…" : total}</span> résultat{total !== 1 ? "s" : ""} pour
            </p>
            <span className="flex items-center gap-1 bg-[#30A08B]/10 text-[#30A08B] font-semibold text-sm px-3 py-0.5 rounded-full">
              &quot;{query}&quot;
              <button onClick={() => router.push("/Search")} className="ml-1 hover:text-[#268070]" aria-label="Effacer la recherche">
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {query.length >= 2 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => { setPage(1); setSortBy(e.target.value as Sort); }}
                className="appearance-none bg-white border border-gray-200 text-sm text-gray-700 rounded-full pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#30A08B] cursor-pointer"
                aria-label="Trier les résultats"
              >
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/ProduitDetail/${product._id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group block"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.image1 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image1} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart size={32} /></div>
                    )}
                    {hasPromo(product) && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Promo</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    {product.Clefournisseur?.storeName ? <p className="text-xs text-gray-500 truncate mb-0.5">{product.Clefournisseur.storeName}</p> : null}
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1.5">{product.name}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#30A08B]">{Number(price(product) || 0).toLocaleString("fr-FR")} F</span>
                      {hasPromo(product) && <span className="text-xs text-gray-400 line-through">{Number(product.prix).toLocaleString("fr-FR")} F</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {page < pages && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="bg-white border border-gray-200 rounded-full px-6 py-2 text-sm font-semibold text-gray-700 hover:border-[#30A08B] hover:text-[#30A08B] disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null} Voir plus de résultats
                </button>
              </div>
            )}
          </>
        ) : loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#30A08B]" size={28} /></div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              {error ? "La recherche n'a pas répondu" : query.length >= 2 ? `Aucun résultat pour "${query}"` : "Faites une recherche"}
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              {error
                ? "Vérifiez votre connexion puis réessayez."
                : query.length >= 2
                ? "Essayez un autre mot-clé ou vérifiez l'orthographe."
                : "Tapez au moins deux lettres dans la barre de recherche ci-dessus."}
            </p>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}

/** Nouvelle recherche : composant remis à zéro (1re page, tri par pertinence) */
function KeyedResults() {
  const q = useSearchParams().get("q") || "";
  return <SearchResults key={q} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#30A08B]" />
      </div>
    }>
      <KeyedResults />
    </Suspense>
  );
}
