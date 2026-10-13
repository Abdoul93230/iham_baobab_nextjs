import React from "react";
import { Metadata } from "next";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import NearbyPageClient from "@/components/nearby/NearbyPageClient";

export const metadata: Metadata = {
  title: "Près de chez moi - Boutiques de votre quartier | IhamBaobab",
  description: "Les produits des boutiques les plus proches de chez vous au Niger : livraison plus rapide et moins chère.",
};

export default function PresDeChezMoiPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50">
        <NearbyPageClient />
      </main>
      <HomeFooter />
    </>
  );
}
