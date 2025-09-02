"use client";

import { useEffect } from 'react';
import { runAllTests } from '@/lib/testRedux';
import { usePanierSync } from '@/hooks/usePanierSync';
import { PanierIndicator } from '@/components/panier/PanierIndicator';

/**
 * Page de test pour valider le système Redux du panier
 * À supprimer après validation
 */
export default function TestReduxPage() {
  const { panierCount, isLoaded } = usePanierSync();

  useEffect(() => {
    if (isLoaded) {
      // Lancer les tests après que le panier soit chargé
      setTimeout(() => {
        runAllTests();
      }, 1000);
    }
  }, [isLoaded]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test du système Redux Panier</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">État actuel du panier</h2>
          <div className="space-y-2">
            <p><strong>Chargé:</strong> {isLoaded ? 'Oui' : 'Non'}</p>
            <p><strong>Nombre d'articles:</strong> {panierCount}</p>
            <div className="flex items-center gap-2">
              <strong>Indicateur:</strong>
              <PanierIndicator />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tests automatiques</h2>
          <p className="text-gray-600">
            Les tests s'exécutent automatiquement au chargement de la page.
            Consultez la console du navigateur pour voir les résultats.
          </p>
          <button 
            onClick={runAllTests}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Relancer les tests
          </button>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Note importante</h3>
        <p className="text-yellow-700">
          Cette page est temporaire pour valider le système Redux. 
          Elle devrait être supprimée après validation.
        </p>
      </div>
    </div>
  );
}
