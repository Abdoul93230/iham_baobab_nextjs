"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

const LivraisonPage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [addressData, setAddressData] = useState({
    name: "",
    email: "",
    numero: "",
    region: "",
    quartier: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null as string[] | null,
    success: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setError(null);
      try {
        const userId = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id 
          : null;
        
        if (!userId) {
          throw new Error(
            "ID utilisateur non trouvé. Veuillez vous reconnecter."
          );
        }

        const userResponse = await axios.get(`${BackendUrl}/user?id=${userId}`);
        const user = userResponse.data.user;
        if (!user) {
          throw new Error(
            "Impossible de récupérer les informations utilisateur."
          );
        }
        setUserData({
          name: user.name || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });

        const addressResponse = await axios.get(
          `${BackendUrl}/getAddressByUserKey/${userId}`
        );
        const address = addressResponse.data.address;
        if (address) {
          setAddressData({
            name: address.name || "",
            email: address.email || "",
            numero: address.numero || "",
            region: address.region || "",
            quartier: address.quartier || "",
            description: address.description || "",
          });
        }
        setLoading(false);
      } catch (err: any) {
        let errorMessage = "Une erreur est survenue lors du chargement des données.";
        if (err.response) {
          switch (err.response.status) {
            case 404:
              errorMessage = "Utilisateur ou adresse non trouvé.";
              break;
            case 401:
              errorMessage = "Session expirée. Veuillez vous reconnecter.";
              break;
            case 500:
              errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
              break;
            default:
              errorMessage = err.response.data?.message || errorMessage;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const validateAddressData = () => {
    const errors = [];
    if (!addressData.name || addressData.name.length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères");
    }
    if (addressData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressData.email)) {
      errors.push("L'adresse email n'est pas valide");
    }
    if (!addressData.numero || addressData.numero.length < 8) {
      errors.push("Le numéro de téléphone doit contenir au moins 8 chiffres");
    }
    if (!addressData.region || addressData.region.length < 3) {
      errors.push("La région doit contenir au moins 3 caractères");
    }
    if (!addressData.quartier || addressData.quartier.length < 2) {
      errors.push("Le quartier doit contenir au moins 2 caractères");
    }
    return errors;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddressData({ ...addressData, [e.target.id]: e.target.value });
    setSubmitStatus({ loading: false, error: null, success: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: null, success: false });

    const validationErrors = validateAddressData();
    if (validationErrors.length > 0) {
      setSubmitStatus({ loading: false, error: validationErrors, success: false });
      return;
    }

    try {
      const userId = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id 
        : null;
      
      if (!userId) {
        throw new Error("ID utilisateur non trouvé. Veuillez vous reconnecter.");
      }

      await axios.post(`${BackendUrl}/createOrUpdateAddress`, {
        ...addressData,
        clefUser: userId,
      });

      setSubmitStatus({ loading: false, error: null, success: true });
      setTimeout(() => {
        setSubmitStatus((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (error: any) {
      let errorMessage: string | string[] = "Erreur lors de la mise à jour de l'adresse.";
      if (error.response) {
        switch (error.response.status) {
          case 400:
            const backendErrors = error.response.data?.err;
            if (Array.isArray(backendErrors)) {
              errorMessage = backendErrors;
            } else {
              errorMessage = error.response.data?.message || "Données invalides";
            }
            break;
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
            break;
          case 500:
            errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setSubmitStatus({
        loading: false,
        error: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
        success: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center p-4">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B17236] mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-[#B17236]">Chargement de vos informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="alert">
        <div className="text-center text-red-500 p-4 max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Recharger la page pour réessayer"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* En-tête avec structure sémantique améliorée */}
        <header className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10 transform transition-all duration-500 hover:scale-105">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#B17236] mb-2 sm:mb-3">
            Adresse de Livraison
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#B2905F]">
            Gérez vos informations de livraison pour recevoir vos commandes
          </p>
        </header>

        {/* Formulaire principal avec meilleure accessibilité */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl p-4 sm:p-6 md:p-8 transition-all duration-300"
          noValidate
          aria-label="Formulaire de mise à jour de l'adresse de livraison"
        >
          {/* Section Informations Utilisateur */}
          <section className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#B17236] border-b-2 border-[#30A08B] pb-2">
              Informations du Compte
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="transform transition-all duration-300">
                <label className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  value={userData.name}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border bg-gray-100 text-gray-600"
                  aria-describedby="user-name-help"
                />
                <small id="user-name-help" className="text-xs text-gray-500 mt-1 block">
                  Information de votre profil utilisateur
                </small>
              </div>

              <div className="transform transition-all duration-300">
                <label className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2">
                  Email du Compte
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border bg-gray-100 text-gray-600"
                  aria-describedby="user-email-help"
                />
                <small id="user-email-help" className="text-xs text-gray-500 mt-1 block">
                  Email de votre compte IhamBaobab
                </small>
              </div>

              <div className="transform transition-all duration-300 md:col-span-2">
                <label className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2">
                  Téléphone du Compte
                </label>
                <input
                  type="tel"
                  value={userData.phoneNumber}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border bg-gray-100 text-gray-600"
                  aria-describedby="user-phone-help"
                />
                <small id="user-phone-help" className="text-xs text-gray-500 mt-1 block">
                  Numéro associé à votre compte
                </small>
              </div>
            </div>
          </section>

          {/* Section Adresse de Livraison avec labels améliorés */}
          <section className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#B17236] border-b-2 border-[#30A08B] pb-2">
              Détails de Livraison
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="transform transition-all duration-300 hover:-translate-y-1">
                <label
                  className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2"
                  htmlFor="name"
                >
                  Nom du Destinataire <span className="text-red-500" aria-label="requis">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={addressData.name}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-describedby="name-help"
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-300"
                  placeholder="Ex: Jean Dupont"
                />
                <small id="name-help" className="text-xs text-gray-500 mt-1 block">
                  Nom de la personne qui recevra la livraison
                </small>
              </div>

              <div className="transform transition-all duration-300 hover:-translate-y-1">
                <label
                  className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2"
                  htmlFor="email"
                >
                  Email de Contact <span className="text-red-500" aria-label="requis">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={addressData.email}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-describedby="email-help"
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-300"
                  placeholder="exemple@email.com"
                />
                <small id="email-help" className="text-xs text-gray-500 mt-1 block">
                  Email pour les notifications de livraison
                </small>
              </div>

              <div className="transform transition-all duration-300 hover:-translate-y-1">
                <label
                  className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2"
                  htmlFor="numero"
                >
                  Téléphone de Livraison <span className="text-red-500" aria-label="requis">*</span>
                </label>
                <input
                  type="tel"
                  id="numero"
                  name="numero"
                  value={addressData.numero}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-describedby="numero-help"
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-300"
                  placeholder="90 12 34 56"
                />
                <small id="numero-help" className="text-xs text-gray-500 mt-1 block">
                  Numéro pour contacter lors de la livraison
                </small>
              </div>

              <div className="transform transition-all duration-300 hover:-translate-y-1">
                <label
                  className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2"
                  htmlFor="region"
                >
                  Région <span className="text-red-500" aria-label="requis">*</span>
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={addressData.region}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-describedby="region-help"
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-300"
                  placeholder="Ex: Niamey, Tillabéri"
                />
                <small id="region-help" className="text-xs text-gray-500 mt-1 block">
                  Région ou ville de livraison
                </small>
              </div>

              <div className="transform transition-all duration-300 hover:-translate-y-1">
                <label
                  className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2"
                  htmlFor="quartier"
                >
                  Quartier <span className="text-red-500" aria-label="requis">*</span>
                </label>
                <input
                  type="text"
                  id="quartier"
                  name="quartier"
                  value={addressData.quartier}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-describedby="quartier-help"
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-300"
                  placeholder="Ex: Plateau, Terminus"
                />
                <small id="quartier-help" className="text-xs text-gray-500 mt-1 block">
                  Quartier précis de livraison
                </small>
              </div>

              <div className="col-span-1 md:col-span-2 transform transition-all duration-300 hover:-translate-y-1">
                <label
                  className="block text-sm md:text-base text-[#B2905F] font-medium mb-1 sm:mb-2"
                  htmlFor="description"
                >
                  Instructions Spéciales
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={addressData.description}
                  onChange={handleAddressChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base rounded-lg border focus:ring-2 focus:ring-[#30A08B] focus:border-transparent transition-all duration-300"
                  rows={3}
                  aria-describedby="description-help"
                  placeholder="Points de repère, instructions spéciales..."
                ></textarea>
                <small id="description-help" className="text-xs text-gray-500 mt-1 block">
                  Informations supplémentaires pour faciliter la livraison (optionnel)
                </small>
              </div>
            </div>
          </section>

          {/* Messages d'état avec rôles ARIA */}
          {(submitStatus.error || submitStatus.success) && (
            <div
              role={submitStatus.success ? "status" : "alert"}
              aria-live="polite"
              className={`mb-6 p-4 rounded-lg ${
                submitStatus.success
                  ? "bg-green-100 border border-green-400"
                  : "bg-red-100 border border-red-400"
              }`}
            >
              {submitStatus.success && (
                <p className="text-green-700 text-center text-sm sm:text-base">
                  ✓ Adresse de livraison mise à jour avec succès
                </p>
              )}
              {submitStatus.error && (
                <div className="text-red-700 text-sm sm:text-base">
                  <p className="font-semibold mb-2">Erreurs à corriger :</p>
                  <ul className="list-disc list-inside">
                    {submitStatus.error.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action avec accessibilité améliorée */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-[#B2905F] hover:bg-[#B17236] text-white rounded-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#B2905F] focus:ring-offset-2"
              aria-label="Retourner à la page précédente"
            >
              ← Retour
            </button>

            <button
              type="submit"
              disabled={submitStatus.loading}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${
                submitStatus.loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#30A08B] hover:bg-[#2a8f7c]"
              } text-white rounded-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#30A08B] focus:ring-offset-2`}
              aria-label={submitStatus.loading ? "Mise à jour en cours" : "Sauvegarder l'adresse de livraison"}
            >
              {submitStatus.loading ? (
                <>
                  <div 
                    className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"
                    aria-hidden="true"
                  ></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <span className="mr-2" aria-hidden="true">💾</span>
                  Sauvegarder l'Adresse
                </>
              )}
            </button>
          </div>

          {/* Informations supplémentaires pour le SEO */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                <strong>Livraison sécurisée</strong> - Vos informations sont protégées
              </p>
              <p className="text-xs">
                Nous utilisons vos données uniquement pour assurer la livraison de vos commandes. 
                <a href="/confidentialite" className="text-[#30A08B] hover:underline ml-1">
                  Politique de confidentialité
                </a>
              </p>
            </div>
          </div>
        </form>

        {/* Section d'aide cachée pour le SEO */}
        <aside className="sr-only">
          <h2>Aide pour la livraison</h2>
          <p>
            Notre service de livraison couvre tout le Niger. Assurez-vous de fournir 
            des informations précises pour garantir une livraison rapide et sécurisée 
            de vos achats sur IhamBaobab.
          </p>
          <h3>Zones de livraison</h3>
          <p>
            Nous livrons dans toutes les régions du Niger : Niamey, Tillabéri, Dosso, 
            Tahoua, Maradi, Zinder, Diffa et Agadez.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default LivraisonPage;