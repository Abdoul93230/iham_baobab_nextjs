"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const PACKAGE = "com.ihambaobab.mobile";
const STORE = `https://play.google.com/store/apps/details?id=${PACKAGE}&referrer=utm_source%3Dsite`;
const KEY = "ihamAppBannerClosed";
// Pages où la bannière gênerait (paiement, espace livreur, vendeur)
const HIDDEN = /^\/(livreur|seller|Panier|commandesReference|payment|auth)/i;

/**
 * Android sur téléphone : « Ouvrir dans l'app ». Si l'app est installée, la même page s'ouvre dedans ;
 * sinon, Google Play. Fermée une fois, elle ne revient pas pendant 30 jours.
 */
export default function OpenInAppBanner() {
  const pathname = usePathname() || "/";
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const android = /Android/i.test(navigator.userAgent) && !/wv\)/.test(navigator.userAgent);
      const closedAt = Number(localStorage.getItem(KEY) || 0);
      setShow(android && Date.now() - closedAt > 30 * 864e5);
    } catch { setShow(false); }
  }, []);

  if (!show || HIDDEN.test(pathname)) return null;

  const path = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
  const intent = `intent://www.ihambaobab.com${path}#Intent;scheme=https;package=${PACKAGE};S.browser_fallback_url=${encodeURIComponent(STORE)};end`;
  const close = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* rien */ }
    setShow(false);
  };

  return (
    <div className="sticky top-0 z-[60] flex items-center gap-3 bg-white border-b border-gray-100 px-3 py-2 shadow-sm">
      <button onClick={close} aria-label="Fermer" className="text-gray-400 p-1 -ml-1"><X size={16} /></button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" className="w-9 h-9 rounded-lg object-contain bg-[#30A08B]/10" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">Ihambaobab</p>
        <p className="text-xs text-gray-500 truncate">Plus rapide dans l&apos;application</p>
      </div>
      <a href={intent} className="bg-[#30A08B] text-white text-sm font-semibold rounded-full px-4 py-1.5">Ouvrir</a>
    </div>
  );
}
