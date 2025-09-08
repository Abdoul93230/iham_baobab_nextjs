"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  getProducts, 
  getCategories, 
  getTypes, 
  getProducts_Pubs, 
  getProducts_Commentes 
} from "@/redux/productsSlice";
import { loadPanier } from "@/redux/panierSlice";
import { loadUser } from "@/redux/userSlice";

interface DataLoaderProps {
  children: React.ReactNode;
}

export default function DataLoader({ children }: DataLoaderProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si les données sont déjà chargées
  const { data: products, categories, types, lastFetched } = useAppSelector((state) => state.products);
  const hasData = products.length > 0 && categories.length > 0 && types.length > 0;
  
  // Cache de 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
  const isCacheValid = lastFetched && (Date.now() - lastFetched) < CACHE_DURATION;

  useEffect(() => {
    // Toujours charger le panier et l'utilisateur depuis localStorage
    dispatch(loadPanier());
    dispatch(loadUser());
    
    // Ne charger les données API que si elles ne sont pas déjà présentes ou si le cache a expiré
    if (!hasData || !isCacheValid) {
      console.log("🔄 Rechargement des données requis", { hasData, isCacheValid });
      loadAllData();
    } else {
      console.log("✅ Utilisation des données en cache");
      setIsLoading(false);
    }
  }, []); // Supprimer la dépendance hasData pour éviter les rechargements incessants

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Chargement des données...");
      
      // Charger toutes les données en parallèle
      const results = await Promise.allSettled([
        dispatch(getProducts()).unwrap(),
        dispatch(getCategories()).unwrap(),
        dispatch(getTypes()).unwrap(),
        dispatch(getProducts_Pubs()).unwrap(),
        dispatch(getProducts_Commentes()).unwrap(),
      ]);

      // Vérifier les erreurs
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map((result) => result.reason);

      if (errors.length > 0) {
        console.error("❌ Erreurs lors du chargement:", errors);
        setError("Erreur lors du chargement de certaines données");
      } else {
        console.log("✅ Toutes les données chargées avec succès");
      }
    } catch (error) {
      console.error("❌ Erreur critique lors du chargement:", error);
      setError("Erreur critique lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry function
  const handleRetry = () => {
    loadAllData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-[#30A08B] text-white px-6 py-2 rounded-lg hover:bg-[#268070] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
