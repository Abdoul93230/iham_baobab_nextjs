"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  ShoppingCart,
  Truck,
  ChevronUp,
  ChevronDown,
  Store,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import ZoneSelector from "./ZoneSelector";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatCurrency } from "../../lib/utils";
import Alert from "../Alert";
import { RootState } from "@/redux/store";
import { 
  selectPanierArticles, 
  deletePanier, 
  updateQuantity as updatePanierQuantity 
} from "@/redux/panierSlice";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

interface Zone {
  _id: string;
  name: string;
  type: string;
  fullPath?: string;
  country?: string;
  region?: string;
  city?: string;
  isActive: boolean;
}

interface StoreGroup {
  storeId: string;
  storeName: string;
  storeInfo: any;
  products: Record<string, ProductGroup>;
  totalWeight: number;
  totalValue: number;
  shippingCost: number;
  isAvailable: boolean;
}

interface ProductGroup {
  productId: string;
  name: string;
  imageUrl: string;
  variants: any[];
  totalQuantity: number;
  totalValue: number;
  totalWeight: number;
}

interface ShippingCalculation {
  storeId: string;
  storeName: string;
  totalWeight: number;
  totalCost: number;
  canDeliver: boolean;
  details: string;
  success?: boolean;
  fixedCost?: number;
  weightCost?: number;
  costPerKg?: number;
  appliedPolicy?: {
    zone: string;
    type: string;
    error?: string;
  };
}

// Composant principal
const PanierPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Utiliser Redux pour les articles du panier au lieu de l'état local
  const articles = useSelector(selectPanierArticles);
  
  const [codePromo, setCodePromo] = useState("");
  const [reduction, setReduction] = useState(0);
  const [estAbonne, setEstAbonne] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [rond, setRond] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [shippingCalculations, setShippingCalculations] = useState<Record<string, ShippingCalculation>>({});
  const [unavailableProducts, setUnavailableProducts] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "info" | "success" | "warning" | "error" | "warn",
    message: "",
  });
  const [total, setTotal] = useState(0);
  const [codeP, setCodeP] = useState<any>(null);

  const { acces } = useSelector((state: RootState) => state.user);

  // Fonction pour estimer le poids d'un produit (memoized) - DOIT ÊTRE DÉFINIE AVANT groupedByStore
  const calculateProductWeight = useMemo(() => (article: any) => {
    // Si le produit a des dimensions, calculer un poids estimé
    if (article.shipping?.dimensions) {
      const { length, width, height } = article.shipping.dimensions;
      if (length && width && height) {
        // Estimation basée sur le volume (densité moyenne de 0.5 kg/dm³)
        const volume = (length * width * height) / 1000; // cm³ vers dm³
        return Math.max(0.1, volume * 0.5); // Minimum 100g
      }
    }
    
    // Poids par défaut selon la catégorie
    const categoryWeights: Record<string, number> = {
      'mode': 0.5,
      'electronique': 1.5,
      'maison': 2.0,
      'sport': 1.0,
    };
    
    const category = article.ClefType || 'mode';
    return categoryWeights[category] || 0.5; // 500g par défaut
  }, []);

  // Memoization des calculs coûteux pour améliorer les performances
  const groupedByStore = useMemo(() => {
    console.log({articles});
    
    return articles.reduce((storeGroups: Record<string, StoreGroup>, article) => {
      const storeId = article.Clefournisseur?._id || "unknown";
      const storeName = article.Clefournisseur?.storeName || article.Clefournisseur?.name || "Boutique inconnue";
      const productId = article._id;

      // Créer le groupe boutique s'il n'existe pas
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          storeId,
          storeName,
          storeInfo: article.Clefournisseur || {},
          products: {},
          totalWeight: 0,
          totalValue: 0,
          shippingCost: 0,
          isAvailable: true,
        };
      }

      // Créer le groupe produit s'il n'existe pas
      if (!storeGroups[storeId].products[productId]) {
        storeGroups[storeId].products[productId] = {
          productId,
          name: article.name,
          imageUrl: article.image1 || article.imageUrl || '/placeholder-image.svg',
          variants: [],
          totalQuantity: 0,
          totalValue: 0,
          totalWeight: 0,
        };
      }

      const quantity = article.quantite || article.quantity || 0;

      // Ajouter la variante au produit
      storeGroups[storeId].products[productId].variants.push(article);
      storeGroups[storeId].products[productId].totalQuantity += quantity;
      storeGroups[storeId].products[productId].totalValue += 
        (article.prixPromo || article.prix || article.price || 0) * quantity;

      // Calculer le poids (estimation basée sur les dimensions ou poids par défaut)
      const estimatedWeight = calculateProductWeight(article) * quantity;
      storeGroups[storeId].products[productId].totalWeight += estimatedWeight;
      storeGroups[storeId].totalWeight += estimatedWeight;
      storeGroups[storeId].totalValue += 
        (article.prixPromo || article.prix || article.price || 0) * quantity;

      return storeGroups;
    }, {});
  }, [articles, calculateProductWeight]); // Dependency pour recalcul quand articles change

  // Version tableau pour le rendu
  const storeGroupsArray = useMemo(() => Object.values(groupedByStore), [groupedByStore]);

  // Fonction pour calculer les frais d'expédition via l'API
  const calculateShippingForStore = async (storeId: string, storeInfo: any, totalWeight: number, customerZoneId: string) => {
    try {
      console.log(`Calcul expédition pour boutique ${storeId}:`, { storeInfo, totalWeight, customerZoneId });
      
      const response = await axios.post(`${BackendUrl}/api/shipping2/calculate`, {
        sellerId: storeId,
        customerZoneId: customerZoneId,
        weight: totalWeight
      }, {
        timeout: 10000, // 10 secondes de timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`Réponse API pour boutique ${storeId}:`, response.data);

      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          fixedCost: response.data.data.fixedCost || 0,
          weightCost: response.data.data.weightCost || (response.data.data.costPerKg || 250) * totalWeight,
          costPerKg: response.data.data.costPerKg || 250,
          totalCost: response.data.data.totalCost || 0,
          appliedPolicy: response.data.data.appliedPolicy || { zone: 'API Response', type: 'calculated' }
        };
      }
      
      throw new Error('Réponse API invalide ou incomplète');
      
    } catch (err) {
      const error = err as any; // Cast pour gérer les erreurs axios
      console.warn(`Erreur API boutique ${storeId}, utilisation du fallback:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Si l'API échoue, utiliser l'ancien système comme fallback avec des détails d'erreur
      const errorDetails = error.response?.status === 500 
        ? 'Erreur serveur (500)' 
        : error.code === 'ECONNABORTED' 
          ? 'Timeout' 
          : 'Erreur réseau';
      
      return {
        success: false,
        fixedCost: 1000,
        costPerKg: 250,
        weightCost: 250 * totalWeight,
        totalCost: 1000 + (250 * totalWeight),
        appliedPolicy: {
          zone: `Politique par défaut (${errorDetails})`,
          type: 'fallback',
          error: errorDetails
        }
      };
    }
  };

  // Calculer les frais d'expédition pour toutes les boutiques
  const recalculateAllShipping = async (grouped: Record<string, StoreGroup>, customerZone: Zone) => {
    if (!customerZone) {
      console.warn('Aucune zone cliente fournie pour le calcul d\'expédition');
      return;
    }

    console.log('Recalcul des expéditions pour', Object.keys(grouped).length, 'boutiques');
    const calculations: Record<string, any> = {};
    const unavailable = new Set<string>();
    let successCount = 0;
    let errorCount = 0;

    // Traitement séquentiel pour éviter la surcharge du serveur
    for (const [storeId, storeGroup] of Object.entries(grouped)) {
      try {
        console.log(`Traitement boutique ${storeGroup.storeName} (${storeId})`);
        
        const shippingResult = await calculateShippingForStore(
          storeId,
          storeGroup.storeInfo,
          storeGroup.totalWeight,
          customerZone._id
        );

        calculations[storeId] = shippingResult;
        
        if (shippingResult.success) {
          successCount++;
          console.log(`✓ Expédition calculée pour ${storeGroup.storeName}: ${shippingResult.totalCost}`);
        } else {
          errorCount++;
          console.warn(`⚠ Fallback utilisé pour ${storeGroup.storeName}: ${shippingResult.totalCost}`);
        }
        
        // Si le calcul échoue complètement (coût = 0), marquer les produits comme indisponibles
        if (shippingResult.totalCost === 0) {
          Object.keys(storeGroup.products).forEach(productId => {
            unavailable.add(`${storeId}-${productId}`);
          });
          console.warn(`Produits de ${storeGroup.storeName} marqués comme indisponibles`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`Erreur critique pour la boutique ${storeGroup.storeName}:`, error);
        
        // Créer un calcul de fallback même en cas d'erreur critique
        calculations[storeId] = {
          success: false,
          fixedCost: 1000,
          costPerKg: 250,
          weightCost: 250 * storeGroup.totalWeight,
          totalCost: 1000 + (250 * storeGroup.totalWeight),
          appliedPolicy: {
            zone: 'Erreur critique - Politique par défaut',
            type: 'emergency-fallback'
          }
        };
        
        // Marquer tous les produits de cette boutique comme indisponibles
        Object.keys(storeGroup.products).forEach(productId => {
          unavailable.add(`${storeId}-${productId}`);
        });
      }
    }

    console.log(`Calculs terminés: ${successCount} succès, ${errorCount} erreurs/fallbacks`);
    setShippingCalculations(calculations);
    setUnavailableProducts(unavailable);
    
    // Afficher un message informatif à l'utilisateur si nécessaire
    if (errorCount > 0 && successCount === 0) {
      showAlert("warning", "Problème de connexion détecté. Tarifs d'expédition par défaut appliqués.");
    } else if (errorCount > 0) {
      showAlert("info", `${errorCount} boutique(s) utilisent les tarifs par défaut.`);
    }
  };

  const showAlert = (type: "info" | "success" | "warning" | "error" | "warn", message: string) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "info", message: "" });
    }, 5000);
  };

  const handleSuccess = (message: string) => {
    showAlert("success", message);
  };

  const handleWarning = (message: string) => {
    showAlert("warn", message);
  };

  // Charger les articles et détecter la zone du client
  useEffect(() => {
    const panierItems = JSON.parse(localStorage.getItem("panier") || "[]");
    
    const detecterZoneClient = async () => {
      setLoading(true);
      console.log('Début de la détection de zone client...');
      
      try {
        // Détecter la localisation du client avec timeout
        console.log('Récupération IP client...');
        const ip = await axios.get("https://ifconfig.me/ip", { timeout: 5000 });
        
        console.log('Récupération données de géolocalisation...');
        const response = await axios.get(`${BackendUrl}/proxy/ip-api`, {
          headers: {
            "Client-IP": ip.data,
          },
          timeout: 5000
        });
        
        const region = response.data.regionName || "Niamey";
        const country = response.data.country || "Niger";
        console.log(`Localisation détectée: ${region}, ${country}`);

        // Rechercher la zone correspondante dans votre système
        let detectedZone = null;
        try {
          console.log(`Recherche de zone pour la région: ${region}`);
          const zoneResponse = await axios.get(`${BackendUrl}/api/shipping2/zones/search`, {
            params: { q: region, limit: 1 },
            timeout: 5000
          });

          if (zoneResponse.data.success && zoneResponse.data.data.length > 0) {
            detectedZone = zoneResponse.data.data[0];
            console.log(`Zone trouvée pour la région: ${detectedZone.name}`);
          } else {
            // Fallback: chercher par pays
            console.log(`Recherche de zone pour le pays: ${country}`);
            const countryResponse = await axios.get(`${BackendUrl}/api/shipping2/zones/search`, {
              params: { q: country, limit: 1 },
              timeout: 5000
            });
            if (countryResponse.data.success && countryResponse.data.data.length > 0) {
              detectedZone = countryResponse.data.data[0];
              console.log(`Zone trouvée pour le pays: ${detectedZone.name}`);
            }
          }
        } catch (zoneError) {
          console.warn("Échec de la détection de zone automatique:", zoneError);
          showAlert("info", "Détection automatique de zone échouée. Veuillez sélectionner manuellement.");
        }

        setSelectedZone(detectedZone);

        // Les articles viennent maintenant automatiquement de Redux
        // Plus besoin de setArticles(panierItems)

        // Calculer les frais d'expédition si une zone est détectée
        if (detectedZone) {
          console.log('Calcul des frais d\'expédition...');
          await recalculateAllShipping(groupedByStore, detectedZone);
        } else {
          console.log('Aucune zone détectée - sélection manuelle requise');
          showAlert("warning", "Veuillez sélectionner votre zone de livraison pour voir les frais d'expédition.");
        }

        setLoading(false);
        console.log('Détection de zone terminée avec succès');
        
      } catch (error) {
        console.error("Erreur critique lors de la détection de zone:", error);
        setLoading(false);
        
        // Fallback complet: continuer sans détection de zone
        // Les articles viennent automatiquement de Redux
        
        showAlert("warning", "Impossible de détecter automatiquement votre zone. Veuillez la sélectionner manuellement.");
      }
    };

    detecterZoneClient();
  }, []);

  // Recalculer quand la zone change (avec protection contre les boucles)
  useEffect(() => {
    if (selectedZone && Object.keys(groupedByStore).length > 0) {
      // Utiliser un délai pour éviter les calculs en cascade
      const timer = setTimeout(() => {
        recalculateAllShipping(groupedByStore, selectedZone);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedZone?._id]);

  // Fonction pour gérer l'expansion des groupes
  const toggleStoreExpansion = (storeId: string) => {
    setExpandedStores((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  const toggleProductExpansion = (storeId: string, productId: string) => {
    const key = `${storeId}-${productId}`;
    setExpandedProducts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Fonction pour supprimer un article
  const removeArticle = (articleIndex: number) => {
    const article = articles[articleIndex];
    if (article) {
      dispatch(deletePanier({
        id: article._id || article.id,
        color: article.color || article.couleur,
        taille: article.taille
      }));
      
      // Les articles sont automatiquement regroupés via useMemo
      if (selectedZone) {
        // Recalculer après suppression avec un délai pour laisser Redux se mettre à jour
        setTimeout(() => {
          recalculateAllShipping(groupedByStore, selectedZone);
        }, 100);
      }
      
      handleSuccess("Article supprimé du panier");
    }
  };

  // Fonction pour mettre à jour la quantité d'un article
  const updateQuantity = (articleIndex: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeArticle(articleIndex);
      return;
    }

    const article = articles[articleIndex];
    if (article) {
      dispatch(updatePanierQuantity({
        id: article._id || article.id,
        color: article.color || article.couleur,
        taille: article.taille,
        quantite: newQuantity
      }));
      
      // Les articles sont automatiquement regroupés via useMemo
      if (selectedZone) {
        // Recalculer après mise à jour avec un délai pour laisser Redux se mettre à jour
        setTimeout(() => {
          recalculateAllShipping(groupedByStore, selectedZone);
        }, 100);
      }
    }
  };

  // Application du code promo
  const appliquerCodePromo = async () => {
    if (!codePromo.trim()) {
      handleWarning("Veuillez entrer un code promo");
      return;
    }

    setRond(true);
    
    try {
      const userId = localStorage.getItem("userEcomId") || "";
      
      const response = await axios.post(`${BackendUrl}/checkCodePromo`, {
        code: codePromo,
        welcom: codePromo === "BIENVENUE20",
        id: userId,
      });

      setRond(false);

      if (response.data.data.isValide) {
        if (!codeP || codeP.code !== response.data.data.code) {
          if (response.data.data?.isWelcomeCode === true) {
            let reduction = (calculerSousTotal() * response.data.data?.prixReduiction) / 100;
            reduction = Math.min(reduction, 2000);
            setReduction(reduction);
          } else {
            setReduction(response.data.data?.prixReduiction);
          }

          setCodeP(response.data.data);
          localStorage.setItem("orderCodeP", JSON.stringify(response.data.data));
          setMessage("Code promo appliqué avec succès !");
          setTimeout(() => calculerTotal(), 100);
        } else {
          setMessage("Ce code promo est déjà appliqué.");
        }
      } else {
        handleWarning("Ce code a expiré.");
        setReduction(0);
        localStorage.removeItem("orderCodeP");
        calculerTotal();
      }
    } catch (error) {
      console.error(error);
      handleWarning("Ce code promo n'existe pas");
      setReduction(0);
      localStorage.removeItem("orderCodeP");
      calculerTotal();
      setRond(false);
    }
  };

  // Calculer les totaux
  const calculerSousTotal = () => {
    return articles.reduce(
      (total, article) => total + (article.prixPromo || article.prix || article.price || 0) * (article.quantite || article.quantity || 0),
      0
    );
  };

  const calculerTotalFraisExpedition = () => {
    return Object.values(shippingCalculations).reduce((total, calc: any) => {
      return total + (calc.totalCost || 0);
    }, 0);
  };

  const calculerTotal = () => {
    const sousTotal = calculerSousTotal();
    const totalAvecReduction = sousTotal - reduction;
    const totalFinal = totalAvecReduction + calculerTotalFraisExpedition();
    return totalFinal;
  };

  // Recalculer le total quand les données changent (avec protection contre les boucles)
  useEffect(() => {
    const newTotal = calculerTotal();
    if (newTotal !== total) {
      setTotal(newTotal);
      localStorage.setItem("orderTotal", newTotal.toString());
    }
  }, [articles.length, reduction, Object.keys(shippingCalculations).length]);

  // Rendu d'une variante de produit
  const renderVariant = (variant: any, storeId: string, productId: string, articleIndex: number) => {
    const isUnavailable = unavailableProducts.has(`${storeId}-${productId}`);
    
    return (
      <div
        key={`${variant._id}-${variant.colors?.[0]}-${variant.sizes?.[0]}`}
        className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between border-b pb-3 sm:pb-4 ${
          isUnavailable ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center space-x-3 flex-1">
          {variant?.imageUrl && (
            <img
              src={variant.imageUrl}
              alt={`Couleur ${variant.colors?.[0]}`}
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {variant.colors?.[0] && (
                <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {variant.colors[0]}
                </span>
              )}
              {variant.sizes?.[0] && (
                <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {variant.sizes[0]}
                </span>
              )}
              {isUnavailable && (
                <Badge variant="destructive" className="text-xs">
                  Non disponible
                </Badge>
              )}
            </div>
            
            {variant.prixPromo ? (
              <div className="flex items-center space-x-2">
                <span className="font-medium text-red-600 text-sm sm:text-base">
                  {formatCurrency(variant.prixPromo)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatCurrency(variant.prix || variant.price)}
                </span>
              </div>
            ) : (
              <span className="font-medium text-sm sm:text-base">
                {formatCurrency(variant.prix || variant.price || 0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => updateQuantity(articleIndex, variant.quantity - 1)}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-medium">{variant.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => updateQuantity(articleIndex, variant.quantity + 1)}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-700"
            onClick={() => removeArticle(articleIndex)}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Rendu d'un groupe produit
  const renderProduct = (product: ProductGroup, storeId: string) => {
    const key = `${storeId}-${product.productId}`;
    const isExpanded = expandedProducts[key];
    const isUnavailable = unavailableProducts.has(key);

    return (
      <div key={product.productId} className="border rounded-lg p-2 sm:p-3 bg-white">
        <div
          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => toggleProductExpansion(storeId, product.productId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span>{product.variants.length} variante(s)</span>
                    <span>•</span>
                    <span>Poids: {product.totalWeight.toFixed(2)} kg</span>
                  </div>
                  {isUnavailable && (
                    <Badge variant="destructive" className="text-xs w-fit mt-1 sm:mt-0">
                      Non livrable
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="font-medium text-sm sm:text-base">{formatCurrency(product.totalValue)}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-2 sm:p-3 bg-gray-50 rounded space-y-2 sm:space-y-3 mt-2">
            {product.variants.map((variant, index) => {
              const articleIndex = articles.findIndex(article => 
                article._id === variant._id && 
                (article.color || article.couleur) === (variant.color || variant.couleur) && 
                article.taille === variant.taille
              );
              return renderVariant(variant, storeId, product.productId, articleIndex);
            })}
          </div>
        )}
      </div>
    );
  };

  // Rendu d'un groupe boutique
  const renderStoreGroup = (storeGroup: StoreGroup) => {
    const isExpanded = expandedStores[storeGroup.storeId];
    const shippingCalc = shippingCalculations[storeGroup.storeId];
    const hasUnavailableProducts = Object.keys(storeGroup.products).some(productId =>
      unavailableProducts.has(`${storeGroup.storeId}-${productId}`)
    );

    return (
      <Card key={storeGroup.storeId} className="mb-4 sm:mb-6 shadow-sm">
        <CardHeader 
          className={`cursor-pointer hover:bg-gray-50 pb-2 sm:pb-3 ${
            hasUnavailableProducts ? 'bg-red-50' : ''
          }`}
          onClick={() => toggleStoreExpansion(storeGroup.storeId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#30A08B] rounded-lg flex items-center justify-center flex-shrink-0">
                {storeGroup.storeInfo.logo ? (
                  <img
                    src={storeGroup.storeInfo.logo}
                    alt={storeGroup.storeName}
                    className="w-6 h-6 sm:w-10 sm:h-10 object-cover rounded"
                  />
                ) : (
                  <Store className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{storeGroup.storeName}</CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{storeGroup.storeInfo.city || 'N/A'}, {storeGroup.storeInfo.region || 'N/A'}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-2">
                    <span>{Object.keys(storeGroup.products).length} produit(s)</span>
                    <span>•</span>
                    <span>{storeGroup.totalWeight.toFixed(2)} kg</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {hasUnavailableProducts && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Livraison limitée</span>
                  <span className="sm:hidden">Limité</span>
                </Badge>
              )}
              
              {shippingCalc && (
                <div className="text-right">
                  <div className="font-medium text-[#30A08B] text-xs sm:text-sm">
                    {formatCurrency(shippingCalc.totalCost)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-end">
                    <Truck className="h-3 w-3 inline mr-1" />
                    <span className="truncate max-w-16 sm:max-w-none text-right">expédition</span>
                  </div>
                </div>
              )}
              
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-3 sm:space-y-4">
            {/* Informations d'expédition */}
            {shippingCalc && (
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3">
                  <h4 className="text-sm sm:text-base font-medium text-blue-800 mb-1 sm:mb-0">
                    Détails d'expédition
                  </h4>
                  {shippingCalc.success ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disponible
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="w-fit">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Politique par défaut
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Coût fixe:</span>
                    <span className="ml-2 font-medium">{formatCurrency(shippingCalc.fixedCost || 0)}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Coût poids:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(
                        shippingCalc.weightCost || 
                        ((shippingCalc.costPerKg || 0) * storeGroup.totalWeight)
                      )}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex justify-between sm:block">
                    <span className="text-gray-600">Politique appliquée:</span>
                    <span className="ml-2 font-medium break-words">
                      {shippingCalc.appliedPolicy?.zone || 'Zone par défaut'}
                      {shippingCalc.appliedPolicy?.error && (
                        <span className="text-xs text-orange-600 ml-1">
                          ({shippingCalc.appliedPolicy.error})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {Object.values(storeGroup.products).map((product) =>
              renderProduct(product, storeGroup.storeId)
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-20 xl:pb-4">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#30A08B] mb-4 sm:mb-6">Mon Panier</h1>

        {/* Sélecteur de zone */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Zone de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <ZoneSelector
                selectedZone={selectedZone}
                onSelect={setSelectedZone}
                placeholder="Sélectionner votre zone de livraison..."
                className="w-full"
              />
              {selectedZone && (
                <div className="text-xs sm:text-sm text-gray-600 bg-green-50 p-2 sm:p-3 rounded-lg">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2 text-green-600" />
                  Livraison vers: <strong className="break-words">{selectedZone.fullPath || selectedZone.name}</strong>
                </div>
              )}
              {!selectedZone && (
                <div className="text-xs sm:text-sm text-orange-600 bg-orange-50 p-2 sm:p-3 rounded-lg">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                  Veuillez sélectionner votre zone pour calculer les frais d'expédition
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {articles.length === 0 ? (
          loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-white rounded-lg shadow-sm">
              <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-[#30A08B] animate-bounce" />
              <p className="text-base sm:text-lg text-[#30A08B] text-center">Chargement...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-white rounded-lg shadow-sm">
              <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-[#30A08B] animate-bounce" />
              <p className="text-base sm:text-lg text-[#30A08B] text-center">Votre panier est vide</p>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-[#30A08B] hover:bg-[#30A08B]/90 mt-4"
                size="sm"
              >
                Continuer mes achats
              </Button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Liste des boutiques et produits */}
            <div className="xl:col-span-2 space-y-3 sm:space-y-4">
              {storeGroupsArray.map((storeGroup: StoreGroup) =>
                renderStoreGroup(storeGroup)
              )}
            </div>

            {/* Résumé de la commande */}
            <div className="xl:sticky xl:top-20 space-y-3 sm:space-y-4 h-fit order-first xl:order-last">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-[#30A08B]">
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Sous-total</span>
                      <span>{formatCurrency(calculerSousTotal())}</span>
                    </div>
                    {reduction > 0 && (
                      <div className="flex justify-between text-sm sm:text-base text-green-600">
                        <span>Réduction</span>
                        <span>-{formatCurrency(reduction)}</span>
                      </div>
                    )}
                    
                    {/* Détail des frais d'expédition par boutique */}
                    {Object.keys(shippingCalculations).length > 0 && (
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-xs sm:text-sm font-medium text-gray-700">Frais d'expédition:</div>
                        {Object.entries(shippingCalculations).map(([storeId, calc]) => {
                          const store = groupedByStore[storeId];
                          return (
                            <div key={storeId} className="flex justify-between text-xs text-gray-500 ml-2 gap-2">
                              <span className="truncate flex-1">{store?.storeName}</span>
                              <span className="flex-shrink-0">{formatCurrency(calc.totalCost)}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-xs sm:text-sm text-gray-600 border-t pt-1 sm:pt-2">
                          <span>Total expédition</span>
                          <span>{formatCurrency(calculerTotalFraisExpedition())}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 sm:pt-3 border-t">
                      <div className="flex justify-between font-bold text-base sm:text-lg text-[#30A08B]">
                        <span>Total</span>
                        <span>{formatCurrency(calculerTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Code promo */}
                  <div className="pt-3 sm:pt-4 border-t">
                    <h3 className="text-sm font-semibold text-[#30A08B] mb-2">
                      Code promo
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        className="flex-grow px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#30A08B] focus:border-transparent"
                        type="text"
                        placeholder="Entrer le code"
                        value={codePromo}
                        onChange={(e) => setCodePromo(e.target.value)}
                      />
                      <Button
                        onClick={appliquerCodePromo}
                        disabled={rond}
                        className="bg-[#30A08B] hover:bg-[#30A08B]/90 w-full sm:w-auto"
                        size="sm"
                      >
                        {rond ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                        {rond ? "..." : "Appliquer"}
                      </Button>
                    </div>
                    {message && (
                      <p className="text-xs sm:text-sm text-green-600 mt-2">{message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Résumé des boutiques */}
              {Object.keys(groupedByStore).length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base">Expéditions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      {storeGroupsArray.map((store: StoreGroup) => (
                        <div key={store.storeId} className="flex justify-between gap-2">
                          <span className="truncate flex-1">{store.storeName}</span>
                          <span className="font-medium flex-shrink-0">
                            {formatCurrency(shippingCalculations[store.storeId]?.totalCost || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bouton Commander */}
      <div className="container mx-auto px-3 sm:px-4 py-4">
        {/* Version mobile - barre fixe en bas */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white p-3 sm:p-4 shadow-lg border-t z-50">
          {calculerTotal() !== 0 && (
            <div className="flex items-center justify-between space-x-3">
              <div className="text-left min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-600">Total</div>
                <div className="text-sm sm:text-lg font-bold text-[#30A08B] truncate">
                  {formatCurrency(calculerTotal())}
                </div>
              </div>
              <Button
                onClick={() => {
                  if (calculerTotal() === 0) return;
                  
                  if (!selectedZone) {
                    handleWarning("Veuillez sélectionner votre zone de livraison");
                    return;
                  }
                  
                  if (acces === "non") {
                    handleWarning("Veuillez vous connecter d'abord");
                    setTimeout(() => {
                      router.push("/Connexion?fromCart=true");
                    }, 1000);
                  } else {
                    localStorage.setItem("orderShippingZone", JSON.stringify(selectedZone));
                    localStorage.setItem("orderShippingCalculations", JSON.stringify(shippingCalculations));
                    router.push("/OrderConfirmation?fromCart=true");
                  }
                }}
                className="bg-[#30A08B] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#30A08B]/90 text-sm sm:text-base flex-shrink-0"
                disabled={!selectedZone || Object.keys(shippingCalculations).length === 0}
              >
                Commander
              </Button>
            </div>
          )}
        </div>
        
        {/* Version desktop */}
        <div className="hidden xl:block">
          {calculerTotal() !== 0 && (
            <Button
              onClick={() => {
                if (calculerTotal() === 0) return;
                
                if (!selectedZone) {
                  handleWarning("Veuillez sélectionner votre zone de livraison");
                  return;
                }
                
                if (acces === "non") {
                  handleWarning("Veuillez vous connecter d'abord");
                  setTimeout(() => {
                    router.push("/Connexion?fromCart=true");
                  }, 1000);
                } else {
                  localStorage.setItem("orderShippingZone", JSON.stringify(selectedZone));
                  localStorage.setItem("orderShippingCalculations", JSON.stringify(shippingCalculations));
                  router.push("/OrderConfirmation?fromCart=true");
                }
              }}
              className="w-full bg-[#30A08B] text-white py-3 rounded-lg font-semibold hover:bg-[#30A08B]/90"
              disabled={!selectedZone || Object.keys(shippingCalculations).length === 0}
            >
              Passer la commande {formatCurrency(calculerTotal())}
            </Button>
          )}
        </div>
      </div>

      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ visible: false, type: "info", message: "" })}
        />
      )}
    </div>
  );
};

export default PanierPage;
