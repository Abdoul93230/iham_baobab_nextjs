"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home } from "lucide-react";

const Unauthorized: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Accès refusé
            </h1>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#30A08B] text-white rounded-lg hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
