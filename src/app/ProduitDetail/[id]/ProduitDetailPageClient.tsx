"use client";

import React, { useEffect } from "react";
import ProduitDetailMain from "@/components/ProduitDetail/ProduitDetailMain";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { ServerPageData } from "./serverData";
import { useAppDispatch } from "@/redux/hooks";
import { setProducts } from "@/redux/productsSlice";

interface ProduitDetailPageClientProps {
  productId: string;
  serverData?: ServerPageData;
}

export default function ProduitDetailPageClient({ productId, serverData }: ProduitDetailPageClientProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Hydratation immédiate du store Redux avec les données serveur
  useEffect(() => {
    if (serverData?.allProducts && serverData.allProducts.length > 0) {
      // Créer une liste combinée avec le produit actuel et les autres
      const allProductsData = [
        ...(serverData.product ? [serverData.product] : []),
        ...serverData.similarProducts,
        ...serverData.allProducts
      ];
      
      // Supprimer les doublons par ID
      const uniqueProducts = allProductsData.filter((product, index, self) => 
        index === self.findIndex(p => p._id === product._id)
      );
      
      dispatch(setProducts(uniqueProducts));
    }
  }, [serverData, dispatch]);

  const handlePanierChange = () => {
    // Fonction pour gérer les changements du panier
    console.log('Panier changed');
  };

  // Affichage conditionnel : si pas de données serveur, afficher un squelette
  if (!serverData?.product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomeHeader paniernbr={0} chg={handlePanierChange} />
        <div className="container mx-auto p-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:flex-1">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="lg:flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader paniernbr={0} chg={handlePanierChange} />
      <ProduitDetailMain 
        productId={productId} 
        panierchg={handlePanierChange}
        serverData={serverData}
      />
      <HomeFooter />
    </div>
  );
}
