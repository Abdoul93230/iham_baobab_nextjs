"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadPanier, selectPanierCount, selectPanierIsLoaded } from '@/redux/panierSlice';

/**
 * Hook personnalisé pour synchroniser le panier Redux avec localStorage
 * et s'assurer que tous les composants sont toujours à jour
 */
export const usePanierSync = () => {
  const dispatch = useAppDispatch();
  const panierCount = useAppSelector(selectPanierCount);
  const isLoaded = useAppSelector(selectPanierIsLoaded);

  useEffect(() => {
    // Charger le panier depuis localStorage au montage du composant
    if (!isLoaded) {
      dispatch(loadPanier());
    }
  }, [dispatch, isLoaded]);

  useEffect(() => {
    // Fonction pour surveiller les changements de localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'panier') {
        console.log('LocalStorage panier modifié, rechargement...');
        dispatch(loadPanier());
      }
    };

    // Écouter les changements de localStorage (autres onglets)
    window.addEventListener('storage', handleStorageChange);

    // Créer un observateur personnalisé pour les changements dans le même onglet
    const checkLocalStorage = () => {
      dispatch(loadPanier());
    };

    // Vérifier localStorage toutes les 500ms pour détecter les changements
    const interval = setInterval(checkLocalStorage, 500);

    // Nettoyer les écouteurs
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [dispatch]);

  return {
    panierCount,
    isLoaded
  };
};

/**
 * Hook pour les composants qui ont besoin de déclencher une mise à jour
 * du panier (comme les pages produits)
 */
export const usePanierUpdater = () => {
  const dispatch = useAppDispatch();

  const refreshPanier = () => {
    dispatch(loadPanier());
  };

  const forceUpdate = () => {
    // Force une mise à jour complète en rechargeant depuis localStorage
    console.log('Force update du panier');
    setTimeout(() => {
      dispatch(loadPanier());
    }, 100); // Petit délai pour s'assurer que localStorage est à jour
  };

  return {
    refreshPanier,
    forceUpdate
  };
};
