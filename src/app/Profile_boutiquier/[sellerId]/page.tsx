import { Metadata } from "next";
import { notFound } from "next/navigation";
import SellerProfile from "@/components/sellerProfile/SellerProfile";

interface PageProps {
  params: Promise<{
    sellerId: string;
  }>;
}

// Fonction pour récupérer les données côté serveur
async function getSellerProfileData(sellerId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_Backend_Url || 'http://localhost:3001';
    
    const sellerResponse = await fetch(`${baseUrl}/getSeller/${sellerId}`, {
      next: { revalidate: 300 } // Cache pendant 5 minutes
    });

    if (!sellerResponse.ok) {
      return null;
    }

    const sellerData = await sellerResponse.json();
    return sellerData.data;
  } catch (error) {
    console.error('Error fetching seller profile data:', error);
    return null;
  }
}

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sellerId } = await params;
  const sellerData = await getSellerProfileData(sellerId);

  if (!sellerData) {
    return {
      title: 'Profil vendeur non trouvé - IhamBaobab',
      description: 'Ce profil de vendeur n\'existe pas ou n\'est plus disponible.',
    };
  }

  const title = `Profil de ${sellerData.storeName || `${sellerData.userName2} ${sellerData.name}`} - IhamBaobab`;
  const description = `Découvrez le profil complet de ${sellerData.storeName || sellerData.userName2} sur IhamBaobab. ${sellerData.storeDescription || 'Vendeur professionnel avec une large gamme de produits de qualité.'}`;

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
          alt: `Profil de ${sellerData.storeName}`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SellerProfilePage({ params }: PageProps) {
  const { sellerId } = await params;
  const sellerData = await getSellerProfileData(sellerId);

  // Si le profil n'existe pas, retourner 404
  if (!sellerData) {
    notFound();
  }

  return <SellerProfile sellerId={sellerId} />;
}