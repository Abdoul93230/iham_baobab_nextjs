"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  Calendar,
  CreditCard,
  Package,
  ArrowLeft,
  Shield,
} from "lucide-react";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  AUTRE: "Autre",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-NE", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

interface LigneVente {
  nom: string;
  image?: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
  varianteLabel?: string;
}

interface ReceiptData {
  reference: string;
  storeName: string;
  total: number;
  montantNet: number;
  modePaiement: string;
  statut: string;
  lignes: LigneVente[];
  createdAt: string;
}

export default function VerifierRecuPage() {
  const params = useParams();
  const reference = params.reference as string;

  const [state, setState] = useState<"loading" | "verified" | "invalid" | "error">("loading");
  const [data, setData] = useState<ReceiptData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!reference) return;
    const verify = async () => {
      try {
        const res = await axios.get(`${BackendUrl}/api/pos/receipt/${reference}`);
        if (res.data?.verified) {
          setData(res.data.data);
          setState("verified");
        } else {
          setState("invalid");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setState("invalid");
        } else {
          setErrorMsg(err.response?.data?.message || "Erreur de connexion");
          setState("error");
        }
      }
    };
    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-start py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">Ihambaobab</h1>
          <p className="text-xs text-slate-500 mt-0.5">Vérification de reçu</p>
        </div>
      </div>

      {/* Loading */}
      {state === "loading" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 flex flex-col items-center gap-4 w-full max-w-md">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Vérification en cours…</p>
          <p className="text-slate-400 text-xs font-mono bg-slate-50 px-3 py-1 rounded-lg">{reference}</p>
        </div>
      )}

      {/* Invalid */}
      {state === "invalid" && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 flex flex-col items-center gap-4 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Reçu invalide</h2>
            <p className="text-slate-500 text-sm mt-1">
              Ce reçu n'existe pas ou a été falsifié. Ne remettez aucun article sans vérification.
            </p>
          </div>
          <div className="bg-red-50 rounded-xl px-4 py-2 w-full">
            <p className="text-xs text-red-600 font-mono break-all">{reference}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 w-full text-left">
            <p className="text-xs text-amber-700 font-semibold mb-1">⚠️ Signalement</p>
            <p className="text-xs text-amber-600">
              Si vous avez reçu ce reçu d'un client, contactez immédiatement le support Ihambaobab.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center gap-4 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
            <XCircle className="w-9 h-9 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Erreur de vérification</h2>
            <p className="text-slate-500 text-sm mt-1">{errorMsg || "Impossible de contacter le serveur."}</p>
          </div>
          <button
            onClick={() => { setState("loading"); }}
            className="text-indigo-600 text-sm font-semibold hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Verified */}
      {state === "verified" && data && (
        <div className="w-full max-w-md space-y-4">
          {/* Status Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-800">Reçu authentique ✓</h2>
              <p className="text-sm text-emerald-600 mt-0.5">
                Ce reçu est valide et certifié par Ihambaobab.
              </p>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Boutique</p>
                  <h3 className="text-lg font-bold mt-0.5">{data.storeName}</h3>
                </div>
                <ShoppingBag className="w-8 h-8 text-indigo-300" />
              </div>
            </div>

            {/* Meta Info */}
            <div className="px-5 py-4 border-b border-slate-100 grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Date</p>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">{formatDate(data.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Paiement</p>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    {MODE_LABELS[data.modePaiement] || data.modePaiement}
                  </p>
                </div>
              </div>
            </div>

            {/* Reference */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">Référence</p>
              <p className="text-xs font-mono text-slate-700 break-all">{data.reference}</p>
            </div>

            {/* Items */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Articles</p>
              </div>
              <div className="space-y-2">
                {data.lignes.map((ligne, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {ligne.image && (
                        <img
                          src={ligne.image}
                          alt={ligne.nom}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{ligne.nom}</p>
                        {ligne.varianteLabel && (
                          <p className="text-[10px] text-slate-400">{ligne.varianteLabel}</p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          {ligne.quantite} × {formatCurrency(ligne.prixUnitaire)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-800 flex-shrink-0">
                      {formatCurrency(ligne.sousTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Total payé</p>
                <p className="text-xl font-black text-indigo-600">{formatCurrency(data.total)}</p>
              </div>
              {data.statut === "ANNULEE" && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs font-bold text-red-600">⚠️ Cette vente a été annulée</p>
                </div>
              )}
            </div>
          </div>

          {/* Trust Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Certifié par Ihambaobab • ihambaobab.com</span>
          </div>
        </div>
      )}
    </div>
  );
}
