"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import LoadingIndicator from "@/components/LoadingIndicator";
import PaiementPage from "./PaiementPage";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// Utilitaires
const PaymentMethods = {
  CARD: ["Visa", "master Card"],
  MOBILE_WALLET: ["zeyna", "nita", "amana"],
  MOBILE_MONEY: ["Mobile Money"],
  CASH_ON_DELIVERY: ["payé à la livraison"],
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
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ acces }) => {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [message, setMessage] = useState("");
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [orderTotal, setOrderTotal] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTotal = localStorage.getItem("orderTotal");
      return savedTotal ? parseFloat(savedTotal) : 0;
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

  const spinnerStyle = {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderTop: "4px solid #FFF",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    animation: "spin 1s linear infinite",
    margin: "auto",
  };

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
          
          setDeliveryInfo({
            name: address.name || "",
            email: address.email || "",
            numero: address.numero || "",
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
    const errors = [];

    if (!selectedPayment) {
      errors.push("Veuillez choisir un moyen de paiement");
      return errors;
    }

    if (selectedPayment === "Visa") {
      const rawNum = String(cardDetails.number || "").replace(/\s|-/g, "");
      if (!/^4[0-9]{12}(?:[0-9]{3})?$/.test(rawNum)) {
        errors.push("Le numéro de la carte Visa n'est pas valide");
      }
      if (!/^[0-9]{3}$/.test(cardDetails.cvc)) {
        errors.push("Le code CVC n'est pas valide");
      }
      if (!cardDetails.expiry) {
        errors.push("Veuillez sélectionner la date d'expiration");
      }
    } else if (selectedPayment === "master Card") {
      const rawNum = String(cardDetails.number || "").replace(/\s|-/g, "");
      if (!/^5[1-5][0-9]{14}$/.test(rawNum)) {
        errors.push("Le numéro de la carte MasterCard n'est pas valide");
      }
      if (!/^[0-9]{3}$/.test(cardDetails.cvc)) {
        errors.push("Le code CVC n'est pas valide");
      }
      if (!cardDetails.expiry) {
        errors.push("Veuillez sélectionner la date d'expiration");
      }
    } else if (selectedPayment === "Mobile Money") {
      if (!/^[0-9]{8,}$/.test(mobileDetails.number)) {
        errors.push("Le format du numéro n'est pas valide");
      }
    } else if (["zeyna", "nita", "amana"].includes(selectedPayment)) {
      if (!/^[0-9]{8,}$/.test(mobileDetails.number)) {
        errors.push("Le format du numéro n'est pas valide");
      }
    }

    return errors;
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Empêcher la modification de la région si une zone est sélectionnée dans le panier
    if (name === 'region' && selectedZone) {
      return; // Ne pas permettre la modification
    }
    
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    startProgressiveChecks(transactionId);

    return response;
  };

  const startProgressiveChecks = (transactionId: string) => {
    let checkCount = 0;
    const maxChecks = 10;
    const initialDelay = 10000;

    const progressiveCheck = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const transactionInfo = JSON.parse(
          localStorage.getItem("currentTransaction") || "{}"
        );
        if (!transactionInfo || transactionInfo.id !== transactionId) return;

        checkCount++;
        const status = await checkTransactionStatus(transactionId);

        if (status.isCompleted) {
          if (status.isSuccessful) {
            await handlePaymentCallback("success", transactionId);
            setSubmitStatus({
              loading: false,
              error: null,
              success: true,
            });
          } else {
            setSubmitStatus({
              loading: false,
              error: "Le paiement n'a pas été complété",
              success: false,
            });
          }
          localStorage.removeItem("currentTransaction");
          return;
        }

        if (checkCount < maxChecks) {
          const nextDelay = initialDelay * Math.pow(1.5, checkCount - 1);
          setTimeout(progressiveCheck, nextDelay);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
      }
    };

    setTimeout(progressiveCheck, initialDelay);
  };

  // Effet pour gérer le retour de l'application mobile
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (typeof window === 'undefined') return;
      
      if (!document.hidden) {
        const transactionInfo = JSON.parse(
          localStorage.getItem("currentTransaction") || "{}"
        );
        if (!transactionInfo) return;

        const timeElapsed = Date.now() - transactionInfo.startTime;
        if (timeElapsed > 900000) {
          localStorage.removeItem("currentTransaction");
          setSubmitStatus({
            loading: false,
            error: "Le délai de paiement a expiré",
            success: false,
          });
          return;
        }

        const timeSinceLastCheck = Date.now() - transactionInfo.lastCheckTime;
        if (timeSinceLastCheck < 5000) return;

        try {
          const status = await checkTransactionStatus(transactionInfo.id);
          transactionInfo.lastCheckTime = Date.now();
          localStorage.setItem(
            "currentTransaction",
            JSON.stringify(transactionInfo)
          );

          if (status.isCompleted) {
            if (status.isSuccessful) {
              await handlePaymentCallback("success", transactionInfo.id);
              setSubmitStatus({
                loading: false,
                error: null,
                success: true,
              });
            } else {
              setSubmitStatus({
                loading: false,
                error: "Le paiement n'a pas été complété",
                success: false,
              });
            }
            localStorage.removeItem("currentTransaction");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification au retour:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

  // Service pour la gestion des codes promo
  const PromoCodeService = {
    async validateAndApply(codePromo: any, orderTotal: number, setSubmitStatus: any) {
      if (!codePromo?.isValide) return orderTotal;

      try {
        const response = await axios.get(
          `${BackendUrl}/getCodePromoById/${codePromo._id}`
        );
        const promoDetails = response.data.data;

        if (
          !promoDetails.isValide ||
          new Date(promoDetails.dateExpirate) < new Date()
        ) {
          AlertService.showAlert(
            setSubmitStatus,
            "Code promo expiré ou invalide"
          );
          return orderTotal;
        }
        if (promoDetails?.isWelcomeCode === true) {
          const reduction = (orderTotal * promoDetails?.prixReduiction) / 100;
          return orderTotal - reduction;
        }

        return orderTotal - promoDetails.prixReduiction;
      } catch (error) {
        console.error("Erreur validation code promo:", error);
        AlertService.showAlert(
          setSubmitStatus,
          "Erreur lors de la validation du code promo"
        );
        return orderTotal;
      }
    },

    async invalidatePromoCode(codePromoId: string) {
      if (!codePromoId) return;

      try {
        await axios.put(`${BackendUrl}/updateCodePromo`, {
          codePromoId,
          isValide: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem("orderCodeP");
        }
      } catch (error) {
        console.error("Erreur invalidation code promo:", error);
      }
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
      if (PaymentMethods.CARD.includes(paymentMethod)) {
        return processCardPayment(transactionId);
      } else if (PaymentMethods.MOBILE_WALLET.includes(paymentMethod)) {
        return processMobilePayment(transactionId);
      } else if (PaymentMethods.MOBILE_MONEY.includes(paymentMethod)) {
        return processMobileMoneyPayment(transactionId);
      }
      return Promise.resolve({ status: "complete" });
    },
  };

  // Version optimisée de handlePaymentSubmit avec gestion des alertes
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      // 3. Application du code promo
      const finalOrderTotal = await PromoCodeService.validateAndApply(
        orderCodeP,
        orderTotal,
        setSubmitStatus
      );

      // 4. Création ou mise à jour de la commande
      const existingOrder = JSON.parse(localStorage.getItem("pendingOrder") || "null");
      const transactionId = generateUniqueID();

      const orderData = {
        clefUser: userId,
        nbrProduits: panier.map((item: any) => ({
          produit: item._id,
          quantite: item.quantity,
          tailles: item.sizes,
          couleurs: item.colors,
        })),
        prix: finalOrderTotal,
        statusPayment: PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment)
          ? "payé à la livraison"
          : "en_attente",
        reference: transactionId,
        livraisonDetails: {
          customerName: deliveryInfo.name,
          email: deliveryInfo.email || null,
          region: deliveryInfo.region,
          quartier: deliveryInfo.quartier,
          numero: deliveryInfo.numero,
          description: deliveryInfo.description,
        },
        prod: panier,
        ...(orderCodeP?.isValide && {
          codePro: true,
          idCodePro: orderCodeP._id,
        }),
      };

      if (existingOrder) {
        orderData.oldReference = existingOrder.transactionId;
        orderData.newReference = transactionId;
      }

      await axios.post(`${BackendUrl}/createOrUpdateAddress`, {
        ...deliveryInfo,
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
      if (!PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment)) {
        const paymentStatus = await OrderManager.processPayment(
          selectedPayment,
          transactionId,
          finalOrderTotal
        );
        if (!paymentStatus?.status || paymentStatus?.status !== "complete") {
          AlertService.showAlert(
            setSubmitStatus,
            paymentStatus?.data?.message ||
              paymentStatus?.response?.data?.message ||
              "Le paiement a échoué. Veuillez réessayer."
          );
          return;
        }
      }

      checkPendingPayment2(transactionId);

      // 6. Finalisation
      await PromoCodeService.invalidatePromoCode(orderCodeP?._id);

      // 7. Nettoyage
      ["panier", "orderTotal", "paymentInfo", "pendingOrder", "orderShippingZone", "orderCodeP"].forEach((key) =>
        localStorage.removeItem(key)
      );

      // 8. Succès
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

      if (PaymentMethods.CASH_ON_DELIVERY.includes(selectedPayment)) {
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

        return checkTransactionStatus2(transactionId);
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

  // Fonction utilitaire pour gérer les callbacks de paiement
  const handlePaymentCallback = async (status: string, transactionId: string) => {
    await axios.post(`${BackendUrl}/payment_callback`, {
      status,
      customerName: user?.name,
      msisdn: mobileDetails.number,
      reference: "komipay",
      publicReference: selectedPayment,
      externalReference: transactionId,
      amount: orderTotal,
      paymentDate: Date.now(),
    });
  };

  // Fonction utilitaire pour vérifier le statut
  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const response = await axios.get(`${BackendUrl}/payment_status_card`, {
        params: {
          externalRef: transactionId,
        },
      });

      if (
        response?.data?.rawResponse?.code === 200 ||
        response?.data?.rawResponse?.code === 201
      ) {
        await handlePaymentCallback("success", transactionId);
        return { isCompleted: true, isSuccessful: true };
      } else {
        await handlePaymentCallback("échec", transactionId);
        return { isCompleted: true, isSuccessful: false };
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut:", error);
      return { isCompleted: false, isSuccessful: false };
    }
  };

  const checkTransactionStatus2 = async (transactionId: string) => {
    try {
      const response = await axios.get(`${BackendUrl}/payment_status_card`, {
        params: {
          externalRef: transactionId,
        },
      });

      if (
        response?.data?.rawResponse?.code === 200 ||
        response?.data?.rawResponse?.code === 201
      ) {
        return { status: "complete", response };
      } else {
        return { status: "echec", response };
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut:", error);
      return error;
    }
  };

  // Dans useEffect pour vérifier au rechargement
  useEffect(() => {
    const checkPendingPayment = async () => {
      if (typeof window === 'undefined') return;
      
      const pendingPayment = localStorage.getItem("paymentInitiated");
      if (pendingPayment) {
        setSubmitStatus({ loading: true, error: null, success: false });
        const { transactionId } = JSON.parse(pendingPayment);
        try {
          const status = await checkTransactionStatus(transactionId);
          if (status.isCompleted && status.isSuccessful) {
            localStorage.removeItem("panier");
            localStorage.removeItem("orderTotal");
            localStorage.removeItem("paymentInfo");
            localStorage.removeItem("pendingOrder");
            localStorage.removeItem("orderShippingZone");

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
            router.push("/commandes");
          } else {
            setSubmitStatus({
              loading: false,
              error: "Le paiement a échoué. Veuillez réessayer.",
              success: false,
            });
            setOnSubmit(false);
          }
        } finally {
          setSubmitStatus({ loading: false, error: null, success: false });
          localStorage.removeItem("paymentInitiated");
        }
      }
    };

    checkPendingPayment();
  }, []);

  const checkPendingPayment2 = async (transactionId: string) => {
    setSubmitStatus({ loading: true, error: null, success: false });
    setMessage("vérification du paiement en cours");
    try {
      const status = await checkTransactionStatus(transactionId);
      if (status.isCompleted && status.isSuccessful) {
        setSubmitStatus({
          loading: false,
          error: "Paiement effectué avec succès",
          success: true,
        });
        setPaiementProduit(true);
      } else if (!status.isCompleted) {
        setMessage(message + "paiement en attente veuillez valider d'abord!");
        return;
      } else {
        setSubmitStatus({
          loading: false,
          error: "Le paiement a échoué. Veuillez réessayer.",
          success: false,
        });
        setOnSubmit(false);
      }
    } finally {
      setSubmitStatus({ loading: false, error: null, success: false });
      if (typeof window !== 'undefined') {
        localStorage.removeItem("paymentInitiated");
      }
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
      case "nita":
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
                    <input
                      type="tel"
                      id="numero"
                      name="numero"
                      value={deliveryInfo.numero}
                      onChange={handleDeliveryChange}
                      className="mt-1 p-3 border border-gray-300 rounded-lg w-full"
                      placeholder="Votre numéro de téléphone"
                    />
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
                        className={`mt-1 p-3 border border-gray-300 rounded-lg w-full ${
                          selectedZone 
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
                <span>Confirmer la commande {orderTotal.toLocaleString('fr-FR')} FCFA</span>
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
        onSubmit={handleSecuritySubmit || (() => {})}
        error={securityCodeModal.error}
      />
    </>
  );
};

export default OrderConfirmation;