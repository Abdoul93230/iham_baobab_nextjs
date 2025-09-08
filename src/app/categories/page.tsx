import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Toutes les Catégories - IhamBaobab Marketplace",
  description: "Découvrez toutes les catégories de produits disponibles sur IhamBaobab. Large sélection d'électroniques, vêtements, chaussures et plus encore.",
  keywords: "catégories, produits, marketplace Niger, électroniques, vêtements, chaussures, IhamBaobab",
  openGraph: {
    title: "Toutes les Catégories - IhamBaobab",
    description: "Explorez notre large gamme de catégories de produits sur la marketplace #1 du Niger",
    url: "/categories",
  },
};

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_Backend_Url;
    const response = await fetch(`${baseUrl}/getAllCategories`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const filteredCategories = categories.filter((cat: any) => cat.name !== 'all');

  return (
    <>
      {/* Données structurées JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Catégories de Produits",
            "description": "Toutes les catégories de produits disponibles sur IhamBaobab",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/categories`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": filteredCategories.length,
              "itemListElement": filteredCategories.map((category: any, index: number) => ({
                "@type": "Thing",
                "position": index + 1,
                "name": category.name,
                "url": `${process.env.NEXT_PUBLIC_SITE_URL}/Categorie/${encodeURIComponent(category.name)}`,
              }))
            }
          }),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Toutes les Catégories
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explorez notre large gamme de produits organisés par catégories pour une navigation facile
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategories.map((category: any) => (
                <Link
                  key={category._id}
                  href={`/Categorie/${encodeURIComponent(category.name)}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-[#30A08B] to-[#B2905F]">
                          <Package className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#30A08B] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Découvrir tous les produits
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune catégorie disponible
              </h3>
              <p className="text-gray-600">
                Les catégories seront bientôt disponibles.
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#30A08B] to-[#B2905F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Contactez-nous et nous vous aiderons à trouver le produit parfait
              </p>
              <Link
                href="/contact"
                className="inline-block bg-white text-[#30A08B] font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
