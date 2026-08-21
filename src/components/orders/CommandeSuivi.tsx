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
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import axios from "axios";
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
  codePromo?: string;
  dateValidation?: string;
  pointsUsed?: number;
  pointsDiscount?: number;
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

const CommandeSuivi: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

        // Fetch order details
        const orderResponse = await axios.get(
          `${BackendUrl}/getCommandesById/${id}`
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
  }, [id]);

  // Fonction pour déterminer le type de commande
  const getOrderType = (): string => {
    if (!order) return "unknown";

    if (order.statusLivraison === "annulé") {
      return "cancelled";
    }

    if (order.statusLivraison === "en cours" || order.statusPayment === "en cours") {
      return "inProgress";
    }

    return "completed";
  };

  // Fonction pour vérifier si la commande peut être relancée
  const canReorder = (): boolean => {
    const orderType = getOrderType();
    // "payé à la livraison" garde le bouton : l'acheteur peut toujours payer en ligne
    const finalPaidStatuses = ["payé", "recu", "payé par téléphone"];
    return (
      orderType === "cancelled" ||
      order?.statusPayment === "échec" ||
      !finalPaidStatuses.includes(order?.statusPayment || "")
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
          <span>Chargement des détails de la commande...</span>
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
        <div className="text-gray-500">Commande non trouvée</div>
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
          Retour aux commandes
        </button>

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

          {/* Masquer l'onglet carte pour les commandes annulées */}
          {orderType !== "cancelled" && (
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
              {/* Masquer tout paiement quand la livraison est terminée */}
              {!["livré", "livraison reçu", "Traité"].includes(order?.etatTraitement || "") && (
                (order?.statusPayment === "échec" ||
                  (order?.statusPayment !== "recu" &&
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
                ) : null
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mr-4">
                  Commande #{order?._id?.slice(0, 7) || "N/A"} ...
                </h1>
                <span
                  className={`px-4 py-1 text-nowrap text-white rounded-full text-xs md:text-sm ${orderType === "cancelled"
                      ? "bg-red-500"
                      : orderType === "completed"
                        ? "bg-green-500"
                        : "bg-teal-500"
                    }`}
                >
                  {orderType === "cancelled" && <XCircle className="w-3 h-3 inline mr-1" />}
                  {orderType === "completed" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {orderType === "inProgress" && <Clock className="w-3 h-3 inline mr-1" />}
                  {order?.statusPayment === "échec" ? order.etatTraitement : order.statusLivraison === "annulé" ? order.statusLivraison : null}
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

          {activeTab === "details" && (
            <>
              <div className="mb-8">
                <h2 className="font-semibold text-lg mb-4">
                  Détails de la livraison
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shippingAddress && (
                    <>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-teal-600" />
                          <p className="font-semibold text-gray-900">Client</p>
                        </div>
                        <p className="text-gray-700 font-medium">{shippingAddress.name || shippingAddress.customerName}</p>
                        <p className="text-gray-500 text-sm">{shippingAddress.email}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-teal-600" />
                          <p className="font-semibold text-gray-900">Destination</p>
                        </div>
                        <p className="text-gray-700 font-medium">{shippingAddress.region}</p>
                        <p className="text-gray-500 text-sm">{shippingAddress.quartier}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone className="w-5 h-5 text-teal-600" />
                          <p className="font-semibold text-gray-900">Contact</p>
                        </div>
                        <p className="text-gray-700 font-medium">{shippingAddress.numero}</p>
                        {shippingAddress.description && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{shippingAddress.description}</p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Truck className="w-5 h-5 text-teal-600" />
                          <p className="font-semibold text-gray-900">Livraison</p>
                        </div>
                        <p className="text-gray-700 font-medium">Frais: {formatPrice(order.fraisLivraison || 0)}</p>
                        <p className="text-gray-500 text-sm">Pris en charge par notre livreur</p>
                      </div>
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
                      <p className={`${order.statusPayment === "échec"
                          ? "text-red-600"
                          : order.statusPayment === "payé" || order.statusPayment === "payé à la livraison"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}>
                        {order.statusPayment === "payé par téléphone"
                          ? "Paiement assisté"
                          : order.statusPayment}
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

          {/* Afficher le suivi de carte seulement pour les commandes non annulées */}
          {activeTab === "map" && orderType !== "cancelled" && (
            <div className="bg-white rounded-lg">
              <OrderTracking order={order} />
            </div>
          )}

          {/* Informations supplémentaires pour paiements échoués */}
          {order?.statusPayment === "échec" && (
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-4">Échec du paiement</h2>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Paiement non traité</p>
                    {order.paymentDetails?.failureReason ? (
                      <p className="text-red-700 text-sm mt-2 font-medium bg-red-100 rounded px-3 py-2">
                        {order.paymentDetails.failureReason}
                      </p>
                    ) : (
                      <>
                        <p className="text-red-600 text-sm mt-1">
                          Le paiement n'a pas pu être traité. Les raisons possibles incluent :
                        </p>
                        <ul className="text-red-600 text-sm mt-2 list-disc list-inside space-y-1">
                          <li>Fonds insuffisants sur le compte</li>
                          <li>Carte expirée ou invalide</li>
                          <li>Problème de réseau durant la transaction</li>
                          <li>Limites de transaction dépassées</li>
                        </ul>
                      </>
                    )}
                    <div className="mt-4 p-3 bg-white rounded border border-red-200">
                      <p className="text-red-800 text-sm font-medium">
                        💡 Astuce : Vous pouvez réessayer le paiement en cliquant sur "Faire le paiement" ci-dessus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informations supplémentaires pour commandes annulées */}
          {orderType === "cancelled" && (
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-4">Raison de l'annulation</h2>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Commande annulée</p>
                    <p className="text-red-600 text-sm mt-1">
                      Cette commande a été annulée. Les raisons possibles incluent :
                    </p>
                    <ul className="text-red-600 text-sm mt-2 list-disc list-inside space-y-1">
                      <li>Produit non disponible en stock</li>
                      <li>Problème de livraison dans votre zone</li>
                      <li>Annulation à la demande du client</li>
                      <li>Problème de paiement</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded border border-red-200">
                      <p className="text-red-800 text-sm font-medium">
                        💡 Astuce : Vous pouvez relancer cette commande en cliquant sur le bouton "Relancer la commande" ci-dessus.
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
                  <div className={`w-2 h-2 rounded-full ${orderType === "cancelled"
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
                      Livraison : {order.statusLivraison} | Paiement : {order.statusPayment === "payé par téléphone"
                        ? "Paiement assisté" : order.statusPayment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de facturation */}
          <div className="mt-8">
            <h2 className="font-semibold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-teal-600" />
              Résumé financier
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Sous-total (articles)</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(order.prixTotal || (order.prix - (order.fraisLivraison || 0) + (order.reduction || 0)))}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Frais d'expédition</span>
                  <span className="font-semibold text-gray-900">
                    {order.fraisLivraison && order.fraisLivraison > 0 
                      ? `+ ${formatPrice(order.fraisLivraison)}`
                      : "Gratuit"}
                  </span>
                </div>

                {order.reduction && order.reduction > 0 ? (
                  <div className="flex flex-col gap-1 bg-teal-50 px-3 py-2 rounded-lg">
                    <div className="flex justify-between items-center text-teal-600">
                      <span className="font-medium">Réduction appliquée</span>
                      <span className="font-bold">-{formatPrice(order.reduction)}</span>
                    </div>
                    {order.codePromo && (
                      <span className="text-[10px] text-teal-500 font-semibold uppercase tracking-wider">
                        Code: {order.codePromo}
                      </span>
                    )}
                  </div>
                ) : null}

                {order.pointsDiscount && order.pointsDiscount > 0 ? (
                  <div className="flex flex-col gap-1 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                    <div className="flex justify-between items-center text-amber-700">
                      <span className="font-medium flex items-center gap-1">
                        🌿 Points Baobab utilisés
                      </span>
                      <span className="font-bold">-{formatPrice(order.pointsDiscount)}</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-semibold">
                      {order.pointsUsed || 0} pts déduits de votre solde
                    </span>
                  </div>
                ) : null}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">Total à payer</p>
                      <p className="text-xs text-gray-500 mt-0.5">TVA incluse le cas échéant</p>
                    </div>
                    <span className="text-2xl font-extrabold text-teal-600">
                      {formatPrice(order.prix)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Mode de paiement :</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {order.statusPayment === "payé par téléphone" ? "Paiement assisté" : order.statusPayment}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    Réf : {order.reference}
                  </div>
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

export default CommandeSuivi;