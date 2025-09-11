"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Mail,
  MessageCircle,
  UserPlus,
  X,
  Edit,
  Send,
  Copy,
  Check,
  Users,
  Gift,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";

const MAX_EMAIL_FIELDS = 5;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ihambaobab.onrender.com/";

interface EmailField {
  address: string;
  isValid: boolean;
}

export default function InviteAmiPage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailField[]>([{ address: "", isValid: false }]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [copied, setCopied] = useState(false);

  const getDefaultMessage = (name: string) => `Salut !

Je viens de découvrir une plateforme incroyable et je pense que ça pourrait vraiment t'intéresser ! 

IhamBaobab propose des produits artisanaux authentiques du Niger avec une qualité exceptionnelle. J'ai été impressionné par leur service et leurs produits uniques.

Découvre la plateforme ici : ${SITE_URL}

J'aimerais vraiment avoir ton avis !

À très vite !
${name}`;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userName) {
      setMessage(getDefaultMessage(userName));
    }
  }, [userName]);

  const loadUserData = async () => {
    try {
      if (user) {
        setUserName(user.name || "");
        const response = await axios.get(`https://ihambackend.onrender.com/user`, {
          params: { id: user.id },
        });
        setSenderEmail(response.data.user.email);
      }
    } catch (error) {
      showNotification("Erreur lors du chargement des données utilisateur", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = {
      address: value,
      isValid: EMAIL_REGEX.test(value),
    };
    setEmails(newEmails);
  };

  const addEmailField = () => {
    if (emails.length < MAX_EMAIL_FIELDS) {
      setEmails([...emails, { address: "", isValid: false }]);
    }
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const getPersonalizedMessage = (recipientEmail = "") => {
    let personalizedMessage = message;
    if (recipientEmail) {
      const recipientName = recipientEmail.split("@")[0];
      personalizedMessage = message.replace("Salut !", `Salut ${recipientName} !`);
    }
    return personalizedMessage;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      showNotification("Lien copié dans le presse-papiers !");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showNotification("Erreur lors de la copie", "error");
    }
  };

  const handleShare = async (platform: "email" | "whatsapp" | "twitter") => {
    setIsLoading(true);
    try {
      const validEmails = emails.filter((e) => e.isValid).map((e) => e.address);

      switch (platform) {
        case "email":
          if (validEmails.length === 0) {
            throw new Error("Veuillez ajouter au moins une adresse email valide");
          }

          for (const friendEmail of validEmails) {
            const emailData = {
              senderEmail,
              subject: `${userName} souhaite partager quelque chose avec vous !`,
              message: getPersonalizedMessage(friendEmail),
              friendEmail,
              clientName: userName,
            };
            await axios.post(`https://ihambackend.onrender.com/Send_email_freind`, emailData);
          }
          showNotification(
            `Invitation${validEmails.length > 1 ? "s" : ""} envoyée${
              validEmails.length > 1 ? "s" : ""
            } avec succès !`
          );
          // Réinitialiser les emails après envoi
          setEmails([{ address: "", isValid: false }]);
          break;

        case "whatsapp":
          const whatsappMessage = `${getPersonalizedMessage()}\n\nDécouvrez la plateforme ici : ${SITE_URL}`;
          window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`,
            "_blank"
          );
          showNotification("Partage WhatsApp ouvert !");
          break;

        case "twitter":
          const twitterMessage = `Je viens de découvrir cette super plateforme artisanale du Niger ! Rejoignez-moi sur ${SITE_URL} #IhamBaobab #Niger #Artisanat`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
          window.open(twitterUrl, "_blank");
          showNotification("Partage Twitter ouvert !");
          break;

        default:
          throw new Error("Mode de partage non supporté");
      }
    } catch (error: any) {
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#30A08B] to-[#B2905F] overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-4 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-8">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Invitez vos amis
              </h1>
              <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
                Partagez l'authenticité de l'artisanat nigérien avec vos proches et 
                faites-leur découvrir des produits d'exception
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              {[
                { icon: Gift, title: "Produits Uniques", desc: "Artisanat authentique" },
                { icon: Users, title: "Communauté", desc: "Plus de 1000 clients" },
                { icon: Star, title: "Satisfaction", desc: "98% de clients heureux" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
                  <h3 className="font-semibold text-sm sm:text-base">{stat.title}</h3>
                  <p className="text-sm opacity-75">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Message Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#30A08B]">
                  Votre message personnalisé
                </h2>
                <button
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="flex items-center gap-2 px-4 py-2 text-[#30A08B] hover:bg-teal-50 rounded-xl transition-colors duration-200 w-fit"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditingMessage ? "Aperçu" : "Modifier"}</span>
                </button>
              </div>

              {isEditingMessage ? (
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-48 p-4 rounded-2xl border-2 border-[#30A08B]/20 focus:border-[#30A08B] focus:ring-2 focus:ring-[#30A08B]/20 outline-none transition-all duration-200 text-gray-700 resize-none"
                    placeholder="Écrivez votre message personnalisé..."
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{message.length} caractères</span>
                    <button
                      onClick={() => setMessage(getDefaultMessage(userName))}
                      className="text-[#30A08B] hover:underline"
                    >
                      Restaurer le message par défaut
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-teal-50 to-amber-50 p-6 rounded-2xl border border-[#30A08B]/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#30A08B]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#30A08B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="whitespace-pre-wrap text-gray-700 text-sm sm:text-base leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Share */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Partage rapide
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={SITE_URL}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-[#30A08B] text-white rounded-xl hover:bg-[#30A08B]/90 transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? "Copié!" : "Copier"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#30A08B]">
                  Inviter par email
                </h2>
                <span className="text-sm text-gray-500">
                  Maximum {MAX_EMAIL_FIELDS} invitations
                </span>
              </div>
              
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="email"
                        placeholder="Email de votre ami(e)"
                        value={email.address}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 outline-none text-sm sm:text-base ${
                          email.address
                            ? email.isValid
                              ? "border-[#30A08B]/30 focus:border-[#30A08B] bg-green-50/50"
                              : "border-red-300 focus:border-red-500 bg-red-50/50"
                            : "border-gray-200 focus:border-[#30A08B] bg-white"
                        }`}
                      />
                      {email.address && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {email.isValid ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {index > 0 && (
                      <button
                        onClick={() => removeEmailField(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {emails.length < MAX_EMAIL_FIELDS && (
                  <button
                    onClick={addEmailField}
                    className="flex items-center gap-2 text-[#B2905F] hover:text-[#B17236] transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-amber-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Ajouter un email ({emails.length}/{MAX_EMAIL_FIELDS})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Choisir votre méthode de partage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleShare("email")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-[#30A08B] text-white rounded-xl hover:bg-[#30A08B]/90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#30A08B]/20 group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  <span className="font-medium">Envoyer par email</span>
                </button>

                <button
                  onClick={() => handleShare("whatsapp")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] text-white rounded-xl hover:bg-[#25D366]/90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-green-500/20 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare("twitter")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1DA1F2] text-white rounded-xl hover:bg-[#1DA1F2]/90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-500/20 group"
                >
                  <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  <span className="font-medium">Twitter</span>
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Conseils pour un partage efficace
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Personnalisez votre message pour chaque ami</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Expliquez pourquoi vous recommandez IhamBaobab</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Partagez votre expérience personnelle avec nos produits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}