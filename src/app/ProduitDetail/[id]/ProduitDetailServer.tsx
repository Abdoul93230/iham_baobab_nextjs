import React from "react";
import Image from "next/image";
import { ProductData, CategoryData, ServerPageData } from "./serverData";

interface ProduitDetailServerProps {
  serverData: ServerPageData;
}

// Composant Server pour le rendu initial optimisé
export default function ProduitDetailServer({ serverData }: ProduitDetailServerProps) {
  const { product, category, comments } = serverData;

  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
        <p className="text-gray-600">Le produit que vous recherchez n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  // Calcul du prix et de la remise
  const originalPrice = product.prix || 0;
  const discountedPrice = product.prixPromo || 0;
  const hasDiscount = discountedPrice > 0 && discountedPrice < originalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  // Images disponibles
  const images = [product.image1, product.image2, product.image3].filter(Boolean) as string[];

  return (
    <div className="container mx-auto p-4">
      {/* JSON-LD structuré pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            description: product.description?.replace(/<[^>]*>/g, ''),
            image: images,
            sku: product._id,
            brand: {
              "@type": "Brand",
              name: "IHAM Baobab"
            },
            category: category?.name,
            offers: {
              "@type": "Offer",
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/ProduitDetail/${product._id}`,
              priceCurrency: "XOF",
              price: discountedPrice || originalPrice,
              availability: product.quantite && product.quantite > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "IHAM Baobab"
              }
            },
            aggregateRating: comments.length > 0 ? {
              "@type": "AggregateRating",
              ratingValue: comments.reduce((acc, c) => acc + (c.etoil || 0), 0) / comments.length,
              reviewCount: comments.length
            } : undefined
          })
        }}
      />

      {/* Contenu initial optimisé pour le SEO et les performances */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Galerie d'images */}
        <div className="lg:flex-1">
          {images.length > 0 && (
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          
          {/* Miniatures */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {images.slice(1).map((img, index) => (
                <div key={index} className="relative w-20 h-20 overflow-hidden rounded border">
                  <Image
                    src={img}
                    alt={`${product.name} - image ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="lg:flex-1">
          <div className="space-y-4">
            {/* Badge */}
            <div className={`inline-block px-4 py-2 rounded-md text-white font-bold ${
              hasDiscount ? 'bg-red-500' : 'bg-emerald-600'
            }`}>
              {hasDiscount ? 'Offre Limitée' : 'Nouveau'}
            </div>

            {/* Titre */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Prix */}
            <div className="space-y-2">
              {hasDiscount ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-emerald-600">
                    {discountedPrice} XOF
                  </span>
                  <span className="text-xl line-through text-red-500">
                    {originalPrice} XOF
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    -{discountPercentage}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {originalPrice} XOF
                </span>
              )}
              <p className="text-sm text-gray-600">Prix hors taxe</p>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <p className={`text-lg font-medium ${
                (product.quantite || 0) > 5 ? 'text-green-600' :
                (product.quantite || 0) > 0 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {(product.quantite || 0) > 0
                  ? `Stock disponible: ${product.quantite}`
                  : "Rupture de stock"
                }
              </p>
            </div>

            {/* Catégorie */}
            {category && (
              <div className="text-sm text-gray-600">
                Catégorie: <span className="font-medium">{category.name}</span>
              </div>
            )}

            {/* Poids si disponible */}
            {product.shipping?.weight && (
              <div className="text-sm text-gray-600">
                Poids: <span className="font-medium">{product.shipping.weight} kg</span>
              </div>
            )}

            {/* Description courte pour le SEO */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: product.description.slice(0, 300) + '...'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section commentaires pour le SEO */}
      {comments.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Avis clients ({comments.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comments.slice(0, 6).map((comment) => (
              <div key={comment._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${
                        i < (comment.etoil || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-medium text-gray-700">{comment.userName}</span>
                </div>
                <p className="text-gray-600 text-sm">{comment.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
