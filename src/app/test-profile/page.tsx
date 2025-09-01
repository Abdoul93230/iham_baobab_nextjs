"use client";

import { useAppSelector } from "@/redux/hooks";
import { selectUser, selectIsAuthenticated } from "@/redux/userSlice";

export default function ProfileTestPage() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">🧪 Test de la page Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">📊 État d'authentification</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Authentifié:</span>
              <span className={`px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? '✅ Oui' : '❌ Non'}
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

        <div className="bg-green-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-green-800">🔗 Navigation</h2>
          <div className="space-y-3">
            <a 
              href="/profile" 
              className="block bg-[#30A08B] text-white px-4 py-2 rounded hover:bg-[#2a907d] transition-colors text-center"
            >
              Aller au Profil
            </a>
            <a 
              href="/auth/login" 
              className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors text-center"
            >
              Page de Connexion
            </a>
            <a 
              href="/" 
              className="block bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors text-center"
            >
              Page d'Accueil
            </a>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3 text-amber-800">📋 Tests à effectuer</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li><strong>Test sans connexion:</strong> Aller sur /profile → doit rediriger vers /auth/login?returnUrl=/profile</li>
          <li><strong>Test avec connexion:</strong> Se connecter puis aller sur /profile → doit afficher la page avec HomeHeader</li>
          <li><strong>Test du header:</strong> Vérifier que le HomeHeader est présent avec les bonnes options de compte</li>
          <li><strong>Test de persistance:</strong> Recharger la page /profile → doit rester connecté</li>
          <li><strong>Test de navigation:</strong> Utiliser les liens du header pour naviguer</li>
        </ol>
      </div>

      {user && (
        <div className="bg-gray-50 p-6 rounded-lg border mt-6">
          <h3 className="text-lg font-semibold mb-3">👤 Détails de l'utilisateur</h3>
          <pre className="bg-white p-4 rounded border text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
