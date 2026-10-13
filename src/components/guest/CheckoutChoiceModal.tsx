"use client";

import React from "react";
import { ChevronRight, Gift, History, MapPin, ShoppingBag, UserRound, X, Zap } from "lucide-react";

const BENEFITS = [
  { icon: History, text: "Toutes vos commandes et leur suivi au même endroit" },
  { icon: Gift, text: "Baobab Points sur chaque achat et codes promo" },
  { icon: MapPin, text: "Adresse enregistrée : commande en 2 clics la prochaine fois" },
  { icon: Zap, text: "Offres et ventes flash réservées aux membres" },
];

/**
 * « Comment voulez-vous commander ? » — le compte est mis en avant,
 * la commande sans compte reste à un clic.
 */
export default function CheckoutChoiceModal({
  open,
  onClose,
  onGuest,
  onLogin,
  onRegister,
}: {
  open: boolean;
  onClose: () => void;
  onGuest: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm p-0 sm:p-4" onMouseDown={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-bold text-gray-900">Comment voulez-vous commander ?</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100" aria-label="Fermer"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-3">
          {/* Compte : mis en avant */}
          <div className="rounded-2xl border-2 border-[#30A08B] bg-[#30A08B]/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserRound size={18} className="text-[#30A08B]" />
              <p className="font-semibold text-gray-900">Avec un compte</p>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-[#30A08B] text-white px-2 py-0.5 rounded-full">Recommandé</span>
            </div>
            <ul className="space-y-1.5 mb-3">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-xs text-gray-600">
                  <Icon size={14} className="text-[#30A08B] mt-0.5 flex-shrink-0" /> {text}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onLogin} className="py-2.5 rounded-xl bg-[#30A08B] text-white text-sm font-semibold hover:bg-[#27866f]">Se connecter</button>
              <button onClick={onRegister} className="py-2.5 rounded-xl bg-white border border-[#30A08B] text-[#30A08B] text-sm font-semibold hover:bg-[#30A08B]/5">Créer un compte</button>
            </div>
          </div>

          {/* Sans compte */}
          <button onClick={onGuest} className="w-full flex items-center gap-3 rounded-2xl border border-gray-200 p-4 text-left hover:border-gray-300 hover:bg-gray-50 transition">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><ShoppingBag size={18} className="text-gray-600" /></div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Continuer sans compte</p>
              <p className="text-xs text-gray-500">Juste votre nom et votre numéro. Suivi par lien.</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
          <p className="text-[11px] text-center text-gray-400">Vous pourrez créer votre compte après la commande et garder vos points.</p>
        </div>
      </div>
    </div>
  );
}
