"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (params.name) {
      setCategoryName(decodeURIComponent(params.name as string));
    }
  }, [params.name]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {categoryName}
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Catégorie : {categoryName}
          </h2>
          <p className="text-gray-600 mb-8">
            Cette section est en cours de développement. Les produits de cette catégorie seront bientôt disponibles.
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Page en construction
            </h3>
            <p className="text-gray-600 mb-6">
              Nous travaillons actuellement sur cette fonctionnalité. Revenez bientôt !
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button
                onClick={() => router.push("/")}
                className="w-full sm:w-auto bg-[#30A08B] text-white px-6 py-3 rounded-lg hover:bg-[#2a907d] transition-colors"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Voir le dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
