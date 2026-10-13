"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Gift, Loader2, Lock, MapPin, Share2 } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { loginUser } from "@/redux/userSlice";
import { claimGuestAccount, clearGuestSession, getGuestSession, shareTracking, trackingPath } from "@/lib/guestSession";

/**
 * Après une commande sans compte : lien de suivi (copier / partager)
 * et création du compte en 1 étape (numéro déjà vérifié, points conservés).
 */
export default function GuestOrderSuccess({
  reference,
  trackingToken,
  pointsHint,
  onClose,
}: {
  reference: string;
  trackingToken: string;
  pointsHint?: number;
  onClose?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const session = getGuestSession();
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const path = trackingPath(reference, trackingToken);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const claim = async () => {
    if (password.length < 6) { setError("Au moins 6 caractères."); return; }
    setBusy(true);
    setError("");
    try {
      const r = await claimGuestAccount(password);
      // Connexion classique avec le nouveau mot de passe (même parcours que l'inscription)
      await dispatch(loginUser({ identifier: r.phone, phoneNumber: r.phone, password }) as any);
      clearGuestSession();
      setCreated(true);
    } catch (e: any) {
      const d = e?.response?.data;
      setError(d?.code === "ACCOUNT_EXISTS" ? "Ce numéro a déjà un compte : connectez-vous." : d?.message || e?.message || "Création impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-8 w-8 text-green-600" /></div>
        <h2 className="text-xl font-bold text-gray-800">Commande confirmée !</h2>
        <p className="text-sm text-gray-500 mt-1">Référence <strong>{reference}</strong>. Le livreur vous appellera.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><MapPin size={13} className="text-[#30A08B]" /> Suivez votre commande avec ce lien</p>
        <div className="flex gap-2">
          <button onClick={() => router.push(path)} className="flex-1 py-2.5 rounded-xl bg-[#30A08B] text-white text-sm font-semibold">Suivre</button>
          <button onClick={copy} className="px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="Copier le lien">{copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}</button>
          <button onClick={() => shareTracking(url)} className="px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="Partager"><Share2 size={16} /></button>
        </div>
      </div>

      {created ? (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="font-semibold text-green-800">Votre compte est créé 🎉</p>
          <p className="text-xs text-green-700 mt-1">Vos commandes et vos points sont dans votre compte.</p>
          <button onClick={() => router.push("/commandes")} className="mt-3 w-full py-2.5 rounded-xl bg-[#30A08B] text-white text-sm font-semibold">Voir mes commandes</button>
        </div>
      ) : session?.verified ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#30A08B]/10 to-[#B2905F]/10 border border-[#30A08B]/30 p-4">
          <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Gift size={16} className="text-[#B17236]" /> Gardez vos {pointsHint ? `${pointsHint} ` : ""}Baobab Points</p>
          <p className="text-xs text-gray-600 mt-1">Votre numéro est déjà vérifié : choisissez un mot de passe et votre compte est prêt, avec cette commande et vos points.</p>
          <div className="mt-3 relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Mot de passe (6 caractères min.)" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B]" />
          </div>
          {error ? <p className="text-xs text-red-600 mt-1.5">{error}</p> : null}
          <button onClick={claim} disabled={busy} className="mt-2 w-full py-2.5 rounded-xl bg-[#30A08B] text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {busy ? <Loader2 size={15} className="animate-spin" /> : null} Créer mon compte
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-700">Créez un compte pour retrouver toutes vos commandes et gagner des Baobab Points.</p>
          <button onClick={() => router.push("/auth/register")} className="mt-2 text-sm font-semibold text-[#30A08B]">Créer mon compte</button>
        </div>
      )}

      {onClose ? <button onClick={onClose} className="w-full text-sm text-gray-500 py-1">Continuer mes achats</button> : null}
    </div>
  );
}
