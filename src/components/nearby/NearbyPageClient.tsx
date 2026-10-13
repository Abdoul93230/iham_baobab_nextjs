"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, Store } from "lucide-react";
import { ProductCard } from "@/components/ProduitDetail/ProduitPage";
import ZoneSelector from "@/components/panier/ZoneSelector";
import { fetchNearby, getRememberedZone, rememberZone, ZoneV3 } from "@/lib/shippingV3";

const LIMIT = 24;

/** Page « Près de chez moi » : tous les produits des boutiques proches, les plus proches d'abord */
export default function NearbyPageClient() {
  const [zone, setZone] = useState<ZoneV3 | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setZone(getRememberedZone()); }, []);

  const load = useCallback(async (z: ZoneV3, p: number) => {
    setLoading(true);
    try {
      const d = await fetchNearby(z._id, p, LIMIT);
      setProducts((prev) => (p === 1 ? d.products : [...prev, ...d.products]));
      setPage(d.page);
      setPages(d.pages);
      setTotal(d.total);
      setSellerCount(d.sellerCount);
    } catch {
      if (p === 1) setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (zone?._id) load(zone, 1);
  }, [zone?._id, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (z: ZoneV3) => { rememberZone(z); setZone(z); };

  const summary = zone && total
    ? `${total} produit${total > 1 ? "s" : ""} de ${sellerCount} boutique${sellerCount > 1 ? "s" : ""} autour de ${zone.name}`
    : "Les boutiques de votre quartier d’abord, puis de votre ville et de votre région";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B17236] to-[#B2905F] text-white flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Près de chez moi</h1>
            <p className="text-sm text-gray-500">{summary}</p>
          </div>
        </div>
        <div className="md:w-96">
          <ZoneSelector selectedZone={zone} onSelect={choose} placeholder="Mon quartier ou ma ville" />
        </div>
      </div>

      {!zone ? (
        <div className="text-center py-16 text-gray-500">
          <MapPin className="mx-auto mb-3 text-gray-300" size={40} />
          Choisissez votre quartier ou votre ville pour voir les boutiques proches.
        </div>
      ) : loading && page === 1 && !products.length ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#30A08B]" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Store className="mx-auto mb-3 text-gray-300" size={40} />
          Aucune boutique dans votre région pour l’instant. Les boutiques livrent partout au Niger.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {page < pages ? (
            <div className="flex justify-center">
              <button
                onClick={() => zone && load(zone, page + 1)}
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#30A08B] text-white font-semibold hover:bg-[#27866f] disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Voir plus
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
