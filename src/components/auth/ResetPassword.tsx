"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, Key, CheckCircle } from "lucide-react";
import { resetPassword, selectUserLoading, selectUserError, clearError } from "@/redux/userSlice";
import { AppDispatch } from "@/redux/store";
import Alert from "@/components/Alert";

const ResetPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  
  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  // Récupérer l'email depuis les paramètres de l'URL
  const email = Array.isArray(params.email) ? params.email[0] : params.email || "";

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
    if (!formData.code.trim()) {
      showAlert("error", "Veuillez entrer le code de vérification");
      return false;
    }

    if (formData.code.length !== 6) {
      showAlert("error", "Le code de vérification doit contenir 6 caractères");
      return false;
    }

    if (!formData.newPassword.trim()) {
      showAlert("error", "Veuillez entrer un nouveau mot de passe");
      return false;
    }

    if (formData.newPassword.length < 6) {
      showAlert("error", "Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showAlert("error", "Les mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!email) {
      showAlert("error", "Email manquant. Veuillez recommencer le processus de réinitialisation.");
      return;
    }

    const resetData = {
      email: decodeURIComponent(email),
      code: formData.code.trim(),
      newPassword: formData.newPassword,
    };

    try {
      const result = await dispatch(resetPassword(resetData));
      
      if (resetPassword.fulfilled.match(result)) {
        setIsPasswordReset(true);
        showAlert("success", "Mot de passe réinitialisé avec succès !");
      }
    } catch (err) {
      console.error("Erreur lors de la réinitialisation:", err);
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Afficher les erreurs Redux
  useEffect(() => {
    if (error) {
      showAlert("error", error);
    }
  }, [error]);

  // Vérifier si l'email est présent
  useEffect(() => {
    if (!email) {
      showAlert("warning", "Email manquant. Redirection vers la page de mot de passe oublié...");
      setTimeout(() => {
        router.push("/auth/forgot-password");
      }, 3000);
    }
  }, [email, router]);

  // Page de succès
  if (isPasswordReset) {
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
              Mot de passe réinitialisé !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Votre mot de passe a été modifié avec succès
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Succès !
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </div>

            <Link
              href="/auth/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30A08B] hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] transition-colors"
            >
              Se connecter maintenant
            </Link>
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
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entrez le code reçu par email et votre nouveau mot de passe
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#30A08B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-[#30A08B]" />
            </div>
            
            {email && (
              <p className="text-sm text-gray-600 mb-4">
                Code envoyé à <span className="font-medium text-[#30A08B]">{decodeURIComponent(email)}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code de vérification */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <div className="relative">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.code}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors text-center text-lg tracking-widest font-mono"
                  placeholder="123456"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Entrez le code à 6 chiffres reçu par email
              </p>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder="Votre nouveau mot de passe"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation nouveau mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30A08B] hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Réinitialisation en cours...
                </div>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>

          {/* Liens de navigation */}
          <div className="text-center space-y-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
            >
              Renvoyer le code
            </Link>
            <br />
            <Link
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>

          {/* Information sur la sécurité */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Conseils de sécurité
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Utilisez au moins 8 caractères</li>
              <li>• Mélangez majuscules, minuscules et chiffres</li>
              <li>• Évitez les informations personnelles</li>
              <li>• Ne réutilisez pas un ancien mot de passe</li>
            </ul>
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

export default ResetPassword;
