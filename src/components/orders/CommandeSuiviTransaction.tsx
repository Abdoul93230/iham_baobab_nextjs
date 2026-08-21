"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Package,
  Truck,
  Loader,
  ChevronLeft,
  User,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Send,
  Check,
  CheckCheck,
  CreditCard,
  XCircle,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  XOctagon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import OrderedItems from "./OrderedItems";
import OrderPaymentHandler from "./OrderPaymentHandler";
import OrderTracking from "./OrderTracking";
import { formatCurrency } from "@/lib/utils";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

interface Order {
  _id: string;
  date: string;
  statusLivraison: string;
  statusPayment: string;
  etatTraitement: string;
  reference: string;
  prix: number;
  prod?: any[];
  nbrProduits: Array<{ produit: string; quantite: number; tailles?: string[]; couleurs?: string[] }>;
  livraisonDetails?: any;
  codePro?: string;
  idCodePro?: string;
  clefUser?: string;
  reduction?: number;
  prixTotal?: number;
  fraisLivraison?: number;
  pointsUsed?: number;
  pointsDiscount?: number;
  codePromo?: string;
  dateValidation?: string;
  paymentDetails?: { failureReason?: string | null };
}

interface ShippingAddress {
  name?: string;
  customerName?: string;
  email: string;
  region: string;
  quartier: string;
  numero: string;
  description?: string;
}

interface PromoCode {
  _id: string;
  prixReduiction: number;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isDeliverer: boolean;
  type: string;
  read?: boolean;
}

interface CommandeSuiviTransactionProps {
  transactionId: string;
  status: string;
  amount?: number;
}

const CommandeSuiviTransaction: React.FC<CommandeSuiviTransactionProps> = ({
  transactionId,
  status,
  amount
}) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("details");
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveStatus, setLiveStatus] = useState(status);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const handledPaymentRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const userEcomme = JSON.parse(localStorage.getItem("userEcomme") || "{}");
        if (!userEcomme || !userEcomme.id) {
          throw new Error("Utilisateur non connecté");
        }

        // Fetch last order details using the new API
        const orderResponse = await axios.get(
          `${BackendUrl}/getCommandeByReference/${transactionId}`
        );
        setOrder(orderResponse.data.commande);

        if (orderResponse.data.commande?.livraisonDetails) {
          setShippingAddress(orderResponse.data.commande?.livraisonDetails);
        } else {
          // Fetch shipping address
          const addressResponse = await axios.get(
            `${BackendUrl}/getAddressByUserKey/${userEcomme.id}`
          );
          setShippingAddress(addressResponse.data.address);
        }

        if (orderResponse?.data?.commande?.codePro) {
          const promoCodeRes = await axios.get(
            `${BackendUrl}/getCodePromoByClefUser/${orderResponse?.data?.commande?.clefUser}`
          );

          setPromoCode(
            promoCodeRes.data.data.find(
              (item: any) => item._id === orderResponse?.data?.commande?.idCodePro
            ) || null
          );
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  useEffect(() => {
    setLiveStatus(status);
  }, [status]);

  useEffect(() => {
    if (!BackendUrl || !order?.reference) {
      return;
    }

    let pollTimer: NodeJS.Timeout | null = null;
    let pollAttempts = 0;
    let wsConnected = false;
    let cancelled = false;

    // ============================================
    // PRIORITÉ 1: WebSocket Real-time (Phase 2) 🚀
    // ============================================
    const socket: Socket = io(BackendUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000, // 10s timeout for WebSocket connection
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      wsConnected = true;
      console.log(`✅ WebSocket Connected for order ${order.reference}`);
      socket.emit("payment:join", { reference: order.reference });
    };

    const handlePaymentStatus = (event: any) => {
      if (cancelled || liveStatus === "succeeded" || liveStatus === "failed") {
        return;
      }

      const eventReference = event?.reference || event?.externalReference;
      if (eventReference !== order.reference) {
        return;
      }

      if (handledPaymentRef.current === order.reference) {
        return;
      }

      handledPaymentRef.current = order.reference;
      const nextStatus = 
        event?.status === "succeeded" || event?.statusPayment === "payé" ? "succeeded" : 
        event?.status === "failed" || event?.statusPayment === "échec" ? "failed" : 
        liveStatus;
      
      console.log(`⚡ Payment status received via WebSocket: ${nextStatus}`);
      setLiveStatus(nextStatus);

      if (typeof window !== "undefined" && typeof (window as any).onCloseIpayCheckout === "function") {
        (window as any).onCloseIpayCheckout();
      }

      // Close polling if running
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };

    const handleDisconnect = () => {
      wsConnected = false;
      console.log("❌ WebSocket Disconnected, fallback to polling...");
      // Fallback to polling
      if (!cancelled && liveStatus !== "succeeded" && liveStatus !== "failed") {
        startFallbackPolling();
      }
    };

    // ============================================
    // FALLBACK: Exponential Backoff Polling
    // ============================================
    const startFallbackPolling = () => {
      let nextInterval = 3000;
      let totalTime = 0;
      const maxTime = 10 * 60 * 1000; // 10 minutes

      const getNextInterval = (attempts: number): number => {
        const intervals = [3000, 5000, 8000, 13000, 21000, 34000, 55000];
        return intervals[Math.min(attempts, intervals.length - 1)];
      };

      const poll = async () => {
        if (cancelled || liveStatus === "succeeded" || liveStatus === "failed") {
          return;
        }

        pollAttempts++;

        try {
          // Use lightweight endpoint
          const response = await axios.get(`${BackendUrl}/getOrderPaymentStatus/${order.reference}`);
          const paymentStatus = response?.data?.status;

          console.log(`📊 Poll attempt ${pollAttempts}: ${paymentStatus}`);

          if (paymentStatus === "payé") {
            handledPaymentRef.current = order.reference;
            setLiveStatus("succeeded");
            
            // Fetch full order details
            const fullResponse = await axios.get(`${BackendUrl}/getCommandeByReference/${order.reference}`);
            setOrder(fullResponse?.data?.commande);
            
            if (typeof window !== "undefined" && typeof (window as any).onCloseIpayCheckout === "function") {
              (window as any).onCloseIpayCheckout();
            }
            return;
          }

          if (paymentStatus === "échec") {
            handledPaymentRef.current = order.reference;
            setLiveStatus("failed");
            
            // Fetch full order details
            const fullResponse = await axios.get(`${BackendUrl}/getCommandeByReference/${order.reference}`);
            setOrder(fullResponse?.data?.commande);
            
            if (typeof window !== "undefined" && typeof (window as any).onCloseIpayCheckout === "function") {
              (window as any).onCloseIpayCheckout();
            }
            return;
          }

          // Every 5th poll, fetch full order to keep UI updated
          if (pollAttempts % 5 === 0 && !wsConnected) {
            const fullResponse = await axios.get(`${BackendUrl}/getCommandeByReference/${order.reference}`);
            setOrder(fullResponse?.data?.commande);
          }
        } catch (error) {
          if (!cancelled) {
            console.log(`Polling attempt ${pollAttempts} error:`, (error as any).message);
          }
        }

        if (totalTime >= maxTime) {
          console.warn("⏱️ Max polling time exceeded");
          cancelled = true;
          return;
        }

        nextInterval = getNextInterval(pollAttempts - 1);
        console.log(`⏳ Next poll in ${nextInterval / 1000}s`);

        pollTimer = setTimeout(() => {
          totalTime += nextInterval;
          poll();
        }, nextInterval);
      };

      poll();
    };

    // Wire up WebSocket events
    socket.on("connect", handleConnect);
    socket.on("payment:status", handlePaymentStatus);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", (error: any) => {
      console.warn("⚠️ WebSocket error:", error.message);
    });

    // Start listening immediately
    console.log(`🚀 Starting payment monitor for ${order.reference}`);

    return () => {
      cancelled = true;
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
      socket.emit("payment:leave", { reference: order.reference });
      socket.off("connect", handleConnect);
      socket.off("payment:status", handlePaymentStatus);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [order?.reference, liveStatus, BackendUrl]);

  // Fonction pour déterminer le type de commande en tenant compte du statut de transaction
  const getOrderType = (): string => {
    if (!order) return "unknown";

    // Si le statut de la transaction est failed, on considère la commande comme échouée
    if (liveStatus === "failed" || order.statusPayment === "échec") {
      return "failed";
    }

    if (order.statusLivraison === "annulé") {
      return "cancelled";
    }

    if (order.statusLivraison === "en cours" || order.statusPayment === "en cours") {
      return "inProgress";
    }

    // Si la transaction est réussie et que l'ordre est payé
    if (liveStatus === "succeeded" && (order.statusPayment === "payé" || order.statusPayment === "payé à la livraison")) {
      return "completed";
    }

    return "completed";
  };

  // Fonction pour vérifier si la commande peut être relancée
  const canReorder = (): boolean => {
    const orderType = getOrderType();
    return (
      orderType === "cancelled" ||
      orderType === "failed" ||
      order?.statusPayment === "échec" ||
      (order?.statusPayment !== "payé à la livraison" && order?.statusPayment !== "payé")
    );
  };

  const handleContact = (type: string) => {
    setSelectedContact(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContact(null);
    setModalMessage("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      time: format(new Date(), "HH:mm"),
      isDeliverer: false,
      type: "text",
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const ChatMessage: React.FC<{ message: Message }> = ({ message }) => (
    <div
      className={`flex ${message.isDeliverer ? "justify-start" : "justify-end"
        } mb-4`}
    >
      <div className="max-w-[100%] sm:max-w-[70%] bg-gray-100 rounded-lg p-3">
        <div className="flex items-start gap-2">
          {message.isDeliverer && (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${message.isDeliverer ? "text-gray-800" : "text-teal-800"
                }`}
            >
              {message.isDeliverer ? "Livreur" : "Vous"}
            </p>
            <p className="text-gray-700">{message.text}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-xs text-gray-500">{message.time}</span>
              {!message.isDeliverer &&
                (message.read ? (
                  <CheckCheck className="w-4 h-4 text-teal-600" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Utilisation du formateur global
  const formatPrice = (price: number) => formatCurrency(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-teal-600" />
          <span>Chargement des détails de la transaction...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 flex items-center space-x-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">Aucune commande trouvée</div>
          <button
            onClick={() => router.push('/')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const orderType = getOrderType();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-2">
        <button
          className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
          onClick={() => router.push('/')}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Retour
        </button>

        {/* Carte de statut de transaction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {liveStatus === "succeeded" ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              ) : liveStatus === "failed" ? (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XOctagon className="w-8 h-8 text-red-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {liveStatus === "succeeded" ? "Paiement Réussi !" :
                    liveStatus === "failed" ? "Échec du Paiement" :
                      "Paiement en Cours"}
                </h1>
                <p className="text-gray-600">
                  Référence: {order?.reference || transactionId}
                </p>
                {order?.prix && (
                  <p className="text-lg font-semibold text-teal-600 mt-1">
                    Montant: {formatPrice(order.prix)}
                  </p>
                )}
              </div>
            </div>

            {/* Message de statut */}
            <div className="text-right">
              {liveStatus === "succeeded" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Votre paiement a été traité avec succès
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Votre commande est maintenant confirmée
                  </p>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Référence :</strong> {order?.reference}</p>
                    {order?.prix && <p><strong>Montant :</strong> {formatPrice(order.prix)}</p>}
                  </div>
                </div>
              )}

              {liveStatus === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    ❌ Le paiement a échoué
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    Veuillez réessayer ou contacter le support
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Affichage conditionnel des onglets selon le type de commande */}
        <div className="flex mb-4 border-b">
          <button
            className={`px-4 py-2 ${activeTab === "details"
              ? "border-b-2 border-teal text-teal"
              : "text-gray-600"
              }`}
            onClick={() => setActiveTab("details")}
          >
            Détails de la commande
          </button>

          {/* Masquer l'onglet carte pour les commandes échouées ou annulées */}
          {orderType !== "cancelled" && orderType !== "failed" && (
            <button
              className={`px-4 py-2 ${activeTab === "map"
                ? "border-b-2 border-teal text-teal"
                : "text-gray-600"
                }`}
              onClick={() => setActiveTab("map")}
            >
              Suivre sur la carte
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            {/* Section des actions selon le type de commande */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-0">
              {/* Gestion des paiements échoués */}
              {(liveStatus === "failed" ||
                order?.statusPayment === "échec" ||
                (order?.statusPayment !== "payé à la livraison" &&
                  order?.statusPayment !== "payé")) ? (
                <OrderPaymentHandler
                  panier={order?.prod || null}
                  pendingOrder={order?.reference || null}
                  id={order?._id || null}
                  setReorderLoading={setReorderLoading}
                  isReOrder={false}
                  order={order}
                />
              ) : canReorder() ? (
                <OrderPaymentHandler
                  panier={order?.prod || null}
                  pendingOrder={order?.reference || null}
                  id={order?._id || null}
                  reorderLoading={reorderLoading}
                  setReorderLoading={setReorderLoading}
                  isReOrder={true}
                  order={order}
                />
              ) : null}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mr-4">
                  Commande #{order?._id?.slice(0, 7) || "N/A"} ...
                </h2>
                <span
                  className={`px-4 py-1 text-nowrap text-white rounded-full text-xs md:text-sm ${orderType === "cancelled"
                    ? "bg-red-500"
                    : orderType === "failed"
                      ? "bg-red-500"
                      : orderType === "completed"
                        ? "bg-green-500"
                        : "bg-teal-500"
                    }`}
                >
                  {orderType === "cancelled" && <XCircle className="w-3 h-3 inline mr-1" />}
                  {orderType === "failed" && <XCircle className="w-3 h-3 inline mr-1" />}
                  {orderType === "completed" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {orderType === "inProgress" && <Clock className="w-3 h-3 inline mr-1" />}
                  {liveStatus === "failed" ? "Paiement échoué" :
                    order?.statusPayment === "échec" ? order.etatTraitement :
                      order.statusLivraison === "annulé" ? order.statusLivraison :
                        liveStatus === "succeeded" ? "Confirmé" : order.statusLivraison}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Commandé le:{" "}
                  {new Date(order.date).toLocaleDateString("fr-FR")}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Status: {(order.statusPayment === "en attente" || order.statusPayment === "en_attente" || order.statusPayment === "en attente") ? "En attente du paiement" : order.statusLivraison}
                </div>
              </div>
            </div>
          </div>

          {/* Alerte pour paiements échoués */}
          {liveStatus === "failed" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Paiement échoué</h3>
                  <p className="text-red-600 text-sm">
                    Le paiement de votre commande n'a pas pu être traité. Vous pouvez réessayer le paiement en cliquant sur le bouton ci-dessus.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alerte pour commandes annulées */}
          {(order?.statusPayment !== "échec" && orderType === "cancelled") && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Commande annulée</h3>
                  <p className="text-red-600 text-sm">
                    Cette commande a été annulée. Vous pouvez la relancer en cliquant sur le bouton "Relancer la commande".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation de paiement réussi */}
          {liveStatus === "succeeded" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800">Paiement confirmé</h3>
                  <p className="text-green-600 text-sm">
                    Votre paiement a été traité avec succès. Votre commande est maintenant confirmée et sera traitée dans les plus brefs délais.
                  </p>
                  <div className="mt-2 text-sm text-green-600">
                    <p><strong>Référence de commande :</strong> {order?.reference}</p>
                    {order?.prix && <p><strong>Montant payé :</strong> {formatPrice(order.prix)}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <>
              <div className="mb-8">
                <h2 className="font-semibold text-lg mb-4">
                  Détails de la livraison
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shippingAddress && (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-medium">Nom du client</p>
                        <p className="text-gray-600">{shippingAddress.name || shippingAddress.customerName}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">{shippingAddress.email}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-medium">Région</p>
                        <p className="text-gray-600">
                          {shippingAddress.region}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-medium">Quartier</p>
                        <p className="text-gray-600">
                          {shippingAddress.quartier}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-medium">Numéro de téléphone</p>
                        <p className="text-gray-600">
                          {shippingAddress.numero}
                        </p>
                      </div>
                      {shippingAddress.description && (
                        <div className="bg-white rounded-lg p-4 shadow">
                          <p className="font-medium">Description</p>
                          <p className="text-gray-600">
                            {shippingAddress.description}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <OrderedItems
                items={order?.prod ? order : null}
                totalPrice={order.prix}
              />

              <div className="mb-8">
                <h2 className="font-semibold text-lg mb-4">
                  Statut de la commande
                </h2>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Status du paiement</p>
                      <p className={`${liveStatus === "failed" || order.statusPayment === "échec"
                        ? "text-red-600"
                        : liveStatus === "succeeded" || order.statusPayment === "payé" || order.statusPayment === "payé à la livraison"
                          ? "text-green-600"
                          : "text-gray-600"
                        }`}>
                        {liveStatus === "failed" ? "Échec" :
                          liveStatus === "succeeded" ? "Payé" :
                            order.statusPayment}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Status de la livraison</p>
                      <p className={`${order.statusLivraison === "annulé"
                        ? "text-red-600"
                        : order.statusLivraison === "livré"
                          ? "text-green-600"
                          : "text-gray-600"
                        }`}>
                        {order.statusLivraison}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">État du traitement</p>
                      <p className="text-gray-600">{order.statusLivraison === "annulé" ? order.statusLivraison : order.etatTraitement}</p>
                    </div>
                    <div>
                      <p className="font-medium">Référence</p>
                      <p className="text-gray-600">{order.reference}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de transaction */}
              <div className="mb-8">
                <h2 className="font-semibold text-lg mb-4">Informations de la transaction</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Référence de commande</p>
                      <p className="text-gray-600 font-mono">{order?.reference}</p>
                    </div>
                    <div>
                      <p className="font-medium">Statut de la transaction</p>
                      <p className={`font-medium ${liveStatus === "succeeded" ? "text-green-600" :
                        liveStatus === "failed" ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                        {liveStatus === "succeeded" ? "Réussi" :
                          liveStatus === "failed" ? "Échoué" :
                            liveStatus}
                      </p>
                    </div>
                    {order?.prix && (
                      <div>
                        <p className="font-medium">Montant de la transaction</p>
                        <p className="text-gray-600 font-semibold">{formatPrice(order.prix)}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Date de la transaction</p>
                      <p className="text-gray-600">{new Date(order.date).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {order?.codePro && promoCode && (
                <div className="mb-8">
                  <h2 className="font-semibold text-lg mb-4">Code promo appliqué</h2>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Réduction appliquée : {formatPrice(promoCode.prixReduiction)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Afficher le suivi de carte seulement pour les commandes non annulées/échouées */}
          {activeTab === "map" && orderType !== "cancelled" && orderType !== "failed" && (
            <div className="bg-white rounded-lg">
              <OrderTracking order={order} />
            </div>
          )}

          {/* Informations supplémentaires pour commandes échouées/annulées */}
          {(orderType === "cancelled" || orderType === "failed") && (
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-4">
                {orderType === "failed" ? "Échec du paiement" : "Raison de l'annulation"}
              </h2>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">
                      {orderType === "failed" ? "Paiement non traité" : "Commande annulée"}
                    </p>
                    {orderType === "failed" && order?.paymentDetails?.failureReason ? (
                      <p className="text-red-700 text-sm mt-2 font-medium bg-red-100 rounded px-3 py-2">
                        {order.paymentDetails.failureReason}
                      </p>
                    ) : (
                      <>
                        <p className="text-red-600 text-sm mt-1">
                          {orderType === "failed" ?
                            "Le paiement n'a pas pu être traité. Les raisons possibles incluent :" :
                            "Cette commande a été annulée. Les raisons possibles incluent :"}
                        </p>
                        <ul className="text-red-600 text-sm mt-2 list-disc list-inside space-y-1">
                          {orderType === "failed" ? (
                            <>
                              <li>Fonds insuffisants sur le compte</li>
                              <li>Carte expirée ou invalide</li>
                              <li>Problème de réseau durant la transaction</li>
                              <li>Limites de transaction dépassées</li>
                            </>
                          ) : (
                            <>
                              <li>Produit non disponible en stock</li>
                              <li>Problème de livraison dans votre zone</li>
                              <li>Annulation à la demande du client</li>
                              <li>Problème de paiement</li>
                            </>
                          )}
                        </ul>
                      </>
                    )}
                    <div className="mt-4 p-3 bg-white rounded border border-red-200">
                      <p className="text-red-800 text-sm font-medium">
                        💡 Astuce : Vous pouvez {orderType === "failed" ? "réessayer le paiement" : "relancer cette commande"} en cliquant sur le bouton correspondant ci-dessus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historique des modifications de statut */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-4">Historique de la commande</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Commande passée</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${liveStatus === "succeeded" ? "bg-green-600" :
                    liveStatus === "failed" ? "bg-red-600" :
                      "bg-yellow-600"
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Traitement du paiement
                    </p>
                    <p className="text-xs text-gray-500">
                      Référence {order?.reference} - {liveStatus === "succeeded" ? "Réussi" : liveStatus === "failed" ? "Échoué" : "En cours"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>

                {order.dateValidation && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Commande validée</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.dateValidation).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${orderType === "cancelled" || orderType === "failed"
                    ? "bg-red-600"
                    : orderType === "completed"
                      ? "bg-green-600"
                      : "bg-yellow-600"
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Statut actuel : {order.etatTraitement}
                    </p>
                    <p className="text-xs text-gray-500">
                      Livraison : {order.statusLivraison} | Paiement : {liveStatus === "succeeded" ? "Payé" : liveStatus === "failed" ? "Échoué": order.statusPayment === "payé par téléphone"
      ? "Paiement assisté" : order.statusPayment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de facturation */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-4">Résumé financier</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sous-total (articles)</span>
                  <span className="font-medium">{formatPrice(order.prixTotal || (order.prix + (order.reduction || 0) + (order.pointsDiscount || 0) - (order.fraisLivraison || 0)))}</span>
                </div>

                {order.fraisLivraison && order.fraisLivraison > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Frais d'expédition</span>
                    <span>+{formatPrice(order.fraisLivraison)}</span>
                  </div>
                )}

                {order.reduction && order.reduction > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Réduction appliquée{order.codePromo ? ` (${order.codePromo})` : ""}</span>
                    <span>-{formatPrice(order.reduction)}</span>
                  </div>
                )}

                {order.pointsDiscount && order.pointsDiscount > 0 && (
                  <div className="flex flex-col gap-0.5 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                    <div className="flex justify-between items-center text-amber-700">
                      <span className="font-medium">🌿 Points Baobab utilisés</span>
                      <span className="font-bold">-{formatPrice(order.pointsDiscount)}</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-semibold">
                      {order.pointsUsed || 0} pts déduits de votre solde
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total à payer</span>
                    <span>{formatPrice(order.prix)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  <p>
                    Mode de paiement : {
                      liveStatus === "succeeded"
                        ? "Payé en ligne"
                          : liveStatus === "failed"
                          ? "Paiement échoué"
                          : order.statusPayment === "payé par téléphone"
                            ? "Paiement assisté"
                            : order.statusPayment
                    }
                  </p>
                  <p>Référence commande : {order.reference}</p>
                  <p>Montant payé : {order?.prix ? formatPrice(order.prix) : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour contact et messages */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedContact === "message"
                  ? "Envoyer un message au livreur"
                  : "Contacter le livreur"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {selectedContact === "phone" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Numéro du livreur</p>
                    <p className="text-blue-600">+227 XX XX XX XX</p>
                    <p className="text-xs text-blue-500 mt-1">
                      Disponible de 8h à 20h
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Cliquez sur le numéro pour appeler directement le livreur.
                </p>
              </div>
            )}

            {selectedContact === "message" && (
              <div className="space-y-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={4}
                  placeholder="Tapez votre message au livreur..."
                  value={modalMessage}
                  onChange={(e) => setModalMessage(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    onClick={handleCloseModal}
                  >
                    Annuler
                  </button>
                  <button
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors duration-200"
                    onClick={handleSendMessage}
                    disabled={!modalMessage.trim()}
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandeSuiviTransaction;