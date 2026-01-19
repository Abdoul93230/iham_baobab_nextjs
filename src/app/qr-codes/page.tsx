import QRCodeBatch from "@/components/QRCodeBatch";

export default function QRCodesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Générateur de QR Codes
          </h1>
          <p className="text-gray-600">
            Générez et téléchargez les QR codes pour vos produits et votre boutique
          </p>
        </div>

        {/* Vous devrez récupérer ces données depuis votre API */}
        <QRCodeBatch
          items={[
            // Exemple de données - à remplacer par vos vraies données
            {
              id: "prod-001",
              name: "T-shirt Premium Coton Bio",
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/ProduitDetail/prod-001`,
              type: "produit",
            },
            {
              id: "shop-001",
              name: "Ma Super Boutique",
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/Profile_boutiquier/shop-001`,
              type: "boutique",
            },
          ]}
          size={200}
        />
      </div>
    </div>
  );
}
