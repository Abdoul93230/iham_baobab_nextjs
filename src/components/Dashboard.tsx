"use client";

import React from "react";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, LogOut, Settings, ShoppingBag, BarChart3 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-[#30A08B]">IhamBaobab</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || "Utilisateur"}
                  </span>
                </div>
                
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue, {user?.name || "Utilisateur"} !
            </h2>
            <p className="text-gray-600">
              Voici votre tableau de bord IhamBaobab. Gérez vos commandes, explorez nos produits et bien plus encore.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#30A08B]/10 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-[#30A08B]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#B2905F]/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-[#B2905F]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produits vus</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Statut compte</p>
                  <p className="text-2xl font-bold text-gray-900">Actif</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations du compte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <p className="text-gray-900">{user?.name || "Non défini"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email || "Non défini"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-gray-900">{user?.phoneNumber || "Non défini"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <p className="text-gray-900">{user?.role || "Utilisateur"}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-[#30A08B] text-white p-4 rounded-lg hover:bg-[#B2905F] transition-colors">
              <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Mes commandes</span>
            </button>
            
            <button className="bg-[#B2905F] text-white p-4 rounded-lg hover:bg-[#30A08B] transition-colors">
              <Settings className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Paramètres</span>
            </button>
            
            <button className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <User className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Profil</span>
            </button>
            
            <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
              <BarChart3 className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Statistiques</span>
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
