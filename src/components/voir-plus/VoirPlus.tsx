"use client";

import React, { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";

export default function VoirPlus() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Adapter selon votre structure Redux
  const DATA_Categories = useSelector((state: any) => state.products.categories);
  
  const filteredCategories = DATA_Categories?.filter(
    (c: any) => c.name !== "all"
  )?.filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    router.push(`/categorie/${category.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#30A08B] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link
            href="/"
            className="p-2 hover:bg-[#2a907d] rounded-full transition-colors"
            aria-label="Retourner à l'accueil"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="ml-4 text-2xl font-semibold text-white">
            Toutes les catégories
          </h1>
        </div>
      </header>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 py-6" aria-label="Recherche de catégories">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#30A08B] focus:border-[#30A08B] outline-none"
            aria-label="Champ de recherche pour les catégories"
          />
          <Search 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B2905F] w-5 h-5" 
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12" aria-label="Liste des catégories">
        {filteredCategories.length > 0 ? (
          <>
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              role="grid"
              aria-label="Grille des catégories de produits"
            >
              {filteredCategories.map((category: any, index: number) => (
                <article
                  key={category._id}
                  className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center space-y-3 border border-gray-200 hover:border-[#30A08B] cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                  role="gridcell"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCategoryClick(category);
                    }
                  }}
                  aria-label={`Catégorie ${category.name}`}
                >
                  <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden relative">
                    <Image
                      src={category.image}
                      alt={`Image de la catégorie ${category.name}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-200"
                      sizes="80px"
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                  </div>
                  <span className="text-sm font-medium text-center text-[#B17236] group-hover:text-[#30A08B] transition-colors duration-200">
                    {category.name}
                  </span>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#B17236] text-lg" role="status" aria-live="polite">
              {searchTerm ? `Aucune catégorie trouvée pour "${searchTerm}"` : "Aucune catégorie disponible"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}