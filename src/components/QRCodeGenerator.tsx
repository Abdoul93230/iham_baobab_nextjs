"use client";

import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeGeneratorProps {
  url: string;
  title: string;
  description?: string;
  size?: number;
}

export default function QRCodeGenerator({
  url,
  title,
  description,
  size = 256,
}: QRCodeGeneratorProps) {
  const [showQR, setShowQR] = useState(false);

  // Télécharger le QR code
  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Partager le QR code
  const shareQRCode = async () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/png");
        });
        
        const file = new File([blob], `qr-code-${title}.png`, { type: "image/png" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            text: description || `Scannez ce QR code pour accéder à ${title}`,
            files: [file],
          });
        } else {
          // Fallback : copier l'URL
          await navigator.clipboard.writeText(url);
          alert("Lien copié dans le presse-papiers !");
        }
      } catch (error) {
        console.error("Erreur lors du partage:", error);
      }
    }
  };

  return (
    <div className="relative">
      {/* Bouton pour afficher le QR code */}
      <Button
        onClick={() => setShowQR(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        QR Code
      </Button>

      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
            {/* Bouton fermer */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Titre */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6 bg-white p-6 rounded-xl border-2 border-gray-200">
              <QRCodeCanvas
                id="qr-code-canvas"
                value={url}
                size={size}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/LogoText.png",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            {/* URL */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Lien de redirection :</p>
              <p className="text-sm text-gray-700 break-all font-mono">{url}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={downloadQRCode}
                className="flex-1 bg-gradient-to-r from-[#30A08B] to-[#258c78] hover:from-[#258c78] hover:to-[#1f7766] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                onClick={shareQRCode}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 text-center">
                📱 Scannez ce QR code avec votre téléphone pour accéder directement à cette page
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
