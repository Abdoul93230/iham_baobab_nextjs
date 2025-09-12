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
      id: "Visa",
      name: "Visa",
      category: "Carte",
      icon: "💳",
      color: "from-blue-600 to-blue-800",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    {
      id: "master Card",
      name: "MasterCard", 
      category: "Carte",
      icon: "💳",
      color: "from-red-500 to-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700"
    },
    {
      id: "Mobile Money",
      name: "Mobile Money",
      category: "Mobile",
      icon: "📱",
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-50", 
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    {
      id: "zeyna",
      name: "Zeyna",
      category: "Wallet",
      icon: "💰",
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200", 
      textColor: "text-purple-700"
    },
    {
      id: "nita",
      name: "MyNita",
      category: "Wallet", 
      icon: "💰",
      color: "from-indigo-500 to-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700"
    },
    {
      id: "amana",
      name: "Amana",
      category: "Wallet",
      icon: "💰",
      color: "from-yellow-500 to-yellow-700", 
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    },
    {
      id: "payé à la livraison",
      name: "À domicile",
      category: "Livraison",
      icon: "🚚",
      color: "from-orange-500 to-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700"
    }
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

    if (selectedPayment === "Mobile Money" || selectedPayment === "zeyna" || selectedPayment === "nita" || selectedPayment === "amana") {
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
    <div className="w-full p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#B17236] to-[#30A08B] bg-clip-text text-transparent mb-1">
          Méthode de paiement
        </h2>
        <p className="text-sm text-gray-500">Sélectionnez votre mode de paiement</p>
      </div>

      {/* Payment Methods Grid - Petites cartes compactes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handlePress(method.id)}
            className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 ${
              selectedPayment === method.id
                ? `${method.borderColor} shadow-lg`
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Selection Indicator */}
            {selectedPayment === method.id && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#30A08B] rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            
            {/* Background when selected */}
            {selectedPayment === method.id && (
              <div className={`absolute inset-0 ${method.bgColor} opacity-20 rounded-xl`}></div>
            )}
            
            <div className="relative text-center">
              {/* Icon */}
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${method.color} text-white text-lg mb-2`}>
                {method.icon}
              </div>
              
              {/* Name */}
              <h3 className="font-medium text-gray-800 text-sm leading-tight">{method.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{method.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {selectedPayment && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">{getPaymentDescription()}</p>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {renderPaymentForm()}

      {/* Security Note */}
      {selectedPayment && (
        <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
          <Shield className="h-3 w-3 mr-1" />
          Paiement 100% sécurisé
        </div>
      )}
    </div>
  );
};

export default PaiementPage;