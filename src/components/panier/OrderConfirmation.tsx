"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, Check, User, Mail, MapPin, Home, MessageSquare, Lock, ShoppingCart, Shield, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
  applyPhoneInputChange,
  parseStoredPhone,
  validatePhone,
  toE164,
  formatPhoneInternational,
  getPhonePlaceholder,
} from "@/lib/phoneRules";
import { io, Socket } from "socket.io-client";
import LoadingIndicator from "@/components/LoadingIndicator";
import PaiementPage from "./PaiementPage";
import PointsRedeemWidget from "@/components/wallet/PointsRedeemWidget";
import ZoneSelector from "./ZoneSelector";
import GuestOtpModal from "@/components/guest/GuestOtpModal";
import GuestOrderSuccess from "@/components/guest/GuestOrderSuccess";
import { ensureGuestSession, getGuestSession, OFFLINE_PAYMENTS } from "@/lib/guestSession";
import { CartQuote, getZones, quoteCart, rememberZone, zoneLabel, ZoneV3 } from "@/lib/shippingV3";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// Liste des indicatifs de pays les plus courants
// Indicatifs, longueurs et formats : règle commune web/mobile (src/lib/phoneRules.ts)
const countryOfDial = (dialCode: string) =>
  PHONE_COUNTRIES.find((c) => c.dialCode === dialCode) || DEFAULT_PHONE_COUNTRY;

// Utilitaires
const PaymentMethods = {
  CARD: ["Visa", "master Card", "paiement_en_ligne"],
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
  /** Commande sans compte (choisie au panier) */
  guest?: boolean;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ acces, initialBP, guest = false }) => {
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
    landmark: "",
  });
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [shippingQuote, setShippingQuote] = useState<CartQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null as string | null,
    success: false,
  });
  const [paiementProduit, setPaiementProduit] = useState(false);
  const [trackedTransactionId, setTrackedTransactionId] = useState<string | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  // Commande sans compte : vérification du numéro (si nécessaire) et commande créée
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpReason, setOtpReason] = useState("");
  const [createdOrder, setCreatedOrder] = useState<{ reference: string; trackingToken: string } | null>(null);
  const resumeAfterOtp = useRef(false);
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
    if (!guest) return;
    const g = getGuestSession();
    if (!g) return;
    const parsed = parseStoredPhone(g.phone);
    setDeliveryInfo((prev) => ({
      ...prev,
      name: prev.name || g.name || "",
      numero: prev.numero || parsed.digits,
      countryCode: prev.numero ? prev.countryCode : parsed.country.dialCode,
    }));
  }, [guest]);

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

  // Devis v3 : recalculé au montage et à chaque changement de zone (prix affiché = prix facturé)
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedZone?._id) return;
    const panier: any[] = (() => { try { return JSON.parse(localStorage.getItem("panier") || "[]"); } catch { return []; } })();
    if (!panier.length) return;
    let alive = true;
    setQuoteLoading(true);
    (async () => {
      try {
        const q = await quoteCart(selectedZone._id, panier.filter((i) => i._id).map((i) => ({ productId: String(i._id), quantity: i.quantity || 1 })));
        if (!alive) return;
        setShippingQuote(q);
        const calcs: Record<string, any> = {};
        for (const p of q.parcels) calcs[p.sellerId] = { totalCost: p.deliverable ? p.fee || 0 : 0, delay: p.delay?.label || null, quoteRequired: p.quoteRequired };
        localStorage.setItem("orderShippingCalculations", JSON.stringify(calcs));
        localStorage.setItem("orderShippingByStore", JSON.stringify(q.parcels.map((p) => ({ storeId: p.sellerId, storeName: p.storeName, shippingCost: p.deliverable ? p.fee || 0 : 0, delay: p.delay?.label || null, quoteRequired: p.quoteRequired }))));
        const currentSubtotal = (() => { try { return parseFloat(localStorage.getItem("orderSubtotal") || "0"); } catch { return 0; } })();
        const savedCodeP = (() => { try { return JSON.parse(localStorage.getItem("orderCodeP") || "null"); } catch { return null; } })();
        const promoDiscount = savedCodeP?.isValide ? (savedCodeP.discount || 0) : 0;
        const freshTotal = Math.max(0, currentSubtotal - promoDiscount + q.totalFee);
        setOrderShippingCost(q.totalFee);
        setOrderTotal(freshTotal);
        localStorage.setItem("orderShippingCost", String(q.totalFee));
        localStorage.setItem("orderTotal", String(freshTotal));
      } catch {
        if (alive) setShippingQuote(null);
      } finally {
        if (alive) setQuoteLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedZone?._id]);

  const changeZone = (z: ZoneV3, meta?: { location?: { lat: number; lng: number; accuracy: number } }) => {
    setSelectedZone(z);
    rememberZone(z);
    localStorage.setItem("orderShippingZone", JSON.stringify(z));
    if (meta?.location) setDeliveryLocation(meta.location);
  };

  const blockedParcels = (shippingQuote?.parcels || []).filter((p) => !p.deliverable && !p.quoteRequired);

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
            const parsed = parseStoredPhone(address.numero.toString());
            countryCode = parsed.country.dialCode;
            phoneNumber = parsed.digits;
          }

          setDeliveryInfo({
            name: address.name || "",
            email: address.email || "",
            numero: phoneNumber,
            countryCode: countryCode,
            region: regionValue,
            quartier: address.quartier || "",
            description: address.description || "",
            landmark: address.landmark || "",
          });
          if (address.location?.lat != null) setDeliveryLocation(address.location);
          // Zone enregistrée avec l'adresse, si le panier n'en a pas fourni
          if (!selectedZone && address.zoneId) {
            const z = (await getZones()).find((x) => x._id === String(address.zoneId));
            if (z) changeZone(address.localityName ? { ...z, localityName: address.localityName } : z);
          }
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

    // Longueur et format selon l'indicatif choisi (règle commune)
    const phoneCheck = validatePhone(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero, true);
    if (!phoneCheck.isValid) {
      errors.push(phoneCheck.message);
    }

    if (!selectedZone?._id) {
      errors.push("Choisissez votre quartier ou votre ville de livraison");
    }

    if (blockedParcels.length) {
      errors.push(`${blockedParcels[0].storeName} : ${blockedParcels[0].message || "livraison indisponible dans votre zone"}`);
    }

    if (shippingQuote?.quoteRequired && !(PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment) || PaymentMethods.ASSISTED_PAYMENT.includes(selectedPayment))) {
      errors.push("Livraison sur devis : choisissez le paiement à la livraison ou le paiement assisté");
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
      // Chiffres nationaux uniquement ; un numéro international collé change l'indicatif
      setDeliveryInfo((prev) => {
        const next = applyPhoneInputChange(countryOfDial(prev.countryCode), value);
        return { ...prev, numero: next.digits, countryCode: next.country.dialCode };
      });
    } else if (name === 'countryCode') {
      setDeliveryInfo((prev) => ({
        ...prev,
        countryCode: value,
        numero: applyPhoneInputChange(countryOfDial(value), prev.numero).digits,
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
    if (!userId && !guest) {
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

    // 1b. Commande sans compte : session liée au numéro, code SMS seulement si nécessaire
    if (guest && !userId) {
      const guestPhone = toE164(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero);
      try {
        const r = await ensureGuestSession(guestPhone, deliveryInfo.name);
        const offline = OFFLINE_PAYMENTS.includes(
          PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment) ? "payé à la livraison"
            : PaymentMethods.ASSISTED_PAYMENT.includes(selectedPayment) ? "payé par téléphone" : ""
        );
        if (r.accountExists || (offline && !r.session?.verified)) {
          setOtpReason(r.accountExists
            ? "Ce numéro a déjà un compte. Confirmez-le par SMS pour commander sans vous connecter."
            : "Pour le paiement à la livraison, nous vérifions votre numéro une seule fois.");
          resumeAfterOtp.current = true;
          setSubmitStatus({ loading: false, error: null, success: false });
          setOtpOpen(true);
          return;
        }
      } catch (e: any) {
        AlertService.showAlert(setSubmitStatus, e?.response?.data?.message || "Impossible de démarrer la commande. Réessayez.");
        return;
      }
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
      // Codes promo et Baobab Points : réservés aux comptes
      const promoDiscount = guest && !userId ? 0 : PromoCodeService.getDiscount();
      const promoCodeId = guest && !userId ? null : PromoCodeService.getPromoCodeId();

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
          quartier: deliveryInfo.quartier || selectedZone?.name,
          numero: toE164(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero),
          description: deliveryInfo.description,
          zoneId: selectedZone?._id,
          localityName: selectedZone?.localityName || "",
          landmark: deliveryInfo.landmark,
          ...(deliveryLocation ? { location: deliveryLocation } : {}),
        },
        prod: panierWithShipping,
        shippingByStore,
        ...(selectedZone?._id && { customerZoneId: selectedZone._id }),
        ...(promoCodeId && {
          codePro: true,
          idCodePro: promoCodeId,
        }),
        ...(pointsToUse > 0 && !(guest && !userId) && { pointsToUse }),
      };

      if (existingOrder) {
        orderData.oldReference = existingOrder.transactionId;
        orderData.newReference = transactionId;
      }

      if (userId) await axios.post(`${BackendUrl}/createOrUpdateAddress`, {
        ...deliveryInfo,
        zoneId: selectedZone?._id,
        localityName: selectedZone?.localityName || "",
        ...(deliveryLocation ? { location: deliveryLocation } : {}),
        numero: toE164(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero), // Numéro complet international
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
      if (orderResult.commande?.reference && orderResult.commande?.trackingToken) {
        setCreatedOrder({ reference: orderResult.commande.reference, trackingToken: orderResult.commande.trackingToken });
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
      case "paiement_en_ligne":
        return "Paiement sécurisé en ligne. Carte bancaire (Visa, Mastercard), Mobile Money, MyNita et Amanata acceptés. Vous serez redirigé vers notre page de paiement sécurisée.";
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
        <div className="min-h-screen bg-gray-50/60 py-4 lg:py-8 px-4 pb-28 lg:pb-8">
          <div className="max-w-5xl mx-auto">

            {/* Alerts */}
            {submitStatus.error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{submitStatus.error}</p>
              </div>
            )}
            {submitStatus.success && (
              <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
                <Check className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">Commande enregistrée avec succès</p>
              </div>
            )}

            {/* En-tête mobile */}
            <div className="lg:hidden mb-4">
              <h1 className="text-lg font-bold text-gray-800">Finaliser la commande</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-[#30A08B] font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#30A08B] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  Livraison
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <div className="flex items-center gap-1.5 text-xs text-[#B17236] font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#B17236] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  Paiement
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

              {/* ── Barre latérale — en tête sur mobile (order-first), à droite sur desktop ── */}
              <div className="flex flex-col gap-3 lg:gap-4 order-first lg:order-last lg:col-start-3 lg:row-start-1 lg:row-span-2">

                {/* Résumé de la commande */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-4 w-4 text-[#30A08B]" />
                    <h3 className="text-sm font-semibold text-gray-700">Résumé de la commande</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Sous-total</span>
                      <span className="font-medium text-gray-700">{(orderSubtotal ?? orderTotal)?.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between text-[#30A08B]">
                        <span className="flex items-center gap-1">🌳 Réduction Baobab</span>
                        <span className="font-medium">−{pointsDiscount.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                    <div className="border-t border-dashed border-gray-100 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total à payer</span>
                      <span className="font-bold text-[#B17236] text-lg">{(orderTotal - pointsDiscount).toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span></span>
                    </div>
                  </div>
                </div>

                {/* Points Baobab (comptes uniquement) */}
                {!guest && <PointsRedeemWidget
                  orderAmountFcfa={orderSubtotal}
                  initialPoints={pointsToUse}
                  onPointsChange={(pts, disc) => {
                    setPointsToUse(pts);
                    setPointsDiscount(disc);
                  }}
                />}

                {/* Sécurité — desktop uniquement */}
                <div className="hidden lg:block bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-semibold">Paiement 100% sécurisé</span>
                  </div>
                  <p className="text-xs text-gray-400">Vos données sont chiffrées et protégées</p>
                </div>
              </div>

              {/* ── Colonne principale (2/3) ── */}
              <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-5">

                {/* Étape 1 — Livraison */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#30A08B] to-[#269078] flex items-center justify-center text-white text-sm font-bold shadow-sm">1</div>
                    <h2 className="text-base font-semibold text-gray-800">Informations de livraison</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#30A08B]/20 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nom */}
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nom complet</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                        <input
                          type="text" id="name" name="name"
                          value={deliveryInfo.name} onChange={handleDeliveryChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                          placeholder="Votre nom complet"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                        <input
                          type="email" id="email" name="email"
                          value={deliveryInfo.email} onChange={handleDeliveryChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                          placeholder="Votre email"
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label htmlFor="numero" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Téléphone</label>
                      <div className="flex">
                        <select
                          name="countryCode" value={deliveryInfo.countryCode} onChange={handleDeliveryChange}
                          className="py-3 px-2 bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] w-28"
                        >
                          {PHONE_COUNTRIES.map((c) => (
                            <option key={c.iso} value={c.dialCode}>{c.flag} {c.dialCode}</option>
                          ))}
                        </select>
                        <input
                          type="tel" id="numero" name="numero"
                          value={applyPhoneInputChange(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero).display} onChange={handleDeliveryChange}
                          inputMode="tel" autoComplete="tel-national"
                          className="flex-1 pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                          placeholder={getPhonePlaceholder(countryOfDial(deliveryInfo.countryCode))}
                        />
                      </div>
                      {deliveryInfo.numero && (
                        <p className="text-xs text-gray-400 mt-1 pl-1">{formatPhoneInternational(toE164(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero))}</p>
                      )}
                    </div>

                    {/* Zone de livraison */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Quartier ou ville de livraison
                      </label>
                      <ZoneSelector selectedZone={selectedZone as ZoneV3 | null} onSelect={changeZone} className="w-full" />
                      {selectedZone ? (
                        <div className="mt-2 space-y-1">
                          {quoteLoading ? (
                            <p className="text-xs text-gray-400 pl-1">Calcul des frais…</p>
                          ) : shippingQuote ? (
                            shippingQuote.parcels.map((p) => (
                              <p key={p.sellerId} className={`text-xs pl-1 flex items-center gap-1.5 ${p.deliverable ? "text-gray-500" : p.quoteRequired ? "text-amber-700" : "text-red-600"}`}>
                                <Truck className="h-3.5 w-3.5 flex-shrink-0 text-[#30A08B]" />
                                <span className="truncate">
                                  {p.storeName} · {p.origin?.name || "?"} → {zoneLabel(selectedZone).title}
                                  {p.deliverable ? ` · ${p.delay?.label || ""} · ${p.free ? "offerte" : `${(p.fee || 0).toLocaleString("fr-FR")} F`}` : ` · ${p.message || "non livrable"}`}
                                </span>
                              </p>
                            ))
                          ) : null}
                          {deliveryLocation ? <p className="text-xs text-[#30A08B] pl-1">📍 Position enregistrée pour le livreur</p> : null}
                        </div>
                      ) : null}
                    </div>

                    {/* Point de repère */}
                    <div className="sm:col-span-2">
                      <label htmlFor="landmark" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Point de repère <span className="normal-case font-normal text-gray-400">(recommandé)</span>
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                        <input
                          type="text" id="landmark" name="landmark" maxLength={200}
                          value={deliveryInfo.landmark} onChange={handleDeliveryChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                          placeholder="Ex. derrière la pharmacie, portail bleu, près de la mosquée"
                        />
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Instructions <span className="normal-case font-normal text-gray-400">(optionnel)</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-300 pointer-events-none" />
                        <textarea
                          id="description" name="description"
                          value={deliveryInfo.description} onChange={handleDeliveryChange}
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B] focus:bg-white transition-all duration-200 placeholder:text-gray-300 resize-none"
                          placeholder="Instructions supplémentaires pour la livraison"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 2 — Paiement */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 px-6 pt-6">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B17236] to-[#9A6130] flex items-center justify-center text-white text-sm font-bold shadow-sm">2</div>
                    <h2 className="text-base font-semibold text-gray-800">Méthode de paiement</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#B17236]/20 to-transparent" />
                  </div>
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

                {/* Bouton de confirmation — desktop uniquement */}
                <motion.button
                  onClick={handlePaymentSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitStatus.loading}
                  className="hidden lg:flex w-full py-4 rounded-2xl bg-gradient-to-r from-[#30A08B] to-[#269078] text-white font-semibold text-base shadow-lg shadow-[#30A08B]/20 hover:shadow-xl hover:shadow-[#30A08B]/30 transition-all duration-300 items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitStatus.loading ? (
                    <div style={spinnerStyle} className="animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>
                        Confirmer la commande —{" "}
                        {pointsDiscount > 0 ? (
                          <>
                            <span className="line-through opacity-60 font-normal">{orderTotal.toLocaleString('fr-FR')}</span>{" "}
                            {(orderTotal - pointsDiscount).toLocaleString('fr-FR')}
                          </>
                        ) : orderTotal.toLocaleString('fr-FR')}{" "}
                        FCFA
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky bottom bar — mobile uniquement ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total à payer</p>
              <p className="text-xl font-bold text-[#B17236] leading-tight">
                {(orderTotal - pointsDiscount).toLocaleString('fr-FR')}{" "}
                <span className="text-sm font-semibold">FCFA</span>
              </p>
            </div>
            <motion.button
              onClick={handlePaymentSubmit}
              whileTap={{ scale: 0.97 }}
              disabled={submitStatus.loading}
              className="flex-shrink-0 bg-gradient-to-r from-[#30A08B] to-[#269078] text-white font-semibold text-sm px-5 py-3.5 rounded-xl shadow-lg shadow-[#30A08B]/25 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:opacity-90 transition-all"
            >
              {submitStatus.loading ? (
                <div style={spinnerStyle} className="animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Confirmer
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Modale succès — invité : suivi + création du compte */}
        {paiementProduit && guest && !user?.id && createdOrder && (
          <div className="min-h-screen flex justify-center items-center bg-black/40 backdrop-blur-sm fixed inset-0 z-50 p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
              <GuestOrderSuccess
                reference={createdOrder.reference}
                trackingToken={createdOrder.trackingToken}
                onClose={() => router.push("/")}
              />
            </motion.div>
          </div>
        )}

        {/* Modale succès */}
        {paiementProduit && !(guest && !user?.id && createdOrder) && (
          <div className="min-h-screen flex justify-center items-center bg-black/40 backdrop-blur-sm fixed inset-0 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Commande confirmée !</h2>
              <p className="text-gray-500 text-sm mb-6">Merci pour votre commande. Vous recevrez bientôt un e-mail de confirmation.</p>
              <button
                onClick={() => router.push("/commandes")}
                className="w-full bg-gradient-to-r from-[#30A08B] to-[#269078] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-200"
              >
                Voir mes commandes
              </button>
            </motion.div>
          </div>
        )}
      </LoadingIndicator>
      <GuestOtpModal
        open={otpOpen}
        phone={toE164(countryOfDial(deliveryInfo.countryCode), deliveryInfo.numero)}
        name={deliveryInfo.name}
        reason={otpReason}
        onClose={() => { setOtpOpen(false); resumeAfterOtp.current = false; }}
        onVerified={() => {
          setOtpOpen(false);
          if (resumeAfterOtp.current) {
            resumeAfterOtp.current = false;
            setTimeout(() => handlePaymentSubmit({ preventDefault() {} } as React.FormEvent), 0);
          }
        }}
      />
      <SecurityCodeModal
        isOpen={securityCodeModal.isOpen}
        onClose={() => {
          setSecurityCodeModal({ isOpen: false, code: "", error: "" });
          setHandleSecuritySubmit(null);
          setSubmitStatus({ loading: false, error: "Paiement annulé", success: false });
        }}
        onSubmit={handleSecuritySubmit || (() => {})}
        error={securityCodeModal.error}
      />
    </>
  );
};

export default OrderConfirmation;