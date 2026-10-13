"use client";

import React from "react";
import { MapPin } from "lucide-react";
import useSellerOrigin from "@/hooks/useSellerOrigin";

/** « 📍 Niamey » : ville d'expédition d'une boutique (rien si inconnue) */
export default function OriginBadge({
  sellerId,
  tone = "wood",
  showDetail = false,
  className = "",
}: {
  sellerId?: string | null;
  tone?: "wood" | "light" | "muted";
  showDetail?: boolean;
  className?: string;
}) {
  const origin = useSellerOrigin(sellerId);
  if (!origin) return null;
  const colors = { wood: "text-[#B17236]", light: "text-white/90", muted: "text-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1 ${colors[tone]} ${className}`} title={`Expédié depuis ${origin.city}`}>
      <MapPin size={12} className="flex-shrink-0" />
      <span className="truncate">{origin.city}{showDetail && origin.detail ? ` · ${origin.detail}` : ""}</span>
    </span>
  );
}
