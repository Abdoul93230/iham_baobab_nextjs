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

export default function ProduitDetailPageClient({ 
  productId, 
  serverData 
}: ProduitDetailPageClientProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Hydratation du store Redux avec les données du serveur
  useEffect(() => {
    if (serverData && serverData.allProducts && serverData.allProducts.length > 0) {
      dispatch(setProducts(serverData.allProducts));
    }
  }, [serverData, dispatch]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <HomeHeader paniernbr={0} chg={() => {}} />
      <main>
        <ProduitDetailMain productId={productId} />
      </main>
      <HomeFooter />
    </div>
  );
}
