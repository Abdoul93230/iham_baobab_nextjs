"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import HomeHeader from "@/components/home/HomeHeader";
import PanierPage from "@/components/panier/PanierPage";
import { loadPanier } from "@/redux/panierSlice";
import { loadUser } from "@/redux/userSlice";

export default function PanierPageWrapper() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Charger les données du panier et utilisateur depuis localStorage
    dispatch(loadPanier());
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader chg={() => {}} />
      <div className="pt-20">
        <PanierPage />
      </div>
    </div>
  );
}
