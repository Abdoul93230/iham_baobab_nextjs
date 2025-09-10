"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import ShippingZonesDropdown from "@/components/panier/ShippingZonesDropdown";

interface OrderedItemsProps {
  items: any;
  totalPrice: number;
}

interface Article {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  shipping?: any;
  colors: string[];
  sizes: string[];
}

interface GroupedArticle {
  productId: string;
  name: string;
  imageUrl: string;
  shipping?: any;
  variants: Article[];
  totalQuantity: number;
  baseShippingFee: number;
  weightShippingFee: number;
}

const OrderedItems: React.FC<OrderedItemsProps> = ({ items, totalPrice }) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [groupedArticles, setGroupedArticles] = useState<{ [key: string]: GroupedArticle }>({});
  const [articles, setArticles] = useState<Article[]>([]);
  const [reduction, setReduction] = useState(0);

  useEffect(() => {
    const panierItems = items?.prod || [];
    const detecterRegion = async () => {
      try {
        const region = items?.livraisonDetails?.region || null;

        // Grouper les articles et calculer les frais d'expédition
        const grouped = groupArticles(panierItems);
        Object.keys(grouped).forEach((productId) => {
          const shippingFees = calculateGroupShipping(
            grouped[productId],
            region
          );
          grouped[productId] = {
            ...grouped[productId],
            ...shippingFees,
          };
        });

        setGroupedArticles(grouped);
        setArticles(panierItems);
        calculerTotal();
      } catch (error) {
        console.error("Erreur de détection de région", error);
        const grouped = groupArticles(panierItems);
        setGroupedArticles(grouped);
        setArticles(panierItems);
        calculerTotal();
      }
    };

    detecterRegion();
  }, [items]);

  // Fonction pour regrouper les articles
  const groupArticles = (articlesArray: Article[]): { [key: string]: GroupedArticle } => {
    return articlesArray.reduce((groups, article) => {
      const productId = article._id;
      if (!groups[productId]) {
        groups[productId] = {
          productId,
          name: article.name,
          imageUrl: article.imageUrl,
          shipping: article.shipping,
          variants: [],
          totalQuantity: 0,
          baseShippingFee: 0,
          weightShippingFee: 0,
        };
      }

      groups[productId].variants.push(article);
      groups[productId].totalQuantity += article.quantity;
      return groups;
    }, {} as { [key: string]: GroupedArticle });
  };

  // Calculer les frais d'expédition pour un groupe
  const calculateGroupShipping = (group: GroupedArticle, region: string | null) => {
    const shippingInfo = group.shipping;
    if (
      !shippingInfo ||
      !shippingInfo.zones ||
      shippingInfo.zones.length === 0
    ) {
      return {
        baseShippingFee: 1000,
        weightShippingFee: 0,
      };
    }

    let zoneClient = shippingInfo.zones.find(
      (zone: any) => zone.name.toLowerCase() === region?.toLowerCase()
    );

    if (!zoneClient && shippingInfo.zones.length > 0) {
      zoneClient = shippingInfo.zones[0];
    }

    if (zoneClient) {
      const baseShippingFee = zoneClient.baseFee || 0;
      let totalWeightFee = 0;

      // Calculer les frais de poids pour chaque variante
      group.variants.forEach((variant) => {
        const weightFee = shippingInfo.weight
          ? shippingInfo.weight * (zoneClient.weightFee || 0) * variant.quantity
          : 0;
        totalWeightFee += weightFee;
      });

      return {
        baseShippingFee,
        weightShippingFee: totalWeightFee,
      };
    }

    return {
      baseShippingFee: 1000,
      weightShippingFee: 0,
    };
  };

  const calculerTotalFraisExpedition = (): number => {
    return Object.values(groupedArticles).reduce((total, group) => {
      return total + group.baseShippingFee + group.weightShippingFee;
    }, 0);
  };

  const calculerSousTotal = (): number => {
    return articles.reduce(
      (total, article) => total + article.price * article.quantity,
      0
    );
  };

  const calculerTotal = (): number => {
    const sousTotal = calculerSousTotal();
    const totalAvecReduction = sousTotal - reduction;
    const totalFinal = totalAvecReduction + calculerTotalFraisExpedition();

    return totalFinal;
  };

  const renderArticleGroup = (group: GroupedArticle) => {
    const isExpanded = expandedGroups[group.productId];
    const totalShippingFee = group.baseShippingFee + group.weightShippingFee;

    return (
      <div
        key={group.productId}
        className="bg-white rounded-lg shadow-sm overflow-hidden mb-4"
      >
        {/* En-tête du groupe */}
        <div
          className="p-4 border-b cursor-pointer"
          onClick={() => toggleGroupExpansion(group.productId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={group.imageUrl}
                alt={group.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium text-lg">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.variants.length} variante(s)
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="h-4 w-4 mr-2 text-[#30A08B]" />
              <span>
                Frais d'expédition de base: {group.baseShippingFee} F CFA
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2 text-[#30A08B]" />
              <span>Frais de poids total: {group.weightShippingFee} F CFA</span>
            </div>
            {/* Ajout du ShippingZonesDropdown */}
            <ShippingZonesDropdown zones={group.shipping?.zones} />
          </div>
        </div>

        {/* Liste des variantes */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {group?.variants?.map((variant, index) => (
              <div
                key={`${variant._id}-${index}`}
                className="flex items-center justify-between border-b pb-4"
              >
                {/* Image de la couleur si elle existe */}
                {variant?.imageUrl && (
                  <img
                    src={variant.imageUrl}
                    alt={`Couleur ${variant.colors[0]}`}
                    className="w-12 h-12 object-cover rounded-md border"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 ml-3">
                      {variant.colors[0] && `Couleur: ${variant.colors[0]}`}
                    </span>
                    <span className="text-sm text-gray-600 ml-3">
                      {variant.sizes[0] && `Taille: ${variant.sizes[0]}`}
                    </span>
                    <div className="text-sm text-[#30A08B] font-medium ml-3">
                      {variant.quantity && `quantite: ${variant.quantity}`}
                    </div>
                  </div>
                  <div className="text-[#30A08B] font-medium ml-3">
                    {variant.price} F CFA
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour gérer l'expansion/réduction des groupes
  const toggleGroupExpansion = (productId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Remplacer la section de rendu des articles par ceci dans le return
  const renderArticlesSection = () => {
    if (Object.keys(groupedArticles).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-sm">
          <ShoppingCart className="h-12 w-12 text-[#30A08B] animate-bounce" />
          <p className="text-lg text-[#30A08B]">Votre Commande est vide</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.values(groupedArticles).map((group) =>
          renderArticleGroup(group)
        )}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="font-semibold text-lg mb-4">Articles commandés</h2>

      {renderArticlesSection()}
      <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
        <span className="text-gray-600 font-medium">Total de la commande</span>
        <span className="text-xl font-semibold text-gray-800">
          {totalPrice} F CFA
        </span>
      </div>
    </div>
  );
};

export default OrderedItems;