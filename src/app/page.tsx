"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { 
  getProducts, 
  getCategories, 
  getTypes, 
  getProducts_Pubs, 
  getProducts_Commentes 
} from "@/redux/productsSlice";
import { loadPanier, selectPanierCount } from "@/redux/panierSlice";
import { loadUser } from "@/redux/userSlice";
import HomeHeader from "@/components/home/HomeHeader";
import HomeMain from "@/components/home/HomeMain";
import HomeFooter from "@/components/home/HomeFooter";

export default function Home() {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Redux selectors
  const panierCount = useSelector(selectPanierCount);
  const { acces } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  // Chargement des données au démarrage (comme dans le projet React)
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(getProducts()),
          dispatch(getCategories()),
          dispatch(getTypes()),
          dispatch(getProducts_Pubs()),
          dispatch(getProducts_Commentes()),
        ]);
        
        // Charger le panier et l'utilisateur depuis localStorage
        dispatch(loadPanier());
        dispatch(loadUser());
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#30A08B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HomeHeader 
        paniernbr={panierCount}
        acces={acces}
        chg={toggleMenu}
      />
      <HomeMain isOpen={isMenuOpen} />
      <HomeFooter />
    </div>
  );
}
