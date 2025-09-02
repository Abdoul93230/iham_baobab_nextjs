"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Menu,
  User,
  ChevronDown,
  ChevronRight,
  Home,
  ShoppingCart,
  Heart,
  Bell,
  Globe,
  Truck,
  Gift,
  Phone,
  X,
  Package,
  LogOut,
  HelpCircle,
  Shield,
  Info,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout, selectAcces, selectIsAuthenticated } from "@/redux/userSlice";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import SearchBar from "../SearchBarNew";
import { fetchUserLikes } from "@/redux/likesSlice";
import HeaderMobile from "./HeaderMobile";

interface HomeHeaderProps {
  paniernbr: number;
  chg: () => void;
}

interface Category {
  _id: string;
  name: string;
  image: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ paniernbr, chg }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.products.categories) as Category[];
  const acces = useAppSelector(selectAcces);
  const currentUser = useAppSelector((state) => state.user.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [produits, setProduits] = useState(0);
  const [nbr, setNbr] = useState(0);
  // const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const { likedProducts, loading: likesLoading, error: likesError } = useAppSelector((state) => state.likes);
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Utiliser l'utilisateur Redux si disponible, sinon localStorage
    if (currentUser) {
      setUser(currentUser);
    } else if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("userEcomme") || "null");
      setUser(userData?.user || userData);
    }
  }, [currentUser]);

  useEffect(() => {
    // Initialiser le socket côté client
    if (typeof window !== "undefined" && BackendUrl) {
      const socketInstance = io(BackendUrl);
      setSocket(socketInstance);
      
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [BackendUrl]);

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserLikes(userId));
    }
  }, [userId, dispatch]);



  useEffect(() => {
    if (user) {
      axios
        .get(`${BackendUrl}/getUserMessagesByClefUser/${user?.id}`)
        .then((res) => {
          setNbr(
            res.data.filter(
              (item: any) => item.lusUser == false && item.provenance === false
            )?.length
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [user, BackendUrl]);

  useEffect(() => {
    if (!socket) return;

    // Écouter les nouveaux messages du serveur
    socket.on("new_message_user", (message: any) => {
      if (message && user) {
        axios
          .get(`${BackendUrl}/getUserMessagesByClefUser/${user?.id}`)
          .then((res) => {
            setNbr(
              res.data.filter(
                (item: any) => item.lusUser == false && item.provenance === false
              )?.length
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });

    return () => {
      socket.off("new_message_user");
    };
  }, [socket, user, BackendUrl]);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown((prevDropdown) =>
      prevDropdown === dropdown ? null : dropdown
    );
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CategoryButton = ({ icon: Icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#30A08B]/10 hover:to-transparent group transition-all duration-200"
    >
      <Icon className="w-5 h-5 text-[#30A08B] group-hover:scale-110 transition-transform duration-200" />
      <span className="ml-3 text-sm font-medium group-hover:text-[#30A08B]">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-[#30A08B] transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
    </button>
  );

  const AccountButton = ({ icon: Icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#30A08B]/10 hover:to-transparent group transition-all duration-200"
    >
      <Icon className="w-5 h-5 text-[#30A08B] group-hover:scale-110 transition-transform duration-200" />
      <span className="ml-3 text-sm font-medium group-hover:text-[#30A08B]">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-[#30A08B] transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
    </button>
  );

  const HelpButton = ({ icon: Icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#30A08B]/10 hover:to-transparent group transition-all duration-200"
    >
      <Icon className="w-5 h-5 text-[#30A08B] group-hover:scale-110 transition-transform duration-200" />
      <span className="ml-3 text-sm font-medium group-hover:text-[#30A08B]">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-[#30A08B] transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
    </button>
  );

  const renderDropdownContent = (dropdown: string) => {
    const accountOptions = [
      ...(acces === "non"
        ? [
            {
              icon: User,
              label: "Se connecter",
              onClick: () => {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
                router.push("/auth/login");
              },
            },
            {
              icon: Plus,
              label: "S'inscrire",
              onClick: () => {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
                router.push("/auth/register");
              },
            },
          ]
        : []),
      {
        icon: Home,
        label: "Mon compte",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          if (acces === "oui") {
            router.push("/profile");
          } else {
            // Rediriger vers la connexion avec le paramètre de retour
            router.push("/auth/login?returnUrl=/profile");
          }
        },
      },
      {
        icon: Package,
        label: "Mes commandes",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          if (acces === "oui") {
            router.push("/dashboard");
          } else {
            router.push("/auth/login?returnUrl=/dashboard");
          }
        },
      },
      {
        icon: Heart,
        label: "Inviter des amis",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          if (acces === "oui") {
            router.push("/dashboard");
          } else {
            router.push("/auth/login?returnUrl=/dashboard");
          }
        },
      },
      {
        icon: Truck,
        label: "Mes adresses",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          if (acces === "oui") {
            router.push("/profile");
          } else {
            router.push("/auth/login?returnUrl=/profile");
          }
        },
      },
      ...(acces === "oui"
        ? [
            {
              icon: LogOut,
              label: "Se déconnecter",
              onClick: () => {
                // Utiliser Redux pour la déconnexion
                dispatch(logout());
                
                // Supprimer les données supplémentaires du localStorage
                localStorage.removeItem("orderTotal");
                localStorage.removeItem("pendingOrder");
                localStorage.removeItem("cartItems");
                localStorage.removeItem("userToken");
                
                // Mettre à jour l'état de connexion
                chg();
                
                // Fermer les dropdowns
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
                
                // Rediriger vers la page d'accueil
                router.push("/");
                
                // Recharger la page pour s'assurer que tous les états sont réinitialisés
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              },
            },
          ]
        : []),
    ];

    const helpOptions = [
      {
        icon: HelpCircle,
        label: "Centre d'aide",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          router.push("/dashboard");
        },
      },
      {
        icon: Truck,
        label: "Adresse de livraison",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          router.push("/profile");
        },
      },
      {
        icon: Bell,
        label: "Paramètre de notification",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          router.push("/dashboard");
        },
      },
      {
        icon: Shield,
        label: "Avis de confidentialité",
        onClick: () => {
          setActiveDropdown(null);
          setIsMobileMenuOpen(false);
          router.push("/dashboard");
        },
      },
      {
        icon: HelpCircle,
        label: "Questions fréquemment posées",
        onClick: () => router.push("/Question Fréquement possées"),
      },
      {
        icon: Info,
        label: "Informations légales",
        onClick: () => router.push("/Legal information"),
      },
    ];

    switch (dropdown) {
      case "language":
        return (
          <div className="absolute top-8 right-4 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-50">
            <button className="block px-4 py-2 text-gray-800 hover:bg-emerald-100 transition">
              English
            </button>
            <button className="block px-4 py-2 text-gray-800 hover:bg-emerald-100 transition">
              Deutsch
            </button>
            <button className="block px-4 py-2 text-gray-800 hover:bg-emerald-100 transition">
              Español
            </button>
          </div>
        );

      case "categories":
        return (
          <div className="absolute z-30 left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden backdrop-blur-sm backdrop-saturate-150 transition-all duration-300">
            <div className="py-2">
              
              {categories?.map((category, index) => {
                if (category.name === "all") {
                  return null;
                }
                return (
                  <div key={category._id}>
                    <button
                      onClick={() => router.push(`/Categorie/${category.name}`)}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#30A08B]/10 hover:to-transparent group transition-all duration-200"
                    >
                      <Image
                        src={category?.image}
                        alt="category"
                        width={30}
                        height={30}
                        className="object-contain rounded-full"
                      />
                      <span className="ml-3 text-sm font-medium group-hover:text-[#30A08B]">
                        {category.name}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-[#30A08B] transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                    </button>
                    {index < categories?.length - 1 && (
                      <div className="mx-4 border-b border-gray-100" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-b from-[#30A08B]/5 to-[#30A08B]/10 px-4 py-3">
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  setIsMobileMenuOpen(false);
                  router.push("/dashboard");
                }}
                className="w-full text-center text-sm font-medium text-[#30A08B] hover:text-[#2a907d] transition-colors"
              >
                Découvrir toutes les catégories
              </button>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden backdrop-blur-sm backdrop-saturate-150 transition-all duration-300 z-10">
            <h3 className="px-4 py-2 text-lg font-semibold text-amber-800 border-b border-gray-200">
              Mon Compte
            </h3>
            <div className="py-2">
              {accountOptions.map((option, index) => (
                <React.Fragment key={option.label}>
                  <AccountButton
                    icon={option.icon}
                    label={option.label}
                    onClick={option.onClick}
                  />
                  {index < accountOptions.length - 1 && (
                    <div className="mx-4 border-b border-gray-100" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case "help":
        return (
          <div className="absolute z-30 right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden backdrop-blur-sm backdrop-saturate-150 transition-all duration-300">
            <h3 className="px-4 py-2 text-lg font-semibold text-amber-800 border-b border-gray-200">
              Plus
            </h3>
            <div className="py-2">
              {helpOptions.map((option, index) => (
                <React.Fragment key={option.label}>
                  <HelpButton
                    icon={option.icon}
                    label={option.label}
                    onClick={option.onClick}
                  />
                  {index < helpOptions.length - 1 && (
                    <div className="mx-4 border-b border-gray-100" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const local = localStorage.getItem("panier");
    if (local) {
      setProduits(JSON.parse(local));
    } else {
      setProduits(0);
    }
  }, []);

  return (
    <div className="">
      {/* Top bar */}
      <div className="bg-emerald-700 text-white py-1 px-4 text-sm flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Phone className="h-4 w-4 mr-1" /> Support: +227 87727501
          </span>
          <span className="flex items-center">
            <Truck className="h-4 w-4 mr-1" /> Livraison gratuite dès 30 000F
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center hover:text-emerald-200"
            onClick={() => toggleDropdown("language")}
          >
            <Globe className="h-4 w-4 mr-1" /> FR
            <ChevronDown
              className={`h-3 w-3 ml-1 transition-transform ${
                activeDropdown === "language" ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {activeDropdown === "language" && renderDropdownContent("language")}
        </div>
      </div>

      {/* Main header */}
      <header
        className="bg-gradient-to-r from-amber-100 to-amber-300 text-gray-800 shadow-lg"
        ref={dropdownRef}
      >
        <div className="container mx-auto px-2 py-3 flex flex-wrap items-center justify-between">
          <div className="relative flex items-center space-x-9 p-1 bg-gradient-to-r from-amber-100 to-amber-300 shadow-md rounded-xl">
            <button
              onClick={toggleMenu}
              className="text-amber-800 hover:text-amber-900 md:hidden focus:outline-none transition-transform duration-300 transform hover:rotate-180"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-8 w-8 text-amber-800 hover:text-amber-900" />
              ) : (
                <Menu className="h-8 w-8 cursor-pointer" />
              )}
            </button>

            <span
              className="text-2xl w-24 h-16 font-extrabold text-amber-900 tracking-widest cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Image
                src="/LogoText.png"
                alt="Logo IhamBaobab"
                width={96}
                height={64}
                className="w-auto h-full object-contain cursor-pointer transition-opacity duration-300 hover:opacity-90"
              />
            </span>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 flex space-x-1 p-1 bg-white border border-gray-200 rounded-full shadow-xl transition-all duration-500 ease-out z-40">
                {/* Menu Button - Hidden on larger screens */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(true);
                    setIsMenuOpen(false); // Fermer les 4 icônes
                  }}
                  className="sm:hidden bg-green-900 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Wishlist Button */}
                <button className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl">
                  <div
                    className="relative text-amber-800 hover:text-amber-900"
                    aria-label="Wishlist"
                    onClick={() => {
                      router.push("/Like produit");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-3 h-3 text-[8px] text-white flex items-center justify-center">
                      {likedProducts?.length}
                    </span>
                  </div>
                </button>

                {/* Shopping Cart Button */}
                <button className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl">
                  <div onClick={() => {
                    router.push("/Panier");
                    setIsMenuOpen(false);
                  }} className="relative">
                    <div className="bg-emerald-600 rounded-full z-10 w-3 h-3 flex items-center justify-center text-white text-[8px] font-bold absolute -top-1 -right-1">
                      {paniernbr ? paniernbr : 0}
                    </div>
                    <ShoppingCart
                      className="h-4 w-4 text-amber-800 hover:text-amber-900 cursor-pointer transition-transform transform hover:scale-110"
                      aria-label="Panier"
                    />
                  </div>
                </button>

                {/* Message Button */}
                <button className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 hover:scale-125 hover:shadow-2xl">
                  <div
                    className="relative text-amber-800 hover:text-amber-900"
                    aria-label="Messages"
                    onClick={() => {
                      router.push("/Messagerie");
                      setIsMenuOpen(false);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 text-[8px] text-white flex items-center justify-center">
                      {nbr}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="relative flex-grow max-w-xl mx-4 my-2 w-full">
            <SearchBar onSearch={(query) => {
              // Rediriger vers la page de recherche avec le query
              router.push(`/Search?q=${encodeURIComponent(query)}`);
            }} />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <button
                className="flex items-center text-amber-800 hover:text-amber-900"
                onClick={() => toggleDropdown("categories")}
                aria-label="Categories"
              >
                <span>Catégories</span>
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${
                    activeDropdown === "categories"
                      ? "transform rotate-180"
                      : ""
                  }`}
                />
              </button>
              {activeDropdown === "categories" &&
                renderDropdownContent("categories")}
            </div>

            <button
              onClick={() => router.push("/Produit promotions")}
              className="text-amber-800 hover:text-amber-900"
            >
              Promotions
            </button>
            <button
              onClick={() => router.push("/Nouveau produit")}
              className="text-amber-800 hover:text-amber-900"
            >
              Nouveautés
            </button>

            <div className="relative">
              <button
                className="flex items-center text-amber-800 hover:text-amber-900"
                onClick={() => toggleDropdown("account")}
                aria-label="Account options"
              >
                <User className="h-6 w-6 mr-1" />
                <span>Compte</span>
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${
                    activeDropdown === "account" ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "account" && renderDropdownContent("account")}
            </div>

            <div className="relative">
              <button
                className="flex items-center text-amber-800 hover:text-amber-900"
                onClick={() => toggleDropdown("help")}
                aria-label="Help options"
              >
                <span>Plus</span>
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${
                    activeDropdown === "help" ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "help" && renderDropdownContent("help")}
            </div>

            <button
              className="relative text-amber-800 hover:text-amber-900"
              aria-label="Wishlist"
              onClick={() => router.push("/Like produit")}
            >
              <Heart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 text-xs text-white flex items-center justify-center">
                {likedProducts?.length}
              </span>
            </button>

            <div onClick={() => router.push("/Panier")} className="relative cursor-pointer">
              <div className="bg-emerald-600 rounded-full z-10 w-5 h-5 flex items-center justify-center text-white text-xs font-bold absolute -top-2 -right-2">
                {paniernbr ? paniernbr : 0}
              </div>
              <ShoppingCart
                className="h-6 w-6 text-amber-800 hover:text-amber-900 cursor-pointer transition-transform transform hover:scale-110"
                aria-label="Panier"
              />
            </div>

            <div onClick={() => router.push("/Messagerie")} className="relative cursor-pointer">
              <div className="bg-emerald-600 rounded-full z-10 w-5 h-5 flex items-center justify-center text-white text-xs font-bold absolute -top-2 -right-2">
                {nbr}
              </div>
              <MessageCircle
                className="h-6 w-6 text-amber-800 hover:text-amber-900 cursor-pointer transition-transform transform hover:scale-110"
                aria-label="messages"
              />
            </div>

            {isCartOpen && (
              <div className="absolute right-0 w-full h-screen max-w-sm md:max-w-md lg:max-w-lg text-black top-5 rounded shadow-lg z-50 p-2">
                1
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Promo banner */}
      <div className="bg-gradient-to-r from-amber-300 to-amber-400 text-amber-900 py-3 px-5 text-base flex items-center justify-center animate-pulse shadow-lg">
        <Gift className="h-6 w-6 mr-3 animate-bounce text-amber-700" />
        <span className="font-bold">🎉 OFFRE CHOC !</span>
        <span className="ml-2">
          -20% sur votre première commande avec le code{" "}
          <span className="bg-amber-200 px-2 py-1 rounded-md font-extrabold text-amber-900">
            BIENVENUE20
          </span>
          <span className="bg-red-500 text-white px-2 py-1 rounded-md font-extrabold ml-2">
            (remise max : 2000 F)
          </span>
        </span>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <HeaderMobile 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          nbr={nbr}
          paniernbr={paniernbr}
        />
      )}
    </div>
  );
};

export default HomeHeader;
