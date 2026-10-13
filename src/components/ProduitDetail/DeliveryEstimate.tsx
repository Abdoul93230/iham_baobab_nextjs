"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, Gift, Loader2, MapPin, Truck } from "lucide-react";
import ZoneSelector from "@/components/panier/ZoneSelector";
import useSellerOrigin from "@/hooks/useSellerOrigin";
import { getRememberedZone, ParcelQuote, rememberZone, ZoneV3 } from "@/lib/shippingV3";
import { formatCurrency } from "@/lib/utils";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

/**
 * Bloc « Livraison » de la fiche produit : d'où part le colis, vers quelle zone,
 * frais et délai réels (même calcul que le panier et la commande).
 */
export default function DeliveryEstimate({ productId, sellerId, quantity = 1 }: { productId: string; sellerId?: string | null; quantity?: number }) {
  const origin = useSellerOrigin(sellerId);
  const [zone, setZone] = useState<ZoneV3 | null>(null);
  const [estimate, setEstimate] = useState<ParcelQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setZone(getRememberedZone()); }, []);

  useEffect(() => {
    if (!zone?._id || !productId) { setEstimate(null); return; }
    let alive = true;
    setLoading(true);
    setFailed(false);
    const t = setTimeout(async () => {
      try {
        const r = await axios.get(`${BackendUrl}/api/shipping-v3/estimate`, {
          params: { productId, destinationZoneId: zone._id, quantity: Math.max(1, quantity) },
          timeout: 10000,
        });
        if (alive) setEstimate(r.data?.data || null);
      } catch {
        if (alive) { setEstimate(null); setFailed(true); }
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [zone?._id, productId, quantity]);

  const choose = (z: ZoneV3) => { setZone(z); rememberZone(z); };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <Truck size={15} className="text-[#30A08B]" /> Livraison
        </h3>
        {origin ? (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            Expédié depuis <MapPin size={12} className="text-[#B17236]" /><span className="font-semibold text-gray-700">{origin.city}</span>
          </span>
        ) : null}
      </div>

      <ZoneSelector selectedZone={zone} onSelect={choose} placeholder="Choisir mon quartier ou ma ville" />

      {!zone ? (
        <p className="text-xs text-gray-500">Choisissez votre zone pour voir les frais et le délai exacts.</p>
      ) : loading ? (
        <p className="text-xs text-gray-400 flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Calcul…</p>
      ) : failed ? (
        <p className="text-xs text-gray-500">Frais calculés au panier.</p>
      ) : estimate ? (
        estimate.deliverable ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1.5">
                <Clock size={14} className="text-[#30A08B]" />
                {estimate.delay?.label || "—"}
              </span>
              <span className={`font-bold ${estimate.free ? "text-green-600" : "text-gray-900"}`}>
                {estimate.free ? (
                  <><span className="line-through text-gray-400 font-normal mr-1.5 text-xs">{formatCurrency(estimate.free.amount)}</span>Offerte</>
                ) : formatCurrency(estimate.fee || 0)}
              </span>
            </div>
            {estimate.delay?.sameDay && estimate.delay?.cutoff ? (
              <p className="text-[11px] text-gray-400">Commandez avant {estimate.delay.cutoff} pour une livraison le jour même.</p>
            ) : null}
            {estimate.freeHint ? (
              <p className="text-xs text-[#1f7a69] bg-[#30A08B]/10 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                <Gift size={13} /> Plus que {formatCurrency(estimate.freeHint.remaining)} dans cette boutique pour la livraison offerte
              </p>
            ) : null}
          </div>
        ) : (
          <p className={`text-xs rounded-lg p-2 ${estimate.quoteRequired ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50"}`}>
            {estimate.message || "Livraison indisponible pour cette zone."}
          </p>
        )
      ) : null}
    </div>
  );
}
