"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, X, Star, MapPin, Phone, Clock, Mail, Instagram, Facebook, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toPng } from 'html-to-image';

interface SellerData {
  storeName: string;
  logo: string;
  storeDescription: string;
  businessPhone: string;
  address: string;
  openingHours: string;
  rating: number;
  followersCount: number;
  category: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  website?: string;
}

interface QRCodeCardBoutiqueProps {
  url: string;
  seller: SellerData;
}

export default function QRCodeCardBoutique({
  url,
  seller,
}: QRCodeCardBoutiqueProps) {
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
      link.download = `flyer-${stripHtml(seller.storeName).replace(/\s+/g, "-").toLowerCase()}.png`;
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

  // Helper pour les étoiles
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="relative">
      {/* Bouton Trigger */}
      <Button
        onClick={() => setShowCard(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 shadow-sm transition-all"
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
          className="text-[#30A08B]"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="text-gray-700 font-medium">Flyer Boutique Pro</span>
      </Button>

      {showCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col h-[90vh] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* HEADER FIXE */}
            <div className="p-6 pb-2 border-b border-gray-100 flex-shrink-0 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">Aperçu du Flyer</h2>
                <p className="text-xs text-gray-500 mt-1">Design Premium IhamBaobab</p>
              </div>
              <button onClick={() => setShowCard(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENU SCROLLABLE */}
            <div className="flex-1 overflow-auto p-6 pb-24 flex flex-col items-center bg-gray-50/50">
              
              {/* WRAPPER DU FLYER */}
              <div 
                ref={cardRef} 
                className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden w-[400px] font-sans flex flex-col h-auto flex-shrink-0"
              >
                {/* HEADER GRADIENT */}
                <div className="bg-gradient-to-br from-[#30A08B] to-[#B17236] p-8 pb-12 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-tr-full -ml-4 -mb-4"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-white text-center">
                    {/* Logo */}
                    <div className="w-28 h-28 bg-white rounded-2xl p-2 shadow-2xl mb-4 ring-4 ring-white/30">
                      {seller.logo ? (
                        <div className="w-full h-full rounded-xl overflow-hidden relative">
                          <Image src={seller.logo} alt="Logo" fill className="object-contain p-1" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                          {seller.storeName[0]}
                        </div>
                      )}
                    </div>

                    {/* Titre & Badge */}
                    <h1 className="text-2xl font-black uppercase tracking-wide mb-2 leading-tight">
                      {seller.storeName}
                    </h1>
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 mb-3">
                      <Award size={12} />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {seller.category}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(seller.rating)}
                      <span className="text-sm font-bold ml-1">{seller.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs opacity-80">{seller.followersCount} Abonnés</p>
                  </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="px-6 pt-6 pb-2 flex flex-col items-center relative -mt-8 z-10">
                  
                  {/* QR CARD CENTRALE */}
                  <div className="w-full bg-white rounded-3xl shadow-xl p-4 mb-6 border border-gray-100 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#30A08B] via-[#B17236] to-[#30A08B]"></div>
                    
                    <QRCodeCanvas value={url} size={180} level="H" includeMargin={false} />
                    <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">Scannez pour visiter</p>
                  </div>

                  {/* DESCRIPTION */}
                  {seller.storeDescription && (
                    <p className="text-sm text-gray-600 text-center line-clamp-3 leading-relaxed mb-6 italic" dangerouslySetInnerHTML={{ __html: seller.storeDescription }} />
                  )}

                  {/* GRID CONTACT & INFO */}
                  <div className="w-full grid grid-cols-2 gap-3 mb-4">
                    {/* Address */}
                    {seller.address && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-start gap-1">
                        <MapPin size={16} className="text-[#30A08B] flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-700">Adresse</span>
                        <span className="text-xs text-gray-500 line-clamp-2 leading-tight">{seller.address}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {seller.businessPhone && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-start gap-1">
                        <Phone size={16} className="text-[#30A08B] flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-700">Téléphone</span>
                        <span className="text-xs text-gray-500 font-semibold">{seller.businessPhone}</span>
                      </div>
                    )}

                    {/* Hours */}
                    {seller.openingHours && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-start gap-1">
                        <Clock size={16} className="text-[#B17236] flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-700">Horaires</span>
                        <span className="text-xs text-gray-500 line-clamp-2 leading-tight">{seller.openingHours}</span>
                      </div>
                    )}

                    {/* Email */}
                    {seller.email && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-start gap-1">
                        <Mail size={16} className="text-[#B17236] flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-700">Email</span>
                        <span className="text-xs text-gray-500 line-clamp-1 leading-tight truncate w-full">{seller.email}</span>
                      </div>
                    )}
                  </div>

                  {/* SOCIALS */}
                  <div className="w-full flex items-center justify-center gap-4">
                    {seller.facebook && (
                      <a href={seller.facebook} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                        <Facebook size={18} />
                      </a>
                    )}
                    {seller.instagram && (
                      <a href={seller.instagram} className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors">
                        <Instagram size={18} />
                      </a>
                    )}
                  </div>

                </div>

                {/* FOOTER BRANDING */}
                <div className="mt-auto pt-6 pb-8 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-[#B17236] font-black text-lg">IhamBaobab.com</p>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">La Marketplace #1 au Niger</p>
                </div>
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