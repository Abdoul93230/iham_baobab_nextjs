"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { ProductCard } from "@/components/ProduitDetail/ProduitPage";
import ZoneSelector from "@/components/panier/ZoneSelector";
import { fetchNearby, getRememberedZone, NearbyPage, rememberZone, ZoneV3 } from "@/lib/shippingV3";

/** Accueil : « Près de chez vous » — produits des boutiques de la zone du client */
export default function NearbyRail() {
  const router = useRouter();
  const [zone, setZone] = useState<ZoneV3 | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<NearbyPage | null>(null);

  useEffect(() => {
    setZone(getRememberedZone());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!zone?._id) {
      setData(null);
      return;
    }
    let alive = true;
    fetchNearby(zone._id, 1, 8)
      .then((d) => { if (alive) setData(d); })
      .catch(() => { if (alive) setData(null); });
    return () => { alive = false; };
  }, [zone?._id]);

  if (!ready) return null;

  // Pas encore de zone : invitation discrète à la choisir
  if (!zone) {
    return (
      <section className="bg-gradient-to-r from-[#30A08B]/10 to-[#B2905F]/10 rounded-2xl p-4 border border-[#30A08B]/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#30A08B] text-white flex items-center justify-center flex-shrink-0">
              <MapPin size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Près de chez vous</h2>
              <p className="text-xs text-gray-500">Choisissez votre quartier : livraison plus rapide et moins chère</p>
            </div>
          </div>
          <div className="sm:w-80">
            <ZoneSelector
              selectedZone={null}
              onSelect={(z) => { rememberZone(z); setZone(z); }}
              placeholder="Mon quartier ou ma ville"
            />
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.total === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B17236] to-[#B2905F] text-white flex items-center justify-center flex-shrink-0">
            <MapPin size={17} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Près de chez vous</h2>
            <p className="text-xs text-gray-400 truncate">
              Autour de {data.destination?.name || zone.name} · {data.sellerCount} boutique{data.sellerCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/pres-de-chez-moi")}
          className="flex items-center gap-1 text-sm font-semibold text-[#30A08B] hover:underline flex-shrink-0"
        >
          Voir tout <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
