"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, MapPin, Package, Phone, Share2, Truck, XCircle } from "lucide-react";
import { fetchTracking, shareTracking } from "@/lib/guestSession";
import { formatCurrency } from "@/lib/utils";
import { paymentLabel } from "@/lib/orderStatus";

const STEPS = [
  { key: "placed", label: "Commande passée", icon: Package },
  { key: "prep", label: "En préparation", icon: Package },
  { key: "ship", label: "En livraison", icon: Truck },
  { key: "done", label: "Livrée", icon: Check },
];

const PAY_WAITING = ["en_attente", "en attente", "en cours", "pending"];
const PAY_FAILED = ["échec", "echec", "failed"];

/**
 * Étape réelle de la commande. statusLivraison vaut « en cours » dès la création :
 * on ne s'y fie pas, seul etatTraitement (mis à jour par l'équipe) fait avancer la livraison,
 * et une commande en ligne non payée reste à « Commande passée ».
 */
function stageOf(o: any): { cancelled: boolean; step: number; payment?: "failed" | "waiting" } {
  const etat = String(o?.etatTraitement || "").toLowerCase();
  const livr = String(o?.statusLivraison || "").toLowerCase();
  const pay = String(o?.statusPayment || "").toLowerCase();
  if (etat.includes("annul") || livr.includes("annul")) return { cancelled: true, step: 0 };
  if (["livraison reçu", "livré", "livrée", "traité"].includes(etat) || ["livré", "livrée"].includes(livr)) return { cancelled: false, step: 3 };
  if (["reçu par le livreur", "en cours de livraison"].includes(etat)) return { cancelled: false, step: 2 };
  if (PAY_FAILED.includes(pay)) return { cancelled: false, step: 0, payment: "failed" };
  if (PAY_WAITING.includes(pay)) return { cancelled: false, step: 0, payment: "waiting" };
  return { cancelled: false, step: 1 };
}

/** Suivi public d'une commande (lien partageable) */
export default function TrackingView({ reference, k }: { reference: string; k: string }) {
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchTracking(reference, k)
      .then((d) => { if (alive) setOrder(d); })
      .catch((e) => { if (alive) setError(e?.response?.status === 404 ? "Lien de suivi invalide ou expiré." : "Suivi indisponible. Réessayez."); });
    return () => { alive = false; };
  }, [reference, k]);

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <XCircle className="mx-auto text-red-400 mb-3" size={40} />
        <p className="text-gray-700 font-medium">{error}</p>
        <Link href="/suivi" className="inline-block mt-4 text-sm font-semibold text-[#30A08B]">Retrouver mes commandes</Link>
      </div>
    );
  }
  if (!order) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#30A08B]" /></div>;

  const st = stageOf(order);
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">Commande</p>
            <h1 className="text-xl font-bold text-gray-900">n° {order.reference}</h1>
            {order.date ? <p className="text-xs text-gray-500 mt-0.5">Passée le {new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p> : null}
          </div>
          <button onClick={() => shareTracking(url)} className="flex items-center gap-1.5 text-sm font-semibold text-[#30A08B] px-3 py-2 rounded-xl bg-[#30A08B]/10 hover:bg-[#30A08B]/15">
            <Share2 size={15} /> Partager
          </button>
        </div>

        {st.cancelled ? (
          <p className="mt-5 text-sm text-red-700 bg-red-50 rounded-xl p-3 flex items-center gap-2"><XCircle size={16} /> Cette commande a été annulée.</p>
        ) : (
          <ol className="mt-6 grid grid-cols-4 gap-1">
            {STEPS.map((s, i) => {
              const done = i <= st.step;
              const Icon = s.icon;
              return (
                <li key={s.key} className="flex flex-col items-center text-center">
                  <div className="flex items-center w-full">
                    <div className={`flex-1 h-0.5 ${i === 0 ? "invisible" : done ? "bg-[#30A08B]" : "bg-gray-200"}`} />
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-[#30A08B] text-white" : "bg-gray-100 text-gray-400"} ${i === st.step ? "ring-4 ring-[#30A08B]/20" : ""}`}><Icon size={16} /></div>
                    <div className={`flex-1 h-0.5 ${i === STEPS.length - 1 ? "invisible" : i < st.step ? "bg-[#30A08B]" : "bg-gray-200"}`} />
                  </div>
                  <span className={`mt-2 text-[11px] leading-tight ${i === st.step ? "font-semibold text-gray-900" : done ? "text-gray-700" : "text-gray-400"}`}>{s.label}</span>
                </li>
              );
            })}
          </ol>
        )}
        {!st.cancelled && order.phoneConfirmation === "pending" ? (
          <p className="mt-5 text-sm rounded-xl p-3 text-[#8a5a2b] bg-[#B17236]/10">
            📞 Notre équipe va vous appeler pour confirmer cette commande avant sa préparation.
          </p>
        ) : null}
        {!st.cancelled && st.payment ? (
          <p className={`mt-5 text-sm rounded-xl p-3 flex items-start gap-2 ${st.payment === "failed" ? "text-red-700 bg-red-50" : "text-[#8a5a2b] bg-[#B17236]/10"}`}>
            {st.payment === "failed" ? <XCircle size={16} className="mt-0.5 shrink-0" /> : <Loader2 size={16} className="mt-0.5 shrink-0" />}
            {st.payment === "failed"
              ? "Paiement non abouti : la commande n'est pas encore validée et ne sera pas préparée. Repassez-la ou contactez-nous."
              : "Paiement en attente : la préparation commence dès sa confirmation."}
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 text-sm">
        <p className="font-semibold text-gray-800 flex items-center gap-1.5"><MapPin size={15} className="text-[#30A08B]" /> Livraison</p>
        {order.livraison?.customerName ? <p className="text-gray-700">Pour {order.livraison.customerName}</p> : null}
        {order.livraison?.zone ? <p className="text-gray-600">{[order.livraison.zone, order.livraison.region].filter(Boolean).join(", ")}</p> : null}
        {order.livraison?.phoneMasked ? <p className="text-gray-500 flex items-center gap-1.5"><Phone size={13} /> {order.livraison.phoneMasked}</p> : null}
        {(order.shippingByStore || []).filter((s: any) => s.delay).map((s: any, i: number) => (
          <p key={i} className="text-xs text-gray-500">{s.storeName} · {s.delay}</p>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="font-semibold text-gray-800 mb-3">Articles ({order.items?.length || 0})</p>
        <ul className="divide-y divide-gray-50">
          {(order.items || []).map((it: any, i: number) => (
            <li key={i} className="py-2.5 flex items-center gap-3">
              {it.image ? <img src={it.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" /> : <div className="w-12 h-12 rounded-lg bg-gray-100" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{it.name}</p>
                <p className="text-xs text-gray-400">Qté {it.quantite}{it.color ? ` · ${it.color}` : ""}{it.taille ? ` · ${it.taille}` : ""}</p>
              </div>
              <p className="text-sm font-semibold">{formatCurrency((it.prix || 0) * (it.quantite || 1))}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600"><span>Livraison</span><span>{order.fraisLivraison > 0 ? formatCurrency(order.fraisLivraison) : "Offerte"}</span></div>
          <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>{formatCurrency(order.prix || 0)}</span></div>
          <p className="text-xs text-gray-400">Paiement : {paymentLabel(order)}</p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Une question ? <Link href="/contact" className="text-[#30A08B] font-medium">Contactez le support</Link> avec la référence de la commande.
      </p>
    </div>
  );
}
