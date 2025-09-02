// SEO et optimisations de performance pour le panier
import { useMemo, useCallback } from 'react';

// Hook personnalisé pour optimiser les calculs du panier
export const usePanierOptimizations = () => {
  
  // Debounce pour les appels API de calcul des frais d'expédition
  const debounce = useMemo(() => {
    return (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return function executedFunction(...args: any[]) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };
  }, []);

  // Memoization pour les calculs de groupe de produits
  const optimizeGroupCalculation = useCallback((articles: any[]) => {
    const groupMap = new Map();
    
    articles.forEach(article => {
      const storeId = article.Clefournisseur?._id || "unknown";
      const key = `${storeId}-${article._id}`;
      
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          ...article,
          totalQuantity: article.quantity,
          totalValue: (article.prixPromo || article.prix || article.price || 0) * article.quantity
        });
      } else {
        const existing = groupMap.get(key);
        existing.totalQuantity += article.quantity;
        existing.totalValue += (article.prixPromo || article.prix || article.price || 0) * article.quantity;
      }
    });
    
    return Array.from(groupMap.values());
  }, []);

  // Throttle pour les re-calculs de total
  const throttle = useMemo(() => {
    return (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function(this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };
  }, []);

  return {
    debounce,
    optimizeGroupCalculation,
    throttle
  };
};

// Optimisations spécifiques au SEO pour le panier
export const getPanierSEOData = (articles: any[], selectedZone: any) => {
  const totalItems = articles.reduce((sum, article) => sum + article.quantity, 0);
  const totalValue = articles.reduce((sum, article) => 
    sum + (article.prixPromo || article.prix || article.price || 0) * article.quantity, 0
  );
  
  const storeCount = new Set(articles.map(article => 
    article.Clefournisseur?._id || "unknown"
  )).size;

  // Génération du JSON-LD pour le SEO
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "ShoppingCart",
    "name": "Panier d'achats IhamBaobab",
    "description": `Panier contenant ${totalItems} article(s) de ${storeCount} boutique(s)`,
    "provider": {
      "@type": "Organization",
      "name": "IhamBaobab",
      "url": process.env.NEXT_PUBLIC_SITE_URL
    },
    "totalPaymentDue": {
      "@type": "MonetaryAmount",
      "currency": "XOF",
      "value": totalValue
    },
    "numberOfItems": totalItems,
    "acceptedPaymentMethod": [
      "http://purl.org/goodrelations/v1#PayPal",
      "http://purl.org/goodrelations/v1#MasterCard",
      "http://purl.org/goodrelations/v1#Visa",
      "Mobile Money"
    ],
    "availableDeliveryMethod": selectedZone ? {
      "@type": "DeliveryMethod",
      "name": `Livraison vers ${selectedZone.name}`,
      "deliveryAddress": {
        "@type": "PostalAddress",
        "addressCountry": selectedZone.country,
        "addressRegion": selectedZone.region
      }
    } : undefined
  };

  return {
    totalItems,
    totalValue,
    storeCount,
    jsonLD
  };
};

// Préchargement des images pour améliorer les performances
export const preloadCartImages = (articles: any[]) => {
  articles.forEach(article => {
    if (article.image1) {
      const img = new Image();
      img.src = article.image1;
    }
  });
};

// Lazy loading optimisé pour les composants
export const lazyLoadOptions = {
  threshold: 0.1,
  rootMargin: '50px 0px',
};

// Configuration de cache pour les appels API
export const cacheConfig = {
  shipping: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  products: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  }
};

// Web Vitals tracking pour les métriques de performance
export const trackWebVitals = (metric: any) => {
  // Log des métriques importantes pour l'optimisation
  if (typeof window !== 'undefined') {
    switch (metric.name) {
      case 'CLS':
        console.log('Cumulative Layout Shift:', metric.value);
        break;
      case 'FID':
        console.log('First Input Delay:', metric.value);
        break;
      case 'FCP':
        console.log('First Contentful Paint:', metric.value);
        break;
      case 'LCP':
        console.log('Largest Contentful Paint:', metric.value);
        break;
      case 'TTFB':
        console.log('Time to First Byte:', metric.value);
        break;
    }
    
    // Envoyer les métriques à un service d'analytics si nécessaire
    // analytics.track('web-vital', metric);
  }
};
