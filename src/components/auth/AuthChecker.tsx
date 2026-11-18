"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { checkAuth, loadUser, selectIsAuthenticated } from "@/redux/userSlice";
import { AuthService } from "@/lib/auth";

interface AuthCheckerProps {
  children: React.ReactNode;
}

export default function AuthChecker({ children }: AuthCheckerProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname() || "";
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, [dispatch]);

  const loader = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Chargement…</p>
      </div>
    </div>
  );

  // Fiches produit et boutiques : rendues côté serveur (contenu visible par Google, affichage
  // immédiat). Ces pages sont générées à la demande ; si l'une ne peut pas l'être, Suspense la rend
  // dans le navigateur. Les autres pages restent rendues dans le navigateur, comme avant : plusieurs
  // utilisent encore next-seo / next/head, qui plantent quand la page est générée à l'avance.
  const serverRendered = SERVER_RENDERED.test(pathname);
  if (!serverRendered && !mounted) return loader;
  return <Suspense fallback={loader}>{children}</Suspense>;
}

const SERVER_RENDERED = /^\/(ProduitDetail|boutique)\//;
