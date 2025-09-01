"use client";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectUser, selectIsAuthenticated, selectAcces, checkAuth, logout } from "@/redux/userSlice";
import { AuthService } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function TestAuthPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const acces = useAppSelector(selectAcces);
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [localUserData, setLocalUserData] = useState<any>(null);

  useEffect(() => {
    // Charger les données locales
    setLocalToken(AuthService.getToken());
    setLocalUserData(AuthService.getUserData());
  }, []);

  const handleCheckAuth = () => {
    dispatch(checkAuth());
  };

  const handleLogout = () => {
    dispatch(logout());
    setLocalToken(null);
    setLocalUserData(null);
  };

  const handleClearStorage = () => {
    AuthService.logout();
    setLocalToken(null);
    setLocalUserData(null);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">🔐 Test de Persistance d'Authentification</h1>
      
      {/* État Redux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">📊 État Redux</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Authentifié:</span>
              <span className={`px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Accès:</span>
              <span className={`px-2 py-1 rounded text-sm ${acces === 'oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {acces}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Utilisateur:</span>
              <span className="text-sm">
                {user ? user.name || user.email || 'Inconnu' : 'Aucun'}
              </span>
            </div>
          </div>
        </div>

        {/* État localStorage */}
        <div className="bg-green-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-green-800">💾 État localStorage</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Token présent:</span>
              <span className={`px-2 py-1 rounded text-sm ${localToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {localToken ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Token valide:</span>
              <span className={`px-2 py-1 rounded text-sm ${localToken && !AuthService.isTokenExpired(localToken) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {localToken && !AuthService.isTokenExpired(localToken) ? '✅ Valide' : '❌ Expiré/Absent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Données utilisateur:</span>
              <span className={`px-2 py-1 rounded text-sm ${localUserData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {localUserData ? '✅ Présentes' : '❌ Absentes'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Détails des données */}
      {user && (
        <div className="bg-gray-50 p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-3">👤 Détails de l'utilisateur</h3>
          <pre className="bg-white p-4 rounded border text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      {localToken && (
        <div className="bg-gray-50 p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-3">🔑 Token (tronqué)</h3>
          <p className="font-mono text-sm bg-white p-3 rounded border break-all">
            {localToken.substring(0, 50)}...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">🛠️ Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleCheckAuth}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            🔍 Vérifier Auth
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            🚪 Déconnexion Redux
          </button>
          <button
            onClick={handleClearStorage}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
          >
            🗑️ Vider localStorage
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 p-6 rounded-lg border mt-6">
        <h3 className="text-lg font-semibold mb-3 text-amber-800">📋 Instructions de test</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Connectez-vous d'abord sur la page de connexion</li>
          <li>Revenez sur cette page et vérifiez que les données sont présentes</li>
          <li>Rechargez la page (F5) - les données doivent persister</li>
          <li>Fermez l'onglet et rouvrez l'app - les données doivent persister</li>
          <li>Attendez l'expiration du token (7 jours) ou utilisez "Vider localStorage"</li>
        </ol>
      </div>
    </div>
  );
}
