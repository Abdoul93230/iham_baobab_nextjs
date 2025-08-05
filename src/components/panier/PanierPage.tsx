"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { RootState } from "@/redux/store";
import {
  updatePanier,
  deletePanier,
  clearPanier,
  PanierArticle,
} from "@/redux/panierSlice";
import Alert from "@/components/Alert";

// Zones et tarifs d'expédition
const shippingZones = [
  { name: "Niamey", price: 1000, weight: { per500g: 500, perKg: 1000 } },
  { name: "Dosso", price: 2000, weight: { per500g: 500, perKg: 1000 } },
  { name: "Tillaberi", price: 3000, weight: { per500g: 500, perKg: 1000 } },
  { name: "Tahoua", price: 3500, weight: { per500g: 500, perKg: 1000 } },
  { name: "Maradi", price: 4000, weight: { per500g: 500, perKg: 1000 } },
  { name: "Zinder", price: 4500, weight: { per500g: 500, perKg: 1000 } },
  { name: "Diffa", price: 5000, weight: { per500g: 500, perKg: 1000 } },
  { name: "Agadez", price: 5500, weight: { per500g: 500, perKg: 1000 } },
];

interface GroupedArticle {
  id: string;
  name: string;
  prix: number;
  images: string[];
  articles: PanierArticle[];
  totalQuantity: number;
  totalPrice: number;
  shipping?: {
    zones: Array<{
      name: string;
      price: number;
      transporteurName?: string;
      transporteurContact?: string;
    }>;
    weight: number;
  };
  shippingCost?: number;
  isExpanded?: boolean;
}

const PanierPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [regionClient, setRegionClient] = useState<string>("Niamey");
  const [groupedArticles, setGroupedArticles] = useState<Record<string, GroupedArticle>>({});
  const [codePromo, setCodePromo] = useState("");
  const [reduction, setReduction] = useState(0);
  const [estAbonne, setEstAbonne] = useState(false);
  const [rond, setRond] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: "info", message: "" });

  // Redux state
  const { articles } = useSelector((state: RootState) => state.panier);
  const { acces } = useSelector((state: RootState) => state.user);

  // Spinner style
  const spinnerStyle = {
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #30A08B",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    animation: "spin 1s linear infinite",
  };

  // Détection région IP
  const detectRegion = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data.country_code === "NE") {
        const regions = ["Niamey", "Dosso", "Tillaberi", "Tahoua", "Maradi", "Zinder", "Diffa", "Agadez"];
        const randomRegion = regions[Math.floor(Math.random() * regions.length)];
        setRegionClient(randomRegion);
      } else {
        setRegionClient("Niamey");
      }
    } catch (error) {
      console.error("Erreur détection région:", error);
      setRegionClient("Niamey");
    }
  };

  // Calculer les frais d'expédition pour un groupe
  const calculateGroupShipping = (group: GroupedArticle, region: string) => {
    if (!group.shipping?.zones) return { shippingCost: 1000 };

    const zone = group.shipping.zones.find(
      (z) => z.name.toLowerCase() === region.toLowerCase()
    );

    if (!zone) return { shippingCost: 1000 };

    const totalWeight = group.articles.reduce((total, article) => {
      const weight = parseFloat(article.poids?.toString() || "0.5");
      return total + weight * article.quantite;
    }, 0);

    let shippingCost = zone.price;
    if (totalWeight > 0.5) {
      const additionalWeight = totalWeight - 0.5;
      const additionalCost = Math.ceil(additionalWeight / 0.5) * 500;
      shippingCost += additionalCost;
    }

    return { shippingCost };
  };

  // Grouper les articles par produit
  const groupArticlesByProduct = (articles: PanierArticle[]) => {
    const grouped: Record<string, GroupedArticle> = {};

    articles.forEach((article) => {
      const productId = article.id;
      
      if (!grouped[productId]) {
        grouped[productId] = {
          id: productId,
          name: article.name,
          prix: article.prix,
          images: article.images || [],
          articles: [],
          totalQuantity: 0,
          totalPrice: 0,
          shipping: article.shipping,
          isExpanded: false,
        };
      }

      grouped[productId].articles.push(article);
      grouped[productId].totalQuantity += article.quantite;
      grouped[productId].totalPrice += article.prix * article.quantite;
    });

    // Calculer les frais d'expédition pour chaque groupe
    Object.keys(grouped).forEach((productId) => {
      const shippingInfo = calculateGroupShipping(grouped[productId], regionClient);
      grouped[productId] = {
        ...grouped[productId],
        ...shippingInfo,
      };
    });

    return grouped;
  };

  // Validation code promo
  const ValidCode = async () => {
    if (!codePromo.trim()) {
      handleWarning("Veuillez entrer un code promo");
      return;
    }

    setRond(true);
    try {
      const response = await fetch(
        `https://secoure.onrender.com/api/validatePromoCode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codePromo }),
        }
      );

      const data = await response.json();
      
      if (data.valid) {
        const discountAmount = Math.floor((calculerSousTotal() * data.discount) / 100);
        setReduction(discountAmount);
        handleSuccess(`Code promo appliqué! ${data.discount}% de réduction`);
      } else {
        handleError("Code promo invalide");
      }
    } catch (error) {
      console.error("Erreur validation code promo:", error);
      handleError("Erreur lors de la validation du code");
    } finally {
      setRond(false);
    }
  };

  // Gestion des alertes
  const handleWarning = (message: string) => {
    setAlert({ visible: true, type: "warning", message });
  };

  const handleSuccess = (message: string) => {
    setAlert({ visible: true, type: "success", message });
  };

  const handleError = (message: string) => {
    setAlert({ visible: true, type: "error", message });
  };

  // Calculs
  const calculerSousTotal = () => {
    return articles.reduce((total: number, article: PanierArticle) => total + article.prix * article.quantite, 0);
  };

  const calculerTotalFraisExpedition = () => {
    return Object.values(groupedArticles).reduce(
      (total, group) => total + (group.shippingCost || 0),
      0
    );
  };

  const calculerTotal = () => {
    return calculerSousTotal() + calculerTotalFraisExpedition() - reduction;
  };

  // Gestion quantité
  const handleQuantityChange = (
    productId: string,
    variantIndex: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const group = groupedArticles[productId];
    if (!group || !group.articles[variantIndex]) return;

    const article = group.articles[variantIndex];
    const updatedArticle = { ...article, quantite: newQuantity };

    dispatch(updatePanier(updatedArticle));
  };

  // Supprimer article
  const handleRemoveArticle = (productId: string, variantIndex: number) => {
    const group = groupedArticles[productId];
    if (!group || !group.articles[variantIndex]) return;

    const article = group.articles[variantIndex];
    dispatch(deletePanier({ 
      id: article.id, 
      color: article.color, 
      taille: article.taille 
    }));
  };

  // Toggle expansion groupe
  const toggleGroupExpansion = (productId: string) => {
    setGroupedArticles((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        isExpanded: !prev[productId].isExpanded,
      },
    }));
  };

  // Rendu section articles
  const renderArticlesSection = () => {
    return Object.values(groupedArticles).map((group) => (
      <div key={group.id} className="bg-white rounded-lg shadow-sm p-4">
        {/* En-tête du groupe */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 relative rounded-lg overflow-hidden">
              <Image
                src={group.images[0] || "/placeholder-image.svg"}
                alt={group.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500">
                {group.totalQuantity} article{group.totalQuantity > 1 ? "s" : ""} • {group.totalPrice} F CFA
              </p>
              <p className="text-sm text-[#30A08B]">
                Frais d'expédition: {group.shippingCost} F CFA
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleGroupExpansion(group.id)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {group.isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Articles du groupe (expandable) */}
        {group.isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            {group.articles.map((article, index) => (
              <div key={`${article.id}-${article.color}-${article.taille}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 relative rounded overflow-hidden">
                  <Image
                    src={article.images?.[0] || "/placeholder-image.svg"}
                    alt={article.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-sm text-gray-900">{article.name}</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    {article.color && <p>Couleur: {article.color}</p>}
                    {article.taille && <p>Taille: {article.taille}</p>}
                    <p>{article.prix} F CFA</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(group.id, index, article.quantite - 1)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                    disabled={article.quantite <= 1}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="min-w-[2rem] text-center font-medium">
                    {article.quantite}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(group.id, index, article.quantite + 1)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleRemoveArticle(group.id, index)}
                    className="p-1 hover:bg-red-100 rounded-full ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  // Rendu modes d'expédition
  const renderShippingModes = () => {
    const shippingInfo = Object.values(groupedArticles).map((group) => {
      const zone = group.shipping?.zones?.find(
        (zone) => zone.name.toLowerCase() === regionClient?.toLowerCase()
      );

      return {
        productName: group.name,
        transporteurName: zone?.transporteurName || "IhamBaobab",
        transporteurContact: zone?.transporteurContact || "+227 87727501",
      };
    });

    return (
      <div className="pt-4">
        <h3 className="text-sm font-semibold text-[#30A08B] mb-2">
          Mode d'expédition
        </h3>
        <div className="space-y-2 bg-gray-50 p-3 rounded-md">
          {shippingInfo.map((info, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{info.productName}</span>
              <div className="ml-2 text-gray-600">
                Transporteur: {info.transporteurName}
                <br />
                Contact: {info.transporteurContact}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Effects
  useEffect(() => {
    detectRegion();
    setLoading(false);
  }, []);

  useEffect(() => {
    setGroupedArticles(groupArticlesByProduct(articles));
  }, [articles, regionClient]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <div className="top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#30A08B]">
            Votre Panier
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {message && (
          <div className="mb-4 p-3 bg-[#30A08B]/10 rounded-lg text-[#30A08B] text-sm">
            {message}
          </div>
        )}

        {articles.length === 0 ? (
          loading === true ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-sm">
              <ShoppingCart className="h-12 w-12 text-[#30A08B] animate-bounce" />
              <p className="text-lg text-[#30A08B]">Patientez .....</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-sm">
              <ShoppingCart className="h-12 w-12 text-[#30A08B] animate-bounce" />
              <p className="text-lg text-[#30A08B]">Votre panier est vide</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              {renderArticlesSection()}
            </div>

            {/* Résumé de la commande */}
            <div className="lg:sticky lg:top-20 space-y-4 h-fit">
              {/* Résumé */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-4">
                <h2 className="text-lg font-bold text-[#30A08B]">
                  Résumé de la commande
                </h2>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span>{calculerSousTotal()} F CFA</span>
                  </div>
                  {reduction > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction</span>
                      <span>-{reduction} F cfa</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frais d'expédition total</span>
                    <span>{calculerTotalFraisExpedition()} F CFA</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-bold text-lg text-[#30A08B]">
                      <span>Total</span>
                      <span>{calculerTotal()} F CFA</span>
                    </div>
                  </div>
                </div>

                {/* Code promo */}
                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-[#30A08B] mb-2">
                    Code promo
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      className="flex-grow px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#30A08B] focus:border-transparent"
                      placeholder="Entrez votre code"
                      value={codePromo}
                      onChange={(e) => setCodePromo(e.target.value)}
                    />
                    <button
                      className="px-4 py-2 bg-[#30A08B] text-white rounded-lg hover:bg-[#30A08B]/90"
                      onClick={ValidCode}
                    >
                      {rond ? (
                        <div style={spinnerStyle}></div>
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mode d'expédition */}
                {renderShippingModes()}

                {/* Newsletter et réinitialisation */}
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`relative ${
                          estAbonne ? "bg-[#30A08B]" : "border"
                        } w-5 h-5 rounded flex items-center justify-center`}
                      >
                        <input
                          type="checkbox"
                          checked={estAbonne}
                          onChange={(e) => setEstAbonne(e.target.checked)}
                          className="opacity-0 absolute w-full h-full cursor-pointer"
                        />
                        {estAbonne && (
                          <span className="text-white text-xs">&#10003;</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">
                        S'abonner à la newsletter
                      </span>
                    </div>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={() => {
                        // Réinitialiser toutes les quantités à 1
                        articles.forEach((article: PanierArticle) => {
                          dispatch(updatePanier({ ...article, quantite: 1 }));
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 text-[#30A08B]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton Commander (fixe en bas sur mobile, dans le flux sur desktop) */}
      <div className="container mx-auto px-4 py-4">
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg">
          {calculerTotal() !== 0 ? (
            <button
              onClick={() => {
                if (calculerTotal() === 0) {
                  return;
                }
                if (acces === "non") {
                  handleWarning("Veuillez vous connecter d'abord");
                  setTimeout(() => {
                    router.push("/OrderConfirmation?fromCart=true");
                  }, 1000);
                } else {
                  router.push("/OrderConfirmation?fromCart=true");
                }
              }}
              className="w-full bg-[#30A08B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold hover:bg-[#30A08B]/90 flex items-center justify-center space-x-2"
            >
              Passer la commande {calculerTotal()} F CFA
            </button>
          ) : (
            <></>
          )}
        </div>
        <div className="hidden lg:block">
          <div className="container mx-auto px-4 py-4">
            {calculerTotal() !== 0 ? (
              <button
                onClick={() => {
                  if (calculerTotal() === 0) {
                    return;
                  }
                  if (acces === "non") {
                    handleWarning("Veuillez vous connecter d'abord");
                    setTimeout(() => {
                      router.push("/OrderConfirmation?fromCart=true");
                    }, 1000);
                  } else {
                    router.push("/OrderConfirmation?fromCart=true");
                  }
                }}
                className="w-full bg-[#30A08B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold hover:bg-[#30A08B]/90 flex items-center justify-center space-x-2"
              >
                Passer la commande {calculerTotal()} F CFA
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      {alert.visible && (
        <Alert
          type={alert.type as "info" | "success" | "warning" | "error"}
          message={alert.message}
          onClose={() => setAlert({ visible: false, type: "", message: "" })}
        />
      )}

      {/* Styles pour l'animation du spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PanierPage;
