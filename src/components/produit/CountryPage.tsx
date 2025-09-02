"use client";

import React, { useState } from "react";
import { X, MapPin, ChevronDown } from "lucide-react";

interface CountryPageProps {
  isOpen: boolean;
  setIsCountryOpen: (isOpen: boolean) => void;
  onClose: () => void;
  setPays: (pays: string) => void;
}

interface Country {
  id: number;
  name: string;
}

const CountryPage: React.FC<CountryPageProps> = ({
  isOpen,
  setIsCountryOpen,
  onClose,
  setPays,
}) => {
  const [countryId, setCountryId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Liste des pays d'Afrique de l'Ouest
  const countries: Country[] = [
    { id: 1, name: "Bénin" },
    { id: 2, name: "Burkina Faso" },
    { id: 3, name: "Cap-Vert" },
    { id: 4, name: "Côte d'Ivoire" },
    { id: 5, name: "Gambie" },
    { id: 6, name: "Ghana" },
    { id: 7, name: "Guinée" },
    { id: 8, name: "Guinée-Bissau" },
    { id: 9, name: "Liberia" },
    { id: 10, name: "Mali" },
    { id: 11, name: "Niger" },
    { id: 12, name: "Nigeria" },
    { id: 13, name: "Sénégal" },
    { id: 14, name: "Sierra Leone" },
    { id: 15, name: "Togo" },
  ];

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCountryChange = (country: Country) => {
    console.log(country);
    setPays(country.name);
    setCountryId(country.id);
    setSelectedCountry(country);
    if (country.id !== 0) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      {/* Modal Content Container */}
      <div className="relative z-10 w-full max-w-lg transform transition-all animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden"
             onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-[#30A08B] to-[#B2905F] p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-white animate-bounce" />
                <h2 className="text-2xl font-bold text-white">
                  Sélectionnez votre pays
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <label className="block text-[#B17236] font-medium">
                Pays
                <div className="mt-1 relative">
                  <select
                    value={countryId}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const country = countries.find(c => c.id === selectedId);
                      if (country) {
                        handleCountryChange(country);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-[#30A08B]/20 rounded-lg focus:border-[#30A08B] focus:ring-2 focus:ring-[#30A08B]/20 outline-none transition-all duration-200 appearance-none bg-white"
                  >
                    <option value={0}>Sélectionnez votre pays</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B2905F] pointer-events-none" />
                </div>
              </label>

              <div className="bg-[#30A08B]/10 rounded-lg p-4">
                <p className="text-sm text-[#30A08B]">
                  Votre sélection nous aidera à personnaliser votre expérience
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-[#B2905F] text-[#B2905F] rounded-lg hover:bg-[#B2905F]/10 transition-colors duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 bg-[#30A08B] text-white rounded-lg font-medium
                  transform transition-all duration-200
                  ${
                    isLoading
                      ? "opacity-75"
                      : "hover:bg-[#B2905F] hover:scale-105"
                  }
                  disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Chargement...
                  </span>
                ) : (
                  "Soumettre"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryPage;
