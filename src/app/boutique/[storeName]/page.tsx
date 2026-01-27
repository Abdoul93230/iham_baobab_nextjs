import { Metadata } from "next";
import Link from 'next/link'
import { notFound } from "next/navigation";
import { AlertTriangle, ShieldAlert, Ban, ArrowLeft } from "lucide-react";
import BoutiqueMain from "@/components/boutiquePage/BoutiqueMain";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";

interface PageProps {
  params: Promise<{
    storeName: string;
  }>;
}

// 1. Fonction adaptée pour récupérer les données et les erreurs
async function getSellerData(storeName: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_Backend_Url;

    const sellerResponse = await fetch(`${baseUrl}/getSellerByNameClients/${storeName}`, {
      next: { revalidate: 60 } // On réduit le cache pour détecter vite si la boutique est validée
    });

    // On parse le JSON pour récupérer le statut même en cas d'erreur 403 ou 404
    const body = await sellerResponse.json();

    if (!sellerResponse.ok) {
      return { success: false, ...body }; // { success: false, status: "NOT_FOUND", message: "..." }
    }

    return { success: true, data: body.data };
  } catch (error) {
    console.error('Error fetching seller data:', error);
    return { success: false, status: "INTERNAL_ERROR", message: "Erreur de connexion au serveur." };
  }
}

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storeName } = await params;
  const result = await getSellerData(storeName);

  const title = "Boutique IhamBaobab";
  const description = "Marketplace de confiance au Niger.";

  // Si active, on met les infos spécifiques
  if (result.success && result.data) {
    const sellerData = result.data;
    return {
      title: `${sellerData.storeName || `${sellerData.userName2} ${sellerData.name}`} - IhamBaobab`,
      description: `Découvrez la boutique de ${sellerData.storeName || sellerData.userName2} sur IhamBaobab.`,
      openGraph: {
        title: sellerData.storeName,
        description: sellerData.storeDescription || "Boutique sur IhamBaobab",
        images: [
          {
            url: sellerData.logo || '/LogoText.png',
            width: 1200,
            height: 630,
            alt: `Logo de ${sellerData.storeName}`,
          },
        ],
      },
    };
  }

  return {
    title,
    description,
  };
}

// --- COMPOSANTS UI D'ERREUR ---

const ErrorLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
    <HomeHeader />
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        {children}
      </div>
    </main>
    <HomeFooter />
  </div>
);

const SuspendedStoreUI = ({ reason, suspensionDate }: { reason?: string, suspensionDate?: string }) => (
  <ErrorLayout>
    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Ban className="w-10 h-10 text-orange-500" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Boutique Temporairement Indisponible</h1>
    <p className="text-gray-600 mb-6">
      La boutique est actuellement suspendue par l'administration pour les raisons suivantes :
    </p>
    {reason && (
      <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl mb-6 text-sm">
        <span className="font-bold block mb-1">Raison :</span>
        {reason}
      </div>
    )}
    <p className="text-xs text-gray-400 mb-6">
      {suspensionDate && `Suspendue le : ${new Date(suspensionDate).toLocaleDateString('fr-FR')}`}
    </p>
    <Link href="/" className="inline-flex items-center justify-center w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-all">
      Retour à l'accueil
    </Link>
  </ErrorLayout>
);

const NotValidatedStoreUI = () => (
  <ErrorLayout>
    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <ShieldAlert className="w-10 h-10 text-blue-500" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">En Cours de Vérification</h1>
    <p className="text-gray-600 mb-6">
      Cette boutique est en attente de validation par nos équipes. Revenez dans quelques heures pour découvrir ses produits.
    </p>
    <div className="flex gap-4">
      <Link href="/" className="flex-1 bg-[#30A08B] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all">
        Voir d'autres boutiques
      </Link>
    </div>
  </ErrorLayout>
);

const NotFoundStoreUI = () => (
  <ErrorLayout>
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <AlertTriangle className="w-10 h-10 text-red-500" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Boutique Introuvable</h1>
    <p className="text-gray-600 mb-6">
      La boutique que vous recherchez n'existe pas ou a été supprimée.
    </p>
    <div className="flex flex-col gap-3">
      <Link href="/" className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-all">
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>
      <Link href="/boutique" className="text-[#30A08B] font-semibold hover:underline">
        Voir toutes les boutiques
      </Link>
    </div>
  </ErrorLayout>
);

const InternalErrorUI = () => (
  <ErrorLayout>
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <AlertTriangle className="w-10 h-10 text-gray-400" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Oups !</h1>
    <p className="text-gray-600 mb-6">
      Une erreur inattendue s'est produite. Veuillez réessayer ultérieurement.
    </p>
    <Link href="/" className="bg-[#30A08B] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all">
      Retour à l'accueil
    </Link>
  </ErrorLayout>
);

export default async function BoutiquePage({ params }: PageProps) {
  const { storeName } = await params;
  const result = await getSellerData(storeName);

  // CAS 1 : BOUTIQUE ACTIVE ✅
  if (result.success && result.data) {
    return (
      <>
        <HomeHeader />
        <BoutiqueMain sellerId={result.data?._id} storeName={result.data.storeName} />
        <HomeFooter />
      </>
    );
  }

  // CAS 2 : BOUTIQUE SUSPENDUE
  if (!result.success && result.status === "SUSPENDED") {
    return <SuspendedStoreUI reason={result.reason} suspensionDate={result.suspensionDate} />;
  }

  // CAS 3 : BOUTIQUE NON VALIDÉE
  if (!result.success && result.status === "NOT_VALIDATED") {
    return <NotValidatedStoreUI />;
  }

  // CAS 4 : BOUTIQUE NON TROUVÉE
  if (!result.success && result.status === "NOT_FOUND") {
    return <NotFoundStoreUI />;
  }

  // CAS 5 : ERREUR INTERNE OU AUTRE
  return <InternalErrorUI />;
}

// Optionnel : Tu peux supprimer le fichier notFound.tsx du dossier app/boutique/[storeName] si tu gères tout ici