import React from "react";
import { Metadata } from "next";
import { Suspense } from "react";
import { generateMetadata } from "./metadata";
import { getServerPageData } from "./serverData";
import ProduitDetailPageClient from "./ProduitDetailPageClient";

interface ProduitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Génération des métadonnées côté serveur
export { generateMetadata };

// Composant de chargement
function ProductLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="lg:flex-1 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProduitDetailPage({ params }: ProduitDetailPageProps) {
  const { id } = await params;

  // Récupération des données côté serveur pour le SEO et l'initialisation
  const serverData = await getServerPageData(id);
  
  // Si le produit n'existe pas, affichage d'une page 404
  if (!serverData.product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
        <p className="text-gray-600">Le produit que vous recherchez n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD structuré pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: serverData.product.name,
            description: serverData.product.description?.replace(/<[^>]*>/g, ''),
            image: [serverData.product.image1, serverData.product.image2, serverData.product.image3].filter(Boolean),
            sku: serverData.product._id,
            brand: {
              "@type": "Brand",
              name: "IHAM Baobab"
            },
            category: serverData.category?.name,
            offers: {
              "@type": "Offer",
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/ProduitDetail/${serverData.product._id}`,
              priceCurrency: "XOF",
              price: serverData.product.prixPromo || serverData.product.prix,
              availability: serverData.product.quantite && serverData.product.quantite > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "IHAM Baobab"
              }
            },
            aggregateRating: serverData.comments.length > 0 ? {
              "@type": "AggregateRating",
              ratingValue: serverData.comments.reduce((acc, c) => acc + (c.etoil || 0), 0) / serverData.comments.length,
              reviewCount: serverData.comments.length
            } : undefined
          })
        }}
      />
      
      {/* Composant client avec fallback */}
      <Suspense fallback={<ProductLoadingSkeleton />}>
        <ProduitDetailPageClient productId={id} serverData={serverData} />
      </Suspense>
    </>
  );
}
