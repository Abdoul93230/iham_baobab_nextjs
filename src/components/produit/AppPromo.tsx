"use client";

import React from "react";
import {
  Smartphone,
  Star,
  Gift,
  Zap,
  Bell,
  Clock,
  Shield,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";

const AppPromo: React.FC = () => {
  const handleSignup = () => {
    window.open("https://waitlist-3l32.onrender.com/", "_blank");
  };

  const mainFeatures = [
    {
      icon: <Star className="w-5 h-5" />,
      title: "Programme Fidélité Premium",
      description: "1 XOF dépensé = 1 point • -10% dès 100 points",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Statuts VIP",
      description: "Bronze, Argent, Or avec avantages croissants",
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Bonus Exclusifs",
      description: "Cadeaux surprise et offres personnalisées",
    },
  ];

  const additionalBenefits = [
    {
      icon: <Bell className="w-4 h-4" />,
      text: "Notifications de promotions",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: "Livraison express prioritaire",
    },
    {
      icon: <Heart className="w-4 h-4" />,
      text: "Cadeaux d'anniversaire",
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Points doublés événements",
    },
    {
      icon: <Award className="w-4 h-4" />,
      text: "Accès ventes privées",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Support prioritaire",
    },
  ];

  return (
    <div className="bg-gray-100">
      <div className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl overflow-hidden shadow-lg border border-emerald-500/20">
        <div className="p-6">
          {/* Header avec animation */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-6 h-6 animate-pulse" />
                ihambaobab Mobile
              </h2>
              <p className="text-emerald-100 text-sm mt-1 font-medium">
                L&apos;expérience shopping africaine réinventée 🌟
              </p>
            </div>
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white text-xs font-semibold">
                BIENTÔT DISPONIBLE
              </span>
            </div>
          </div>

          {/* Main Features avec hover effects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-4 hover:bg-emerald-500/30 transition-all duration-300 border border-emerald-400/20"
              >
                <div className="flex items-center mb-2">
                  <span className="text-white mr-2">{feature.icon}</span>
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-emerald-100 text-xs">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Benefits Grid */}
          <div className="bg-emerald-500/20 rounded-lg p-4 mb-4 border border-emerald-400/20">
            <h4 className="text-white text-sm font-semibold mb-3">
              Avantages Membres ✨
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {additionalBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white text-xs"
                >
                  <span className="p-1 bg-emerald-500/30 rounded">
                    {benefit.icon}
                  </span>
                  {benefit.text}
                </div>
              ))}
            </div>
          </div>

          {/* Offre et CTA avec design amélioré */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-emerald-500/20 rounded-lg p-4 border border-emerald-400/20">
            <div className="flex-1">
              <div className="text-white mb-2 md:mb-0">
                <span className="bg-emerald-500/30 px-2 py-1 rounded text-xs font-bold">
                  OFFRE DE LANCEMENT
                </span>
              </div>
              <div className="text-white text-sm mt-2">
                <span className="font-bold text-white">200 points bonus</span>
                <span className="mx-2">+</span>
                <span className="font-bold text-white">3 mois</span> de
                livraison gratuite
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleSignup}
                className="inline-flex items-center px-6 py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-all duration-300 text-sm group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Rejoindre la Liste d&apos;Attente
                <Zap className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPromo;
