"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, Package, Store, Search, Filter } from "lucide-react";
import axios from "axios";

export default function SellerQRCodesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "produit" | "boutique">("all");
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
  const SiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer l'ID du vendeur depuis localStorage
        const userData = JSON.parse(localStorage.getItem("userEcomme") || "{}");
        const sellerId = userData?.id;

        if (!sellerId) {
          alert("Vous devez être connecté comme vendeur");
          return;
        }

        // Récupérer les infos du vendeur
        const sellerResponse = await axios.get(`${BackendUrl}/getSellerClients/${sellerId}`);
        setSeller(sellerResponse.data.data);

        // Récupérer les produits du vendeur
        const productsResponse = await axios.get(`${BackendUrl}/searchProductBySupplier/${sellerId}`);
        setProducts(productsResponse.data.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BackendUrl]);

  const downloadQRCode = (id: string, name: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printAll = () => {
    window.print();
  };

  // Filtrer les items
  const allItems = [
    ...(filterType === "all" || filterType === "boutique"
      ? [{
          id: seller?._id,
          name: seller?.storeName,
          url: `${SiteUrl}/boutique/${encodeURIComponent(seller?.storeName || '')}`,
          type: "boutique",
        }]
      : []),
    ...(filterType === "all" || filterType === "produit"
      ? products
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((p) => ({
            id: p._id,
            name: p.name,
            url: `${SiteUrl}/ProduitDetail/${p._id}`,
            type: "produit",
          }))
      : []),
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30A08B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 Mes QR Codes
          </h1>
          <p className="text-gray-600">
            Générez et téléchargez les QR codes pour votre boutique et vos produits
          </p>
        </div>

        {/* Filtres et actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 print:hidden">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30A08B] focus:border-transparent"
              />
            </div>

            {/* Filtre par type */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-[#30A08B] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setFilterType("produit")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === "produit"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Package className="w-4 h-4 inline mr-1" />
                Produits
              </button>
              <button
                onClick={() => setFilterType("boutique")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === "boutique"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Store className="w-4 h-4 inline mr-1" />
                Boutique
              </button>
            </div>

            {/* Bouton imprimer */}
            <button
              onClick={printAll}
              className="px-6 py-2 bg-gradient-to-r from-[#B17236] to-[#8f5a2a] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              <Printer className="w-4 h-4 inline mr-2" />
              Imprimer Tout
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>
              📦 {products.length} produit{products.length > 1 ? "s" : ""}
            </span>
            <span>•</span>
            <span>🏪 1 boutique</span>
            <span>•</span>
            <span className="font-semibold text-[#30A08B]">
              {allItems.length} QR code{allItems.length > 1 ? "s" : ""} affiché{allItems.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Grille de QR Codes */}
        {allItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun résultat
            </h3>
            <p className="text-gray-500">
              Aucun produit ne correspond à votre recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allItems.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md hover:shadow-xl transition-all print:break-inside-avoid qr-code-item"
              >
                {/* Badge type */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      item.type === "produit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.type === "produit" ? "🏷️ Produit" : "🏪 Boutique"}
                  </span>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4 bg-white p-4 rounded-lg border border-gray-100">
                  <QRCodeCanvas
                    id={`qr-${item.id}`}
                    value={item.url}
                    size={180}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/LogoText.png",
                      height: 30,
                      width: 30,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-center line-clamp-2 min-h-[3rem]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 text-center break-all print:block">
                    {item.url}
                  </p>
                </div>

                {/* Action */}
                <button
                  onClick={() => downloadQRCode(item.id, item.name)}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#30A08B] to-[#258c78] text-white rounded-lg font-medium hover:shadow-lg transition-shadow print:hidden"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 print:hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Comment utiliser vos QR codes ?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">📦 Pour vos produits :</h4>
              <ul className="space-y-1 ml-4">
                <li>• Imprimez sur étiquettes autocollantes</li>
                <li>• Collez sur vos emballages</li>
                <li>• Clients scannent pour voir détails</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏪 Pour votre boutique :</h4>
              <ul className="space-y-1 ml-4">
                <li>• Affichez à l'entrée de votre magasin</li>
                <li>• Ajoutez sur vos cartes de visite</li>
                <li>• Partagez sur vos réseaux sociaux</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
