"use client";

import React from "react";
import { CreditCard, Smartphone, Banknote, Truck, Info, Shield, Check } from "lucide-react";

interface PaiementPageProps {
  selectedPayment: string;
  setSelectedPayment: (payment: string) => void;
  cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name?: string;
  };
  setCardDetails: (details: any) => void;
  mobileDetails: {
    number: string;
    operateur: string;
  };
  setMobileDetails: (details: any) => void;
  submitStatus?: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
  setSubmitStatus?: (status: {
    loading: boolean;
    error: string | null;
    success: boolean;
  }) => void;
  onSubmit?: boolean;
  setOnSubmit?: (value: boolean) => void;
  validatePaymentInfo?: () => string[];
  handlePress: (payment: string) => void;
  handlePaymentSubmit?: (e: React.FormEvent) => Promise<void>;
  getPaymentDescription: () => string;
  formatCardNumber: (value: string) => string;
}

const PaiementPage: React.FC<PaiementPageProps> = ({
  selectedPayment,
  setSelectedPayment,
  cardDetails,
  setCardDetails,
  mobileDetails,
  setMobileDetails,
  submitStatus,
  handlePress,
  getPaymentDescription,
  formatCardNumber,
}) => {

  const paymentMethods = [
    {
      id: "paiement_en_ligne",
      name: "Paiement en ligne",
      category: "En ligne",
      icon: "🌐",
      color: "from-[#30A08B] to-[#B17236]",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      textColor: "text-teal-700",
      subLabels: ["Visa", "Mastercard", "Mobile Money", "MyNita", "Amanata"],
    },
    {
      id: "payé à la livraison",
      name: "À domicile",
      category: "Livraison",
      icon: "🚚",
      color: "from-orange-500 to-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      subLabels: [],
    },
    {
      id: "paiement_assiste",
      name: "Paiement assisté",
      category: "Paiement",
      icon: "📞",
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      subLabels: [],
    },
  ];

  const handleCardChange = (field: string, value: string) => {
    if (field === "number") {
      value = formatCardNumber(value);
    }
    if (field === "expiry") {
      value = value.replace(/[^0-9]/g, '').replace(/(.{2})(.{2})/, '$1/$2');
    }
    if (field === "cvc") {
      value = value.replace(/[^0-9]/g, '').slice(0, 3);
    }
    setCardDetails((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleMobileChange = (field: string, value: string) => {
    if (field === "number") {
      value = value.replace(/[^0-9]/g, '');
    }
    setMobileDetails((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderPaymentForm = () => {
    const selected = paymentMethods.find(p => p.id === selectedPayment);
    if (!selected) return null;

    if (selectedPayment === "Visa" || selectedPayment === "master Card") {
      return (
        <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className={`p-2 ${selected.bgColor} rounded-lg mr-3`}>
              <CreditCard className={`h-5 w-5 ${selected.textColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Informations carte</h3>
              <p className="text-xs text-gray-500">Sécurisé par SSL</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nom sur la carte"
              value={cardDetails.name || ""}
              onChange={(e) => handleCardChange("name", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
            />

            <div className="relative">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => handleCardChange("number", e.target.value)}
                maxLength={19}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              />
              <Shield className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => handleCardChange("expiry", e.target.value)}
                maxLength={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              />
              <input
                type="password"
                placeholder="CVC"
                value={cardDetails.cvc}
                onChange={(e) => handleCardChange("cvc", e.target.value)}
                maxLength={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              />
            </div>
          </div>
        </div>
      );
    }

    if (selectedPayment === "Mobile Money" || selectedPayment === "zeyna" || selectedPayment === "mynita" || selectedPayment === "amana") {
      return (
        <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className={`p-2 ${selected.bgColor} rounded-lg mr-3`}>
              <Smartphone className={`h-5 w-5 ${selected.textColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Numéro téléphone</h3>
              <p className="text-xs text-gray-500">Votre numéro de mobile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-3 gap-3">
              <select
                value={mobileDetails.operateur}
                onChange={(e) => handleMobileChange("operateur", e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              >
                <option value="227">+227</option>
                <option value="229">+229</option>
              </select>
              <div className="col-span-2">
                <input
                  type="tel"
                  placeholder="90 12 34 56"
                  value={mobileDetails.number}
                  onChange={(e) => handleMobileChange("number", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedPayment === "payé à la livraison") {
      return (
        <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Processus de livraison</h3>
              <p className="text-xs text-gray-500">Étapes du paiement</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { step: 1, text: "Confirmation" },
              { step: 2, text: "Préparation" },
              { step: 3, text: "Livraison" },
              { step: 4, text: "Paiement" }
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center p-2 bg-white rounded-lg border border-orange-100">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                  {step}
                </div>
                <span className="text-xs text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 pt-4">

      {/* ── Cartes de paiement ── */}
      {/* Mobile : cartes horizontales empilées | Desktop : grille 3 colonnes */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3 mb-5">
        {paymentMethods.map((method) => {
          const selected = selectedPayment === method.id;
          return (
            <div
              key={method.id}
              onClick={() => handlePress(method.id)}
              className={`relative rounded-xl cursor-pointer transition-all duration-200 border-2 active:scale-[0.98] ${
                selected
                  ? `${method.borderColor} shadow-md`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Fond coloré quand sélectionné */}
              {selected && (
                <div className={`absolute inset-0 ${method.bgColor} opacity-20 rounded-xl pointer-events-none`} />
              )}

              {/* ── Layout mobile : horizontal ── */}
              <div className="relative flex sm:hidden items-center gap-3 p-3.5">
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-xl shadow-sm`}>
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{method.name}</h3>
                  {method.subLabels && method.subLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {method.subLabels.map((label) => (
                        <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{label}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">{method.category}</p>
                  )}
                </div>
                {selected
                  ? <div className="flex-shrink-0 w-6 h-6 bg-[#30A08B] rounded-full flex items-center justify-center"><Check className="h-3.5 w-3.5 text-white" /></div>
                  : <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-200" />
                }
              </div>

              {/* ── Layout desktop : vertical centré ── */}
              <div className="relative hidden sm:flex sm:flex-col items-center text-center p-4">
                {selected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#30A08B] rounded-full flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${method.color} text-white text-xl mb-2.5 shadow-sm`}>
                  {method.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{method.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 mb-1.5">{method.category}</p>
                {method.subLabels && method.subLabels.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {method.subLabels.map((label) => (
                      <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{label}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Description de la méthode sélectionnée */}
      {selectedPayment && (
        <div className="mb-4 p-3.5 bg-[#30A08B]/5 rounded-xl border border-[#30A08B]/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-[#30A08B] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{getPaymentDescription()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementPage;