"use client";

import { useEffect, useState } from "react";
import { loadSellerOrigin, OriginBadge } from "@/lib/shippingV3";

/** Ville d'expédition d'une boutique, chargée en lot avec les autres cartes de la page */
export default function useSellerOrigin(sellerId?: string | null): OriginBadge | null {
  const [origin, setOrigin] = useState<OriginBadge | null>(null);
  useEffect(() => {
    let alive = true;
    if (!sellerId) { setOrigin(null); return; }
    loadSellerOrigin(sellerId).then((v) => { if (alive) setOrigin(v); });
    return () => { alive = false; };
  }, [sellerId]);
  return origin;
}
