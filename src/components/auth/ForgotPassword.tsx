"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { forgotPassword, selectUserLoading, selectUserError, clearError } from "@/redux/userSlice";
import { AppDispatch } from "@/redux/store";
import Alert from "@/components/Alert";

const ForgotPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  // Validation pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Gestion des alertes
  const showAlert = (type: "success" | "error" | "warning" | "info", message: string) => {
    setAlert({ visible: true, type, message });
  };

  const hideAlert = () => {
    setAlert({ visible: false, type: "info", message: "" });
    dispatch(clearError());
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!email.trim()) {
      showAlert("error", "Veuillez entrer votre adresse email");
      return false;
    }

    if (!emailRegex.test(email)) {
      showAlert("error", "Veuillez entrer une adresse email valide");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await dispatch(forgotPassword(email.trim()));
      
      if (forgotPassword.fulfilled.match(result)) {
        setIsEmailSent(true);
        showAlert("success", "Email de réinitialisation envoyé ! Vérifiez votre boîte mail.");
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email:", err);
    }
  };

  // Renvoyer l'email
  const handleResend = () => {
    setIsEmailSent(false);
    setEmail("");
  };

  // Afficher les erreurs Redux
  useEffect(() => {
    if (error) {
      showAlert("error", error);
    }
  }, [error]);

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="IhamBaobab Logo"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-[#30A08B]">
              Email envoyé !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Vérifiez votre boîte mail
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Instructions envoyées
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Nous avons envoyé les instructions de réinitialisation à{" "}
                <span className="font-medium text-[#30A08B]">{email}</span>
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Que faire maintenant ?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Vérifiez votre boîte de réception</li>
                        <li>Regardez aussi dans les spams/courriers indésirables</li>
                        <li>Cliquez sur le lien dans l'email reçu</li>
                        <li>Suivez les instructions pour créer un nouveau mot de passe</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResend}
                className="w-full flex justify-center py-3 px-4 border border-[#30A08B] rounded-lg shadow-sm text-sm font-medium text-[#30A08B] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] transition-colors"
              >
                Renvoyer l'email
              </button>

              <Link
                href="/auth/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30A08B] hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert.visible && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={hideAlert}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image
              src="/logo.png"
              alt="IhamBaobab Logo"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#30A08B]">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entrez votre email pour recevoir les instructions de réinitialisation
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#30A08B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#30A08B]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder="vous@exemple.com"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Entrez l'adresse email associée à votre compte
              </p>
            </div>

            {/* Bouton d'envoi */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30A08B] hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer les instructions
                </>
              )}
            </button>
          </form>

          {/* Liens de navigation */}
          <div className="text-center space-y-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à la connexion
            </Link>
          </div>

          {/* Information supplémentaire */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Besoin d'aide ?
              </h4>
              <p className="text-xs text-gray-600">
                Si vous ne recevez pas l'email dans les 5 minutes, vérifiez vos spams ou{" "}
                <Link href="/contact" className="text-[#30A08B] hover:text-[#B2905F] underline">
                  contactez notre support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
