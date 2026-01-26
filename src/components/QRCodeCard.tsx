"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toPng } from 'html-to-image';

interface QRCodeCardProps {
  type: "produit" | "boutique";
  url: string;
  title: string;
  image?: string;
  price?: number;
  promoPrice?: number;
  storeName?: string;
  storeLogo?: string;
  description?: string;
  size?: number;
}

export default function QRCodeCard({
  type,
  url,
  title,
  image,
  price,
  promoPrice,
  storeName,
  storeLogo,
  description,
  size = 200,
}: QRCodeCardProps) {
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stripHtml = (html: string): string => {
    if (!html) return '';
    let text = html.replace(/<[^>]*>/g, ' ');
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    return text.replace(/\s+/g, ' ').trim();
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `flyer-${stripHtml(title).replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowCard(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200"
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
          className="text-purple-600"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="text-purple-700 font-medium">Générer le Flyer</span>
      </Button>

      {showCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col h-[90vh] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* HEADER FIXE */}
            <div className="p-6 pb-2 border-b border-gray-100 flex-shrink-0 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">Aperçu du Flyer</h2>
                <p className="text-xs text-gray-500 mt-1">Design optimisé IhamBaobab</p>
              </div>
              <button onClick={() => setShowCard(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENU SCROLLABLE */}
            {/* On ajoute overflow-auto au cas où l'écran est très petit (x et y) */}
            <div className="flex-1 overflow-auto p-6 pb-24 flex flex-col items-center bg-gray-50/50">
              
              {/* WRAPPER DU FLYER */}
              {/* 
                  w-[400px] => Largeur FIXE. Ne change jamais, même sur petit écran.
                  flex-shrink-0 => Empêche le navigateur d'écraser la carte.
                  h-auto => La hauteur s'adapte au contenu.
              */}
              <div 
                ref={cardRef} 
                className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden w-[400px] font-sans flex flex-col h-auto flex-shrink-0"
              >
                {type === "produit" ? (
                  <>
                    {/* HEADER GRADIENT */}
                    <div className="bg-gradient-to-r from-[#30A08B] to-[#B17236] p-6 pb-12 relative">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          {storeLogo && (
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full p-1 shadow-lg">
                              <Image src={storeLogo} alt="Logo" width={40} height={40} className="w-full h-full object-cover rounded-full" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs opacity-90 font-medium uppercase tracking-wider">Vendu par</div>
                            <div className="font-bold text-lg leading-none mt-1">{storeName || "IhamBaobab"}</div>
                          </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* IMAGE + BADGE PROMO */}
                    <div className="relative -mt-8 px-4 z-10">
                      <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-2">
                        {image && (
                          <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
                            <Image src={image} alt={title} fill className="object-cover" priority />
                            {promoPrice && promoPrice < (price || 0) && (
                              <div className="absolute top-3 right-3 bg-red-600 text-white rounded-xl px-3 py-1.5 shadow-xl font-bold text-sm">
                                -{Math.round(((price! - promoPrice) / price!) * 100)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CONTENU */}
                    <div className="px-6 py-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight tracking-tight">{title}</h3>

                      {description && (
                        <div className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
                      )}

                      {/* ZONE PRIX */}
                      <div className="mb-4">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-t-3xl p-5 text-center shadow-inner">
                           <p className="text-xs text-[#B17236] font-bold uppercase tracking-wide mb-1">Prix Spécial</p>
                           <div className="flex items-baseline justify-center gap-1">
                             <span className="text-4xl font-black text-[#B17236]">
                               {(promoPrice || price || 0).toLocaleString('fr-FR')}
                             </span>
                             <span className="text-lg font-bold text-[#B17236]">FCFA</span>
                           </div>
                           {promoPrice && promoPrice < (price || 0) && (
                             <div className="text-xs text-gray-400 line-through mt-1">
                               {price?.toLocaleString('fr-FR')} FCFA
                             </div>
                           )}
                        </div>

                        {/* ZONE QR CODE */}
                        <div className="bg-white border-2 border-t-0 border-orange-200 rounded-b-3xl p-8 pb-12 flex flex-col items-center">
                           <div className="relative p-1.5 bg-gradient-to-br from-[#30A08B] to-[#B17236] rounded-2xl shadow-lg">
                              <div className="bg-white rounded-xl p-2">
                                <QRCodeCanvas
                                  value={url}
                                  size={160} 
                                  level="H"
                                  includeMargin={false}
                                />
                              </div>
                           </div>
                           <p className="text-xs text-gray-500 mt-4 font-semibold tracking-wide">SCANNER POUR ACHETER</p>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="bg-gray-50 px-6 py-4 mt-2 text-center border-t border-gray-100">
                      <p className="text-[#B17236] font-bold text-sm">IhamBaobab.com</p>
                      <p className="text-xs text-gray-400">Sécurité & Garantie Totales</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-8 pb-12 min-h-[500px]">
                    <div className="w-28 h-28 bg-gradient-to-br from-[#30A08B] to-[#B17236] rounded-full p-1 shadow-xl mb-6">
                      <div className="w-full h-full bg-white rounded-full p-2 flex items-center justify-center">
                        {storeLogo ? (
                          <Image src={storeLogo} alt="Logo" fill className="object-cover rounded-full" />
                        ) : (
                          <span className="text-4xl font-bold text-gray-300">{title[0]}</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">{title}</h3>
                    <p className="text-sm text-gray-500 mb-8 text-center">Marketplace de confiance au Niger</p>
                    <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 mb-6">
                      <QRCodeCanvas value={url} size={220} level="H" />
                    </div>
                    {description && (
                      <div className="text-center text-sm text-gray-600 mb-6 px-4" dangerouslySetInnerHTML={{ __html: description }} />
                    )}
                    <div className="mt-auto w-full grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <Star size={16} className="text-[#B17236] fill-current" />
                        <span className="text-xs font-bold text-gray-600">Qualité Top</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <svg className="w-4 h-4 text-[#30A08B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-xs font-bold text-gray-600">Certifié</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER FIXE */}
            <div className="p-6 pt-2 border-t border-gray-100 flex-shrink-0 bg-white/95 backdrop-blur-sm z-20">
              <Button onClick={downloadCard} disabled={isGenerating} className="w-full bg-gradient-to-r from-[#30A08B] to-[#B17236] hover:opacity-90 text-white font-semibold py-6 text-lg shadow-lg transition-all active:scale-[0.98]">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le Flyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}