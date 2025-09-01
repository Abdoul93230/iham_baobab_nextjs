"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { loginUser, selectUserLoading, selectUserError, clearError } from "@/redux/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Alert from "@/components/Alert";

interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    rememberMe: false,
  });
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{8,11}$/;

  // Gestion des alertes
  const showAlert = (type: "success" | "error" | "warning" | "info", message: string) => {
    setAlert({ visible: true, type, message });
  };

  const hideAlert = () => {
    setAlert({ visible: false, type: "info", message: "" });
    dispatch(clearError());
  };

  // Navigation en fonction de la provenance
  const navigateBasedOnLocation = () => {
    const fromCart = searchParams.get("fromCart");
    const fromProfile = searchParams.get("fromProfile");
    const fromMore = searchParams.get("fromMore");
    const fromMessages = searchParams.get("fromMessages");

    if (fromCart) {
      router.push("/OrderConfirmation?fromCart=true");
    } else if (fromProfile) {
      router.push("/Compte?fromProfile=true");
    } else if (fromMore) {
      router.push("/More?fromMore=true");
    } else if (fromMessages) {
      router.push("/Messages?fromMessages=true");
    } else {
      router.push("/");
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    if (loginMethod === "email") {
      if (!formData.email.trim()) {
        showAlert("error", "Veuillez entrer votre adresse email");
        return false;
      }
      if (!emailRegex.test(formData.email)) {
        showAlert("error", "Veuillez entrer une adresse email valide");
        return false;
      }
    } else {
      if (!formData.phoneNumber.trim()) {
        showAlert("error", "Veuillez entrer votre numéro de téléphone");
        return false;
      }
      if (!phoneRegex.test(formData.phoneNumber)) {
        showAlert("error", "Veuillez entrer un numéro de téléphone valide (8-11 chiffres)");
        return false;
      }
    }

    if (!formData.password.trim()) {
      showAlert("error", "Veuillez entrer votre mot de passe");
      return false;
    }

    if (formData.password.length < 6) {
      showAlert("error", "Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const credentials = {
      email: loginMethod === "email" ? formData.email : undefined,
      phoneNumber: loginMethod === "phone" ? formData.phoneNumber : undefined,
      password: formData.password,
      rememberMe: formData.rememberMe,
    };

    try {
      const result = await dispatch(loginUser(credentials));
      
      if (loginUser.fulfilled.match(result)) {
        showAlert("success", "Connexion réussie ! Redirection en cours...");
        
        // Appeler onSuccess si fourni
        if (onSuccess) {
          onSuccess();
        }
        
        // Rediriger après un délai
        setTimeout(() => {
          navigateBasedOnLocation();
        }, 1500);
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Changement de méthode de connexion
  const switchLoginMethod = (method: "email" | "phone") => {
    setLoginMethod(method);
    setFormData(prev => ({
      ...prev,
      email: "",
      phoneNumber: "",
    }));
  };

  // Afficher les erreurs Redux
  useEffect(() => {
    if (error) {
      showAlert("error", error);
    }
  }, [error]);

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
          <h2 className="mt-6 text-3xl font-bold text-[#30A08B] uppercase">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte IhamBaobab
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélecteur de méthode de connexion */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                type="button"
                onClick={() => switchLoginMethod("email")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  loginMethod === "email"
                    ? "bg-[#30A08B] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => switchLoginMethod("phone")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  loginMethod === "phone"
                    ? "bg-[#30A08B] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Téléphone
              </button>
            </div>

            {/* Champ Email/Téléphone */}
            <div>
              <label
                htmlFor={loginMethod}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {loginMethod === "email" ? "Adresse email" : "Numéro de téléphone"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginMethod === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id={loginMethod}
                  name={loginMethod}
                  type={loginMethod === "email" ? "email" : "tel"}
                  required
                  value={loginMethod === "email" ? formData.email : formData.phoneNumber}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder={
                    loginMethod === "email"
                      ? "vous@exemple.com"
                      : "+227 90 12 34 56"
                  }
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder="Votre mot de passe"
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

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#30A08B] focus:ring-[#30A08B] border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30A08B] hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuez avec</span>
            </div>
          </div>

          {/* Connexion sociale */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <FaFacebook className="h-5 w-5 text-blue-600" />
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <FaXTwitter className="h-5 w-5 text-gray-900" />
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <FaGoogle className="h-5 w-5 text-red-600" />
            </button>
          </div>

          {/* Lien vers inscription */}
          <p className="text-center text-sm text-gray-600">
            Pas encore membre ?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
            >
              Inscrivez-vous maintenant
            </Link>
          </p>
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

export default Login;
