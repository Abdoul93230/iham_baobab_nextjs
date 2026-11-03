"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, KeyRound, ReceiptText, ShieldCheck, Undo2, XCircle } from "lucide-react";

/** Bloc « trace » renvoyé par le backend (getCommandesById, suivi public) */
export interface OrderTrace {
  breakdown: { subtotal: number; shipping: number; promoCode: string | null; promoDiscount: number; points: number; pointsDiscount: number; total: number };
  payment: { awaiting: boolean; deadline: string | null; paid: boolean };
  deliveryCode?: string | null;
  cancel: { reason: string | null; label: string; by: string; note: string; at: string | null; restored?: { stock?: boolean; promo?: boolean; points?: boolean } | null } | null;
  history: { at: string; type: string; label: string; note: string }[];
}

const fcfa = (n: number) => `${Math.round(n || 0).toLocaleString("fr-FR")} F`;
const when = (d: string) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function useCountdown(deadline: string | null) {
  const [left, setLeft] = useState(() => (deadline ? new Date(deadline).getTime() - Date.now() : 0));
  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setLeft(new Date(deadline).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return Math.max(0, left);
}

/** Ce qui est réservé / rendu, en mots simples : « votre code BAOBAB10 et vos 120 points » */
function reservedLabel(b: OrderTrace["breakdown"]) {
  const parts = [b.promoCode ? `votre code ${b.promoCode}` : b.promoDiscount > 0 ? "votre code promo" : null, b.points > 0 ? `vos ${b.points} Baobab Points` : null].filter(Boolean);
  return parts.join(" et ");
}

/** « Votre code X vous a été rendu » / « … vous ont été rendus » */
function restoredSentence(b: OrderTrace["breakdown"]) {
  const r = reservedLabel(b);
  if (!r) return "";
  const plural = b.points > 0;
  return ` ${r.charAt(0).toUpperCase() + r.slice(1)} vous ${plural ? "ont" : "a"} été rendu${plural ? "s" : ""}.`;
}

export default function OrderTracePanel({ trace, onPay }: { trace: OrderTrace; onPay?: () => void }) {
  const { breakdown: b, payment, cancel, deliveryCode, history } = trace;
  const left = useCountdown(payment.awaiting ? payment.deadline : null);
  const reserved = reservedLabel(b);
  const expired = cancel?.reason === "paiement_non_abouti";
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <div className="space-y-3">
      {/* ── Paiement en attente : délai + ce qui est réservé ── */}
      {payment.awaiting ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Paiement en attente</p>
              <p className="text-sm text-gray-700 mt-0.5">
                {reserved ? <>Vos articles, {reserved} sont réservés </> : <>Vos articles sont réservés </>}
                {left > 0 ? <>encore <span className="font-semibold tabular-nums">{mm}:{String(ss).padStart(2, "0")}</span>.</> : <>quelques instants.</>}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sans paiement, la commande s'annule seule et tout vous est rendu. Rien n'est débité tant que vous n'avez pas validé.</p>
              {onPay ? (
                <button onClick={onPay} className="mt-3 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#30A08B] text-white font-semibold hover:bg-[#2a8f7c]">
                  Payer {fcfa(b.total)}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Annulée : pourquoi, par qui, ce qui a été rendu ── */}
      {cancel ? (
        <div className={`rounded-2xl border p-4 ${expired ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
          <div className="flex items-start gap-3">
            {expired ? <Undo2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{expired ? "Commande annulée : paiement non reçu" : `Commande annulée : ${cancel.label}`}</p>
              {expired ? (
                <p className="text-sm text-gray-700 mt-0.5">
                  Aucun montant n'a été débité.{restoredSentence(b)}
                </p>
              ) : (
                <p className="text-sm text-gray-700 mt-0.5">
                  Annulée par {cancel.by}{cancel.note ? ` — ${cancel.note}` : ""}.{restoredSentence(b)}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Code de livraison : à donner au livreur ── */}
      {deliveryCode ? (
        <div className="rounded-2xl border border-[#30A08B]/30 bg-[#E8F5F2] p-4 flex items-center gap-4">
          <KeyRound className="w-6 h-6 text-[#1F7A69] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Code de livraison</p>
            <p className="text-xs text-gray-600">Donnez-le au livreur seulement quand vous avez votre colis en main.</p>
          </div>
          <p className="text-3xl font-bold tracking-[0.3em] text-[#1F7A69] tabular-nums">{deliveryCode}</p>
        </div>
      ) : null}

      {/* ── Ce que vous avez payé ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3"><ReceiptText className="w-4 h-4 text-gray-400" /><p className="text-sm font-semibold text-gray-900">Ce que vous {payment.paid ? "avez payé" : "payez"}</p></div>
        <dl className="text-sm space-y-1.5">
          <div className="flex justify-between"><dt className="text-gray-600">Articles</dt><dd className="tabular-nums">{fcfa(b.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-600">Livraison</dt><dd className="tabular-nums">{b.shipping ? fcfa(b.shipping) : "Offerte"}</dd></div>
          {b.promoDiscount > 0 ? <div className="flex justify-between text-emerald-700"><dt>Code {b.promoCode || "promo"}</dt><dd className="tabular-nums">−{fcfa(b.promoDiscount)}</dd></div> : null}
          {b.pointsDiscount > 0 ? <div className="flex justify-between text-emerald-700"><dt>{b.points} Baobab Points</dt><dd className="tabular-nums">−{fcfa(b.pointsDiscount)}</dd></div> : null}
          <div className="flex justify-between pt-2 mt-1 border-t border-gray-100 font-semibold text-gray-900">
            <dt>Total</dt>
            <dd className="tabular-nums flex items-center gap-1.5">{fcfa(b.total)}{payment.paid ? <ShieldCheck className="w-4 h-4 text-emerald-600" aria-label="Payé" /> : null}</dd>
          </div>
        </dl>
      </div>

      {/* ── Étapes ── */}
      {history.length ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Étapes de votre commande</p>
          <ol className="relative border-l border-gray-200 ml-2 space-y-3">
            {history.map((e, i) => (
              <li key={`${e.at}-${i}`} className="ml-4">
                <span className={`absolute -left-[7px] mt-1 w-3.5 h-3.5 rounded-full border-2 border-white ${e.type === "cancelled" || e.type === "payment_failed" ? "bg-red-400" : e.type === "expired" ? "bg-amber-400" : "bg-[#30A08B]"}`} />
                <p className="text-sm text-gray-900 flex items-center gap-1.5">{e.type === "delivered" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : null}{e.label}</p>
                <p className="text-xs text-gray-500">{when(e.at)}{e.note ? ` · ${e.note}` : ""}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
