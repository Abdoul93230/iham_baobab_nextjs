"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Hook pour optimiser les performances du panier
export const usePanierPerformance = () => {
  
  // Ref pour éviter les re-renders inutiles
  const renderCountRef = useRef(0);
  
  useEffect(() => {
    renderCountRef.current += 1;
    console.log('Panier re-render count:', renderCountRef.current);
  });

  // Debounce optimisé pour les calculs
  const useDebounce = useCallback((callback: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  }, []);

  // Throttle pour limiter les appels API
  const useThrottle = useCallback((callback: Function, limit: number) => {
    const inThrottle = useRef(false);
    
    return useCallback((...args: any[]) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    }, [callback, limit]);
  }, []);

  // Memoization avancée pour les calculs de panier
  const memoizeCalculation = useCallback((fn: Function, deps: any[]) => {
    return useMemo(() => fn(), deps);
  }, []);

  // Observer pour le lazy loading des images
  const imageObserver = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.onload = () => {
                img.classList.add('loaded');
              };
              imageObserver?.unobserve(img);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );
  }, []);

  // Optimisation des groupes de produits
  const optimizeProductGroups = useCallback((articles: any[]) => {
    const groupMap = new Map();
    
    // Utiliser Map pour de meilleures performances
    articles.forEach(article => {
      const storeId = article.Clefournisseur?._id || "unknown";
      const productId = article._id;
      const key = `${storeId}-${productId}`;
      
      if (!groupMap.has(storeId)) {
        groupMap.set(storeId, {
          storeId,
          storeName: article.Clefournisseur?.storeName || "Boutique inconnue",
          products: new Map(),
          totalWeight: 0,
          totalValue: 0
        });
      }
      
      const store = groupMap.get(storeId);
      
      if (!store.products.has(productId)) {
        store.products.set(productId, {
          productId,
          name: article.name,
          imageUrl: article.image1,
          variants: [],
          totalQuantity: 0,
          totalValue: 0,
          totalWeight: 0
        });
      }
      
      const product = store.products.get(productId);
      product.variants.push(article);
      product.totalQuantity += article.quantity;
      product.totalValue += (article.prixPromo || article.prix || 0) * article.quantity;
      
      store.totalValue += (article.prixPromo || article.prix || 0) * article.quantity;
      store.totalWeight += (article.weight || 0.5) * article.quantity;
    });
    
    // Convertir Map en Object pour la compatibilité
    const result: any = {};
    groupMap.forEach((store, storeId) => {
      result[storeId] = {
        ...store,
        products: Object.fromEntries(store.products)
      };
    });
    
    return result;
  }, []);

  // Préchargement des images
  const preloadImages = useCallback((imageUrls: string[]) => {
    imageUrls.forEach(url => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, []);

  // Cache pour les calculs d'expédition
  const shippingCache = useRef(new Map());
  
  const getCachedShipping = useCallback((storeId: string, zoneId: string) => {
    const key = `${storeId}-${zoneId}`;
    return shippingCache.current.get(key);
  }, []);
  
  const setCachedShipping = useCallback((storeId: string, zoneId: string, data: any) => {
    const key = `${storeId}-${zoneId}`;
    shippingCache.current.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Nettoyer le cache après 5 minutes
    setTimeout(() => {
      shippingCache.current.delete(key);
    }, 5 * 60 * 1000);
  }, []);

  // Détection des changements de performance
  const performanceObserver = useMemo(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return null;
    
    return new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });
  }, []);

  // Mesure de performance pour les fonctions critiques
  const measurePerformance = useCallback((name: string, fn: Function) => {
    return (...args: any[]) => {
      if (typeof window !== 'undefined' && window.performance) {
        performance.mark(`${name}-start`);
        const result = fn(...args);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        return result;
      }
      return fn(...args);
    };
  }, []);

  // Nettoyage automatique des observers
  useEffect(() => {
    return () => {
      imageObserver?.disconnect();
      performanceObserver?.disconnect();
    };
  }, [imageObserver, performanceObserver]);

  return {
    useDebounce,
    useThrottle,
    memoizeCalculation,
    imageObserver,
    optimizeProductGroups,
    preloadImages,
    getCachedShipping,
    setCachedShipping,
    measurePerformance,
    renderCount: renderCountRef.current
  };
};

// Hook pour la gestion optimisée du scroll
export const useOptimizedScroll = (callback: Function, threshold = 100) => {
  const scrolling = useRef(false);
  
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > threshold && !scrolling.current) {
            scrolling.current = true;
            callback(true);
          } else if (window.scrollY <= threshold && scrolling.current) {
            scrolling.current = false;
            callback(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, threshold]);
  
  return scrolling.current;
};

// Hook pour la gestion de l'état optimisée
export const useOptimizedState = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  
  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev: T) => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev) 
        : newState;
      
      // Éviter les re-renders inutiles avec une comparaison shallow
      if (JSON.stringify(nextState) !== JSON.stringify(stateRef.current)) {
        stateRef.current = nextState;
        return nextState;
      }
      
      return prev;
    });
  }, []);
  
  return [state, setOptimizedState] as const;
};
