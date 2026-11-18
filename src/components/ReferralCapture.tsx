"use client";

import { useEffect } from "react";
import { setSource, track } from "@/lib/analytics";

/**
 * À l'arrivée sur le site :
 * - lien de parrainage (…/?ref=CODE) : le code est gardé jusqu'à l'inscription, où il est prérempli ;
 * - lien de campagne (…?utm_source=…) : la source est retenue pour la mesure.
 */
export default function ReferralCapture() {
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const code = String(q.get("ref") || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
      if (code) {
        localStorage.setItem("ihamPendingRef", code);
        setSource("parrainage");
      } else if (q.get("utm_source")) {
        setSource(String(q.get("utm_source")));
      }
    } catch { /* stockage indisponible : le code peut être saisi à la main */ }
    track("app_open");
  }, []);
  return null;
}
