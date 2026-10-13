"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Package, Search } from "lucide-react";
import GuestOtpModal from "./GuestOtpModal";
import { fetchGuestOrders, getGuestSession, trackingPath } from "@/lib/guestSession";
import { applyPhoneInputChange, DEFAULT_PHONE_COUNTRY, getPhonePlaceholder, PHONE_COUNTRIES, toE164, validatePhone } from "@/lib/phoneRules";
import { formatCurrency } from "@/lib/utils";

/**
 * « Retrouver mes commandes » sans compte : numéro + code SMS (une seule fois par appareil),
 * puis la liste des commandes de ce numéro avec leur lien de suivi.
 */
export default function FindMyOrders() {
  const router = useRouter();
  const [country, setCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await fetchGuestOrders());
    } catch {
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  // Numéro déjà vérifié sur cet appareil : liste directe, sans SMS
  useEffect(() => { if (getGuestSession()?.verified) load(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validatePhone(country, digits, true);
    if (!check.isValid) { setError(check.message); return; }
    const phone = toE164(country, digits);
    const s = getGuestSession();
    if (s?.verified && s.phone === phone) { load(); return; }
    setOtpOpen(true);
  };

  if (orders) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-3">
        <h1 className="text-xl font-bold text-gray-900">Mes commandes</h1>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm py-10 text-center">Aucune commande pour ce numéro.</p>
        ) : orders.map((o) => (
          <button key={o.reference} onClick={() => router.push(trackingPath(o.reference, o.trackingToken))} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 text-left hover:border-[#30A08B]/40">
            <div className="w-10 h-10 rounded-xl bg-[#30A08B]/10 flex items-center justify-center"><Package size={18} className="text-[#30A08B]" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">n° {o.reference}</p>
              <p className="text-xs text-gray-500 truncate">{o.items?.length || 0} article(s) · {o.etatTraitement || "En cours"}</p>
            </div>
            <span className="text-sm font-bold">{formatCurrency(o.prix || 0)}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
        <p className="text-center text-xs text-gray-500 pt-2">Créez un compte pour retrouver vos commandes partout et gagner des Baobab Points.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#30A08B]/10 flex items-center justify-center mb-3"><Search className="text-[#30A08B]" /></div>
        <h1 className="text-xl font-bold text-gray-900">Retrouver mes commandes</h1>
        <p className="text-sm text-gray-500 mt-1">Commandé sans compte ? Entrez votre numéro : nous vous envoyons un code par SMS.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="flex">
            <select value={country.dialCode} onChange={(e) => setCountry(PHONE_COUNTRIES.find((c) => c.dialCode === e.target.value) || DEFAULT_PHONE_COUNTRY)} className="py-3 px-2 bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl text-sm w-28">
              {PHONE_COUNTRIES.map((c) => <option key={c.iso} value={c.dialCode}>{c.flag} {c.dialCode}</option>)}
            </select>
            <input
              type="tel"
              inputMode="tel"
              value={applyPhoneInputChange(country, digits).display}
              onChange={(e) => { const n = applyPhoneInputChange(country, e.target.value); setDigits(n.digits); setCountry(n.country); setError(""); }}
              placeholder={getPhonePlaceholder(country)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B]"
            />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#30A08B] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null} Continuer
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">Vous avez un compte ? <a href="/auth/login?redirect=/commandes" className="text-[#30A08B] font-medium">Connectez-vous</a></p>
      </div>
      <GuestOtpModal
        open={otpOpen}
        phone={toE164(country, digits)}
        name=""
        reason="Pour protéger vos commandes, confirmez que ce numéro est bien le vôtre."
        onClose={() => setOtpOpen(false)}
        onVerified={() => { setOtpOpen(false); load(); }}
      />
    </div>
  );
}
