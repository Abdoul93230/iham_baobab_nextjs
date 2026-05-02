"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchRedeemPreview,
  selectRedeemPreview,
  selectWallet,
  fetchWallet,
  fetchPublicConfig,
  selectGamificationConfig,
} from "@/redux/gamificationSlice";
import { selectUser } from "@/redux/userSlice";
import { Trees, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  orderAmountFcfa: number;
  onPointsChange: (points: number, discountFcfa: number) => void;
  initialPoints?: number;
}

export default function PointsRedeemWidget({ orderAmountFcfa, onPointsChange, initialPoints = 0 }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const wallet = useSelector(selectWallet);
  const preview = useSelector(selectRedeemPreview);
  const config = useSelector(selectGamificationConfig);

  const [expanded, setExpanded] = useState(initialPoints > 0);
  const [pointsToUse, setPointsToUse] = useState(initialPoints);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchPublicConfig());
    dispatch(fetchWallet(user.id));
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!user?.id || !orderAmountFcfa || orderAmountFcfa <= 0) return;
    dispatch(fetchRedeemPreview({ userId: user.id, orderAmountFcfa }));
  }, [user?.id, orderAmountFcfa, dispatch]);

  useEffect(() => {
    // Skip the initial mount — only reset when amount truly changes later
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPointsToUse(0);
    onPointsChange(0, 0);
  }, [orderAmountFcfa]);

  // Sync initialPoints dès qu'il arrive (ou que preview se charge), clampé au max utilisable
  useEffect(() => {
    if (initialPoints <= 0) return;
    const rate = config?.redemption?.pointsToFcfaRate ?? 20;
    const maxUsable = preview?.usablePoints ?? initialPoints; // si preview pas encore là, on prend initialPoints tel quel
    const clamped = Math.min(initialPoints, maxUsable);
    if (clamped > 0) {
      setPointsToUse(clamped);
      onPointsChange(clamped, clamped * rate);
      setExpanded(true);
    }
  }, [initialPoints, preview]);

  // Afficher quand même une bannière si la commande originale avait des BP, même si solde = 0
  if (!config?.enabled) return null;
  if (!wallet) return null;
  if (wallet.balance <= 0 && initialPoints <= 0) return null;

  const usable = preview?.usablePoints ?? 0;
  const rate = config?.redemption?.pointsToFcfaRate ?? 20;
  const maxPct = config?.redemption?.maxPercentPerOrder ?? 30;
  const discountFcfa = pointsToUse * rate;

  const handleSlider = (val: number) => {
    setPointsToUse(val);
    onPointsChange(val, val * rate);
  };

  const handleToggleAll = () => {
    if (pointsToUse >= usable) {
      handleSlider(0);
    } else {
      handleSlider(usable);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all ${pointsToUse > 0 ? "border-[#30A08B] bg-[#f0faf7]" : "border-gray-200 bg-white"}`}>
      {/* Bannière BP commande originale */}
      {initialPoints > 0 && (
        <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
          <span>🌿</span>
          <span>Cette commande utilisait <strong>{initialPoints} BP</strong> (−{(initialPoints * (config?.redemption?.pointsToFcfaRate ?? 20)).toLocaleString("fr-FR")} FCFA). Vous pouvez en appliquer à nouveau ci-dessous.</span>
        </div>
      )}
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#30A08B]/10 flex items-center justify-center shrink-0">
            <Trees size={18} className="text-[#30A08B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Baobab Points</p>
            <p className="text-xs text-gray-500">
              {wallet.balance} BP disponibles
              {pointsToUse > 0 && (
                <span className="text-[#30A08B] font-semibold ml-1">
                  — {pointsToUse} BP utilisés (−{discountFcfa.toLocaleString("fr-FR")} FCFA)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pointsToUse > 0 && (
            <span className="text-xs font-bold text-white bg-[#30A08B] px-2.5 py-1 rounded-full">
              −{discountFcfa.toLocaleString("fr-FR")} FCFA
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {usable === 0 ? (
            <p className="text-xs text-gray-500">
              Vos points ne peuvent pas être utilisés sur cette commande (plafond {maxPct}% atteint ou solde insuffisant).
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">0 BP</span>
                <span className="text-xs font-semibold text-[#30A08B]">{usable} BP max (−{(usable * rate).toLocaleString("fr-FR")} FCFA)</span>
              </div>
              <input
                type="range"
                min={0}
                max={usable}
                step={1}
                value={pointsToUse}
                onChange={(e) => handleSlider(Number(e.target.value))}
                className="w-full accent-[#30A08B] mb-3"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-xl font-black text-[#30A08B]">{pointsToUse}</p>
                  <p className="text-xs text-gray-500">BP utilisés</p>
                </div>
                <Zap size={16} className="text-gray-300 shrink-0" />
                <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-xl font-black text-gray-800">−{discountFcfa.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-gray-500">FCFA déduits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleAll}
                className="mt-3 w-full py-2 rounded-xl text-sm font-semibold border border-[#30A08B] text-[#30A08B] hover:bg-[#30A08B] hover:text-white transition-colors"
              >
                {pointsToUse >= usable ? "Retirer tous les points" : `Utiliser le maximum (${usable} BP)`}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                1 BP = {rate} FCFA · Plafond {maxPct}% du montant de la commande
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
