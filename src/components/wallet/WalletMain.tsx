"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchWallet,
  fetchTransactions,
  fetchPublicConfig,
  dailyCheckin,
  clearCheckinResult,
  selectWallet,
  selectTransactions,
  selectGamificationConfig,
  selectCheckinResult,
} from "@/redux/gamificationSlice";
import { selectUser } from "@/redux/userSlice";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import {
  Leaf,
  TreePine,
  Trees,
  Copy,
  CheckCircle2,
  TrendingUp,
  Clock,
  Gift,
  ShoppingBag,
  Star,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";

// ─── Level config ──────────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  Graine: {
    label: "Graine",
    icon: Leaf,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    gradient: "from-green-400 to-emerald-500",
    next: "Arbre",
    nextThreshold: 500,
  },
  Arbre: {
    label: "Arbre",
    icon: TreePine,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    gradient: "from-teal-500 to-[#30A08B]",
    next: "Grand Baobab",
    nextThreshold: 2500,
  },
  "Grand Baobab": {
    label: "Grand Baobab",
    icon: Trees,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    gradient: "from-amber-400 to-yellow-500",
    next: null,
    nextThreshold: null,
  },
};

const TRANSACTION_LABELS: Record<string, { label: string; color: string }> = {
  PURCHASE: { label: "Commande livrée", color: "text-green-600" },
  CHECKIN: { label: "Check-in quotidien", color: "text-teal-600" },
  CHECKIN_STREAK: { label: "Bonus série", color: "text-teal-600" },
  REVIEW: { label: "Avis produit", color: "text-blue-600" },
  FIRST_ORDER: { label: "Bonus 1ère commande", color: "text-purple-600" },
  EVENT: { label: "Événement spécial", color: "text-orange-600" },
  REFERRAL_PARRAIN: { label: "Parrainage (parrain)", color: "text-indigo-600" },
  REFERRAL_FILLEUL: { label: "Parrainage (filleul)", color: "text-indigo-600" },
  REDEMPTION: { label: "Points utilisés", color: "text-red-500" },
  EXPIRY: { label: "Points expirés", color: "text-gray-400" },
  ADMIN_CREDIT: { label: "Crédit admin", color: "text-green-600" },
  ADMIN_DEBIT: { label: "Débit admin", color: "text-red-500" },
  CANCELLATION: { label: "Annulation commande", color: "text-red-500" },
};

// ─── Earn section with accordion ─────────────────────────────────────────────

function EarnSection({ config }: { config: any }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const rate = config?.modules?.POINTS_PURCHASE?.ratePerThousand ?? 2;
  const checkinPts = config?.modules?.DAILY_CHECKIN?.pointsPerDay ?? 1;
  const bonus7 = config?.modules?.DAILY_CHECKIN?.bonus7d ?? 10;
  const bonus30 = config?.modules?.DAILY_CHECKIN?.bonus30d ?? 30;
  const reviewTxt = config?.modules?.REVIEW_POINTS?.textOnly ?? 2;
  const reviewPhoto = config?.modules?.REVIEW_POINTS?.withPhoto ?? 5;
  const parrain = config?.modules?.REFERRAL?.pointsParrain ?? 25;
  const filleul = config?.modules?.REFERRAL?.pointsFilleul ?? 10;
  const expiry = config?.modules?.REFERRAL?.expiryDays ?? 30;
  const firstOrder = config?.modules?.FIRST_ORDER_BONUS?.points ?? 50;
  const redeemRate = config?.redemption?.pointsToFcfaRate ?? 20;

  const items = [
    {
      key: "purchase",
      icon: ShoppingBag,
      label: "Commande livrée",
      desc: `${rate} BP / 1 000 FCFA`,
      detail: `Vous gagnez ${rate} Baobab Points pour chaque tranche de 1 000 FCFA dépensés. Les points sont crédités une fois la commande marquée "Livrée".\n\nMultiplicateurs de niveau :\n• Arbre → ×1.25 (${Math.round(rate * 1.25 * 10) / 10} BP/1 000 FCFA)\n• Grand Baobab → ×1.5 (${Math.round(rate * 1.5 * 10) / 10} BP/1 000 FCFA)`,
    },
    {
      key: "checkin",
      icon: Zap,
      label: "Check-in quotidien",
      desc: `+${checkinPts} BP/jour`,
      detail: `Ouvrez l'application chaque jour et cliquez "Pointer" pour gagner ${checkinPts} BP.\n\nBonusd de série :\n• 7 jours consécutifs → +${bonus7} BP bonus\n• 30 jours consécutifs → +${bonus30} BP bonus\n\nLa série est remise à zéro si vous manquez un jour.`,
    },
    {
      key: "review",
      icon: Star,
      label: "Avis produit",
      desc: `${reviewTxt} – ${reviewPhoto} BP`,
      detail: `Laissez un avis sur un produit que vous avez acheté :\n• Avis texte uniquement → ${reviewTxt} BP\n• Avis avec photo → ${reviewPhoto} BP\n\nChaque avis est comptabilisé une seule fois (anti-doublon). Minimum 1 jour après la livraison.`,
    },
    {
      key: "referral",
      icon: Users,
      label: "Parrainage",
      desc: `${parrain} BP par filleul`,
      detail: `Partagez votre code de parrainage. Quand votre filleul passe et reçoit sa 1ère commande, vous gagnez ${parrain} BP et lui ${filleul} BP.\n\nBonus parrain progressif :\n• 5–19 filleuls → +10 BP/filleul supplémentaire\n• ≥ 20 filleuls → +30 BP/filleul supplémentaire\n\nFenêtre de validation : ${expiry} jours après l'inscription du filleul.`,
    },
    {
      key: "firstorder",
      icon: Gift,
      label: "1ère commande",
      desc: `${firstOrder} BP bonus`,
      detail: `Recevez ${firstOrder} BP offerts à la livraison de votre toute première commande.\n\nCe bonus est accordé une seule fois par compte. Il s'accumule avec les points d'achat normaux.`,
    },
    {
      key: "redeem",
      icon: TrendingUp,
      label: "Comment utiliser mes BP ?",
      desc: `1 BP = ${redeemRate} FCFA`,
      detail: `À la commande, vous pouvez utiliser vos BP comme réduction :\n• 1 BP = ${redeemRate} FCFA de réduction\n• Plafond : ${config?.redemption?.maxPercentPerOrder ?? 30}% du montant de la commande\n\nExemple : 50 BP = ${50 * redeemRate} FCFA de réduction sur une commande de ${Math.round(50 * redeemRate / 0.3).toLocaleString("fr-FR")} FCFA minimum.`,
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-bold text-gray-800 flex items-center gap-2"><Gift size={16} className="text-[#30A08B]" /> Baobab Points — Comment ça marche ?</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map(({ key, icon: Icon, label, desc, detail }) => {
          const isOpen = openKey === key;
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#30A08B]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#30A08B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-300 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 bg-[#f8fdfb] border-t border-[#30A08B]/10">
                  {detail.split("\n").map((line, i) => (
                    <p key={i} className={`text-xs leading-relaxed ${line === "" ? "mt-2" : line.startsWith("•") ? "text-gray-600 ml-2" : line.endsWith(":") ? "font-semibold text-gray-700 mt-2" : "text-gray-600"}`}>
                      {line || " "}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function WalletMain() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const wallet = useSelector(selectWallet);
  const transactions = useSelector(selectTransactions);
  const config = useSelector(selectGamificationConfig);
  const checkinResult = useSelector(selectCheckinResult);
  const isLoadingWallet = useSelector((s: RootState) => s.gamification.isLoadingWallet);
  const isLoadingCheckin = useSelector((s: RootState) => s.gamification.isLoadingCheckin);

  const [copiedCode, setCopiedCode] = useState(false);
  const [showCheckinToast, setShowCheckinToast] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWallet(user.id));
      dispatch(fetchTransactions({ userId: user.id }));
      dispatch(fetchPublicConfig());
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (checkinResult) {
      setShowCheckinToast(true);
      const t = setTimeout(() => {
        setShowCheckinToast(false);
        dispatch(clearCheckinResult());
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [checkinResult, dispatch]);

  const handleCheckin = () => {
    if (user?.id) dispatch(dailyCheckin(user.id));
  };

  const copyReferralCode = () => {
    if (wallet?.referralCode) {
      navigator.clipboard.writeText(wallet.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const level = wallet?.level ?? "Graine";
  const lvlCfg = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG];
  const LvlIcon = lvlCfg.icon;

  const nextThreshold = lvlCfg.nextThreshold;
  const currentBase = level === "Arbre" ? 500 : 0;
  const progressPct = nextThreshold
    ? Math.min(
        100,
        Math.round(
          ((wallet?.totalEarned ?? 0 - currentBase) / (nextThreshold - currentBase)) * 100
        )
      )
    : 100;

  const rate = config?.redemption?.pointsToFcfaRate ?? 20;
  const todayCheckin = wallet?.lastCheckinDate
    ? new Date(wallet.lastCheckinDate).toDateString() === new Date().toDateString()
    : false;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Connectez-vous pour accéder à votre wallet.
      </div>
    );
  }

  return (
    <>
      <HomeHeader />

      {/* ── Checkin toast ── */}
      {showCheckinToast && checkinResult && (
        <div className="fixed top-20 right-4 z-50 bg-[#30A08B] text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
          <Zap size={18} />
          <span className="font-semibold">+{checkinResult.pointsEarned} BP</span>
          <span className="text-white/80 text-sm">— Série {checkinResult.streak} jours !</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-10">

        {/* ── Hero wallet card ── */}
        <div className={`rounded-3xl bg-gradient-to-br ${lvlCfg.gradient} p-6 text-white shadow-xl mb-6`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Baobab Points</p>
              {isLoadingWallet ? (
                <div className="w-32 h-10 bg-white/20 rounded-xl animate-pulse" />
              ) : (
                <div className="text-5xl font-black">{wallet?.balance ?? 0} <span className="text-2xl font-semibold">BP</span></div>
              )}
              <p className="text-white/80 text-sm mt-1">
                = {((wallet?.balance ?? 0) * rate).toLocaleString("fr-FR")} FCFA utilisables
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <LvlIcon size={28} className="text-white" />
            </div>
          </div>

          {/* Level badge + progress */}
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <LvlIcon size={16} />
                <span className="font-bold text-sm">{level}</span>
              </div>
              {lvlCfg.next && (
                <span className="text-white/70 text-xs">
                  {wallet?.totalEarned ?? 0} / {nextThreshold} BP → {lvlCfg.next}
                </span>
              )}
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Gagnés", value: wallet?.totalEarned ?? 0, icon: TrendingUp, color: "text-green-600" },
            { label: "Utilisés", value: wallet?.totalSpent ?? 0, icon: ShoppingBag, color: "text-orange-500" },
            { label: "Série", value: `${wallet?.checkinStreak ?? 0}j`, icon: Zap, color: "text-teal-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <Icon size={20} className={`${color} mx-auto mb-1`} />
              <div className="text-xl font-black text-gray-800">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Daily check-in */}
          <button
            onClick={handleCheckin}
            disabled={isLoadingCheckin || todayCheckin}
            className={`rounded-2xl p-4 flex flex-col items-center gap-2 font-semibold text-sm transition-all
              ${todayCheckin
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#30A08B] text-white shadow-md hover:bg-[#27897a] active:scale-95"
              }`}
          >
            {isLoadingCheckin ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap size={22} />
            )}
            {todayCheckin ? "Check-in effectué ✓" : "Check-in quotidien"}
            <span className="text-xs font-normal opacity-70">+{config?.modules?.DAILY_CHECKIN?.pointsPerDay ?? 1} BP/jour</span>
          </button>

          {/* Referral */}
          <button
            onClick={copyReferralCode}
            className="bg-white border-2 border-[#30A08B] text-[#30A08B] rounded-2xl p-4 flex flex-col items-center gap-2 font-semibold text-sm hover:bg-[#30A08B]/5 transition-all active:scale-95"
          >
            {copiedCode ? <CheckCircle2 size={22} /> : <Share2 size={22} />}
            Parrainer un ami
            <span className="text-xs font-normal opacity-70 font-mono">
              {copiedCode ? "Copié !" : (wallet?.referralCode ?? "—")}
            </span>
          </button>
        </div>

        {/* ── How to earn ── */}
        <EarnSection config={config} />

        {/* ── Transaction history ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><Clock size={16} className="text-[#30A08B]" /> Historique</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">Aucune transaction pour l'instant</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((txn) => {
                const meta = TRANSACTION_LABELS[txn.type] ?? { label: txn.type, color: "text-gray-600" };
                const isCredit = txn.delta > 0;
                return (
                  <div key={txn._id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-green-50" : "bg-red-50"}`}>
                      {isCredit ? <TrendingUp size={15} className="text-green-600" /> : <ShoppingBag size={15} className="text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${meta.color}`}>{meta.label}</div>
                      <div className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                    <div className={`text-base font-black ${isCredit ? "text-green-600" : "text-red-500"}`}>
                      {isCredit ? "+" : ""}{txn.delta} BP
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </>
  );
}
