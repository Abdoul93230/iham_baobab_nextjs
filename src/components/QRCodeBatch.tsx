"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeBatchProps {
  items: Array<{
    id: string;
    name: string;
    url: string;
    type: "produit" | "boutique";
  }>;
  size?: number;
}

export default function QRCodeBatch({ items, size = 200 }: QRCodeBatchProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Télécharger tous les QR codes dans un ZIP
  const downloadAllQRCodes = async () => {
    // Pour une vraie implémentation, vous auriez besoin d'une bibliothèque comme JSZip
    alert("Fonctionnalité de téléchargement groupé à venir !");
  };

  // Imprimer tous les QR codes
  const printAllQRCodes = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Recharger pour restaurer les événements
    }
  };

  // Télécharger un QR code individuel
  const downloadSingleQRCode = (itemId: string, itemName: string) => {
    const canvas = document.getElementById(`qr-${itemId}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${itemName.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions globales */}
      <div className="flex gap-4 justify-end sticky top-0 bg-white p-4 shadow-md rounded-lg z-10">
        <Button
          onClick={downloadAllQRCodes}
          className="bg-gradient-to-r from-[#30A08B] to-[#258c78] hover:from-[#258c78] hover:to-[#1f7766] text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger Tout
        </Button>
        <Button
          onClick={printAllQRCodes}
          variant="outline"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimer Tout
        </Button>
      </div>

      {/* Grille de QR codes */}
      <div ref={printRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md hover:shadow-xl transition-shadow print:break-inside-avoid print:page-break-inside-avoid"
            >
              {/* Type badge */}
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
                  size={size}
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
                <p className="text-xs text-gray-500 text-center break-all">
                  ID: {item.id}
                </p>
              </div>

              {/* Action */}
              <Button
                onClick={() => downloadSingleQRCode(item.id, item.name)}
                variant="outline"
                size="sm"
                className="w-full mt-4 print:hidden"
              >
                <Download className="w-3 h-3 mr-2" />
                Télécharger
              </Button>

              {/* URL pour impression */}
              <div className="hidden print:block mt-4 pt-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-600 break-all text-center">
                  {item.url}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions d'impression */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils d'impression</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Utilisez du papier blanc de qualité pour un meilleur scan</li>
          <li>• Imprimez en couleur pour inclure le logo</li>
          <li>• Vérifiez que les QR codes sont bien lisibles avant distribution</li>
          <li>• Recommandé : Papier autocollant pour faciliter l'application</li>
        </ul>
      </div>
    </div>
  );
}
