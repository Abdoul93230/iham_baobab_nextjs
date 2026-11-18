"use client";

import React from "react";
import { Package, ShoppingCart, Store, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderedItemsProps {
  items: any; // la commande (prod, shippingByStore, fraisLivraison…)
  totalPrice: number;
}

/** Valeurs d'un article tel qu'enregistré dans la commande (anciens et nouveaux formats) */
const qtyOf = (a: any) => Math.max(1, Number(a?.quantity ?? a?.quantite) || 1);
const unitPriceOf = (a: any) => {
  const promo = Number(a?.prixPromo);
  const prix = Number(a?.prix);
  const price = Number(a?.price);
  if (price > 0) return price;
  if (promo > 0 && (!prix || promo < prix)) return promo;
  return prix > 0 ? prix : 0;
};
const imageOf = (a: any) => a?.colorImage || a?.imageUrl || a?.image1 || a?.image2 || "";
const variantOf = (a: any) =>
  [a?.color || a?.colors?.[0], a?.taille || a?.sizes?.[0]].filter(Boolean).join(" · ");

/**
 * Articles d'une commande : ce qui a été commandé, au prix enregistré, et la livraison réellement
 * facturée (par boutique quand elle est connue). Aucun recalcul : tout vient de la commande.
 */
const OrderedItems: React.FC<OrderedItemsProps> = ({ items: order, totalPrice }) => {
  const articles: any[] = Array.isArray(order?.prod) ? order.prod : [];
  const stores: any[] = Array.isArray(order?.shippingByStore) ? order.shippingByStore : [];
  const shippingTotal = Number(order?.fraisLivraison) || 0;

  return (
    <div className="mb-8">
      <h2 className="font-semibold text-lg mb-4">
        Articles commandés {articles.length ? <span className="text-gray-400 font-normal">({articles.length})</span> : null}
      </h2>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 p-8 bg-white rounded-lg shadow-sm">
          <ShoppingCart className="h-10 w-10 text-[#30A08B]" />
          <p className="text-gray-600">Aucun article dans cette commande</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {articles.map((a, i) => {
            const qty = qtyOf(a);
            const unit = unitPriceOf(a);
            const variant = variantOf(a);
            const img = imageOf(a);
            return (
              <div key={`${a?._id || i}-${i}`} className="flex items-center gap-4 p-4">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="w-16 h-16 object-cover rounded-md border flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-md border bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {a?._id ? (
                    <a href={`/ProduitDetail/${a._id}`} className="font-medium text-gray-900 line-clamp-2 hover:text-[#30A08B]">{a?.name || "Article"}</a>
                  ) : (
                    <p className="font-medium text-gray-900 line-clamp-2">{a?.name || "Article"}</p>
                  )}
                  {variant ? <p className="text-sm text-gray-500">{variant}</p> : null}
                  <p className="text-sm text-gray-500">
                    Qté {qty}{unit > 0 && qty > 1 ? ` × ${formatCurrency(unit)}` : ""}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 whitespace-nowrap">{unit > 0 ? formatCurrency(unit * qty) : "—"}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Livraison facturée */}
      <div className="mt-4 bg-white rounded-lg shadow-sm p-4 space-y-2">
        <div className="flex items-center gap-2 font-medium text-gray-800">
          <Truck className="w-4 h-4 text-[#30A08B]" /> Livraison
        </div>
        {stores.length > 0 ? (
          stores.map((s, i) => (
            <div key={`${s.storeId || i}`} className="flex items-start justify-between gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 min-w-0">
                <Store className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{s.storeName || "Boutique"}{s.delay ? ` · ${s.delay}` : ""}</span>
              </span>
              <span className="whitespace-nowrap">
                {s.quoteRequired ? "Sur devis" : Number(s.shippingCost) > 0 ? formatCurrency(Number(s.shippingCost)) : "Offerte"}
              </span>
            </div>
          ))
        ) : (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Frais de livraison</span>
            <span>{shippingTotal > 0 ? formatCurrency(shippingTotal) : "Offerte"}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center bg-white rounded-lg shadow p-4">
        <span className="text-gray-600 font-medium">Total de la commande</span>
        <span className="text-xl font-semibold text-gray-800">{formatCurrency(Number(totalPrice) || 0)}</span>
      </div>
    </div>
  );
};

export default OrderedItems;
