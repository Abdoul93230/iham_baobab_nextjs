"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  DollarSign,
  Box,
  AlertCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";

const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://secoure.onrender.com";

interface TabButtonProps {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, icon: Icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative flex-shrink-0 flex items-center justify-center gap-2 sm:gap-3 
      py-2 sm:py-3 px-3 sm:px-6 min-w-fit mx-1
      rounded-lg transition-all duration-300 ease-in-out
      ${
        active
          ? "bg-teal-50 border-2 border-teal-600"
          : "bg-white text-gray-600 hover:bg-gray-50"
      }
      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
    `}
  >
    <Icon
      className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-300 ${
        active ? "text-teal-600" : "text-gray-500"
      }`}
    />
    <span
      className={`font-medium text-sm sm:text-base hidden sm:block ${
        active ? "text-teal-600" : "text-gray-600"
      }`}
    >
      {label}
    </span>
    <span
      className={`
        px-1.5 sm:px-2.5 py-0.5 text-xs sm:text-sm font-medium rounded-full flex-shrink-0
        transition-colors duration-300
        ${active ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-600"}
      `}
    >
      {count}
    </span>
  </button>
);

interface Order {
  _id: string;
  date: string;
  nbrProduits: Array<{ produit: string; quantite: number; tailles?: string[]; couleurs?: string[] }>;
  prix: number;
  etatTraitement: string;
  reference: string;
  statusLivraison: string;
  statusPayment: string;
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, isHovered, onHover, onLeave }) => {
  const formattedDate = new Date(order.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`
        relative bg-white rounded-xl p-6 
        transition-all duration-300 ease-in-out 
        ${
          isHovered
            ? "shadow-lg transform scale-[1.02]"
            : "shadow-sm hover:shadow-md"
        }
        cursor-pointer
      `}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span className="font-medium text-gray-900 capitalize">
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <Box className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Produits</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.nbrProduits.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.prix || 0} F CFA
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">État</p>
              <p className="mt-1 font-semibold text-gray-900">
                {order.etatTraitement}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Référence</p>
              <p className="mt-1 font-semibold text-gray-900">
                {order.reference}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`
          absolute right-6 top-1/2 -translate-y-1/2
          transition-all duration-300 ease-in-out
          ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        `}
      >
        <ChevronRight className="w-6 h-6 text-teal-600" />
      </div>
    </div>
  );
};

interface EmptyStateProps {
  activeTab: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  const getEmptyStateText = () => {
    switch (activeTab) {
      case "inProgress":
        return {
          title: "Aucune commande en cours",
          subtitle: "Les commandes en cours apparaîtront ici"
        };
      case "completed":
        return {
          title: "Aucune commande reçue",
          subtitle: "Les commandes reçues apparaîtront ici"
        };
      case "cancelled":
        return {
          title: "Aucune commande annulée",
          subtitle: "Les commandes annulées apparaîtront ici"
        };
      default:
        return {
          title: "Aucune commande",
          subtitle: "Les commandes apparaîtront ici"
        };
    }
  };

  const { title, subtitle } = getEmptyStateText();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Package className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-gray-500">
        {subtitle}
      </p>
    </div>
  );
};

const CommandePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inProgress");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userEcomme = JSON.parse(localStorage.getItem("userEcomme") || "{}");
        if (!userEcomme?.id) {
          throw new Error("Utilisateur non connecté");
        }

        const response = await axios.get(
          `${BackendUrl}/getCommandesByClefUser/${userEcomme.id}`
        );
        setOrders(response.data.commandes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getOrderStatus = (order: Order): string => {
    // Vérifier d'abord si la commande est annulée
    if (order.statusLivraison === "annulé") {
      return "cancelled";
    }

    // Ensuite vérifier si elle est en cours
    if (
      order.statusLivraison === "en cours" ||
      order.statusPayment === "en cours"
    ) {
      return "inProgress";
    }

    // Sinon, c'est une commande terminée/reçue
    return "completed";
  };

  const tabs = [
    { id: "inProgress", label: "En cours", icon: Clock },
    { id: "completed", label: "Reçues", icon: CheckCircle },
    { id: "cancelled", label: "Annulées", icon: XCircle },
  ];

  const filteredOrders = orders.filter(
    (order) => getOrderStatus(order) === activeTab
  );

  const handleOrderClick = (order: Order) => {
    const status = getOrderStatus(order);
    switch (status) {
      case "inProgress":
        router.push(`/commandes/${order._id}`);
        break;
      case "completed":
        router.push(`/commandes/${order._id}`);
        break;
      case "cancelled":
        router.push(`/commandes/${order._id}`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 text-red-500 px-6 py-4 rounded-lg flex items-center gap-3 max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
        </div>

<div className="bg-gray-100 rounded-xl p-2 mb-8">
  <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide px-1 pb-1 pt-1">
    {tabs.map((tab) => (
      <div key={tab.id} className="flex-shrink-0 min-w-fit">
        <TabButton
          active={activeTab === tab.id}
          icon={tab.icon}
          label={tab.label}
          count={
            orders.filter((order) => getOrderStatus(order) === tab.id)
              .length
          }
          onClick={() => setActiveTab(tab.id)}
        />
      </div>
    ))}
  </div>
</div>

        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.reverse().map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => handleOrderClick(order)}
                isHovered={hoveredOrder === order._id}
                onHover={() => setHoveredOrder(order._id)}
                onLeave={() => setHoveredOrder(null)}
              />
            ))}
          </div>
        ) : (
          <EmptyState activeTab={activeTab} />
        )}
      </div>
    </div>
  );
};

export default CommandePage;