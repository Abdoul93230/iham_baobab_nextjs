"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Bell,
  Heart,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";

interface HeaderMobileProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  nbr?: number;
  paniernbr?: number;
}

const HeaderMobile: React.FC<HeaderMobileProps> = ({ 
  setIsMobileMenuOpen, 
  nbr = 0, 
  paniernbr = 0 
}) => {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();
  const DATA_Types = useSelector((state: any) => state.products.types || []);
  const DATA_Categories = useSelector((state: any) => state.products.categories || []);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
  
  // Récupérer l'utilisateur depuis localStorage
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userEcomme = localStorage.getItem("userEcomme");
      if (userEcomme) {
        const user = JSON.parse(userEcomme);
        setUserId(user?.id);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserLikes();
    }
  }, [userId]);

  const fetchUserLikes = async () => {
    try {
      const response = await axios.get(`${BackendUrl}/likes/user/${userId}`);
      const likedIds = new Set(response?.data?.data?.map((like: any) => like.produit._id));
      setLikedProducts(likedIds);
    } catch (error) {
      console.error("Erreur lors du chargement des likes:", error);
    }
  };

  const toggleSection = (sectionId: number) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  const handleItemClick = (item: string, link?: string) => {
    console.log("Item clicked:", item);
    if (link) {
      if (link === "/Home") {
        // Déconnexion
        localStorage.removeItem("userEcomme");
        router.push("/");
      } else {
        router.push(link);
      }
    }
    // Fermer le menu après chaque clic
    setIsMobileMenuOpen(false);
  };

  const menuData = [
    {
      id: 1,
      question: "Catégories",
      answers: DATA_Categories.filter((item: any) => item.name !== "all").map(
        (item: any) => item.name
      ),
    },
    {
      id: 2,
      question: "Compte",
      answers: [
        "Mon compte",
        "Mes commandes",
        "Invité des amis",
        "Mes addresses",
        "Faire une Suggestions",
        "Se déconnecter",
      ],
      links: [
        "/profile",
        "/dashboard/orders",
        "/invite",
        "/profile/addresses",
        "/suggestion",
        "/Home",
      ],
    },
    {
      id: 3,
      question: "Plus",
      answers: [
        "Centre d'aide",
        "Address de livraison",
        "Paramètre de notification",
        "Avis de confidentialité",
        "Question fréquemment possées",
        "Information Legal",
      ],
      links: [
        "/help",
        "/delivery",
        "/settings/notifications",
        "/privacy",
        "/faq",
        "/legal",
      ],
    },
  ];

  const bottomIcons = [
    {
      icon: Heart,
      count: likedProducts?.size || 0,
      bgColor: "from-red-400 to-red-600",
      countBg: "bg-emerald-500",
      label: "Wishlist",
      onClick: () => {
        router.push("/likes");
        setIsMobileMenuOpen(false);
      },
    },
    {
      icon: ShoppingCart,
      count: paniernbr || 0,
      bgColor: "from-blue-400 to-blue-600",
      countBg: "bg-emerald-600",
      label: "Panier",
      onClick: () => {
        router.push("/panier");
        setIsMobileMenuOpen(false);
      },
    },
    {
      icon: Bell,
      count: nbr,
      bgColor: "from-green-400 to-green-600",
      countBg: "bg-red-500",
      label: "Notifications",
      onClick: () => {
        router.push("/notifications");
        setIsMobileMenuOpen(false);
      },
    },
    {
      icon: MessageCircle,
      count: 0,
      bgColor: "bg-green-500",
      countBg: "bg-emerald-600",
      label: "Messages",
      onClick: () => {
        router.push("/messages");
        setIsMobileMenuOpen(false);
      },
    },
  ];

  return (
    <>
      <div 
        className="md:hidden fixed inset-0 bg-white bg-opacity-20 z-50"
        onClick={(e) => {
          // Fermer le menu si on clique sur le fond
          if (e.target === e.currentTarget) {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        {/* Fond avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#30A08B] to-[#B2905F]">
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
        </div>

        {/* En-tête */}
        <div className="relative flex justify-between p-4">
          <div className="flex items-center cursor-pointer space-x-2">
            <Sparkles className="h-6 w-6 text-white" />
            <h2 className="text-white text-xl font-bold">Menu</h2>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white p-2 rounded-full hover:bg-white/20 transform hover:rotate-180 transition-all duration-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu principal avec défilement */}
        <div className="relative flex flex-col space-y-4 p-4 overflow-y-auto h-[calc(100vh-180px)]">
          {/* Boutons fixes */}
          {[
            { name: "Promotions", link: "/promotions" },
            { name: "Nouveautés", link: "/nouveautes" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                router.push(item.link);
                setIsMobileMenuOpen(false);
              }}
              className="group relative w-full p-3 bg-white/10 backdrop-blur-md rounded-lg shadow-lg transform hover:scale-105 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#30A08B]/50 to-[#B2905F]/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative text-white text-lg font-medium group-hover:tracking-wider transition-all duration-500">
                {item.name}
              </span>
            </button>
          ))}

          {/* Sections dépliables */}
          {menuData.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="w-full"
              style={{
                animation: "slideIn 0.5s ease-out forwards",
                animationDelay: `${sectionIndex * 200}ms`,
              }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="relative w-full p-4 bg-[#30A08B] rounded-t-lg shadow-lg transform hover:translate-x-2 transition-all duration-500 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#30A08B] to-[#B2905F] rounded-t-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative flex justify-between items-center">
                  <span className="text-white font-medium group-hover:tracking-wider transition-all duration-500">
                    {section.question}
                  </span>
                  <div
                    className={`transform transition-all duration-500 ${
                      openSection === section.id ? "rotate-180" : ""
                    }`}
                  >
                    {openSection === section.id ? (
                      <ChevronUp className="text-white animate-bounce" />
                    ) : (
                      <ChevronDown className="text-white" />
                    )}
                  </div>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out transform
                  ${
                    openSection === section.id
                      ? "max-h-[500px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-4"
                  }`}
              >
                <div className="bg-white/95 backdrop-blur-md rounded-b-lg shadow-xl">
                  {section.answers.map((answer: string, index: number) => (
                    <button
                      key={index}
                      onMouseEnter={() =>
                        setHoveredItem(`${section.id}-${index}`)
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => {
                        if (section.question === "Catégories") {
                          router.push(`/categorie/${answer}`);
                          setIsMobileMenuOpen(false);
                        } else if (section.question === "Compte") {
                          const link = section.links?.[index];
                          if (link) handleItemClick(answer, link);
                        } else if (section.question === "Plus") {
                          const link = section.links?.[index];
                          if (link) handleItemClick(answer, link);
                        }
                      }}
                      className="relative w-full p-3 text-start transition-all duration-500 hover:pl-6"
                      style={{
                        animation: "slideInRight 0.5s ease-out forwards",
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#30A08B] to-[#B2905F] transition-all duration-500
                        ${
                          hoveredItem === `${section.id}-${index}` ? "w-1" : "w-0"
                        }`}
                      />
                      <span
                        className={`relative text-[#30A08B] transition-all duration-500
                        ${
                          hoveredItem === `${section.id}-${index}`
                            ? "text-[#B2905F] font-medium"
                            : ""
                        }`}
                      >
                        {answer}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barre d'icônes du bas */}
        <div className="fixed bottom-8 left-0 right-0 px-4">
          <div className="flex justify-around items-center gap-4 animate-slideUp">
            {bottomIcons.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`relative group w-14 h-14 rounded-full bg-gradient-to-r ${item.bgColor} 
                  flex items-center justify-center shadow-lg 
                  transform transition-all duration-500 
                  hover:scale-110 hover:shadow-2xl
                  active:scale-95`}
                style={{
                  animation: "bounceIn 0.5s ease-out forwards",
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="relative">
                  <item.icon className="h-6 w-6 text-white transform transition-all duration-300 group-hover:scale-110" />
                  {item.count > 0 && (
                    <span
                      className={`absolute -top-2 -right-2 ${item.countBg} 
                        rounded-full min-w-5 h-5 px-1
                        text-xs text-white font-bold
                        flex items-center justify-center
                        transform transition-all duration-300
                        group-hover:scale-110 group-hover:animate-pulse`}
                    >
                      {item.count}
                    </span>
                  )}
                </div>

                {/* Tooltip */}
                <span
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                  bg-black text-white text-xs py-1 px-2 rounded 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Styles avec Tailwind uniquement */}
    </>
  );
};

export default HeaderMobile;
