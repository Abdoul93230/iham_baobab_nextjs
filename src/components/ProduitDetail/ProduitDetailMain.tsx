"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  Share2,
  Heart,
  Store,
  MessageCircle,
  X,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaStar,
} from "react-icons/fa";
import Head from "next/head";
import ProduitSimilaires from "./ProduitSimilaires";
import CommentaireProduit from "./CommentaireProduit";
import CountryPage from "./CountryPage";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { shuffle } from "lodash";
import Alert from "./Alert";
import AppPromo from "./AppPromo";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import { setProducts } from "@/redux/productsSlice";

// Fonction utilitaire pour combiner les classes CSS
function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface ProduitDetailMainProps {
  panierchg?: () => void;
  productId: string;
  serverData?: any; // Type pour les données serveur
}

function ProduitDetailMain({ panierchg, productId, serverData }: ProduitDetailMainProps) {
  const router = useRouter();
  const swiperRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeImage, setSelectedSizeImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [Allcommente, setAllCommente] = useState([]);
  const [categorie, setCategorie] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsAutres, setProductsAutres] = useState<any[]>([]);
  const [produitsL, setProduitsL] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const westAfricanCountries = [
    "benin",
    "burkina Faso",
    "cap-Vert",
    "côte d'Ivoire",
    "gambie",
    "ghana",
    "guinee",
    "guinee-Bissau",
    "liberia",
    "mali",
    "niger",
    "nigeria",
    "senegal",
    "sierra Leone",
    "togo",
  ];

  const [regionClient, setRegionClient] = useState("Niamey");
  const [pays, setPays] = useState("Niger");
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: "error" | "success" | "warn" | "info";
    message: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  // Gestion sécurisée du localStorage pour Next.js
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userEcomme = localStorage.getItem("userEcomme");
      if (userEcomme) {
        const userData = JSON.parse(userEcomme);
        setUser(userData);
        setUserId(userData?.id);
      }
    }
  }, []);

  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
  const API_URL = process.env.NEXT_PUBLIC_Backend_Url;
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const DATA_Products = useAppSelector((state) => state.products.data);
  const DATA_Types = useAppSelector((state) => state.products.types);
  const DATA_Categories = useAppSelector((state) => state.products.categories);
  const likedProducts = useAppSelector((state) => state.likes.likedProducts);
  
  // État local pour les données immédiates (hydratation SSR)
  const [immediateProducts, setImmediateProducts] = useState<any[]>([]);
  const [immediateProduct, setImmediateProduct] = useState<any>(null);
  const [immediateTypes, setImmediateTypes] = useState<any[]>([]);
  const [immediateCategories, setImmediateCategories] = useState<any[]>([]);
  
  // Hydratation immédiate avec les données serveur
  useEffect(() => {
    if (serverData) {
      // Utiliser immédiatement les données serveur pour un affichage instantané
      if (serverData.product) {
        setImmediateProduct(serverData.product);
      }
      
      const allProductsData = [
        ...(serverData.product ? [serverData.product] : []),
        ...serverData.similarProducts,
        ...serverData.allProducts
      ];
      
      setImmediateProducts(allProductsData);
      
      // Ajouter types et catégories si disponibles
      if (serverData.type) {
        setImmediateTypes([serverData.type]);
      }
      if (serverData.category) {
        setImmediateCategories([serverData.category]);
      }
    }
  }, [serverData]);
  
  // Utiliser les données immédiates si disponibles, sinon fallback sur Redux
  const effectiveProducts = immediateProducts.length > 0 ? immediateProducts : DATA_Products;
  const effectiveProduct = immediateProduct || effectiveProducts.find((p: any) => p._id === productId);
  const effectiveTypes = immediateTypes.length > 0 ? immediateTypes : DATA_Types;
  const effectiveCategories = immediateCategories.length > 0 ? immediateCategories : DATA_Categories;
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserLikes(userId));
    }
  }, [userId, dispatch]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLikeClick = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!userId) {
      showToast("Veuillez vous connecter pour ajouter des favoris", "error");
      return;
    }

    try {
      await dispatch(toggleLike({ userId, product })).unwrap();
      showToast(
        likedProducts.includes(product._id)
          ? "Produit retiré des favoris"
          : "Produit ajouté aux favoris"
      );
    } catch (error) {
      showToast("Une erreur est survenue", "error");
      console.error("Erreur:", error);
    }
  };

  // Utiliser effectiveProduct au lieu de rechercher dans DATA_Products
  const produit = effectiveProduct;
  const [selectedVariant, setSelectedVariant] = useState(produit?.variants?.[0]);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const img = e.currentTarget.querySelector("img");
    if (img) {
      img.scrollBy(e.deltaX, e.deltaY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - left;
    const offsetY = e.clientY - top;
    const scrollX = (offsetX / width) * 100;
    const scrollY = (offsetY / height) * 100;
    const img = e.currentTarget.querySelector("img") as HTMLImageElement;
    if (img) {
      img.style.transform = `translate(-${scrollX}px, -${scrollY}px)`;
    }
  };

  // Définition des variables CSS
  const styles = {
    scrollbarHide: {
      scrollbarWidth: "none" as const,
      msOverflowStyle: "none" as const,
      overflowX: "auto" as const,
      overflowY: "auto" as const,
      WebkitOverflowScrolling: "touch" as const,
      display: "-webkit-box" as const,
      WebkitBoxOrient: "vertical" as const,
    },
    container: {
      backgroundColor: "#CCC",
      padding: "12px",
      gap: "12px",
    },
    card: {
      width: "100px",
      padding: "8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    zoomContainer: {
      overflow: "hidden" as const,
      position: "relative" as const,
      perspective: "1000px",
    },
    zoomImage: {
      transform: isZoomed ? "scale(0)" : "scale(1)",
      transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`,
      transition: "transform 0.1s ease",
    },
  };

  useEffect(() => {
    setSelectedSize(null);
    setSelectedVariant(produit?.variants?.[0]);
    setSelectedSizeImage(null);
    setQuantity(1);
    setLiked(false);
  }, [productId, produit]);

  const images = [
    produit?.image1,
    produit?.image2,
    produit?.image3,
  ].filter((image: string | undefined): image is string => image !== undefined && image.startsWith("http"));

  // Récupérer toutes les images disponibles
  const getAllImages = () => {
    const baseImages = images || [];
    const variantImages = Array.isArray(produit?.variants)
      ? produit.variants.map((variant: any) => variant?.imageUrl).filter(Boolean)
      : [];
    return [...baseImages, ...variantImages];
  };

  // Gestion du changement de variante
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setSelectedSize(null);

    const images = getAllImages();
    const variantImageIndex = images.findIndex(
      (img: string) => img === variant.imageUrl
    );
    if (variantImageIndex !== -1) {
      setActiveImageIndex(variantImageIndex);
    }
  };

  // Nouvelle méthode de navigation entre les images
  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % getAllImages().length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setActiveImageIndex(
      (prev) => (prev - 1 + getAllImages().length) % getAllImages().length
    );
    setZoomLevel(1);
  };

  const getAvailableStock = () => {
    // Si le produit a des variants
    if (produit?.variants && produit.variants.length > 0) {
      // Si une variante est sélectionnée, retourner son stock
      if (selectedVariant) {
        return selectedVariant.stock || 0;
      }
      // Si aucune variante sélectionnée, retourner le stock total des variants
      return produit.variants.reduce((total: number, variant: any) => total + (variant.stock || 0), 0);
    }

    // Si pas de variants, utiliser la quantité générale du produit
    return produit?.quantite || 0;
  };

  const increaseQuantity = () => {
    if (!produit) return;
    
    const availableStock = getAvailableStock();
    const existingProducts = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("panier") || "[]") 
      : [];
      
    const existingProduct = existingProducts.find((p: any) => {
      if (!produit.variants || produit.variants.length === 0) {
        return p?._id === produit?._id;
      }
      return (
        p?._id === produit?._id &&
        p.colors[0] === selectedVariant?.color &&
        p.sizes[0] === selectedSize
      );
    });

    const currentCartQuantity = existingProduct ? existingProduct.quantity : 0;
    const maxAllowed = availableStock - currentCartQuantity;

    if (quantity < maxAllowed) {
      setQuantity(prev => prev + 1);
    } else {
      handleWarning(`Maximum ${maxAllowed} produits disponibles`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Pour les like
  const handleLike = () => {
    if (!liked) {
      setLiked(true);
    }
  };

  //pour les share
  const ShareModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
      <div
        style={{ zIndex: 100 }}
        className="fixed inset-0 z-10 flex items-center p-3 justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2
            className="text-xl font-bold mb-4 text-center"
            style={{ color: "#30A08B" }}
          >
            Partager sur
          </h2>
          <div className="flex justify-around mb-4">
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://ihambaobab.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="w-8 h-8 text-blue-600 hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://wa.me/?text=https://ihambaobab.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="w-8 h-8 text-green-500 hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://www.linkedin.com/shareArticle?mini=true&url=https://ihambaobab.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="w-8 h-8 text-blue-700 hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="w-8 h-8 text-pink-600 hover:scale-110 transition-transform" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-red-500 text-white p-2 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="mr-2" />
            Fermer
          </button>
        </div>
      </div>
    );
  };

  const handleShareClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  // pour les commentaire
  const StarRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
    return (
      <div className="flex items-center justify-center mb-4">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`w-6 h-6 cursor-pointer ${index < rating ? "text-[#30A08B]" : "text-gray-400"
              }`}
            onClick={() => setRating(index + 1)}
          />
        ))}
        <span className="ml-2 text-sm" style={{ color: "#B17236" }}>
          Note: {rating}
        </span>
      </div>
    );
  };

  useEffect(() => {
    if (productId && BackendUrl) {
      axios
        .get(`${BackendUrl}/getAllCommenteProduitById/${productId}`)
        .then((coments) => {
          setAllCommente(coments.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [productId, BackendUrl]);

  // Déclare une fonction pour sélectionner des commentaires aléatoires
  const selectRandomComments = (comments: any[], maxCount: number) => {
    if (comments.length <= maxCount) {
      return comments;
    }
    const shuffled = comments.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, maxCount);
  };

  const randomComments = selectRandomComments(Allcommente, 20);

  useEffect(() => {
    // Filtrer les produits basés sur la condition donnée
    const filteredProducts = DATA_Products.filter(
      (item: any) => item.ClefType === produit?.ClefType
    );
    const type = DATA_Types.find((item: any) => item._id === produit?.ClefType);
    const categorie = DATA_Categories.find(
      (item: any) => item._id === type?.clefCategories
    );

    setCategorie(categorie);

    // Obtenir les éléments aléatoires à partir du tableau filtré
    const getRandomElements = (array: any[], nbr: number) => {
      const shuffledArray = shuffle(array);
      return shuffledArray.slice(0, nbr);
    };

    // Définir les produits aléatoires dans l'état
    setProducts(getRandomElements(filteredProducts, 12));
    setProductsAutres(getRandomElements(DATA_Products, 12));
  }, [DATA_Products, produit, DATA_Types, DATA_Categories]);

  const showAlert = (type: "error" | "success" | "warn" | "info", message: string) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "success", message: "" });
    }, 5000);
  };

  const handleSuccess = (message: string) => {
    showAlert("success", message);
  };

  const handleWarning = (message: string) => {
    showAlert("warn", message);
  };

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    const regexNumber = /^[0-5]$/;
    if (commentText.trim().length < 3) {
      handleWarning("votre commentaire doit contenire au moin 3 carracteres.");
      return;
    }
    if (rating === 0) {
      handleWarning("veuiller noter ce produit s'il vous plait.");
      return;
    }
    if (!regexNumber.test(rating.toString())) {
      handleWarning("forma non valid de 1 a 5 s'il vous plait!");
      return;
    }
    if (BackendUrl) {
      axios
        .post(`${BackendUrl}/createCommenteProduit`, {
          description: commentText,
          clefProduct: produit?._id,
          clefType: produit?.ClefType,
          etoil: rating,
          userName: user?.name,
        })
        .then((resp) => {
          handleSuccess(resp.data.message);
          setIsCommentOpen(false);
          setCommentText("");
          setRating(0);

          axios
            .get(`${BackendUrl}/getAllCommenteProduitById/${productId}`)
            .then((coments) => {
              setAllCommente(coments.data.data);
            })
            .catch((error) => {
              handleWarning(error.response?.data || "Erreur");
              console.log(error);
            });
        })
        .catch((error) => {
          handleWarning(error.response?.data || "Erreur");
          console.log(error);
        });
    }
  };

  // Calculer le prix et la remise
  const originalPrice = produit?.prix || 0;
  const discountedPrice = produit?.prixPromo || 0;
  const discountPercentage = originalPrice > 0 && discountedPrice > 0 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const addToCart = () => {
    if (!produit) return;
    
    if (!westAfricanCountries.includes(pays?.toLowerCase())) {
      handleWarning(`ce Produit ne peut etre expedier au ${pays}`);
      return;
    }
    
    // Vérification des variantes de couleur
    if (produit?.variants && produit.variants.length >= 2 && !selectedVariant) {
      handleWarning(
        `Veuillez choisir un modèle parmi les ${produit.variants.length}`
      );
      return;
    }

    // Vérification des tailles
    const hasMultipleSizes1 = produit?.variants?.some(
      (variant: any) => variant.sizes && variant.sizes.length >= 1
    );
    const hasMultipleSizes = produit?.variants?.some(
      (variant: any) => variant.sizes && variant.sizes.length >= 2
    );

    if (hasMultipleSizes1 && !selectedSize) {
      handleWarning(`Veuillez selectionner la taille disponible`);
      return;
    } else if (hasMultipleSizes && !selectedSize) {
      handleWarning(`Veuillez choisir une taille parmi les disponibles`);
      return;
    }

    // NOUVELLE VALIDATION DU STOCK
    const availableStock = getAvailableStock();
    if (availableStock <= 0) {
      handleWarning("Ce produit est en rupture de stock");
      return;
    }

    if (typeof window !== 'undefined') {
      // Vérifier le stock existant dans le panier
      const existingProducts = JSON.parse(localStorage.getItem("panier") || "[]");
      const existingProduct = existingProducts.find((p: any) => {
        if (!produit?.variants || produit.variants.length === 0) {
          return p?._id === produit?._id;
        }
        return (
          p?._id === produit?._id &&
          p.colors[0] === selectedVariant?.color &&
          p.sizes[0] === selectedSize
        );
      });

      const currentCartQuantity = existingProduct ? existingProduct.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      if (totalRequestedQuantity > availableStock) {
        handleWarning(
          `Stock insuffisant. Disponible: ${availableStock}, Dans le panier: ${currentCartQuantity}`
        );
        return;
      }

      // Vérifier si le produit existe déjà dans le panier
      const existingProductIndex = existingProducts.findIndex((p: any) => {
        if (!produit?.variants || produit.variants.length === 0) {
          return p?._id === produit?._id;
        }
        return (
          p?._id === produit?._id &&
          p.colors[0] === selectedVariant?.color &&
          p.sizes[0] === selectedSize
        );
      });

      if (existingProductIndex !== -1) {
        // Produit existant : incrémenter la quantité
        const updatedProducts = existingProducts.map((p: any, index: number) =>
          index === existingProductIndex ? { ...p, quantity: p.quantity + quantity } : p
        );

        localStorage.setItem("panier", JSON.stringify(updatedProducts));
        handleSuccess(
          `${quantity} produit(s) ajouté(s) au panier !`
        );
      } else {
        // Nouveau produit à ajouter
        const newProduct = {
          ...produit,
          colors: selectedVariant ? [selectedVariant.color] : [],
          sizes: selectedSize ? [selectedSize] : [],
          quantity: quantity,
          _id: produit?._id,
          imageUrl: selectedVariant ? selectedVariant.imageUrl : produit?.image1,
          price:
            discountedPrice && discountedPrice > 0
              ? discountedPrice
              : originalPrice,
          prixPromo: discountedPrice,
        };

        const updatedProducts = [...existingProducts, newProduct];
        localStorage.setItem("panier", JSON.stringify(updatedProducts));
        handleSuccess("Produit ajouté au panier !");
      }

      // Mettre à jour la longueur du panier
      const local = localStorage.getItem("panier");
      if (panierchg) {
        panierchg();
      }
      if (local) {
        setProduitsL(JSON.parse(local));
      } else {
        setProduitsL(0);
      }
    }
  };

  const addToCart2 = () => {
    addToCart();
    router.push("/Panier");
  };

  // Gestion du zoom avec la molette de souris
  const handleImageWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoomLevel = Math.min(Math.max(zoomLevel + delta, 1), 5);
    setZoomLevel(newZoomLevel);
  };

  // Gestion du début du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      const startX = e.clientX - imagePosition.x;
      const startY = e.clientY - imagePosition.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!imageRef.current || !containerRef.current) return;

        const newX = moveEvent.clientX - startX;
        const newY = moveEvent.clientY - startY;

        // Limiter le mouvement aux dimensions de l'image
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const maxMoveX = (imgRect.width * zoomLevel - containerRect.width) / 2;
        const maxMoveY =
          (imgRect.height * zoomLevel - containerRect.height) / 2;

        const boundedX = Math.min(Math.max(newX, -maxMoveX), maxMoveX);
        const boundedY = Math.min(Math.max(newY, -maxMoveY), maxMoveY);

        setImagePosition({ x: boundedX, y: boundedY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  // Navigation entre les images dans la modal
  const navigateModal = (direction: "next" | "prev") => {
    const images = getAllImages();
    const newIndex =
      direction === "next"
        ? (activeImageIndex + 1) % images.length
        : (activeImageIndex - 1 + images.length) % images.length;

    setActiveImageIndex(newIndex);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const detecterRegion = async () => {
      try {
        if (BackendUrl) {
          const ip = await axios.get("https://ifconfig.me/ip");
          const response = await axios.get(`${BackendUrl}/proxy/ip-api`, {
            headers: {
              "Client-IP": ip.data,
            },
          });
          const region = response.data.regionName || "Niamey";
          const pays = response.data.country || "Niger";
          setRegionClient(region.toLowerCase());
          setPays(pays.toLowerCase());
        }
      } catch (error) {
        console.error("Erreur de détection de région", error);
      }
    };

    detecterRegion();
  }, [BackendUrl]);

  const stripHtml = (html: string) => {
    if (typeof window !== 'undefined') {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    return html;
  };

  // Créer une description SEO optimisée
  const generateSEODescription = () => {
    const cleanText =
      typeof produit?.description === "string"
        ? stripHtml(produit?.description)
        : "";
    return `${produit?.name} - ${cleanText?.slice(0, 150)}... Prix: ${produit?.prixf || produit?.prix
      } XOF. Livraison disponible.`;
  };

  // Créer des mots-clés SEO pertinents
  const generateSEOKeywords = () => {
    return `${produit?.name}, ${categorie?.name}, achat en ligne, e-commerce, ${pays}`;
  };

  // Créer le titre SEO optimisé
  const generateSEOTitle = () => {
    return `${produit?.name} | ${categorie?.name} | Achetez en ligne`;
  };

  // Créer l'URL canonique
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ProduitDetail/${productId}` 
    : "";

  // Ajout de la fonction pour gérer le clic sur le bouton WhatsApp
  const handleWhatsAppChat = () => {
    if (typeof window !== 'undefined') {
      const currentURL = window.location.href;

      let message = `Bonjour, je suis intéressé(e) par le produit ${produit?.name}.\n`;

      if (produit?.image1) {
        message += `Voici le lien vers l'image :\n${produit?.image1}\n\n`;
      }

      message += `Lien vers les détails du produit :\n${currentURL}`;

      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = "22787727501";
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div className="container mx-auto p-4" ref={swiperRef}>
      <Head>
        <title>{generateSEOTitle()}</title>
        <meta name="description" content={generateSEODescription()} />
        <meta name="keywords" content={generateSEOKeywords()} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" type="image/jpeg" href={produit?.image1} />
        <link rel="apple-touch-icon" href={produit?.image1} />
        <meta property="og:title" content={generateSEOTitle()} />
        <meta property="og:description" content={generateSEODescription()} />
        <meta property="og:image" content={produit?.image1} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="IHAM Baobab" />
        <meta
          property="product:price:amount"
          content={String(produit?.prixf || produit?.prix || 0)}
        />
        <meta property="product:price:currency" content="XOF" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={generateSEOTitle()} />
        <meta name="twitter:description" content={generateSEODescription()} />
        <meta name="twitter:image" content={produit?.image1} />
      </Head>

      {showNotification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg transition-all duration-300",
            notificationType === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          )}
        >
          <p className="text-sm">{notificationMessage}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Galerie de miniatures */}
        <div
          className="w-full lg:w-auto h-40 lg:h-96"
          style={styles.scrollbarHide}
        >
          <div
            className="flex w-[90px] lg:flex-col gap-2"
            style={{
              marginTop: "55px",
            }}
          >
            {getAllImages().map((image: string, index: number) => (
              <div
                key={index}
                className={`w-[80px] h-[80px] cursor-pointer rounded flex-shrink-0 overflow-hidden transition-all duration-200 ${activeImageIndex === index
                    ? "border-2 border-solid border-[#30A08B]"
                    : "border border-gray-300"
                  }`}
                onMouseEnter={() => setActiveImageIndex(index)}
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-200 transform hover:scale-105"
                  src={image}
                  alt={`Product ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Visualisateur d'image principal */}
        <div className="flex-grow flex flex-col lg:flex-row gap-4">
          <div
            className="lg:h-96 border-[#ccc] border flex lg:flex-1 cursor-pointer rounded-md overflow-hidden col-12"
            onWheel={handleWheel}
            style={styles.zoomContainer}
            onClick={() => setIsModalOpen1(true)}
          >
            <img
              className="w-full h-auto object-cover"
              src={getAllImages()[activeImageIndex]}
              alt=""
              style={styles.zoomImage}
            />
            <div
              className="absolute z-1 top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 bg-[#30A08B] text-white rounded-full p-2 cursor-pointer flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <span className="text-lg">←</span>
            </div>
            <div
              className="absolute z-1 top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 bg-[#30A08B] text-white rounded-full p-2 cursor-pointer flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <span className="text-lg">→</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#30A08B] opacity-10 group-hover:scale-105 transition-transform duration-300"></div>
          </div>

          {/* Section des informations de produit */}
          <div className="flex lg:flex-1">
            <div className="border-[#ccc] p-2 border cursor-pointer rounded-md overflow-hidden w-full">
              {discountedPrice > 0 ? (
                <div className="bg-[#F9394F] rounded-md p-2 h-[30px] flex justify-start items-center w-full">
                  <span className="text-start text-white font-bold text-lg">
                    Offre Limitée
                  </span>
                </div>
              ) : (
                <div className="bg-[#30A08B] rounded-md p-2 h-[30px] flex justify-start items-center w-full">
                  <span className="text-start text-white font-bold text-lg">
                    Nouveaus
                  </span>
                </div>
              )}

              <div className="p-2">
                {discountedPrice > 0 ? (
                  <h1 className="text-lg font-bold">
                    XOF {discountedPrice}{" "}
                    <span className="line-through text-red-500">
                      XOF {originalPrice}
                    </span>{" "}
                    -{discountPercentage}%
                  </h1>
                ) : (
                  <span className="text-lg font-bold">XOF {originalPrice}</span>
                )}

                <div className="my-2 w-full flex items-center">
                  <div className="w-24 mr-2">
                    <img
                      src="/logoPromo.png"
                      alt="Promotion"
                      className="w-full h-auto z-2"
                    />
                  </div>
                  <p className="text-sm text-gray-600">2+ pièces, extra -5%</p>
                </div>
                <p className="text-xs text-gray-600">Prix hors taxe</p>
                <p className="font-bold text-xs">{produit?.name}</p>
                {produit?.shipping?.weight ? (
                  <p className="font-bold text-xs">
                    Poids : {produit?.shipping?.weight} kg
                  </p>
                ) : null}
                <div className="my-2">
                  <p className={`text-sm ${getAvailableStock() > 5 ? 'text-green-600' :
                    getAvailableStock() > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    {getAvailableStock() > 0
                      ? `Stock disponible: ${getAvailableStock()}`
                      : "Rupture de stock"
                    }
                  </p>
                </div>
              </div>

              {produit?.variants && produit.variants.length > 0 ? (
                <>
                  <div className="flex py-2 p-2 items-center">
                    <p className="text-xs font-bold mr-1">Couleur:</p>
                    <p className="text-xs font-bold mr-1">
                      {selectedVariant?.color}
                    </p>
                  </div>

                  <div className="flex space-x-2 p-2">
                    {produit?.variants.map((variant: any, index: number) => (
                      <div
                        className={`w-[70px] h-[70px] rounded-md overflow-hidden transition-all duration-200 
                      ${selectedVariant?.color === variant?.color
                            ? "border-2 border-solid border-[#30A08B]"
                            : "border border-gray-300"
                          }`}
                        key={index}
                      >
                        <img
                          className="w-full h-full object-cover cursor-pointer"
                          src={variant.imageUrl}
                          alt={`Image ${variant.color}`}
                          onClick={() => handleVariantChange(variant)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {produit?.variants && produit.variants.length > 0 ? (
                <div className="flex flex-col p-1">
                  <div className="flex py-2 items-center">
                    <p className="text-xs font-bold mr-1">Taille du Produit:</p>
                    <p className="text-xs font-bold mr-1">
                      {selectedSize
                        ? `${selectedSize}`
                        : "Sélectionnez une taille"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant?.sizes?.map((size: string, index: number) => (
                      <div
                        key={index}
                        className={`w-24 h-[46px] flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 
                      ${selectedSize === size
                            ? "border-2 border-[#30A08B]"
                            : "border border-gray-300"
                          }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        <p className="text-sm font-bold">{`${size}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                onClick={(e) => produit?._id && handleLikeClick(produit, e)}
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  produit?._id && likedProducts.includes(produit._id)
                    ? "bg-red-50 hover:bg-red-100"
                    : "bg-white hover:bg-emerald-50"
                )}
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    produit?._id && likedProducts.includes(produit._id)
                      ? "text-red-500 fill-red-500"
                      : "text-emerald-600"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de zoom amélioré */}
        {isModalOpen1 && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => {
              setIsModalOpen1(false);
              setZoomLevel(1);
              setImagePosition({ x: 0, y: 0 });
            }}
          >
            <div
              ref={containerRef}
              className="relative w-[90%] h-[90%] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton de fermeture */}
              <button
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors duration-300 z-50"
                onClick={() => setIsModalOpen1(false)}
              >
                <X size={32} strokeWidth={2} />
              </button>

              {/* Boutons de navigation */}
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
                <button
                  className="bg-[#30A08B] hover:bg-[#228B73] backdrop-blur-sm p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
                  onClick={() => navigateModal("prev")}
                >
                  <ChevronLeft
                    size={24}
                    className="text-white"
                    strokeWidth={2}
                  />
                </button>
              </div>

              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
                <button
                  className="bg-[#30A08B] hover:bg-[#228B73] backdrop-blur-sm p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
                  onClick={() => navigateModal("next")}
                >
                  <ChevronRight
                    size={24}
                    className="text-white"
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Contrôles de zoom */}
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <button
                  className="bg-[#30A08B] hover:bg-[#228B73] backdrop-blur-sm p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
                  onClick={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}
                >
                  <ZoomOut size={24} className="text-white" strokeWidth={2} />
                </button>
                <button
                  className="bg-[#30A08B] hover:bg-[#228B73] backdrop-blur-sm p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
                  onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 5))}
                >
                  <ZoomIn size={24} className="text-white" strokeWidth={2} />
                </button>
              </div>

              {/* Container de l'image avec gestion du zoom et du déplacement */}
              <div
                ref={containerRef}
                className="flex items-center justify-center w-full h-full overflow-hidden"
                onWheel={handleImageWheel}
              >
                <img
                  ref={imageRef}
                  src={getAllImages()[activeImageIndex]}
                  alt="Zoomed Image"
                  onMouseDown={handleMouseDown}
                  className={`transition-transform duration-300 cursor-${zoomLevel > 1 ? "move" : "zoom-in"
                    }`}
                  style={{
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    willChange: "transform",
                    userSelect: "none",
                    pointerEvents: isDragging ? "none" : "auto",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="py-2">
        <div className="w-full border bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Livré vers</h2>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsCountryOpen(true)}
              >
                <MapPin className="w-5 h-5 mr-1" />
                <span>{pays?.toLocaleUpperCase()}</span>
              </div>
              {isCountryOpen && (
                <div className="fixed inset-0 p-3 z-10 flex items-center justify-center bg-black bg-opacity-50">
                  <CountryPage
                    isOpen={isOpenCountry}
                    setIsCountryOpen={setIsCountryOpen}
                    onClose={() => setIsCountryOpen(false)}
                    setPays={setPays}
                  />
                </div>
              )}
            </div>

            {!westAfricanCountries.includes(pays?.toLowerCase()) ? (
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">L&apos;engagement IHAM Baobab</h3>
                <div className="flex items-start space-x-2 text-gray-600">
                  <Truck className="w-5 h-5 mt-1 flex-shrink-0" />
                  <p>
                    Cet article ne peut pas être livré à cette adresse.
                    Sélectionnez un autre article ou une autre adresse.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Sécurité et vie privée
              </h3>
              <p className="text-sm text-gray-600">
                Paiements sûrs: Nous ne partageons pas vos données personnelles
                avec des tiers sans votre consentement.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Informations personnelles sécurisées: Nous protégeons votre vie
                privée et assurons la sécurité de vos données personnelles.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quantité</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={decreaseQuantity}
                  className="p-2 border rounded-md border-[#B2905F] text-[#B2905F] hover:bg-[#B17236] hover:text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-30 text-center border rounded-md p-1 border-gray-300"
                />
                <button
                  onClick={increaseQuantity}
                  className="p-2 border rounded-md border-[#B2905F] text-[#B2905F] hover:bg-[#B17236] hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Vous pouvez ajouter autant de produits que vous le souhaitez.
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-2">
              <button
                onClick={addToCart2}
                disabled={getAvailableStock() <= 0}
                className={`w-full py-3 rounded-md mb-2 md:mb-0 ${getAvailableStock() <= 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-[#30A08B] hover:bg-[#228B73] text-white'
                  }`}
              >
                {getAvailableStock() <= 0 ? "Rupture de stock" : "Acheter maintenant"}
              </button>
              <button
                onClick={addToCart}
                className="w-full bg-red-100 hover:bg-red-200 text-red-600 py-3 rounded-md mb-2 md:mb-0"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
          <div className="flex justify-between px-6 py-4 border-t">
            <div className="flex flex-col items-center">
              <button
                className="p-2"
                onClick={() =>
                  router.push(`/Boutique/${produit?.Clefournisseur?._id}`)
                }
              >
                <Store className="w-5 h-5" />
              </button>
              <span className="text-sm">Boutique</span>
            </div>
            {/* Nouveau style pour le bouton WhatsApp */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleWhatsAppChat}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 transform hover:scale-105"
                title="Discuter sur WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5" />
              </button>
              <span className="text-sm text-green-600 font-medium">
                WhatsApp
              </span>
            </div>

            {user ? (
              <div className="flex flex-col items-center">
                <button
                  className="p-2 flex items-center"
                  onClick={() => setIsCommentOpen(true)}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                <span className="text-sm">Commenter</span>

                {isCommentOpen && (
                  <div
                    style={{ zIndex: 100 }}
                    className="fixed inset-0 p-3 z-10 flex items-center justify-center bg-black bg-opacity-50"
                  >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                      <h2
                        className="text-xl font-bold mb-4 text-center"
                        style={{ color: "#30A08B" }}
                      >
                        Ajouter un commentaire
                      </h2>
                      <StarRating rating={rating} setRating={setRating} />
                      <form onSubmit={envoyer} className="flex flex-col mb-4">
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          rows={3}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Écrire un commentaire..."
                          style={{ borderColor: "#B2905F" }}
                        />
                        <button
                          type="submit"
                          className="mt-2 bg-[#B17236] text-white p-2 rounded hover:bg-[#B2905F] transition-colors"
                        >
                          Envoyer
                        </button>
                      </form>
                      <button
                        onClick={() => {
                          setIsCommentOpen(false);
                          setRating(0);
                          setCommentText("");
                        }}
                        className="mt-4 w-full bg-red-500 text-white p-2 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="mr-2" />
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex flex-col items-center">
              <button className="p-2" onClick={handleShareClick}>
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-sm">Partager</span>
              <ShareModal isOpen={isModalOpen} onClose={handleClose} />
            </div>
          </div>
        </div>
      </div>
      
      <ProduitSimilaires
        titre={"Articles similaires"}
        produits={products}
        userId={userId}
        onLike={handleLikeClick}
      />

      <div className="py-3">
        <div className="border-t border-gray-300 mb-4" />

        <h2 className="text-2xl font-semibold text-[#B17236] mb-2">
          Produit Détail
        </h2>

        <p
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: produit?.description || "",
          }}
        ></p>
      </div>

      <AppPromo />

      <ProduitSimilaires
        titre={"Autres Articles"}
        produits={productsAutres}
        userId={userId}
        onLike={handleLikeClick}
      />
      
      <CommentaireProduit
        name={produit?.name || ""}
        img={[produit?.image1 || "", produit?.image2 || "", produit?.image3 || ""].filter(Boolean)}
        coments={Allcommente}
        categorie={categorie}
      />

      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ visible: false, type: "success", message: "" })}
        />
      )}
    </div>
  );
}

export default ProduitDetailMain;
