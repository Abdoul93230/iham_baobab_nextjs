"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { sendGuestOtp, verifyGuestOtp, GuestSession } from "@/lib/guestSession";
import { formatPhoneInternational } from "@/lib/phoneRules";

/**
 * Vérification du numéro par SMS (1 seule fois par appareil, valable 90 jours).
 * Le code est envoyé à l'ouverture ; renvoi possible après le délai.
 */
export default function GuestOtpModal({
  open,
  phone,
  name,
  reason = "Pour le paiement à la livraison, nous vérifions votre numéro une seule fois.",
  onClose,
  onVerified,
}: {
  open: boolean;
  phone: string;
  name: string;
  reason?: string;
  onClose: () => void;
  onVerified: (s: GuestSession) => void;
}) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const sentFor = useRef<string | null>(null);

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const d = await sendGuestOtp(phone, name);
      setCooldown(d.cooldownSeconds || 60);
    } catch (e: any) {
      const d = e?.response?.data;
      setError(d?.message || "Envoi impossible. Vérifiez le numéro.");
      if (d?.data?.cooldownSeconds) setCooldown(d.data.cooldownSeconds);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (open && sentFor.current !== phone) {
      sentFor.current = phone;
      setCode("");
      send();
    }
    if (!open) sentFor.current = null;
  }, [open, phone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (value = code) => {
    if (!/^\d{6}$/.test(value)) return;
    setChecking(true);
    setError("");
    try {
      const s = await verifyGuestOtp(phone, value, name);
      onVerified(s);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Code incorrect.");
    } finally {
      setChecking(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm p-0 sm:p-4" onMouseDown={onClose}>
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-[#30A08B]/10 flex items-center justify-center"><ShieldCheck className="text-[#30A08B]" /></div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100" aria-label="Fermer"><X size={18} /></button>
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900">Vérifiez votre numéro</h2>
        <p className="text-sm text-gray-500 mt-1">{reason}</p>
        <p className="text-sm text-gray-700 mt-3">Code envoyé par SMS au <strong>{formatPhoneInternational(phone)}</strong></p>

        <input
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(v);
            setError("");
            if (v.length === 6) verify(v);
          }}
          placeholder="••••••"
          className="mt-3 w-full text-center tracking-[0.6em] text-2xl font-bold py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B]"
        />
        {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}

        <button
          onClick={() => verify()}
          disabled={checking || code.length !== 6}
          className="mt-4 w-full py-3 rounded-xl bg-[#30A08B] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {checking ? <Loader2 size={16} className="animate-spin" /> : null} Valider
        </button>
        <button
          onClick={send}
          disabled={sending || cooldown > 0}
          className="mt-2 w-full py-2 text-sm text-[#30A08B] font-medium disabled:text-gray-400"
        >
          {sending ? "Envoi…" : cooldown > 0 ? `Renvoyer le code dans ${cooldown}s` : "Renvoyer le code"}
        </button>
        <p className="text-[11px] text-center text-gray-400 mt-1">Astuce : le paiement en ligne ne demande pas de code.</p>
      </div>
    </div>
  );
}
