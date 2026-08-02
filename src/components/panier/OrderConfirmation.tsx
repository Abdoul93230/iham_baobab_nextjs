"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import LoadingIndicator from "@/components/LoadingIndicator";
import PaiementPage from "./PaiementPage";
import PointsRedeemWidget from "@/components/wallet/PointsRedeemWidget";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// Liste des indicatifs de pays les plus courants
const COUNTRY_CODES = [
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+1", country: "États-Unis/Canada", flag: "🇺🇸" },
  { code: "+44", country: "Royaume-Uni", flag: "🇬🇧" },
  { code: "+49", country: "Allemagne", flag: "🇩🇪" },
  { code: "+34", country: "Espagne", flag: "🇪🇸" },
  { code: "+39", country: "Italie", flag: "🇮🇹" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+213", country: "Algérie", flag: "🇩🇿" },
  { code: "+216", country: "Tunisie", flag: "🇹🇳" },
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+224", country: "Guinée", flag: "🇬🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+230", country: "Maurice", flag: "🇲🇺" },
  { code: "+231", country: "Libéria", flag: "🇱🇷" },
  { code: "+232", country: "Sierra Leone", flag: "🇸🇱" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+234", country: "Nigéria", flag: "🇳🇬" },
  { code: "+235", country: "Tchad", flag: "🇹🇩" },
  { code: "+236", country: "République centrafricaine", flag: "🇨🇫" },
  { code: "+237", country: "Cameroun", flag: "🇨🇲" },
  { code: "+238", country: "Cap-Vert", flag: "🇨🇻" },
  { code: "+239", country: "São Tomé-et-Príncipe", flag: "🇸🇹" },
  { code: "+240", country: "Guinée équatoriale", flag: "🇬🇶" },
  { code: "+241", country: "Gabon", flag: "🇬🇦" },
  { code: "+242", country: "République du Congo", flag: "🇨🇬" },
  { code: "+243", country: "République démocratique du Congo", flag: "🇨🇩" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+245", country: "Guinée-Bissau", flag: "🇬🇼" },
  { code: "+246", country: "Territoire britannique de l'océan Indien", flag: "🇮🇴" },
  { code: "+248", country: "Seychelles", flag: "🇸🇨" },
  { code: "+249", country: "Soudan", flag: "🇸🇩" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+251", country: "Éthiopie", flag: "🇪🇹" },
  { code: "+252", country: "Somalie", flag: "🇸🇴" },
  { code: "+253", country: "Djibouti", flag: "🇩🇯" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+255", country: "Tanzanie", flag: "🇹🇿" },
  { code: "+256", country: "Ouganda", flag: "🇺🇬" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+258", country: "Mozambique", flag: "🇲🇿" },
  { code: "+260", country: "Zambie", flag: "🇿🇲" },
  { code: "+261", country: "Madagascar", flag: "🇲🇬" },
  { code: "+262", country: "La Réunion/Mayotte", flag: "🇷🇪" },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
  { code: "+264", country: "Namibie", flag: "🇳🇦" },
  { code: "+265", country: "Malawi", flag: "🇲🇼" },
  { code: "+266", country: "Lesotho", flag: "🇱🇸" },
  { code: "+267", country: "Botswana", flag: "🇧🇼" },
  { code: "+268", country: "Eswatini", flag: "🇸🇿" },
  { code: "+269", country: "Comores", flag: "🇰🇲" },
  { code: "+290", country: "Sainte-Hélène", flag: "🇸🇭" },
  { code: "+291", country: "Érythrée", flag: "🇪🇷" },
  { code: "+297", country: "Aruba", flag: "🇦🇼" },
  { code: "+298", country: "Îles Féroé", flag: "🇫🇴" },
  { code: "+299", country: "Groenland", flag: "🇬🇱" },
];

// Utilitaires
const PaymentMethods = {
  CARD: ["Visa", "master Card"],
  MOBILE_WALLET: ["zeyna", "mynita", "amana"],
  MOBILE_MONEY: ["Mobile Money"],
  CASH_ON_DELIVERY: ["payé à la livraison"],
  ASSISTED_PAYMENT: ["paiement_assiste"],
};

interface SecurityCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  error: string;
}

const SecurityCodeModal: React.FC<SecurityCodeModalProps> = ({ isOpen, onClose, onSubmit, error }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Code de sécurité</h2>
        <p className="text-gray-600 mb-4">
          Veuillez entrer le code qui vous a été envoyé par SMS
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Entrez le code"
            autoFocus
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface OrderConfirmationProps {
  acces: string;
  total?: number;
  codeP?: any;
  setCodeP?: (code: any) => void;
  initialBP?: { pointsUsed: number; pointsDiscount: number } | null;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ acces, initialBP }) => {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [message, setMessage] = useState("");
  const [selectedZone, setSelectedZone] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("orderShippingZone");
      if (saved) { try { return JSON.parse(saved); } catch { return null; } }
    }
    return null;
  });
  const [orderTotal, setOrderTotal] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTotal = localStorage.getItem("orderTotal");
      return savedTotal ? parseFloat(savedTotal) : 0;
    }
    return 0;
  });
  const [orderSubtotal, setOrderSubtotal] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSubtotal = localStorage.getItem("orderSubtotal");
      return savedSubtotal ? parseFloat(savedSubtotal) : 0;
    }
    return 0;
  });
  const [orderShippingCost, setOrderShippingCost] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedShipping = localStorage.getItem("orderShippingCost");
      return savedShipping ? parseFloat(savedShipping) : 0;
    }
    return 0;
  });
  const [orderCodeP, setOrderCodeP] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCodeP = localStorage.getItem("orderCodeP");
      return savedCodeP ? JSON.parse(savedCodeP) : null;
    }
    return null;
  });
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
  });
  const [securityCodeModal, setSecurityCodeModal] = useState({
    isOpen: false,
    code: "",
    error: "",
  });
  const [handleSecuritySubmit, setHandleSecuritySubmit] = useState<((code: string) => void) | null>(null);
  const [mobileDetails, setMobileDetails] = useState({
    number: "",
    operateur: "227",
  });
  const [onSubmit, setOnSubmit] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    email: "",
    numero: "",
    countryCode: "+227", // Indicatif par défaut pour le Niger
    region: "",
    quartier: "",
    description: "",
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null as string | null,
    success: false,
  });
  const [paiementProduit, setPaiementProduit] = useState(false);
  const [trackedTransactionId, setTrackedTransactionId] = useState<string | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Sync quand initialBP arrive (chargé après le mount via useEffect de la page parente)
  useEffect(() => {
    if (initialBP?.pointsUsed && initialBP.pointsUsed > 0) {
      setPointsToUse(initialBP.pointsUsed);
      setPointsDiscount(initialBP.pointsDiscount || 0);
    }
  }, [initialBP]);
  const handledPaymentRef = useRef<string | null>(null);

  const spinnerStyle = {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderTop: "4px solid #FFF",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    animation: "spin 1s linear infinite",
    margin: "auto",
  };

  const clearSuccessfulPaymentState = useCallback(async (transactionId: string) => {
    if (handledPaymentRef.current === transactionId) {
      return;
    }

    handledPaymentRef.current = transactionId;

    ["panier", "orderTotal", "orderSubtotal", "orderShippingCost", "paymentInfo", "pendingOrder", "orderShippingZone", "orderShippingCalculations", "orderShippingByStore", "orderCodeP", "paymentInitiated", "pendingOrderBP"].forEach((key) =>
      localStorage.removeItem(key)
    );

    if (orderCodeP?.isValide) {
      await axios.put(`${BackendUrl}/updateCodePromo`, {
        codePromoId: orderCodeP._id,
        isValide: false,
      });
      localStorage.removeItem("orderCodeP");
    }

    setSubmitStatus({
      loading: false,
      error: "Paiement confirmé par iPay",
      success: true,
    });
    setPaiementProduit(true);
    setOnSubmit(false);
  }, [orderCodeP]);

  // Récupération utilisateur avec vérification côté client
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("userEcomme");
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Récupérer la zone de livraison sélectionnée dans le panier
      const shippingZone = localStorage.getItem("orderShippingZone");
      if (shippingZone) {
        try {
          const zone = JSON.parse(shippingZone);
          setSelectedZone(zone);
          console.log("Zone de livraison récupérée:", zone);
        } catch (error) {
          console.error("Erreur lors de la récupération de la zone:", error);
        }
      }
    }
  }, []);

  function generateUniqueID() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const uniqueID = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return uniqueID;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user?.id;
        if (!userId) {
          setSubmitStatus({
            loading: false,
            error: "ID utilisateur non trouvé. Veuillez vous reconnecter.",
            success: false,
          });
          return;
        }

        // Récupérer l'adresse de livraison
        const addressResponse = await axios.get(
          `${BackendUrl}/getAddressByUserKey/${userId}`
        );

        if (addressResponse.data.address) {
          const address = addressResponse.data.address;
          // Construire le chemin complet de la zone
          let regionValue = address.region || "";
          if (selectedZone) {
            if (selectedZone.fullPath) {
              regionValue = selectedZone.fullPath;
            } else if (selectedZone.country && selectedZone.region && selectedZone.name) {
              regionValue = `${selectedZone.country} > ${selectedZone.region} > ${selectedZone.name}`;
            } else if (selectedZone.name) {
              regionValue = selectedZone.name;
            }
          }

          // Extraire l'indicatif et le numéro du numéro complet
          let countryCode = "+227"; // Valeur par défaut
          let phoneNumber = "";
          
          if (address.numero) {
            const fullNumber = address.numero.toString();
            // Chercher l'indicatif dans notre liste
            const foundCountry = COUNTRY_CODES.find(country => fullNumber.startsWith(country.code));
            if (foundCountry) {
              countryCode = foundCountry.code;
              phoneNumber = fullNumber.substring(foundCountry.code.length);
            } else {
              // Si aucun indicatif trouvé, supposer que c'est un numéro local
              phoneNumber = fullNumber;
            }
          }

          setDeliveryInfo({
            name: address.name || "",
            email: address.email || "",
            numero: phoneNumber,
            countryCode: countryCode,
            region: regionValue,
            quartier: address.quartier || "",
            description: address.description || "",
          });
        } else if (selectedZone) {
          // Si pas d'adresse sauvegardée mais zone sélectionnée dans le panier
          let regionValue = "";
          if (selectedZone.fullPath) {
            regionValue = selectedZone.fullPath;
          } else if (selectedZone.country && selectedZone.region && selectedZone.name) {
            regionValue = `${selectedZone.country} > ${selectedZone.region} > ${selectedZone.name}`;
          } else if (selectedZone.name) {
            regionValue = selectedZone.name;
          }

          setDeliveryInfo(prev => ({
            ...prev,
            region: regionValue,
            quartier: "",
            countryCode: "+227", // Valeur par défaut si pas d'adresse
          }));
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user, selectedZone]);

  // Sync selectedZone → deliveryInfo.region immédiatement (indépendant de fetchData)
  useEffect(() => {
    if (!selectedZone) return;
    const regionValue = selectedZone.fullPath
      || (selectedZone.country && selectedZone.region && selectedZone.name
        ? `${selectedZone.country} > ${selectedZone.region} > ${selectedZone.name}`
        : selectedZone.name || "");
    if (regionValue) {
      setDeliveryInfo(prev => ({ ...prev, region: regionValue }));
    }
  }, [selectedZone]);

  const validateDeliveryInfo = () => {
    const errors = [];

    if (!deliveryInfo.name || deliveryInfo.name.length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères");
    }

    if (
      deliveryInfo.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.email)
    ) {
      errors.push("L'adresse email n'est pas valide");
    }

    if (!deliveryInfo.numero || deliveryInfo.numero.length < 8) {
      errors.push("Le numéro de téléphone doit contenir au moins 8 chiffres");
    }

    // Validation du format international du numéro
    const fullPhoneNumber = deliveryInfo.countryCode + deliveryInfo.numero;
    const phoneRegex = /^\+[1-9]\d{1,14}$/; // Format E.164 international
    if (!phoneRegex.test(fullPhoneNumber)) {
      errors.push("Le format du numéro de téléphone n'est pas valide");
    }

    if (!deliveryInfo.region || deliveryInfo.region.length < 3) {
      errors.push("La région doit contenir au moins 3 caractères");
    }

    if (!deliveryInfo.quartier || deliveryInfo.quartier.length < 2) {
      errors.push("Le quartier doit contenir au moins 2 caractères");
    }

    return errors;
  };

  // Amélioration de la validation des cartes
  const validatePaymentInfo = () => {
    // const errors = [];
    const errors: string[] = [];

    if (!selectedPayment) {
      errors.push("Veuillez choisir un moyen de paiement");
      return errors;
    }

    // if (selectedPayment === "Visa") {
    //   const rawNum = String(cardDetails.number || "").replace(/\s|-/g, "");
    //   if (!/^4[0-9]{12}(?:[0-9]{3})?$/.test(rawNum)) {
    //     errors.push("Le numéro de la carte Visa n'est pas valide");
    //   }
    //   if (!/^[0-9]{3}$/.test(cardDetails.cvc)) {
    //     errors.push("Le code CVC n'est pas valide");
    //   }
    //   if (!cardDetails.expiry) {
    //     errors.push("Veuillez sélectionner la date d'expiration");
    //   }
    // } else if (selectedPayment === "master Card") {
    //   const rawNum = String(cardDetails.number || "").replace(/\s|-/g, "");
    //   if (!/^5[1-5][0-9]{14}$/.test(rawNum)) {
    //     errors.push("Le numéro de la carte MasterCard n'est pas valide");
    //   }
    //   if (!/^[0-9]{3}$/.test(cardDetails.cvc)) {
    //     errors.push("Le code CVC n'est pas valide");
    //   }
    //   if (!cardDetails.expiry) {
    //     errors.push("Veuillez sélectionner la date d'expiration");
    //   }
    // } else if (selectedPayment === "Mobile Money") {
    //   if (!/^[0-9]{8,}$/.test(mobileDetails.number)) {
    //     errors.push("Le format du numéro n'est pas valide");
    //   }
    // } else if (["zeyna", "mynita", "amana"].includes(selectedPayment)) {
    //   if (!/^[0-9]{8,}$/.test(mobileDetails.number)) {
    //     errors.push("Le format du numéro n'est pas valide");
    //   }
    // }

    return errors;
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Empêcher la modification de la région si une zone est sélectionnée dans le panier
    if (name === 'region' && selectedZone) {
      return; // Ne pas permettre la modification
    }

    // Pour le numéro de téléphone, ne garder que les chiffres
    if (name === 'numero') {
      const cleanedValue = value.replace(/[^0-9]/g, '');
      setDeliveryInfo((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
    } else {
      setDeliveryInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    setSubmitStatus({
      loading: false,
      error: null,
      success: false,
    });
  };

  const handleReturnToCart = () => {
    router.push("/Panier");
  };

  const handlePress = (paymentMethod: string) => {
    setSelectedPayment(paymentMethod);
  };

  // Traitement des paiements Mobile Money
  const processSTAPayment = async (paymentData: any, transactionId: string) => {
    const response = await axios.post(
      `${BackendUrl}/processSTAPayment`,
      paymentData
    );

    if (response.data.code_validation) {
      const message = `${response.data.message} Votre code de validation : ${response.data.code_validation}`;
      alert(message);
      setMessage(message);
    }

    // Démarrer la vérification progressive
    // startProgressiveChecks(transactionId);

    return response;
  };

  // const startProgressiveChecks = (transactionId: string) => {
  //   let checkCount = 0;
  //   const maxChecks = 10;
  //   const initialDelay = 10000;

  //   const progressiveCheck = async () => {
  //     try {
  //       if (typeof window === 'undefined') return;

  //       const transactionInfo = JSON.parse(
  //         localStorage.getItem("currentTransaction") || "{}"
  //       );
  //       if (!transactionInfo || transactionInfo.id !== transactionId) return;

  //       checkCount++;
  //       const status = await checkTransactionStatus(transactionId);

  //       if (status.isCompleted) {
  //         if (status.isSuccessful) {
  //           await handlePaymentCallback("success", transactionId);
  //           setSubmitStatus({
  //             loading: false,
  //             error: null,
  //             success: true,
  //           });
  //         } else {
  //           setSubmitStatus({
  //             loading: false,
  //             error: "Le paiement n'a pas été complété",
  //             success: false,
  //           });
  //         }
  //         localStorage.removeItem("currentTransaction");
  //         return;
  //       }

  //       if (checkCount < maxChecks) {
  //         const nextDelay = initialDelay * Math.pow(1.5, checkCount - 1);
  //         setTimeout(progressiveCheck, nextDelay);
  //       }
  //     } catch (error) {
  //       console.error("Erreur lors de la vérification:", error);
  //     }
  //   };

  //   setTimeout(progressiveCheck, initialDelay);
  // };

  // Effet pour gérer le retour de l'application mobile
  // useEffect(() => {
  //   const handleVisibilityChange = async () => {
  //     if (typeof window === 'undefined') return;

  //     if (!document.hidden) {
  //       const transactionInfo = JSON.parse(
  //         localStorage.getItem("currentTransaction") || "{}"
  //       );
  //       if (!transactionInfo) return;

  //       const timeElapsed = Date.now() - transactionInfo.startTime;
  //       if (timeElapsed > 900000) {
  //         localStorage.removeItem("currentTransaction");
  //         setSubmitStatus({
  //           loading: false,
  //           error: "Le délai de paiement a expiré",
  //           success: false,
  //         });
  //         return;
  //       }

  //       const timeSinceLastCheck = Date.now() - transactionInfo.lastCheckTime;
  //       if (timeSinceLastCheck < 5000) return;

  //       try {
  //         const status = await checkTransactionStatus(transactionInfo.id);
  //         transactionInfo.lastCheckTime = Date.now();
  //         localStorage.setItem(
  //           "currentTransaction",
  //           JSON.stringify(transactionInfo)
  //         );

  //         if (status.isCompleted) {
  //           if (status.isSuccessful) {
  //             await handlePaymentCallback("success", transactionInfo.id);
  //             setSubmitStatus({
  //               loading: false,
  //               error: null,
  //               success: true,
  //             });
  //           } else {
  //             setSubmitStatus({
  //               loading: false,
  //               error: "Le paiement n'a pas été complété",
  //               success: false,
  //             });
  //           }
  //           localStorage.removeItem("currentTransaction");
  //         }
  //       } catch (error) {
  //         console.error("Erreur lors de la vérification au retour:", error);
  //       }
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, []);

  // Service pour la gestion des messages
  const AlertService = {
    showAlert(setSubmitStatus: any, message: string, type = "error") {
      setSubmitStatus({
        loading: false,
        error: message,
        success: type === "success",
      });
      setOnSubmit(false);
    },
  };

  // Service pour la gestion des codes promo (V2 — le backend gère tout)
  const PromoCodeService = {
    getDiscount() {
      // La réduction a déjà été calculée côté serveur lors de la validation dans le panier
      if (!orderCodeP?.isValide) return 0;
      return orderCodeP.discount || 0;
    },

    getPromoCodeId() {
      if (!orderCodeP?.isValide) return null;
      return orderCodeP._id || null;
    },
  };

  // Gestionnaire principal des commandes
  const OrderManager = {
    async createOrUpdateOrder(orderData: any, existingOrder = null) {
      const endpoint = existingOrder
        ? `${BackendUrl}/updateCommande`
        : `${BackendUrl}/createCommande`;

      const method = existingOrder ? "put" : "post";

      try {
        const response = await axios[method](endpoint, orderData);
        return response.data;
      } catch (error) {
        console.error("Erreur gestion commande:", error);
        return {
          error:
            (error as any).response?.data?.message ||
            "Erreur lors de la création de la commande",
        };
      }
    },

    async processPayment(paymentMethod: string, transactionId: string, orderTotal: number) {
      // const pendingOrder = localStorage.getItem("pendingOrder");
      // const transactionId = pendingOrder ? JSON.parse(pendingOrder).transactionId : null;

      localStorage.setItem(
        "paymentInfo",
        JSON.stringify({
          amount: orderTotal,
          transactionId,
        })
      );
      if (PaymentMethods.CARD.includes(paymentMethod)) {
        // return processCardPayment(transactionId);
        return window.location.href = "/payment-page.html";
      } else if (PaymentMethods.MOBILE_WALLET.includes(paymentMethod)) {
        // return processMobilePayment(transactionId);

        window.location.href = "/payment-page.html";
        return Promise.resolve({ status: false });
      } else if (PaymentMethods.MOBILE_MONEY.includes(paymentMethod)) {
        // return processMobileMoneyPayment(transactionId);

        window.location.href = "/payment-page.html";
        return Promise.resolve({ status: false });
      }
      // return Promise.resolve({ status: "complete" });
      window.location.href = "/commandes";
      return Promise.resolve({ status: false });
    },
  };

  // Version optimisée de handlePaymentSubmit avec gestion des alertes
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitStatus.loading) return;
    setSubmitStatus({ loading: true, error: null, success: false });
    setMessage("Veuillez patienter...");
    setOnSubmit(true);

    // 1. Validation initiale
    const userId = user?.id;
    if (!userId) {
      AlertService.showAlert(
        setSubmitStatus,
        "Veuillez vous connecter pour continuer"
      );
      return;
    }

    const validationErrors = [
      ...validateDeliveryInfo(),
      ...validatePaymentInfo(),
    ];
    if (validationErrors.length > 0) {
      AlertService.showAlert(setSubmitStatus, validationErrors.join(", "));
      return;
    }

    // 2. Vérification du panier
    if (typeof window === 'undefined') return;

    const panier = JSON.parse(localStorage.getItem("panier") || "[]");
    if (!panier?.length) {
      AlertService.showAlert(setSubmitStatus, "Votre panier est vide");
      return;
    }

    // Enrichir chaque article avec prixLivraison depuis shippingCalculations
    const shippingCalculations: Record<string, any> = JSON.parse(
      localStorage.getItem("orderShippingCalculations") || "{}"
    );
    // Le 1er article du store porte tout le totalCost, les suivants 0
    const storeFirstItem: Record<string, boolean> = {};
    const panierWithShipping = panier.map((item: any) => {
      const storeId = item.Clefournisseur?._id || item.createdBy || "unknown";
      const calc = shippingCalculations[storeId];
      let prixLivraison = 0;
      if (calc) {
        const isFirst = !storeFirstItem[storeId];
        storeFirstItem[storeId] = true;
        prixLivraison = isFirst ? (calc.totalCost || 0) : 0;
      }
      return { ...item, prixLivraison };
    });

    // Ventilation exacte des frais par boutique — sauvegardée depuis le panier
    const shippingByStore: { storeId: string; storeName: string; shippingCost: number }[] =
      JSON.parse(localStorage.getItem("orderShippingByStore") || "[]");

    try {
      // 3. Le backend recalcule la réduction, on envoie juste le promoCodeId
      const promoDiscount = PromoCodeService.getDiscount();
      const promoCodeId = PromoCodeService.getPromoCodeId();

      const finalOrderTotal = orderTotal;

      // 4. Création ou mise à jour de la commande
      const existingOrder = JSON.parse(localStorage.getItem("pendingOrder") || "null");
      const transactionId = generateUniqueID();
      handledPaymentRef.current = null;
      setTrackedTransactionId(transactionId);

      const orderData: any = {
        clefUser: userId,
        nbrProduits: panier.map((item: any) => ({
          produit: item._id,
          quantite: item.quantity,
          tailles: item.sizes,
          couleurs: item.colors,
        })),
        prix: finalOrderTotal,
        prixTotal: orderSubtotal,
        fraisLivraison: orderShippingCost,
        reduction: promoDiscount,
        statusPayment: PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment)
          ? "payé à la livraison" : PaymentMethods.ASSISTED_PAYMENT.includes(selectedPayment)
          ? "payé par téléphone"
          : "en_attente",
        reference: transactionId,
        livraisonDetails: {
          customerName: deliveryInfo.name,
          email: deliveryInfo.email || null,
          region: deliveryInfo.region,
          quartier: deliveryInfo.quartier,
          numero: deliveryInfo.countryCode + deliveryInfo.numero,
          description: deliveryInfo.description,
        },
        prod: panierWithShipping,
        shippingByStore,
        ...(selectedZone?._id && { customerZoneId: selectedZone._id }),
        ...(promoCodeId && {
          codePro: true,
          idCodePro: promoCodeId,
        }),
        ...(pointsToUse > 0 && { pointsToUse }),
      };

      if (existingOrder) {
        orderData.oldReference = existingOrder.transactionId;
        orderData.newReference = transactionId;
      }

      await axios.post(`${BackendUrl}/createOrUpdateAddress`, {
        ...deliveryInfo,
        numero: deliveryInfo.countryCode + deliveryInfo.numero, // Numéro complet international
        email: deliveryInfo.email !== "" ? deliveryInfo.email : null,
        clefUser: userId,
      });

      const orderResult = await OrderManager.createOrUpdateOrder(
        orderData,
        existingOrder
      );
      if (orderResult.error) {
        AlertService.showAlert(setSubmitStatus, orderResult.error);
        return;
      }

      // 5. Traitement du paiement
      if (!(PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment) || PaymentMethods.ASSISTED_PAYMENT.includes(selectedPayment))) {
        const paymentStatus = await OrderManager.processPayment(
          selectedPayment,
          transactionId,
          finalOrderTotal
        );

        if (
          !paymentStatus ||
          typeof paymentStatus !== "object" ||
          !("status" in paymentStatus) 
        ) {
          AlertService.showAlert(
            setSubmitStatus,
            "Le paiement a échoué. Veuillez réessayer."
          );
          return;
        }

        // Appel de vérification (polling) pour les paiements électroniques
        if (typeof window !== 'undefined') {
          localStorage.setItem("paymentInitiated", JSON.stringify({
             transactionId,
             method: selectedPayment,
             timestamp: Date.now()
          }));
        }
        setTrackedTransactionId(transactionId);
        handledPaymentRef.current = null;
        checkPendingPayment2(transactionId);
        return;
      }

      // 6. Nettoyage et succès IMMÉDIAT pour Paiement à la Livraison ou Assisté
      ["panier", "orderTotal", "orderSubtotal", "orderShippingCost", "paymentInfo", "pendingOrder", "orderShippingZone", "orderShippingCalculations", "orderShippingByStore", "orderCodeP", "pendingOrderBP"].forEach((key) =>
        localStorage.removeItem(key)
      );

      // 7. Succès
      setSubmitStatus({
        loading: false,
        error: null,
        success: true,
      });
      setPaiementProduit(true);

      AlertService.showAlert(
        setSubmitStatus,
        "Commande effectuée avec succès!",
        "success"
      );

      if (PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment) || PaymentMethods.ASSISTED_PAYMENT.includes(selectedPayment)) {
        router.push("/commandes");
      }
    } catch (error) {
      console.log(error);
      AlertService.showAlert(
        setSubmitStatus,
        (error as any).response?.data?.message ||
        "Une erreur est survenue lors du traitement de votre commande"
      );
    }
  };

  // Service de paiement unifié
  const PaymentService = {
    handlePaymentError(error: any, setSubmitStatus: any, customMessage: string | null = null) {
      console.error("Erreur de paiement:", error);
      setSubmitStatus({
        loading: false,
        error:
          error?.response?.data?.message ||
          customMessage ||
          "Une erreur est survenue lors du paiement",
        success: false,
      });
      AlertService.showAlert(
        setSubmitStatus,
        error?.response?.data?.message ||
        "Le paiement a échoué. Veuillez réessayer."
      );
    },

    showPaymentMessage(message: string, type = "info") {
      if (type === "alert") {
        alert(message);
      }
      setMessage(message);
    },

    async processCardPayment(
      transactionId: string,
      cardDetails: any,
      orderTotal: number,
      setSubmitStatus: any
    ) {
      const cardData = {
        cardNumber:
          String(cardDetails.number || "")
            .replace(/\s|-/g, "")
            .match(/.{1,4}/g)
            ?.join("-") || "",
        expiryDate: cardDetails.expiry,
        cvv: cardDetails.cvc,
        amount: orderTotal,
        payerName: user?.name,
        externalRef: transactionId,
        browserInfo: {
          javaEnabled: false,
          javascriptEnabled: true,
          screenHeight: window.screen.height,
          screenWidth: window.screen.width,
          TZ: new Date().getTimezoneOffset() / -60,
          challengeWindowSize: "05",
        },
      };

      try {
        this.showPaymentMessage(
          "Une fenêtre de paiement va s'ouvrir. Veuillez autoriser les popups si nécessaire.",
          "alert"
        );

        const paymentWindow = window.open(
          "",
          "_blank",
          "width=800,height=600,scrollbars=yes,resizable=yes,top=50,left=50"
        );

        const response = await axios.post(
          `${BackendUrl}/pay-with-card`,
          cardData
        );

        if (!response.data.success || !response.data.redirectUrl) {
          throw new Error("Aucune URL de redirection n'a été fournie");
        }

        if (
          !paymentWindow ||
          paymentWindow.closed ||
          typeof paymentWindow.closed === "undefined"
        ) {
          const shouldRedirect = window.confirm(
            "La fenêtre de paiement n'a pas pu s'ouvrir automatiquement. Cliquez OK pour ouvrir la page de paiement."
          );

          if (shouldRedirect) {
            const link = document.createElement("a");
            link.href = response.data.redirectUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.click();
          } else {
            throw new Error("Impossible d'ouvrir la fenêtre de paiement");
          }
        } else {
          paymentWindow.location.href = response.data.redirectUrl;
        }

        // return checkTransactionStatus2(transactionId);
      } catch (error) {
        this.handlePaymentError(
          error,
          setSubmitStatus,
          "Erreur lors du paiement par carte. Vérifiez vos informations et réessayez."
        );
        return null;
      }
    },

    async processMobilePayment(
      transactionId: string,
      selectedPayment: string,
      mobileDetails: any,
      orderTotal: number,
      setSubmitStatus: any,
      setSecurityCodeModal: any
    ) {
      const paymentData = {
        option: selectedPayment,
        phoneNumber: "+" + mobileDetails.operateur + mobileDetails.number,
        country: "niger",
        amount: orderTotal,
        externalRef: transactionId,
        staType: selectedPayment,
      };

      try {
        if (selectedPayment === "zeyna") {
          return await this.handleZeynaPayment(
            paymentData,
            setSecurityCodeModal,
            setSubmitStatus
          );
        }

        const response = await axios.post(
          `${BackendUrl}/processSTAPayment`,
          paymentData
        );

        if (response.data.code_validation) {
          this.showPaymentMessage(
            `${response.data.message} Votre code de validation : ${response.data.code_validation}`,
            "alert"
          );
        }

        return response;
      } catch (error: any) {
        console.log(error);
        this.handlePaymentError(
          error,
          setSubmitStatus,
          error?.response?.data?.message ||
          "Erreur lors du paiement mobile. Vérifiez votre numéro et réessayez."
        );
        return error;
      }
    },

    async handleZeynaPayment(
      paymentData: any,
      setSecurityCodeModal: any,
      setSubmitStatus: any
    ) {
      try {
        const securityCodeReq = await axios.post(
          `${BackendUrl}/requestZeynaCashSecurityCode`,
          { phoneNumber: paymentData.phoneNumber }
        );

        if (!securityCodeReq.data.success) {
          throw new Error(
            securityCodeReq.data.message || "Erreur lors de l'envoi du code"
          );
        }

        return new Promise((resolve) => {
          const handleSecurityCode = async (code: string) => {
            try {
              if (!code?.trim() || code.trim().length < 4) {
                setSecurityCodeModal((prev: any) => ({
                  ...prev,
                  error: "Code invalide ou manquant",
                }));
                return;
              }

              const response = await axios.post(
                `${BackendUrl}/processSTAPayment`,
                { ...paymentData, securityCode: code }
              );

              setSecurityCodeModal({ isOpen: false, code: "", error: "" });
              resolve(response);
            } catch (error: any) {
              setSecurityCodeModal((prev: any) => ({
                ...prev,
                error: error?.response?.data?.message || "Code invalide",
              }));
            }
          };

          setHandleSecuritySubmit(() => handleSecurityCode);
          setSecurityCodeModal({
            isOpen: true,
            code: "",
            error: "",
          });
        });
      } catch (error) {
        this.handlePaymentError(error, setSubmitStatus);
        return error;
      }
    },

    async processMobileMoneyPayment(
      transactionId: string,
      mobileDetails: any,
      orderTotal: number,
      setSubmitStatus: any
    ) {
      try {
        const paymentData = {
          operator: "airtel",
          amount: orderTotal,
          phoneNumber: mobileDetails.number,
          payerName: user?.name,
          externalRef: transactionId,
        };

        const response = await axios.post(
          `${BackendUrl}/processMobilePayment`,
          paymentData
        );

        this.showPaymentMessage(response.data.message, "alert");
        return response;
      } catch (error) {
        this.handlePaymentError(
          error,
          setSubmitStatus,
          "Erreur lors du paiement Mobile Money. Vérifiez votre numéro et réessayez."
        );
        return null;
      }
    },
  };

  // Utilisation
  const processCardPayment = (transactionId: string) =>
    PaymentService.processCardPayment(
      transactionId,
      cardDetails,
      orderTotal,
      setSubmitStatus
    );

  const processMobilePayment = (transactionId: string) =>
    PaymentService.processMobilePayment(
      transactionId,
      selectedPayment,
      mobileDetails,
      orderTotal,
      setSubmitStatus,
      setSecurityCodeModal
    );

  const processMobileMoneyPayment = (transactionId: string) =>
    PaymentService.processMobileMoneyPayment(
      transactionId,
      mobileDetails,
      orderTotal,
      setSubmitStatus
    );

  const normalizePaymentStatus = (rawStatus?: string) => {
    const status = (rawStatus || "").toString().trim().toLowerCase();

    if (
      [
        "payé",
        "paye",
        "paid",
        "success",
        "succeeded",
        "completed",
        "payé à la livraison",
        "payé par téléphone",
      ].includes(status)
    ) {
      return "succeeded";
    }

    if (["échec", "echec", "failed", "cancelled", "canceled", "rejected"].includes(status)) {
      return "failed";
    }

    return "pending";
  };

  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const response = await axios.get(`${BackendUrl}/getCommandeByReference/${transactionId}`);
      const order = response?.data?.commande;
      const normalizedStatus = normalizePaymentStatus(order?.statusPayment);

      return {
        isCompleted: normalizedStatus !== "pending",
        isSuccessful: normalizedStatus === "succeeded",
      };
    } catch (error) {
      console.error("Erreur lors de la vérification du statut de commande:", error);
      return { isCompleted: false, isSuccessful: false };
    }
  };

  // Dans useEffect pour vérifier au rechargement
  useEffect(() => {
    const checkPendingPayment = async () => {
      if (typeof window === 'undefined') return;

      const pendingPayment = localStorage.getItem("paymentInitiated");
      if (pendingPayment) {
        const { transactionId, method, timestamp } = JSON.parse(pendingPayment);

        // Ignorer les sessions de paiement de plus de 30 minutes
        if (timestamp && Date.now() - timestamp > 30 * 60 * 1000) {
          localStorage.removeItem("paymentInitiated");
          return;
        }

        setTrackedTransactionId(transactionId);
        handledPaymentRef.current = null;

        // NE PAS POLER si c'est un paiement manuel
        if (PaymentMethods.CASH_ON_DELIVERY.includes(method) || PaymentMethods.ASSISTED_PAYMENT.includes(method)) {
          localStorage.removeItem("paymentInitiated");
          return;
        }

        setSubmitStatus({ loading: true, error: null, success: false });
        try {
          const status = await checkTransactionStatus(transactionId);
          if (handledPaymentRef.current === transactionId) {
            return;
          }

          if (!status.isCompleted) {
            setSubmitStatus({
              loading: false,
              error: "Paiement en attente de confirmation iPay.",
              success: false,
            });
            return;
          }

          if (status.isCompleted && status.isSuccessful) {
            if (typeof window !== 'undefined' && typeof (window as any).onCloseIpayCheckout === "function") {
              (window as any).onCloseIpayCheckout();
            }
            localStorage.removeItem("panier");
            localStorage.removeItem("orderTotal");
            localStorage.removeItem("paymentInfo");
            localStorage.removeItem("pendingOrder");
            localStorage.removeItem("orderShippingZone");
            localStorage.removeItem("orderShippingCalculations");
            localStorage.removeItem("orderShippingByStore");

            if (orderCodeP?.isValide) {
              await axios.put(`${BackendUrl}/updateCodePromo`, {
                codePromoId: orderCodeP._id,
                isValide: false,
              });
              localStorage.removeItem("orderCodeP");
            }

            setSubmitStatus({
              loading: false,
              error: "Paiement effectué avec succès",
              success: true,
            });
            setPaiementProduit(true);
            localStorage.removeItem("paymentInitiated");
            router.push(`/commandesReference?transactionId=${transactionId}&status=succeeded&amount=${orderTotal}`);
          } else {
            if (typeof window !== 'undefined' && typeof (window as any).onCloseIpayCheckout === "function") {
              (window as any).onCloseIpayCheckout();
            }
            setSubmitStatus({
              loading: false,
              error: "Le paiement a échoué. Veuillez réessayer.",
              success: false,
            });
            setOnSubmit(false);
            localStorage.removeItem("paymentInitiated");
            router.push(`/commandesReference?transactionId=${transactionId}&status=failed&amount=${orderTotal}`);
          }
        } catch (error) {
          console.error("Erreur lors de la reprise de vérification du paiement:", error);
          setSubmitStatus({
            loading: false,
            error: "Impossible de vérifier le paiement pour le moment.",
            success: false,
          });
        }
      }
    };

    checkPendingPayment();
  }, []);

  useEffect(() => {
    if (!BackendUrl || !trackedTransactionId || typeof window === "undefined") {
      return;
    }

    const socket: Socket = io(BackendUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });

    const handleConnect = () => {
      socket.emit("payment:join", { reference: trackedTransactionId });
    };

    const handlePaymentStatus = async (event: any) => {
      const eventReference = event?.externalReference || event?.reference;
      if (eventReference !== trackedTransactionId) {
        return;
      }

      if (handledPaymentRef.current === trackedTransactionId) {
        return;
      }

      if (event?.status === "succeeded") {
        if (typeof window !== 'undefined' && typeof (window as any).onCloseIpayCheckout === "function") {
          (window as any).onCloseIpayCheckout();
        }
        await clearSuccessfulPaymentState(trackedTransactionId);
        AlertService.showAlert(setSubmitStatus, "Paiement validé par le webhook", "success");
        router.push(`/commandesReference?transactionId=${trackedTransactionId}&status=succeeded&amount=${orderTotal}`);
      } else if (event?.status === "failed") {
        handledPaymentRef.current = trackedTransactionId;
        if (typeof window !== 'undefined' && typeof (window as any).onCloseIpayCheckout === "function") {
          (window as any).onCloseIpayCheckout();
        }
        setSubmitStatus({
          loading: false,
          error: "Le paiement a échoué (confirmation reçue par webhook).",
          success: false,
        });
        setOnSubmit(false);
        router.push(`/commandesReference?transactionId=${trackedTransactionId}&status=failed&amount=${orderTotal}`);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("payment:status", handlePaymentStatus);

    return () => {
      socket.emit("payment:leave", { reference: trackedTransactionId });
      socket.off("connect", handleConnect);
      socket.off("payment:status", handlePaymentStatus);
      socket.disconnect();
    };
  }, [BackendUrl, trackedTransactionId, clearSuccessfulPaymentState, router]);

  const checkPendingPayment2 = async (transactionId: string) => {
    setSubmitStatus({ loading: true, error: null, success: false });
    setMessage("vérification du paiement en cours");
    try {
      const status = await checkTransactionStatus(transactionId);
      if (handledPaymentRef.current === transactionId) {
        return;
      }
      if (status.isCompleted && status.isSuccessful) {
        if (typeof window !== 'undefined' && typeof (window as any).onCloseIpayCheckout === "function") {
          (window as any).onCloseIpayCheckout();
        }
        setSubmitStatus({
          loading: false,
          error: "Paiement effectué avec succès",
          success: true,
        });
        setPaiementProduit(true);
        localStorage.removeItem("paymentInitiated");
        router.push(`/commandesReference?transactionId=${transactionId}&status=succeeded&amount=${orderTotal}`);
      } else if (!status.isCompleted) {
        setMessage("Paiement en attente: veuillez valider sur iPay.");
        setSubmitStatus({ loading: false, error: "Paiement en attente de confirmation iPay.", success: false });
        return;
      } else {
        if (typeof window !== 'undefined' && typeof (window as any).onCloseIpayCheckout === "function") {
          (window as any).onCloseIpayCheckout();
        }
        setSubmitStatus({
          loading: false,
          error: "Le paiement a échoué. Veuillez réessayer.",
          success: false,
        });
        setOnSubmit(false);
        localStorage.removeItem("paymentInitiated");
        router.push(`/commandesReference?transactionId=${transactionId}&status=failed&amount=${orderTotal}`);
      }
    } finally {
      setSubmitStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const getPaymentDescription = () => {
    switch (selectedPayment) {
      case "master Card":
        return "Paiement sécurisé immédiat. Vos données sont chiffrées.";
      case "Visa":
        return "Paiement sécurisé immédiat. Vos données sont chiffrées.";
      case "Mobile Money":
        return "Vous recevrez un code de confirmation par SMS.";
      case "payé à la livraison":
        return "Un agent se déplacera sous 24-48h. Paiement en espèces ou carte.";
      case "paiement_assiste":
        return "Vous serez contacté rapidement par un conseiller pour effectuer le paiement en toute sécurité.🤝";
      case "mynita":
        return "Notification via l'app MyNita pour finaliser le paiement.";
      case "zeyna":
        return "Code USSD envoyé sur votre téléphone pour finaliser.";
      case "amana":
        return "Lien de paiement envoyé par SMS. Confirmation instantanée.";
      default:
        return "Sélectionnez un mode de paiement pour continuer.";
    }
  };

  // Formater automatiquement le numéro de carte
  const formatCardNumber = (value: string) => {
    const v = String(value)
      .replace(/\s+/g, "")
      .replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  return (
    <>
      <LoadingIndicator
        text={message?.length > 0 ? message : undefined}
        loading={submitStatus.loading}
      >
        <div className="min-h-screen flex justify-center items-center">
          <div className="container rounded-lg p-2 overflow-hidden">
            {submitStatus.error && (
              <div className={`mb-4 p-1 rounded bg-red-100 text-red-700`}>
                <p className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {submitStatus.error}
                </p>
              </div>
            )}
            {submitStatus.success && (
              <div className={`mb-4 p-1 rounded bg-green-100 text-green-700`}>
                <p className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Commande enregistrée avec succès
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-4 mx-auto">
              {/* Première carte - Informations de livraison */}
              <div className="w-full p-4 sm:p-6 md:p-3 transition-all duration-300">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#B17236] border-b-2 border-[#30A08B] pb-2 mb-4">
                  Informations de livraison
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={deliveryInfo.name}
                      onChange={handleDeliveryChange}
                      className="mt-1 p-3 border border-gray-300 rounded-lg w-full"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={deliveryInfo.email}
                      onChange={handleDeliveryChange}
                      className="mt-1 p-3 border border-gray-300 rounded-lg w-full"
                      placeholder="Votre email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="numero"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Numéro de téléphone
                    </label>
                    <div className="mt-1 flex">
                      {/* Sélecteur d'indicatif de pays */}
                      <select
                        name="countryCode"
                        value={deliveryInfo.countryCode}
                        onChange={handleDeliveryChange}
                        className="p-3 border border-gray-300 rounded-l-lg bg-gray-50 text-sm w-32"
                      >
                        {COUNTRY_CODES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      {/* Champ de numéro */}
                      <input
                        type="tel"
                        id="numero"
                        name="numero"
                        value={deliveryInfo.numero}
                        onChange={handleDeliveryChange}
                        className="flex-1 p-3 border border-l-0 border-gray-300 rounded-r-lg"
                        placeholder="87727501"
                        maxLength={15}
                      />
                    </div>
                    {/* Affichage du numéro complet */}
                    {deliveryInfo.numero && (
                      <p className="text-xs text-gray-500 mt-1">
                        Numéro complet: {deliveryInfo.countryCode}{deliveryInfo.numero}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Région {selectedZone && "(sélectionnée dans le panier)"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="region"
                        name="region"
                        value={deliveryInfo.region}
                        onChange={handleDeliveryChange}
                        readOnly={!!selectedZone}
                        className={`mt-1 p-3 border border-gray-300 rounded-lg w-full ${selectedZone
                          ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                          : 'bg-white'
                          }`}
                        placeholder="Votre région"
                      />
                      {selectedZone && (
                        <button
                          type="button"
                          onClick={handleReturnToCart}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-[#30A08B] text-white px-2 py-1 rounded hover:bg-[#30A08B]/80 transition-colors"
                        >
                          Modifier
                        </button>
                      )}
                    </div>
                    {selectedZone && (
                      <p className="text-xs text-gray-500 mt-1">
                        Zone sélectionnée: {
                          selectedZone.fullPath ||
                          (selectedZone.country && selectedZone.region && selectedZone.name
                            ? `${selectedZone.country} > ${selectedZone.region} > ${selectedZone.name}`
                            : selectedZone.name)
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="quartier"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Quartier
                    </label>
                    <input
                      type="text"
                      id="quartier"
                      name="quartier"
                      value={deliveryInfo.quartier}
                      onChange={handleDeliveryChange}
                      className="mt-1 p-3 border border-gray-300 rounded-lg w-full"
                      placeholder="Votre quartier ou précision d'adresse"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Instructions de livraison
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={deliveryInfo.description}
                      onChange={handleDeliveryChange}
                      rows={3}
                      className="mt-1 p-3 border border-gray-300 rounded-lg w-full"
                      placeholder="Instructions supplémentaires pour la livraison"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Points Baobab */}
              <PointsRedeemWidget
                orderAmountFcfa={orderSubtotal}
                initialPoints={pointsToUse}
                onPointsChange={(pts, disc) => {
                  setPointsToUse(pts);
                  setPointsDiscount(disc);
                }}
              />

              {/* Deuxième carte - Méthode de paiement */}
              <PaiementPage
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                cardDetails={cardDetails}
                setCardDetails={setCardDetails}
                mobileDetails={mobileDetails}
                setMobileDetails={setMobileDetails}
                submitStatus={submitStatus}
                setSubmitStatus={setSubmitStatus}
                onSubmit={onSubmit}
                setOnSubmit={setOnSubmit}
                validatePaymentInfo={validatePaymentInfo}
                handlePress={handlePress}
                handlePaymentSubmit={handlePaymentSubmit}
                getPaymentDescription={getPaymentDescription}
                formatCardNumber={formatCardNumber}
              />
            </div>

            <motion.button
              onClick={handlePaymentSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 bg-[#30A08B] text-white p-3 rounded-lg w-full shadow-md hover:bg-opacity-90 transition-all duration-300"
            >
              {submitStatus.loading ? (
                <div style={spinnerStyle} className="animate-spin"></div>
              ) : (
                <span>
                  Confirmer la commande{" "}
                  {pointsDiscount > 0 ? (
                    <>
                      <span className="line-through opacity-60">{orderTotal.toLocaleString('fr-FR')}</span>{" "}
                      {(orderTotal - pointsDiscount).toLocaleString('fr-FR')}
                    </>
                  ) : orderTotal.toLocaleString('fr-FR')}{" "}
                  FCFA
                </span>
              )}
            </motion.button>

            {paiementProduit && (
              <div className="min-h-screen flex justify-center items-center bg-black bg-opacity-10 fixed inset-0 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto text-center">
                  <div className="flex justify-center mb-4">
                    <Check className="h-12 w-12 text-green-600 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-semibold text-green-800 mb-2">
                    Commande confirmée !
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Merci pour votre commande. Vous recevrez bientôt un e-mail
                    de confirmation.
                  </p>
                  <button
                    onClick={() => router.push("/commandes")}
                    className="w-full bg-[#30A08B] text-white py-2 rounded-lg font-semibold hover:bg-[#30A08B]/90 transition duration-200"
                  >
                    Mes commandes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </LoadingIndicator>
      <SecurityCodeModal
        isOpen={securityCodeModal.isOpen}
        onClose={() => {
          setSecurityCodeModal({ isOpen: false, code: "", error: "" });
          setHandleSecuritySubmit(null);
          setSubmitStatus({
            loading: false,
            error: "Paiement annulé",
            success: false,
          });
        }}
        onSubmit={handleSecuritySubmit || (() => { })}
        error={securityCodeModal.error}
      />
    </>
  );
};

export default OrderConfirmation;