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
import OrderedItems from "./OrderedItems";
import OrderPaymentHandler from "./OrderPaymentHandler";
import OrderTracking from "./OrderTracking";

const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ihambackend.onrender.com";

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
  dateValidation?: string;
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fonction pour déterminer le type de commande en tenant compte du statut de transaction
  const getOrderType = (): string => {
    if (!order) return "unknown";

    // Si le statut de la transaction est failed, on considère la commande comme échouée
    if (status === "failed") {
      return "failed";
    }

    if (order.statusLivraison === "annulé") {
      return "cancelled";
    }

    if (order.statusLivraison === "en cours" || order.statusPayment === "en cours") {
      return "inProgress";
    }

    // Si la transaction est réussie et que l'ordre est payé
    if (status === "succeeded" && (order.statusPayment === "payé" || order.statusPayment === "payé à la livraison")) {
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
      className={`flex ${
        message.isDeliverer ? "justify-start" : "justify-end"
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
              className={`text-sm font-medium ${
                message.isDeliverer ? "text-gray-800" : "text-teal-800"
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

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(price);
  };

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
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Retour
        </button>

        {/* Carte de statut de transaction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {status === "succeeded" ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              ) : status === "failed" ? (
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
                  {status === "succeeded" ? "Paiement Réussi !" : 
                   status === "failed" ? "Échec du Paiement" : 
                   "Paiement en Cours"}
                </h1>
                <p className="text-gray-600">
                  Transaction ID: {transactionId}
                </p>
                {amount && (
                  <p className="text-lg font-semibold text-teal-600 mt-1">
                    Montant: {formatPrice(amount)}
                  </p>
                )}
              </div>
            </div>

            {/* Message de statut */}
            <div className="text-right">
              {status === "succeeded" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Votre paiement a été traité avec succès
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Votre commande est maintenant confirmée
                  </p>
                </div>
              )}
              
              {status === "failed" && (
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
            className={`px-4 py-2 ${
              activeTab === "details"
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
              className={`px-4 py-2 ${
                activeTab === "map"
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
              {(status === "failed" ||
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
                  className={`px-4 py-1 text-nowrap text-white rounded-full text-xs md:text-sm ${
                    orderType === "cancelled"
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
                  {status === "failed" ? "Paiement échoué" : 
                   order?.statusPayment === "échec" ? order.etatTraitement : 
                   order.statusLivraison === "annulé" ? order.statusLivraison : 
                   status === "succeeded" ? "Confirmé" : order.statusLivraison}
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
          {status === "failed" && (
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
          {status === "succeeded" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800">Paiement confirmé</h3>
                  <p className="text-green-600 text-sm">
                    Votre paiement a été traité avec succès. Votre commande est maintenant confirmée et sera traitée dans les plus brefs délais.
                  </p>
                  <div className="mt-2 text-sm text-green-600">
                    <p><strong>ID de transaction :</strong> {transactionId}</p>
                    {amount && <p><strong>Montant payé :</strong> {formatPrice(amount)}</p>}
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
                      <p className={`${
                        status === "failed" || order.statusPayment === "échec"
                          ? "text-red-600"
                          : status === "succeeded" || order.statusPayment === "payé" || order.statusPayment === "payé à la livraison"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}>
                        {status === "failed" ? "Échec" : 
                         status === "succeeded" ? "Payé" : 
                         order.statusPayment}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Status de la livraison</p>
                      <p className={`${
                        order.statusLivraison === "annulé"
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
                      <p className="font-medium">ID de transaction</p>
                      <p className="text-gray-600 font-mono">{transactionId}</p>
                    </div>
                    <div>
                      <p className="font-medium">Statut de la transaction</p>
                      <p className={`font-medium ${
                        status === "succeeded" ? "text-green-600" : 
                        status === "failed" ? "text-red-600" : 
                        "text-yellow-600"
                      }`}>
                        {status === "succeeded" ? "Réussi" : 
                         status === "failed" ? "Échoué" : 
                         status}
                      </p>
                    </div>
                    {amount && (
                      <div>
                        <p className="font-medium">Montant de la transaction</p>
                        <p className="text-gray-600 font-semibold">{formatPrice(amount)}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Date de la transaction</p>
                      <p className="text-gray-600">{new Date().toLocaleString("fr-FR")}</p>
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
                  <div className={`w-2 h-2 rounded-full ${
                    status === "succeeded" ? "bg-green-600" : 
                    status === "failed" ? "bg-red-600" : 
                    "bg-yellow-600"
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Traitement du paiement
                    </p>
                    <p className="text-xs text-gray-500">
                      Transaction {transactionId} - {status === "succeeded" ? "Réussi" : status === "failed" ? "Échoué" : "En cours"}
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
                  <div className={`w-2 h-2 rounded-full ${
                    orderType === "cancelled" || orderType === "failed"
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
                      Livraison : {order.statusLivraison} | Paiement : {status === "succeeded" ? "Payé" : status === "failed" ? "Échoué" : order.statusPayment}
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
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatPrice(order.prix - (order.reduction || 0))}</span>
                </div>

                {order.reduction && order.reduction > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(order.reduction)}</span>
                  </div>
                )}

                {promoCode && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Code promo</span>
                    <span>-{formatPrice(promoCode.prixReduiction)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.prix)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  <p>Mode de paiement : {status === "succeeded" ? "Payé en ligne" : status === "failed" ? "Paiement échoué" : order.statusPayment}</p>
                  <p>Référence commande : {order.reference}</p>
                  <p>Transaction ID : {transactionId}</p>
                  {amount && <p>Montant transaction : {formatPrice(amount)}</p>}
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