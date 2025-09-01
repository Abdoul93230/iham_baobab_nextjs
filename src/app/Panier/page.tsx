"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import HomeHeader from "@/components/home/HomeHeader";
import PanierPage from "@/components/panier/PanierPage";
import { loadPanier, selectPanierCount } from "@/redux/panierSlice";
import { loadUser } from "@/redux/userSlice";

export default function Panier() {
  const dispatch = useDispatch();
  const panierCount = useSelector(selectPanierCount);

  useEffect(() => {
    // Charger les données du panier et utilisateur depuis localStorage
    dispatch(loadPanier());
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader 
        paniernbr={panierCount}
        chg={() => {}}
      />
      <div className="pt-20">
        <PanierPage />
      </div>
    </div>
  );
}