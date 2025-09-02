"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadPanier, selectPanierCount, selectPanierIsLoaded } from '@/redux/panierSlice';

interface PanierContextType {
  panierCount: number;
  isLoaded: boolean;
  refreshPanier: () => void;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

/**
 * Provider pour la synchronisation globale du panier
 * À utiliser au niveau racine de l'application
 */
export const PanierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const panierCount = useAppSelector(selectPanierCount);
  const isLoaded = useAppSelector(selectPanierIsLoaded);

  const refreshPanier = () => {
    dispatch(loadPanier());
  };

  useEffect(() => {
    // Charger le panier au démarrage de l'application
    if (!isLoaded) {
      dispatch(loadPanier());
    }
  }, [dispatch, isLoaded]);

  useEffect(() => {
    // Synchronisation entre onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'panier') {
        console.log('Panier modifié dans un autre onglet, synchronisation...');
        dispatch(loadPanier());
      }
    };

    // Synchronisation lors du focus de la fenêtre
    const handleFocus = () => {
      dispatch(loadPanier());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  return (
    <PanierContext.Provider value={{ panierCount, isLoaded, refreshPanier }}>
      {children}
    </PanierContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte du panier
 */
export const usePanierContext = () => {
  const context = useContext(PanierContext);
  if (!context) {
    throw new Error('usePanierContext doit être utilisé dans un PanierProvider');
  }
  return context;
};
