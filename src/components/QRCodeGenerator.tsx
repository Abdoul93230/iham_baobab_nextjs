"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
// Import des fonctions html-to-image
import { toPng, toBlob } from 'html-to-image';

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
  // Ref pour cibler l'élément à capturer
  const qrRef = useRef<HTMLDivElement>(null);

  // Télécharger le QR code avec html-to-image
  const downloadQRCode = async () => {
    if (!qrRef.current) return;
    try {
      const dataUrl = await toPng(qrRef.current, {
        cacheBust: true,
        quality: 1,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-code-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
    }
  };

  // Partager le QR code avec html-to-image
  const shareQRCode = async () => {
    if (!qrRef.current) return;
    try {
      // toBlob convertit directement l'élément en fichier binaire (Blob)
      const blob = await toBlob(qrRef.current, {
        cacheBust: true,
        quality: 1,
      });

      if (!blob) return;

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
      // En cas d'annulation de l'utilisateur ou autre erreur
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-300">
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

            {/* QR Code - Le ref est ici pour la capture */}
            <div 
              ref={qrRef} 
              className="flex justify-center mb-6 bg-white p-8 rounded-3xl border-2 border-gray-200 shadow-inner"
            >
              <QRCodeCanvas
                value={url}
                size={size}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/LogoText.png",
                  height: 50,
                  width: 50,
                  excavate: true,
                }}
              />
            </div>

            {/* URL */}
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Lien de redirection</p>
              <p className="text-sm text-gray-800 break-all font-medium">{url}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={downloadQRCode}
                className="flex-1 bg-gradient-to-r from-[#30A08B] to-[#B17236] hover:opacity-90 text-white shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                onClick={shareQRCode}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-xs text-blue-800 text-center leading-relaxed">
                📱 Scannez ce QR code avec votre téléphone pour accéder directement à la page
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}