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
import { useParams, useRouter } from "next/navigation";
import { shuffle } from "lodash";
import Alert from "./Alert";
import AppPromo from "./AppPromo";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";

// Fonction utilitaire pour combiner les classes CSS
function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface ProduitDetailMainProps {
  panierchg?: () => void;
}

interface Product {
  _id: string;
  name: string;
  prix: number;
  prixPromo?: number;
  image1: string;
  image2?: string;
  image3?: string;
  image4?: string;
  quantite: number;
  category: string;
  description: string;
  ClefType?: string;
  taille?: string[];
  couleur?: string[];
  pointure?: string[];
  matiere?: string;
  marque?: string;
}

interface Comment {
  _id: string;
  userName?: string;
  etoil: number;
  description?: string;
  review: string;
  date: string;
}

interface Categorie {
  _id: string;
  name: string;
}

function ProduitDetailMain({ panierchg }: ProduitDetailMainProps) {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_Backend_Url;
  
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [category, setCategory] = useState<Categorie | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // États pour les images et le zoom
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  
  // États pour les variantes
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedPointure, setSelectedPointure] = useState<string>("");
  
  // États pour les modales
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [pays, setPays] = useState("Bénin");
  
  // États pour les alertes
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  
  // Redux
  const dispatch = useAppDispatch();
  const likedProducts = useAppSelector((state) => state.likes.likedProducts);
  const [liked, setLiked] = useState(false);

  // Récupération de l'userId depuis localStorage
  useEffect(() => {
    const userEcomme = localStorage.getItem("userEcomme");
    if (userEcomme) {
      const user = JSON.parse(userEcomme);
      setUserId(user?.id);
    }
  }, []);

  // Chargement des likes utilisateur
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserLikes(userId));
    }
  }, [userId, dispatch]);

  // Vérification si le produit est liké
  useEffect(() => {
    if (product && likedProducts.includes(product._id)) {
      setLiked(true);
    }
  }, [product, likedProducts]);

  // Chargement du produit
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/produit/${id}`);
        const productData = response.data;
        
        setProduct(productData);
        
        // Initialiser les variantes
        if (productData.couleur && productData.couleur.length > 0) {
          setSelectedColor(productData.couleur[0]);
        }
        if (productData.taille && productData.taille.length > 0) {
          setSelectedSize(productData.taille[0]);
        }
        if (productData.pointure && productData.pointure.length > 0) {
          setSelectedPointure(productData.pointure[0]);
        }
        
        // Charger les produits similaires
        const productsResponse = await axios.get(`${API_URL}/produit`);
        const shuffledProducts = shuffle(productsResponse.data).slice(0, 12);
        setProducts(shuffledProducts);
        
        // Charger les commentaires
        try {
          const commentsResponse = await axios.get(`${API_URL}/commentaire/produit/${id}`);
          setComments(commentsResponse.data || []);
        } catch (error) {
          console.log("Aucun commentaire trouvé");
          setComments([]);
        }
        
        // Charger la catégorie
        if (productData.ClefType) {
          try {
            const categoryResponse = await axios.get(`${API_URL}/type/${productData.ClefType}`);
            setCategory(categoryResponse.data);
          } catch (error) {
            console.log("Catégorie non trouvée");
          }
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        showToast("Erreur lors du chargement du produit", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_URL]);

  // Images du produit
  const productImages = product ? [
    product.image1,
    product.image2,
    product.image3,
    product.image4
  ].filter(Boolean) : [];

  // Gestion du zoom sur l'image
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  // Navigation des images
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  // Gestion des quantités
  const increaseQuantity = () => {
    if (product && quantity < product.quantite) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Gestion des likes
  const handleLike = async () => {
    if (!userId) {
      showToast("Veuillez vous connecter pour ajouter des favoris", "error");
      return;
    }

    if (!product) return;

    try {
      await dispatch(toggleLike({ userId, product })).unwrap();
      setLiked(!liked);
      showToast(
        liked ? "Produit retiré des favoris" : "Produit ajouté aux favoris"
      );
    } catch (error) {
      showToast("Une erreur est survenue", "error");
      console.error("Erreur:", error);
    }
  };

  // Ajout au panier
  const handleAddToCart = () => {
    if (!product) return;
    
    if (quantity > product.quantite) {
      showToast("Quantité non disponible en stock", "error");
      return;
    }

    const cartItem = {
      ...product,
      quantity,
      selectedColor,
      selectedSize,
      selectedPointure,
    };

    // Récupérer le panier existant
    const existingCart = JSON.parse(localStorage.getItem("panier") || "[]");
    
    // Vérifier si le produit existe déjà
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item._id === product._id &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize &&
      item.selectedPointure === selectedPointure
    );

    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Ajouter le nouvel item
      existingCart.push(cartItem);
    }

    // Sauvegarder dans localStorage
    localStorage.setItem("panier", JSON.stringify(existingCart));
    
    showToast(`${product.name} ajouté au panier !`);
    
    if (panierchg) {
      panierchg();
    }
  };

  // Chat WhatsApp
  const handleWhatsAppChat = () => {
    if (!product) return;
    
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par ce produit: ${product.name} (${product.prix} FCFA). Pouvez-vous me donner plus d'informations ?`
    );
    window.open(`https://wa.me/+22997979797?text=${message}`, "_blank");
  };

  // Affichage des alertes
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Modal de partage
  const ShareModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen || !product) return null;

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Découvrez ce produit: ${product.name} - ${product.prix} FCFA`;

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
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              <FaWhatsapp size={24} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
            >
              <FaInstagram size={24} />
            </a>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#30A08B]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Produit non trouvé</h2>
          <button
            onClick={() => router.push("/")}
            className="bg-[#30A08B] text-white px-6 py-2 rounded-lg hover:bg-[#268771] transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - ihambaobab</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image1} />
        <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alertes */}
        {showAlert && (
          <Alert
            message={alertMessage}
            type={alertType}
            onClose={() => setShowAlert(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Section Images */}
          <div className="space-y-4">
            {/* Image principale */}
            <div
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                ref={imageRef}
                src={productImages[currentImageIndex]}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-300",
                  isZoomed && "scale-150"
                )}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
              />
              
              {/* Boutons de navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Indicateur de zoom */}
              <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>

            {/* Miniatures */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                      currentImageIndex === index
                        ? "border-[#30A08B]"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Détails */}
          <div className="space-y-6">
            {/* Titre et prix */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-[#30A08B]">
                  {product.prix?.toLocaleString()} FCFA
                </span>
                {product.prixPromo && product.prixPromo > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.prixPromo?.toLocaleString()} FCFA
                  </span>
                )}
              </div>
            </div>

            {/* Évaluations */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= 4 ? "text-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({comments.length} avis)
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  product.quantite > 0 ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span className="text-sm text-gray-600">
                {product.quantite > 0
                  ? `${product.quantite} en stock`
                  : "Rupture de stock"
                }
              </span>
            </div>

            {/* Variantes Couleur */}
            {product.couleur && product.couleur.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Couleur: {selectedColor}
                </h3>
                <div className="flex space-x-2">
                  {product.couleur.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-3 py-1 border rounded-md text-sm transition-colors",
                        selectedColor === color
                          ? "border-[#30A08B] bg-[#30A08B] text-white"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes Taille */}
            {product.taille && product.taille.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Taille: {selectedSize}
                </h3>
                <div className="flex space-x-2">
                  {product.taille.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-3 py-1 border rounded-md text-sm transition-colors",
                        selectedSize === size
                          ? "border-[#30A08B] bg-[#30A08B] text-white"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes Pointure */}
            {product.pointure && product.pointure.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Pointure: {selectedPointure}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.pointure.map((pointure) => (
                    <button
                      key={pointure}
                      onClick={() => setSelectedPointure(pointure)}
                      className={cn(
                        "px-3 py-1 border rounded-md text-sm transition-colors",
                        selectedPointure === pointure
                          ? "border-[#30A08B] bg-[#30A08B] text-white"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {pointure}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quantité</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-medium w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={!product.quantite || quantity >= product.quantite}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.quantite === 0}
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-medium transition-colors",
                  product.quantite > 0
                    ? "bg-[#30A08B] text-white hover:bg-[#268771]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                {product.quantite > 0 ? "Ajouter au panier" : "Rupture de stock"}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex-1 py-2 px-4 border rounded-lg font-medium transition-colors flex items-center justify-center space-x-2",
                    liked
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-5 h-5",
                      liked ? "fill-red-500 text-red-500" : ""
                    )}
                  />
                  <span>{liked ? "Aimé" : "Aimer"}</span>
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Partager</span>
                </button>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-[#30A08B]" />
                <span>Livraison gratuite à partir de 50 000 FCFA</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <ShieldCheck className="w-5 h-5 text-[#30A08B]" />
                <span>Garantie satisfait ou remboursé</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Store className="w-5 h-5 text-[#30A08B]" />
                <span>Retrait en magasin disponible</span>
              </div>
            </div>

            {/* Localisation */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsCountryModalOpen(true)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-[#30A08B] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Livrer à {pays}</span>
              </button>
            </div>

            {/* Contact WhatsApp */}
            <button
              onClick={handleWhatsAppChat}
              className="w-full py-3 px-6 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>Contacter via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Description du produit */}
        <div className="py-3">
          <div className="border-t border-gray-300 mb-4" />

          <h2 className="text-2xl font-semibold text-[#B17236] mb-2">
            Produit Détail
          </h2>

          <div
            className="text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          
          {/* Informations techniques */}
          {(product.matiere || product.marque) && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Informations techniques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {product.matiere && (
                  <div>
                    <span className="font-medium text-gray-700">Matière: </span>
                    <span className="text-gray-600">{product.matiere}</span>
                  </div>
                )}
                {product.marque && (
                  <div>
                    <span className="font-medium text-gray-700">Marque: </span>
                    <span className="text-gray-600">{product.marque}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Catégorie: </span>
                  <span className="text-gray-600">{category?.name || "Non spécifiée"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Référence: </span>
                  <span className="text-gray-600">{product._id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Produits similaires */}
        <ProduitSimilaires
          titre="Articles similaires"
          produits={products}
        />

        {/* Commentaires */}
        <CommentaireProduit
          name={product.name}
          img={productImages.filter(Boolean) as string[]}
          coments={comments}
          categorie={category || undefined}
        />

        {/* Promotion de l'app */}
        <div className="mt-12">
          <AppPromo />
        </div>
      </div>

      {/* Modales */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {isCountryModalOpen && (
        <CountryPage
          isOpen={isCountryModalOpen}
          setIsCountryOpen={setIsCountryModalOpen}
          onClose={() => setIsCountryModalOpen(false)}
          setPays={setPays}
        />
      )}
    </>
  );
}

export default ProduitDetailMain;
