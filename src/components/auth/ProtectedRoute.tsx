"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectIsAuthenticated, selectUser, checkAuth } from "@/redux/userSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/auth/login",
  loadingComponent,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Vérifier l'authentification si pas encore fait
      if (!isAuthenticated) {
        await dispatch(checkAuth());
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Attendre que l'initialisation soit terminée
    if (!isInitialized) return;

    // Si l'authentification est requise mais l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated) {
      console.log("🔒 Accès refusé - redirection vers:", redirectTo);
      router.push(redirectTo);
      return;
    }

    // Si l'utilisateur est connecté mais ne devrait pas accéder à cette page
    if (!requireAuth && isAuthenticated) {
      console.log("✅ Utilisateur connecté - redirection vers dashboard");
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isInitialized, requireAuth, router, redirectTo]);

  // Afficher le loading pendant l'initialisation
  if (!isInitialized) {
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

  // Afficher le contenu si tout est OK
  return <>{children}</>;
};

export default ProtectedRoute;
