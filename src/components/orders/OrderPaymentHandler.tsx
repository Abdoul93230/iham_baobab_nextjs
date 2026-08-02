"use client";

import { Loader, RefreshCw } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

interface OrderPaymentHandlerProps {
  panier: any[] | null;
  pendingOrder: string | null;
  id: string | null;
  reorderLoading?: boolean;
  setReorderLoading: (loading: boolean) => void;
  isReOrder?: boolean;
  order: any;
}

const OrderPaymentHandler: React.FC<OrderPaymentHandlerProps> = ({ 
  panier, 
  pendingOrder, 
  id, 
  reorderLoading, 
  setReorderLoading, 
  isReOrder = false, 
  order 
}) => {
  const router = useRouter();

  const handlePaymentRetry = () => {
    if (!panier) return;
    setReorderLoading(true);

    // Reconstruire le panier au format attendu par PanierPage
    // order.prod = snapshots produit (format backend)
    // order.nbrProduits = [{produit: id, quantite, tailles, couleurs}]
    const nbrProduits: any[] = order?.nbrProduits || [];
    const panierFormatted = panier.map((item: any) => {
      // Retrouver la quantité et les options choisies depuis nbrProduits
      const orderItem = nbrProduits.find(
        (n: any) =>
          String(n.produit?._id || n.produit) === String(item._id)
      );
      return {
        ...item,
        quantity: orderItem?.quantite || item.quantite || item.quantity || 1,
        sizes: orderItem?.tailles || item.tailles || item.sizes || [],
        colors: orderItem?.couleurs || item.couleurs || item.colors || [],
      };
    });

    localStorage.setItem("panier", JSON.stringify(panierFormatted));
    localStorage.removeItem("paymentInitiated");

    // Passer la référence de la commande annulée pour que le backend fasse
    // un PUT /updateCommande (réactivation) plutôt qu'un POST /createCommande
    if (id && pendingOrder) {
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          commandeId: id,
          transactionId: pendingOrder,  // null ici → le backend bascule vers createCommande
          timestamp: new Date().getTime(),
        })
      );
    }
    // Si pas de référence disponible, ne pas setter pendingOrder — createCommande sera appelé directement
    else if (id && !pendingOrder) {
      localStorage.removeItem("pendingOrder");
    }

    // Pré-remplir le code promo si présent
    if (order.idCodePro) {
      localStorage.setItem("idCodePro", order.idCodePro);
      if (order.codePromo) {
        localStorage.setItem("appliedPromoCode", order.codePromo);
      }
    }

    // Pré-remplir les BP utilisés sur la commande originale
    if (order.pointsUsed && order.pointsUsed > 0) {
      localStorage.setItem("pendingOrderBP", JSON.stringify({
        pointsUsed: order.pointsUsed,
        pointsDiscount: order.pointsDiscount || 0,
      }));
    } else {
      localStorage.removeItem("pendingOrderBP");
    }

    router.push("/Panier");
  };

  return (
    <>
      {panier ? (
        order.statusLivraison === "annulé" || isReOrder ? (
          <button
            onClick={handlePaymentRetry}
            disabled={reorderLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {reorderLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {reorderLoading ? "Relance..." : "Relancer la commande"}
          </button>
        ) : (
          <button
            onClick={handlePaymentRetry}
            className="px-4 py-1 text-nowrap bg-teal hover:bg-teal-600 text-white rounded-full text-xs md:text-sm transition-colors duration-200"
          >
            Faire le paiement ?
          </button>
        )
      ) : null}
    </>
  );
};

export default OrderPaymentHandler;