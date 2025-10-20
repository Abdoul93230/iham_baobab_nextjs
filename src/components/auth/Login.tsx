"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { loginUser, selectUserLoading, selectUserError, clearError } from "@/redux/userSlice";
import { AppDispatch } from "@/redux/store";
import Alert from "@/components/Alert";

// Liste des indicatifs pays
const countryCodes = [
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+1", country: "États-Unis", flag: "🇺🇸" },
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+213", country: "Algérie", flag: "🇩🇿" },
];

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
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
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

  // Expressions régulières
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

  // Changement de méthode de connexion
  const switchLoginMethod = (method: "email" | "phone") => {
    setLoginMethod(method);
    setFormData(prev => ({
      ...prev,
      email: "",
      phoneNumber: "",
    }));
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "phoneNumber") {
      // Nettoyer le numéro de téléphone (garder seulement les chiffres)
      const cleanedValue = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Sélection de l'indicatif pays
  const handleCountrySelect = (country: typeof countryCodes[0]) => {
    setSelectedCountryCode(country);
    setIsCountryDropdownOpen(false);
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

    // Préparer les données de connexion avec l'indicatif complet pour le téléphone
    const loginData = {
      identifier: loginMethod === "email" 
        ? formData.email 
        : `${selectedCountryCode.code}${formData.phoneNumber}`,
      password: formData.password,
      method: loginMethod,
    };

    try {
      const result = await dispatch(loginUser(loginData));
      
      if (loginUser.fulfilled.match(result)) {
        showAlert("success", "Connexion réussie !");
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirection selon les paramètres URL
          const redirect = searchParams.get("redirect");
          const returnUrl = searchParams.get("returnUrl");
          
          if (redirect) {
            router.push(redirect);
          } else if (returnUrl) {
            router.push(returnUrl);
          } else {
            router.push("/");
          }
        }
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
    }
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
              
              {loginMethod === "email" ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                    placeholder="vous@exemple.com"
                  />
                </div>
              ) : (
                <div className="relative flex">
                  {/* Sélecteur d'indicatif pays */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-[52px] px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors flex items-center space-x-2"
                    >
                      <span className="text-base">{selectedCountryCode.flag}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedCountryCode.code}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                    
                    {/* Dropdown des pays */}
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center space-x-3"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-medium text-gray-700">
                              {country.code}
                            </span>
                            <span className="text-sm text-gray-500">
                              {country.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Champ numéro */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-r-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                      placeholder="90 12 34 56"
                      maxLength={11}
                    />
                  </div>
                </div>
              )}
              
              {loginMethod === "phone" && (
                <p className="mt-1 text-xs text-gray-500">
                  Exemple: {selectedCountryCode.code}90123456 sera envoyé au serveur
                </p>
              )}
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

            {/* Se souvenir de moi + Mot de passe oublié */}
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
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
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
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            {/* Boutons réseaux sociaux */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <FaGoogle className="h-5 w-5 text-red-500" />
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <FaFacebook className="h-5 w-5 text-blue-600" />
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                <FaXTwitter className="h-5 w-5 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Lien d'inscription */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas de compte ?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
              >
                Créer un compte
              </Link>
            </p>
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

export default Login;
