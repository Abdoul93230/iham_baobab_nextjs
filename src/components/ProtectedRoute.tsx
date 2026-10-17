"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string;
  loadingComponent?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/auth/login",
  requiredRole,
  loadingComponent,
}) => {
  const { isAuthenticated, user, loading, initialized, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Attendre que l'initialisation soit terminée
    if (!initialized) {
      console.log("⏳ En attente de l'initialisation...");
      return;
    }

    console.log("🔍 ProtectedRoute - État:", { 
      requireAuth, 
      isAuthenticated, 
      initialized,
      userExists: !!user 
    });

    // Si l'authentification est requise mais l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated) {
      console.log("🔒 Accès refusé - redirection vers:", redirectTo);
      // Le retour après connexion garde aussi les paramètres (ex. boutique à contacter)
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
      return;
    }

    // Si un rôle spécifique est requis
    if (requiredRole && isAuthenticated && !hasRole(requiredRole)) {
      console.log("❌ Rôle insuffisant - redirection vers unauthorized");
      router.push("/unauthorized");
      return;
    }

    // Si l'utilisateur est connecté mais ne devrait pas accéder à cette page
    if (!requireAuth && isAuthenticated) {
      console.log("✅ Utilisateur connecté - redirection vers dashboard");
      router.push("/dashboard");
      return;
    }

    console.log("✅ Accès autorisé à la route protégée");
  }, [isAuthenticated, initialized, requireAuth, requiredRole, router, redirectTo, hasRole, user]);

  // Afficher le loading pendant l'initialisation ou la vérification
  if (!initialized || loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise et l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-3-5a6 6 0 1112 0v3H9v-3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-[#30A08B] text-white px-6 py-2 rounded-lg hover:bg-[#2a907d] transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Si un rôle spécifique est requis et l'utilisateur ne l'a pas
  if (requiredRole && isAuthenticated && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-3-5a6 6 0 1112 0v3H9v-3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[#30A08B] text-white px-6 py-2 rounded-lg hover:bg-[#B2905F] transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Si l'utilisateur ne devrait pas accéder à cette page (ex: pages d'auth quand connecté)
  if (!requireAuth && isAuthenticated) {
    return null; // La redirection s'occupe de l'affichage
  }

  // Afficher le contenu de la page
  return <>{children}</>;
};

export default ProtectedRoute;
