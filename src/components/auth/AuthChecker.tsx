"use client";

import { Suspense, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { checkAuth, loadUser, selectIsAuthenticated } from "@/redux/userSlice";
import { AuthService } from "@/lib/auth";

interface AuthCheckerProps {
  children: React.ReactNode;
}

export default function AuthChecker({ children }: AuthCheckerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔍 Initialisation de l'authentification...");
        
        // Vérifier d'abord localement
        if (AuthService.isAuthenticated()) {
          console.log("✅ Token trouvé localement, vérification en cours...");
          
          // Charger immédiatement depuis localStorage pour une réponse rapide
          dispatch(loadUser());
          
          // Puis vérifier avec le serveur en arrière-plan
          const result = await dispatch(checkAuth());
          
          if (checkAuth.fulfilled.match(result)) {
            console.log("✅ Authentification confirmée par le serveur");
          } else {
            console.log("❌ Authentification rejetée par le serveur");
          }
        } else {
          console.log("ℹ️ Aucun token valide trouvé");
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de l'auth:", error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Les pages s'affichent tout de suite, y compris pour Google : la session se vérifie en arrière-plan
  // (les pages réservées attendent la leur via ProtectedRoute). Filet de sécurité : si une page ne peut
  // pas être rendue côté serveur, React affiche ce chargement puis la rend dans le navigateur.
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Chargement…</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
