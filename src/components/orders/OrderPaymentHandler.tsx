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
    if (panier) {
      // Sauvegarder le nouveau panier dans le localStorage
      setReorderLoading(true);
      localStorage.setItem("panier", JSON.stringify(panier));

      if (pendingOrder !== null && id !== null)
        localStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            commandeId: id,
            transactionId: pendingOrder,
            timestamp: new Date().getTime(),
          })
        );

      if (pendingOrder !== null && id !== null)
        localStorage.setItem(
          "paymentInitiated",
          JSON.stringify({
            transactionId: pendingOrder,
            commandeId: id,
            timestamp: new Date().getTime(),
          })
        );

      // Rediriger vers la page panier
      router.push("/Panier");
    }
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