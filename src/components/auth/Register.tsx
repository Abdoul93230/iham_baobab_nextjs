"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Lock, Eye, EyeOff, User, ChevronDown } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { registerUser, selectUserLoading, selectUserError, clearError } from "@/redux/userSlice";
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

interface RegisterProps {
  onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    whatsapp: false,
    acceptTerms: false,
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
    // Validation du nom
    if (!formData.name.trim()) {
      showAlert("error", "Veuillez entrer votre nom");
      return false;
    }
    if (formData.name.trim().length < 3) {
      showAlert("error", "Le nom doit contenir au moins 3 caractères");
      return false;
    }

    // Validation email (optionnel mais doit être valide si fourni)
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      showAlert("error", "Veuillez entrer une adresse email valide");
      return false;
    }

    // Validation téléphone (optionnel mais doit être valide si fourni)
    if (formData.phoneNumber.trim() && !phoneRegex.test(formData.phoneNumber)) {
      showAlert("error", "Veuillez entrer un numéro de téléphone valide (8-11 chiffres)");
      return false;
    }

    // Au moins email ou téléphone doit être fourni
    if (!formData.email.trim() && !formData.phoneNumber.trim()) {
      showAlert("error", "Veuillez fournir au moins une adresse email ou un numéro de téléphone");
      return false;
    }

    // Validation mot de passe
    if (!formData.password.trim()) {
      showAlert("error", "Veuillez entrer un mot de passe");
      return false;
    }
    if (formData.password.length < 6) {
      showAlert("error", "Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    // Confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      showAlert("error", "Les mots de passe ne correspondent pas");
      return false;
    }

    // Acceptation des conditions
    if (!formData.acceptTerms) {
      showAlert("error", "Veuillez accepter les conditions d'utilisation");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() 
        ? `${selectedCountryCode.code}${formData.phoneNumber.trim()}`
        : undefined,
      password: formData.password,
      whatsapp: formData.whatsapp,
    };

    try {
      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        showAlert("success", "Inscription réussie ! Connexion automatique en cours...");
        
        // Appeler onSuccess si fourni
        if (onSuccess) {
          onSuccess();
        }
        
        // Rediriger après un délai
        setTimeout(() => {
          navigateBasedOnLocation();
        }, 2000);
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);
    }
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
            Inscription
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre compte IhamBaobab
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            {/* Champ Téléphone */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
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
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-r-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors"
                    placeholder="90 12 34 56"
                    maxLength={11}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                * Au moins l'email ou le téléphone est requis. Exemple: {selectedCountryCode.code}90123456 sera envoyé au serveur
              </p>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
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

            {/* Confirmation Mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe *
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
                  placeholder="Confirmez votre mot de passe"
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

            {/* Options */}
            <div className="space-y-4">
              {/* WhatsApp */}
              <div className="flex items-center">
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="checkbox"
                  checked={formData.whatsapp}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#30A08B] focus:ring-[#30A08B] border-gray-300 rounded"
                />
                <label htmlFor="whatsapp" className="ml-2 block text-sm text-gray-900">
                  Ce numéro est aussi mon WhatsApp
                </label>
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#30A08B] focus:ring-[#30A08B] border-gray-300 rounded mt-0.5"
                  required
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J'accepte les{" "}
                  <Link href="/terms" className="text-[#30A08B] hover:text-[#B2905F] underline">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="/privacy" className="text-[#30A08B] hover:text-[#B2905F] underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30A08B] hover:bg-[#B2905F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30A08B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Inscription en cours...
                </div>
              ) : (
                "S'inscrire"
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

          {/* Lien vers connexion */}
          <p className="text-center text-sm text-gray-600">
            Déjà membre ?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-[#30A08B] hover:text-[#B2905F] transition-colors"
            >
              Connectez-vous ici
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

export default Register;
