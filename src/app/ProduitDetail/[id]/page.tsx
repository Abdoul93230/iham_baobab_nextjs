import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { generateMetadata } from "./metadata";
import { getServerPageData } from "./serverData";
import { Ghost, Search, ShoppingBag, ArrowLeft, Home } from "lucide-react";
import ProduitDetailPageClient from "./ProduitDetailPageClient";

interface ProduitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Génération des métadonnées côté serveur
export { generateMetadata };

// Composant de chargement (Léger et moderne)
function ProductLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse shadow-sm" />
        </div>
        <div className="lg:flex-1 space-y-4 flex flex-col justify-center">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-3/4" />
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2" />
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-1/3" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-full" />
            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- NOUVEAU COMPOSANT UI : PRODUIT NON TROUVÉ ---
const ProductNotFoundView = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-md w-full p-8 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* Cercles décoratifs en arrière-plan */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-[#30A08B]/10 to-[#B17236]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gray-100/50 rounded-full blur-2xl"></div>
      
      {/* Contenu Principal */}
      <div className="relative z-10">
        {/* Icône Illustrative */}
        <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
          <Ghost className="w-12 h-12 text-red-300 animate-bounce" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Produit introuvable</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Nous sommes désolés, mais le produit que vous recherchez a disparu ou a été supprimé par le vendeur.
        </p>

        {/* Boutons d'Action */}
        <div className="space-y-3">
          <Link href="/" className="block w-full bg-gradient-to-r from-[#30A08B] to-[#B17236] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          
          {/* <div className="grid grid-cols-2 gap-3">
            <Link href="/boutique" className="flex flex-col items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-2xl transition-all border border-gray-200">
              <ShoppingBag className="w-5 h-5 text-[#30A08B]" />
              <span className="text-xs">Boutiques</span>
            </Link>
            <Link href="/Produit" className="flex flex-col items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-2xl transition-all border border-gray-200">
              <Search className="w-5 h-5 text-[#B17236]" />
              <span className="text-xs">Chercher</span>
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  </div>
);
// -----------------------------------------------------

export default async function ProduitDetailPage({ params }: ProduitDetailPageProps) {
  const { id } = await params;

  // Récupération des données côté serveur pour le SEO et l'initialisation
  const serverData = await getServerPageData(id);
  
  // Si le produit n'existe pas, on affiche la nouvelle UI attractive
  if (!serverData.product) {
    return <ProductNotFoundView />;
  }

  return (
    <>
      {/* JSON-LD structuré pour le SEO (inchangé) */}
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