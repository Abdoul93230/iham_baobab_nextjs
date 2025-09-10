"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Upload,
  Edit,
  Save,
  ChevronDown,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Alert from "@/components/Alert";
import { isValidPhoneNumber } from "@/lib/utils";

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

interface UserData {
  nom: string;
  email: string;
  phoneNumber: string;
  photo: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  
  // États pour la gestion du téléphone séparé
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phoneNumberOnly, setPhoneNumberOnly] = useState("");
  
  const [userData, setUserData] = useState<UserData>({
    nom: "",
    email: "",
    phoneNumber: "",
    photo: "/icon_user.png",
  });
  
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLCanvasElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Fermer le dropdown de pays quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour séparer le numéro de téléphone complet
  const parsePhoneNumber = (fullPhoneNumber: string) => {
    if (!fullPhoneNumber) {
      return { countryCode: countryCodes[0], phoneOnly: "" };
    }

    // Rechercher l'indicatif correspondant
    const foundCountry = countryCodes.find(country => 
      fullPhoneNumber.startsWith(country.code)
    );

    if (foundCountry) {
      const phoneOnly = fullPhoneNumber.substring(foundCountry.code.length);
      return { countryCode: foundCountry, phoneOnly };
    }

    // Si aucun indicatif trouvé, utiliser le premier par défaut
    return { countryCode: countryCodes[0], phoneOnly: fullPhoneNumber };
  };

  // Fonction pour construire le numéro complet
  const buildFullPhoneNumber = () => {
    return phoneNumberOnly.trim() 
      ? `${selectedCountryCode.code}${phoneNumberOnly.trim()}`
      : "";
  };

  // Gestion des alertes
  const showAlert = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setAlert({ visible: true, type, message });
  }, []);

  const hideAlert = () => {
    setAlert({ visible: false, type: "info", message: "" });
  };

  // Récupération des données utilisateur
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [userResponse, profileResponse] = await Promise.all([
        axios.get(`https://ihambackend.onrender.com/user`, {
          params: { id: userId },
          timeout: 10000,
        }),
        axios.get(`https://ihambackend.onrender.com/getUserProfile`, {
          params: { id: userId },
          timeout: 10000,
        }),
      ]);

      if (!userResponse.data.user) {
        throw new Error("Données utilisateur non trouvées");
      }

      const profileData = profileResponse.data.data;
      const fullPhoneNumber = profileData?.numero || userResponse.data.user.phoneNumber || "";
      const { countryCode, phoneOnly } = parsePhoneNumber(fullPhoneNumber);

      setSelectedCountryCode(countryCode);
      setPhoneNumberOnly(phoneOnly);

      setUserData({
        nom: userResponse.data.user.name || "",
        email: userResponse.data.user.email || "",
        phoneNumber: fullPhoneNumber,
        photo: profileData?.image && profileData.image !== "https://chagona.onrender.com/images/image-1688253105925-0.jpeg"
          ? profileData.image
          : "/icon_user.png",
      });

      showAlert("Profil chargé avec succès", "success");
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      
      // Extraire le message d'erreur du backend
      let errorMessage = "Erreur lors du chargement des données";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserData(user.id);
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchUserData]);

  // Gestion du drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoSelect(file);
  };

  // Sélection de photo
  const handlePhotoSelect = (file: File) => {
    const maxSize = 4 * 1024 * 1024; // 4MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showAlert("Format non supporté (JPEG, PNG, GIF, WebP uniquement)", "warning");
      return;
    }

    if (file.size > maxSize) {
      showAlert("Image trop volumineuse (max 4MB)", "warning");
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setEditingPhoto(true);
    setScale(1.2);
    setRotate(0);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handlePhotoSelect(e.target.files[0]);
    }
  };

  // Sauvegarde de la photo
  const handleSavePhoto = async () => {
    if (!selectedImage || !user?.id) {
      showAlert("Erreur lors de la sauvegarde", "error");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fullPhoneNumber = buildFullPhoneNumber();
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("name", userData.nom);
      formData.append("email", userData.email);
      formData.append("phone", fullPhoneNumber);
      formData.append("id", user.id);

      await axios.post(
        "https://ihambackend.onrender.com/createProfile",
        formData,
        {
          timeout: 15000,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showAlert("Photo mise à jour avec succès", "success");
      setEditingPhoto(false);
      setSelectedImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      await fetchUserData(user.id);
    } catch (error: any) {
      console.error("Erreur sauvegarde photo:", error);
      
      // Extraire le message d'erreur du backend
      let errorMessage = "Erreur lors de la mise à jour de la photo";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (userData.nom.trim().length < 3) {
      showAlert("Le nom doit contenir au moins 3 caractères", "warning");
      return false;
    }
    if (!regexMail.test(userData.email)) {
      showAlert("Adresse email invalide", "warning");
      return false;
    }
    
    const fullPhoneNumber = buildFullPhoneNumber();
    if (!isValidPhoneNumber(fullPhoneNumber)) {
      showAlert("Numéro de téléphone invalide (format: +227XXXXXXXX ou XXXXXXXX)", "warning");
      return false;
    }
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = buildFullPhoneNumber();
      const formData = new FormData();
      formData.append("name", userData.nom);
      formData.append("email", userData.email);
      formData.append("phone", fullPhoneNumber);
      formData.append("id", user.id);

      await axios.post(
        "https://ihambackend.onrender.com/createProfile",
        formData,
        {
          timeout: 10000,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showAlert("Profil mis à jour avec succès", "success");
      setIsEditing(false);
      await fetchUserData(user.id);
    } catch (error: any) {
      console.error("Erreur mise à jour profil:", error);
      
      // Extraire le message d'erreur du backend
      let errorMessage = "Erreur lors de la mise à jour du profil";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de champs
  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Gestion du changement d'indicatif pays
  const handleCountryCodeChange = (country: typeof countryCodes[0]) => {
    setSelectedCountryCode(country);
    setIsCountryDropdownOpen(false);
    // Mettre à jour le numéro complet dans userData
    const fullPhoneNumber = phoneNumberOnly.trim() 
      ? `${country.code}${phoneNumberOnly.trim()}`
      : "";
    setUserData(prev => ({ ...prev, phoneNumber: fullPhoneNumber }));
  };

  // Gestion du changement du numéro de téléphone
  const handlePhoneNumberChange = (value: string) => {
    // Permettre seulement les chiffres
    const cleanValue = value.replace(/[^0-9]/g, '');
    setPhoneNumberOnly(cleanValue);
    // Mettre à jour le numéro complet dans userData
    const fullPhoneNumber = cleanValue.trim() 
      ? `${selectedCountryCode.code}${cleanValue.trim()}`
      : "";
    setUserData(prev => ({ ...prev, phoneNumber: fullPhoneNumber }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-4">
        <div className="max-w-2xl mx-auto p-6">
          {/* Titre de la page */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#30A08B] mb-2">Mon Profil</h1>
            <p className="text-gray-600">Gérez vos informations personnelles</p>
          </div>

          {/* Photo de profil */}
          <div className="mb-8 text-center">
            <div className="relative inline-block group">
              <div
                className={`w-40 h-40 rounded-full overflow-hidden border-4 border-[#30A08B] transition-transform duration-300 group-hover:scale-105 ${
                  isDragging ? "border-[#B2905F] scale-105" : ""
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Image
                  src={userData.photo}
                  alt="Photo de profil"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handlePhotoChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#30A08B] text-white p-3 rounded-full cursor-pointer hover:bg-[#B2905F] transform transition-transform duration-300 hover:scale-110 shadow-lg"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-3">
              Glissez une image ou cliquez pour modifier (MAX 4MB)
            </p>
          </div>

          {/* Éditeur de photo modal */}
          {editingPhoto && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Éditer la photo
                  </h3>
                  <button
                    onClick={() => {
                      setEditingPhoto(false);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl("");
                      setSelectedImage(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="relative w-72 h-72 border rounded-lg overflow-hidden">
                    {previewUrl && (
                      <Image
                        src={previewUrl}
                        alt="Prévisualisation"
                        fill
                        className="object-cover"
                        style={{
                          transform: `scale(${scale}) rotate(${rotate}deg)`,
                          transformOrigin: "center",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Contrôles */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScale((s) => Math.max(1, s - 0.1))}
                        className="p-2 text-gray-600 hover:text-[#30A08B] transition-colors"
                      >
                        <ZoomOut size={20} />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.01"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-24 accent-[#30A08B]"
                      />
                      <button
                        onClick={() => setScale((s) => Math.min(2, s + 0.1))}
                        className="p-2 text-gray-600 hover:text-[#30A08B] transition-colors"
                      >
                        <ZoomIn size={20} />
                      </button>
                    </div>

                    <button
                      onClick={() => setRotate((r) => r + 90)}
                      className="p-2 text-gray-600 hover:text-[#30A08B] transition-colors"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setEditingPhoto(false);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl("");
                        setSelectedImage(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={isUploadingPhoto}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSavePhoto}
                      disabled={isUploadingPhoto}
                      className="px-6 py-2 bg-[#30A08B] text-white rounded-lg hover:bg-[#B2905F] transition-colors shadow-md disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sauvegarde...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Sauvegarder</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informations du profil */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Informations personnelles
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 text-[#30A08B] hover:bg-[#30A08B]/10 rounded-lg transition-colors"
              >
                <Edit size={16} />
                <span>{isEditing ? "Annuler" : "Modifier"}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={userData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <div className="flex gap-2">
                  {/* Dropdown pour l'indicatif pays */}
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      disabled={!isEditing}
                      className="flex items-center px-3 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-50 disabled:text-gray-500 min-w-[120px]"
                    >
                      <span className="text-base">{selectedCountryCode.flag}</span>
                      <span className="ml-2 text-sm font-medium">
                        {selectedCountryCode.code}
                      </span>
                      <ChevronDown size={16} className="ml-2 text-gray-400" />
                    </button>

                    {/* Dropdown menu */}
                    {isCountryDropdownOpen && isEditing && (
                      <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountryCodeChange(country)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center transition-colors"
                          >
                            <span className="text-base">{country.flag}</span>
                            <span className="ml-3 text-sm font-medium">{country.code}</span>
                            <span className="ml-2 text-xs text-gray-500">{country.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Champ numéro de téléphone */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={phoneNumberOnly}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="90123456"
                      maxLength={11}
                    />
                  </div>
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Exemple: {selectedCountryCode.code}90123456 sera envoyé au serveur
                  </p>
                )}
              </div>

              {/* Actions */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#30A08B] text-white rounded-lg hover:bg-[#B2905F] transition-colors shadow-md disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Mise à jour...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Mettre à jour</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Changer mot de passe */}
            <div className="pt-4 border-t">
              <button
                onClick={() => router.push("/auth/forgot-password")}
                className="inline-flex items-center space-x-2 text-sm text-[#30A08B] hover:text-[#B2905F] transition-colors"
              >
                <Lock size={16} />
                <span>Changer le mot de passe</span>
              </button>
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
    </ProtectedRoute>
  );
};

export default Profile;
