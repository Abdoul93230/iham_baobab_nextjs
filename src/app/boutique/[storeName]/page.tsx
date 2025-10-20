import { Metadata } from "next";
import { notFound } from "next/navigation";
import BoutiqueMain from "@/components/boutiquePage/BoutiqueMain";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";

interface PageProps {
  params: Promise<{
    storeName: string;
  }>;
}

// Fonction pour récupérer les données côté serveur
async function getSellerData(storeName: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_Backend_Url || 'http://localhost:3001';

    const sellerResponse = await fetch(`${baseUrl}/getSellerByNameClients/${storeName}`, {
      next: { revalidate: 300 } // Cache pendant 5 minutes
    });

    if (!sellerResponse.ok) {
      return null;
    }

    const sellerData = await sellerResponse.json();
    return sellerData.data;
  } catch (error) {
    console.error('Error fetching seller data:', error);
    return null;
  }
}

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storeName } = await params;
  const sellerData = await getSellerData(storeName);

  if (!sellerData) {
    return {
      title: 'Boutique non trouvée - IhamBaobab',
      description: 'Cette boutique n\'existe pas ou n\'est plus disponible.',
    };
  }

  const title = `${sellerData.storeName || `${sellerData.userName2} ${sellerData.name}`} - IhamBaobab`;
  const description = `Découvrez la boutique de ${sellerData.storeName || sellerData.userName2} sur IhamBaobab. ${sellerData.storeDescription || 'Large sélection de produits de qualité avec livraison rapide au Niger.'}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: sellerData.logo || '/LogoText.png',
          width: 1200,
          height: 630,
          alt: `Logo de ${sellerData.storeName}`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BoutiquePage({ params }: PageProps) {
  const { storeName } = await params;
  const sellerData = await getSellerData(storeName);

  // Si la boutique n'existe pas, retourner 404
  if (!sellerData) {
    notFound();
  }

  return (
    <>
      <HomeHeader />
      <BoutiqueMain sellerId={sellerData?._id} storeName={sellerData.storeName} />
      <HomeFooter />
    </>
  );
}