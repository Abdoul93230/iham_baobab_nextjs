"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { User, LogOut, Menu, X, ShoppingCart, Heart } from "lucide-react";

const Navigation: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-[#30A08B]">IhamBaobab</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-[#30A08B] transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-[#30A08B] transition-colors"
              >
                Produits
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-[#30A08B] transition-colors"
              >
                Catégories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-[#30A08B] transition-colors"
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-[#30A08B] transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:text-[#30A08B] transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {/* Badge pour le nombre d'articles - à implémenter */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </Link>
                
                <Link
                  href="/favorites"
                  className="p-2 text-gray-600 hover:text-[#30A08B] transition-colors"
                >
                  <Heart className="w-6 h-6" />
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#30A08B] transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {user?.name || "Mon compte"}
                    </span>
                  </Link>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-[#30A08B] font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#30A08B] text-white px-4 py-2 rounded-lg hover:bg-[#B2905F] transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-[#30A08B] focus:outline-none focus:text-[#30A08B]"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {/* Navigation Links */}
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Produits
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catégories
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Auth Section */}
            <div className="border-t pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/cart"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Panier (0)</span>
                  </Link>
                  
                  <Link
                    href="/favorites"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Favoris</span>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#30A08B] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.name || "Mon compte"}</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-gray-700 hover:text-[#30A08B] font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block mx-3 my-2 bg-[#30A08B] text-white px-4 py-2 rounded-lg hover:bg-[#B2905F] transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
