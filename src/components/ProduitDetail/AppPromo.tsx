"use client";

import React, { useEffect, useState } from "react";
import { Smartphone, Leaf, Gift, Users, CalendarCheck, Bell, Truck, Download } from "lucide-react";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.ihambaobab.mobile&referrer=utm_source%3Dsite";

/** Règles réelles des Baobab Points : lues sur le serveur, valeurs par défaut identiques à sa configuration */
type Rules = { perThousand: number; fcfaPerPoint: number; maxPercent: number; firstOrder: number; referral: number; checkin: number };
const DEFAULT_RULES: Rules = { perThousand: 2, fcfaPerPoint: 20, maxPercent: 30, firstOrder: 50, referral: 25, checkin: 1 };

/**
 * Bloc « Application Ihambaobab » de la fiche produit. Uniquement ce qui existe vraiment :
 * l'app est disponible, les Baobab Points suivent les règles du serveur. Aucune offre inventée.
 */
const AppPromo: React.FC = () => {
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch(`${BackendUrl}/api/gamification/config/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (!c) return;
        setEnabled(c.enabled !== false);
        const m = c.modules || {};
        setRules({
          perThousand: Number(m.POINTS_PURCHASE?.ratePerThousand) || 0,
          fcfaPerPoint: Number(c.redemption?.pointsToFcfaRate) || DEFAULT_RULES.fcfaPerPoint,
          maxPercent: Number(c.redemption?.maxPercentPerOrder) || DEFAULT_RULES.maxPercent,
          firstOrder: Number(m.FIRST_ORDER_BONUS?.points) || 0,
          referral: Number(m.REFERRAL?.pointsParrain) || 0,
          checkin: Number(m.DAILY_CHECKIN?.pointsPerDay) || 0,
        });
      })
      .catch(() => { /* règles par défaut */ });
  }, []);

  const points = [
    rules.perThousand > 0 && {
      icon: <Leaf className="w-5 h-5" />,
      title: "Des points à chaque achat",
      description: `${rules.perThousand} Baobab Points pour 1 000 F d'achat, crédités à la livraison. 1 point = ${rules.fcfaPerPoint} F de réduction, jusqu'à ${rules.maxPercent} % d'une commande.`,
    },
    rules.firstOrder > 0 && {
      icon: <Gift className="w-5 h-5" />,
      title: "Bonus de 1re commande",
      description: `+${rules.firstOrder} Baobab Points quand votre première commande est livrée.`,
    },
    rules.referral > 0 && {
      icon: <Users className="w-5 h-5" />,
      title: "Parrainage",
      description: `+${rules.referral} Baobab Points pour chaque ami qui reçoit sa première commande avec votre lien.`,
    },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; title: string; description: string }>;

  const benefits = [
    { icon: <Truck className="w-4 h-4" />, text: "Suivi de commande étape par étape" },
    { icon: <Bell className="w-4 h-4" />, text: "Notification à chaque étape" },
    ...(rules.checkin > 0 ? [{ icon: <CalendarCheck className="w-4 h-4" />, text: `+${rules.checkin} point par jour en pointant` }] : []),
  ];

  return (
    <div className="bg-gray-100">
      <div className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl overflow-hidden shadow-lg border border-emerald-500/20">
        <div className="p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Application Ihambaobab
              </h2>
              <p className="text-emerald-100 text-sm mt-1 font-medium">
                Commandez, suivez vos colis et gagnez des Baobab Points
              </p>
            </div>
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-lg px-3 py-1 flex-shrink-0">
              <span className="text-white text-xs font-semibold">DISPONIBLE SUR ANDROID</span>
            </div>
          </div>

          {enabled && points.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {points.map((p) => (
                <div key={p.title} className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-400/20">
                  <div className="flex items-center mb-2">
                    <span className="text-white mr-2">{p.icon}</span>
                    <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                  </div>
                  <p className="text-emerald-100 text-xs leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-500/20 rounded-lg p-4 border border-emerald-400/20">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {benefits.map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-white text-xs">
                  <span className="p-1 bg-emerald-500/30 rounded">{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>
            <a
              href={PLAY_STORE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-all text-sm shadow-lg flex-shrink-0"
            >
              <Download className="mr-2 w-4 h-4" />
              Télécharger l&apos;application
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPromo;
