"use client";

import React, { useEffect } from "react";
import ProduitDetailMain from "@/components/ProduitDetail/ProduitDetailMain";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { ServerPageData } from "./serverData";

interface ProduitDetailPageClientProps {
  productId: string;
  serverData?: ServerPageData;
}

export default function ProduitDetailPageClient({ productId, serverData }: ProduitDetailPageClientProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const handlePanierChange = () => {
    // Fonction pour gérer les changements du panier
    console.log('Panier changed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader paniernbr={0} chg={handlePanierChange} />
      <ProduitDetailMain productId={productId} panierchg={handlePanierChange} />
      <HomeFooter />
    </div>
  );
}
