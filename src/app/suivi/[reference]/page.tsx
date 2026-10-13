"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import TrackingView from "@/components/guest/TrackingView";

function Tracking() {
  const params = useParams<{ reference: string }>();
  const search = useSearchParams();
  return <TrackingView reference={decodeURIComponent(String(params?.reference || ""))} k={search.get("k") || ""} />;
}

/** Suivi public d'une commande (lien partageable, sans connexion) */
export default function SuiviCommandePage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50">
        <Suspense fallback={null}>
          <Tracking />
        </Suspense>
      </main>
      <HomeFooter />
    </>
  );
}
