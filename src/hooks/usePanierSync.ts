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
    // Écouter les changements de localStorage (si modifié depuis un autre onglet)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'panier' && e.newValue !== e.oldValue) {
        console.log('Panier modifié depuis un autre onglet, rechargeant...');
        dispatch(loadPanier());
      }
    };

    // Ajouter l'écouteur d'événements
    window.addEventListener('storage', handleStorageChange);

    // Nettoyer l'écouteur au démontage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
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

  return {
    refreshPanier
  };
};
