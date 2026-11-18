"use client";

import { useEffect } from "react";

/** Lien de parrainage (…/?ref=CODE) : le code est gardé jusqu'à l'inscription, où il est prérempli */
export default function ReferralCapture() {
  useEffect(() => {
    try {
      const raw = new URLSearchParams(window.location.search).get("ref");
      const code = String(raw || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
      if (code) localStorage.setItem("ihamPendingRef", code);
    } catch { /* stockage indisponible : le code peut être saisi à la main */ }
  }, []);
  return null;
}
