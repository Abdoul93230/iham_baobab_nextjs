"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  dailyCheckin,
  fetchWallet,
  fetchPublicConfig,
  selectWallet,
  selectGamificationConfig,
  selectCheckinResult,
} from "@/redux/gamificationSlice";
import { selectUser } from "@/redux/userSlice";
import { Trees, Zap, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DailyCheckinBanner() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector(selectUser);
  const wallet = useSelector(selectWallet);
  const config = useSelector(selectGamificationConfig);
  const checkinResult = useSelector(selectCheckinResult);

  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchPublicConfig());
    dispatch(fetchWallet(user.id));
  }, [user?.id, dispatch]);

  if (!config?.enabled || !user?.id || dismissed) return null;

  const alreadyDone = wallet?.lastCheckinDate
    ? new Date(wallet.lastCheckinDate).toDateString() === new Date().toDateString()
    : false;

  if (alreadyDone) return null;

  const checkinPoints = (config as any)?.modules?.DAILY_CHECKIN?.pointsPerDay ?? 1;

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const result = await dispatch(dailyCheckin(user.id)).unwrap();
      const bonusDelta = result.bonus?.transaction?.[0]?.delta || 0;
      const checkinDelta = result.checkin?.transaction?.delta || 0;
      const earned = checkinDelta + bonusDelta || checkinPoints;
      setToast(`+${earned} BP crédités !`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast("Pointage déjà effectué aujourd'hui.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 mt-3">
        <div className="relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#30A08B] to-[#1d7a6a] px-4 py-3 text-white shadow-md">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Trees size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">Pointage du jour</p>
            <p className="text-xs opacity-80 truncate">
              Gagnez {checkinPoints} BP{wallet?.checkinStreak && wallet.checkinStreak > 1 ? ` · Série de ${wallet.checkinStreak} jour(s)` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckin}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 bg-white text-[#30A08B] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-opacity-90 transition-all disabled:opacity-60"
          >
            <Zap size={13} />
            {loading ? "…" : "Pointer"}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#30A08B] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg animate-bounce">
          <Trees size={15} />
          {toast}
        </div>
      )}
    </>
  );
}
