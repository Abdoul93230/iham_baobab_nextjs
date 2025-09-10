"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Star,
  ShoppingBag,
  MessageCircle,
  Clock,
  Heart,
  Mail,
  Calendar,
  Award,
  Truck,
  CreditCard,
  UserPlus,
  UserCheck,
  Globe,
  Instagram,
  Facebook,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import socialService from "./socialService"; // Vous devrez adapter ce service

// Remplacez cette URL par votre URL backend réelle
const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

interface SellerProfileProps {
  sellerId: string;
}

export default function SellerProfile({ sellerId }: SellerProfileProps) {
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasLikedStore, setHasLikedStore] = useState(false);
  const [socialStats, setSocialStats] = useState({
    followersCount: 0,
    likesCount: 0,
    reviewsCount: 0,
    rating: 0,
  });
  const [activeSection, setActiveSection] = useState("produits");
  const [selectedReviewFilter, setSelectedReviewFilter] = useState("recent");
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.token
      : null;
    setIsAuthenticated(!!token);
  }, []);

  // Récupérer les données du vendeur, ses produits et ses stats sociales
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        // Récupérer les informations du vendeur
        const sellerResponse = await axios.get(
          `${BackendUrl}/getSeller/${sellerId}`
        );

        // Récupérer les produits du vendeur
        const productsResponse = await axios.get(
          `${BackendUrl}/searchProductBySupplier/${sellerId}`
        );

        // Récupérer les statistiques sociales
        const statsResponse = await socialService.getSellerSocialStats(sellerId);

        // Vérifier si l'utilisateur suit ce vendeur (seulement si connecté)
        if (isAuthenticated) {
          try {
            // Cette vérification nécessiterait une API supplémentaire au backend
            // Par exemple: /sellers/:sellerId/checkFollowing
            // Pour l'instant, on peut vérifier si l'ID de l'utilisateur est dans la liste des followers
            const followersResponse = await socialService.getSellerFollowers(sellerId);
            const userId = JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id;
            const isUserFollowing = followersResponse.data.followers.some(
              (follower: any) => follower._id === userId
            );
            setIsFollowing(isUserFollowing);

            // Vérifier si l'utilisateur a liké la boutique
            const likeResponse = await socialService.checkStoreLike(sellerId);
            setHasLikedStore(likeResponse.data.liked);
          } catch (error) {
            console.error(
              "Erreur lors de la vérification des relations sociales:",
              error
            );
          }
        }

        setSeller(sellerResponse?.data?.data);
        setProducts(productsResponse?.data?.data);
        setSocialStats(statsResponse.data.stats);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
        console.error("Erreur:", err);
      }
    };

    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId, isAuthenticated]);

  // Récupérer les avis quand on change de page ou qu'on va dans la section avis
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await socialService.getSellerReviews(
          sellerId,
          currentPage,
          10 // Nombre d'avis par page
        );

        setReviews(reviewsResponse.data.reviews);
        setTotalPages(reviewsResponse.data.totalPages);
      } catch (error) {
        console.error("Erreur lors de la récupération des avis:", error);
      }
    };

    if (sellerId && activeSection === "avis") {
      fetchReviews();
    }
  }, [sellerId, activeSection, currentPage]);

  // Gérer le suivi du vendeur
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion ou afficher un message
      alert("Veuillez vous connecter pour suivre ce vendeur.");
      return;
    }

    try {
      if (isFollowing) {
        await socialService.unfollowSeller(sellerId);
        setIsFollowing(false);
        // Mettre à jour les statistiques
        setSocialStats({
          ...socialStats,
          followersCount: socialStats.followersCount - 1,
        });
      } else {
        await socialService.followSeller(sellerId);
        setIsFollowing(true);
        // Mettre à jour les statistiques
        setSocialStats({
          ...socialStats,
          followersCount: socialStats.followersCount + 1,
        });
      }
    } catch (error) {
      console.error("Erreur lors du changement de suivi:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  // Gérer le like de la boutique
  const handleStoreLikeToggle = async () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour liker cette boutique.");
      return;
    }

    try {
      if (hasLikedStore) {
        await socialService.unlikeStore(sellerId);
        setHasLikedStore(false);
        // Mettre à jour les statistiques
        setSocialStats({
          ...socialStats,
          likesCount: socialStats.likesCount - 1,
        });
      } else {
        await socialService.likeStore(sellerId);
        setHasLikedStore(true);
        // Mettre à jour les statistiques
        setSocialStats({
          ...socialStats,
          likesCount: socialStats.likesCount + 1,
        });
      }
    } catch (error) {
      console.error("Erreur lors du like de la boutique:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  // Gérer le like d'un avis
  const handleReviewLike = async (reviewId: string, isCurrentlyLiked: boolean) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour liker cet avis.");
      return;
    }

    try {
      if (isCurrentlyLiked) {
        await socialService.unlikeReview(reviewId);
      } else {
        await socialService.likeReview(reviewId);
      }

      // Rafraîchir la liste des avis
      const reviewsResponse = await socialService.getSellerReviews(
        sellerId,
        currentPage,
        10
      );
      setReviews(reviewsResponse.data.reviews);
    } catch (error) {
      console.error("Erreur lors du like de l'avis:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  // Soumettre un nouveau avis
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour laisser un avis.");
      return;
    }

    if (newReview.rating === 0 || !newReview.comment) {
      alert("Veuillez donner une note et écrire un commentaire.");
      return;
    }

    try {
      await socialService.createReview(sellerId, {
        rating: newReview.rating,
        comment: newReview.comment,
      });

      // Réinitialiser le formulaire
      setNewReview({ rating: 0, comment: "" });

      // Rafraîchir la liste des avis et les stats
      const reviewsResponse = await socialService.getSellerReviews(
        sellerId,
        1,
        10
      );
      setReviews(reviewsResponse.data.reviews);
      setCurrentPage(1);

      const statsResponse = await socialService.getSellerSocialStats(sellerId);
      setSocialStats(statsResponse.data.stats);

      alert("Votre avis a été publié avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis:", error);
      alert("Une erreur s'est produite lors de la publication de votre avis.");
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis?")) {
      return;
    }

    try {
      // await socialService.deleteReview(reviewId);

      // Rafraîchir la liste des avis et les stats
      const reviewsResponse = await socialService.getSellerReviews(
        sellerId,
        currentPage,
        10
      );
      setReviews(reviewsResponse.data.reviews);

      const statsResponse = await socialService.getSellerSocialStats(sellerId);
      setSocialStats(statsResponse.data.stats);

      alert("Avis supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avis:", error);
      alert("Une erreur s'est produite lors de la suppression de l'avis.");
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        onClick={() =>
          interactive && setNewReview({ ...newReview, rating: index + 1 })
        }
        className={`cursor-${interactive ? "pointer" : "default"} ${
          index < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"
        }`}
        fill={index < Math.floor(rating) ? "currentColor" : "none"}
      />
    ));
  };

  const filterAndSortReviews = () => {
    const filteredReviews = [...reviews];

    switch (selectedReviewFilter) {
      case "top":
        filteredReviews.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case "recent":
      default:
        // Les avis sont déjà triés par date de création par l'API
        break;
    }

    return filteredReviews;
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.note, 0) / reviews.length
        ).toFixed(1)
      : "N/A";

  const renderReviews = () => {
    const sortedReviews = filterAndSortReviews();
    const userId = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("userEcomme") || '{}')?.id
      : null;

    return (
      <div className="space-y-4 mb-3">
        {/* Filtre des avis */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#30A08B] mb-2 sm:mb-0">
            Avis Clients ({socialStats.reviewsCount || 0})
          </h3>

          <div className="flex space-x-2">
            {["recent", "top"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedReviewFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs capitalize text-nowrap transition duration-300 ${
                  selectedReviewFilter === filter
                    ? "bg-[#30A08B] text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-[#30A08B] hover:text-white`}
              >
                {filter === "recent" ? "Plus récents" : "Les plus likés"}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des avis existants */}
        {sortedReviews.length > 0 ? (
          <>
            {sortedReviews.map((review) => {
              // Vérifier si l'utilisateur connecté a liké cet avis
              const userHasLiked = review.likes?.includes(userId);

              return (
                <div
                  key={review._id}
                  className="bg-white p-4 rounded-xl shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">
                        {review.user?.name || review.user?.userName2}
                      </h4>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          handleReviewLike(review._id, userHasLiked)
                        }
                        className={`flex items-center space-x-1 ${
                          userHasLiked
                            ? "text-green-600"
                            : "hover:text-green-600"
                        }`}
                      >
                        <ThumbsUp size={16} />
                        <span>{review.likesCount}</span>
                      </button>
                    </div>

                    {/* Option de suppression pour l'auteur de l'avis */}
                    {userId && review.user?._id === userId && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === index + 1
                          ? "bg-[#30A08B] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Aucun avis pour le moment
          </div>
        )}

        {/* Formulaire d'ajout d'avis */}
        {isAuthenticated ? (
          <form
            onSubmit={handleAddReview}
            className="bg-white p-6 rounded-xl shadow-md mt-6"
          >
            <h3 className="text-xl font-semibold text-[#30A08B] mb-4">
              Laissez votre avis
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span>Votre note :</span>
                {renderStars(newReview.rating, true)}
              </div>
              <textarea
                placeholder="Votre commentaire"
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                className="w-full p-2 border rounded-md h-24"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#30A08B] text-white py-2 rounded-full hover:bg-opacity-90"
              >
                Publier mon avis
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md mt-6 text-center">
            <p className="text-gray-600 mb-3">
              Connectez-vous pour laisser un avis
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-[#30A08B] text-white px-6 py-2 rounded-full inline-block hover:bg-opacity-90"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInfoSection = () => {
    if (!seller) return null;

    return (
      <div className="space-y-6">
        {/* Informations de contact */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
            Coordonnées
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="text-[#30A08B]" />
              <span>{seller.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-[#30A08B]" />
              <span>{seller.phone}</span>
            </div>
            {seller.businessPhone && (
              <div className="flex items-center space-x-3">
                <Phone className="text-[#30A08B]" />
                <span>Tél. professionnel: {seller.businessPhone}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <MapPin className="text-[#30A08B]" />
              <span>
                {seller.address}, {seller.city}, {seller.region}{" "}
                {seller.postalCode}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="text-[#30A08B]" />
              <span>
                Inscrit depuis le{" "}
                {new Date(seller.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        {(seller.website ||
          seller.facebook ||
          seller.instagram ||
          seller.whatsapp) && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
              Réseaux sociaux
            </h2>
            <div className="space-y-4">
              {seller.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="text-[#30A08B]" />
                  <a
                    href={seller.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Site web
                  </a>
                </div>
              )}
              {seller.facebook && (
                <div className="flex items-center space-x-3">
                  <Facebook className="text-[#30A08B]" />
                  <a
                    href={seller.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Facebook
                  </a>
                </div>
              )}
              {seller.instagram && (
                <div className="flex items-center space-x-3">
                  <Instagram className="text-[#30A08B]" />
                  <a
                    href={seller.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Instagram
                  </a>
                </div>
              )}
              {seller.whatsapp && (
                <div className="flex items-center space-x-3">
                  <MessageCircle className="text-[#30A08B]" />
                  <a
                    href={`https://wa.me/${seller.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informations de livraison et commande */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
            Informations de boutique
          </h2>
          <div className="space-y-4">
            {seller.storeType && (
              <div className="flex items-center space-x-3">
                <ShoppingBag className="text-[#30A08B]" />
                <div>
                  <span className="font-semibold">Type de boutique</span>
                  <div className="text-gray-600 capitalize">
                    {seller.storeType === "enligne"
                      ? "En ligne"
                      : seller.storeType}
                  </div>
                </div>
              </div>
            )}
            {seller.minimumOrder && (
              <div className="flex items-center space-x-3">
                <CreditCard className="text-[#30A08B]" />
                <div>
                  <span className="font-semibold">Commande minimum</span>
                  <div className="text-gray-600">{seller.minimumOrder}</div>
                </div>
              </div>
            )}
            {seller.openingHours && (
              <div className="flex items-center space-x-3">
                <Clock className="text-[#30A08B]" />
                <div>
                  <span className="font-semibold">Heures d'ouverture</span>
                  <div className="text-gray-600">{seller.openingHours}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Catégorie et certifications */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
            Catégorie
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Award className="text-[#30A08B]" />
              <div>
                <span className="font-semibold">Spécialisation</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-[#30A08B]/10 text-[#30A08B] px-3 py-1 rounded-full text-sm capitalize">
                    {seller.category}
                  </span>
                </div>
              </div>
            </div>
            {seller.isvalid && (
              <div className="flex items-center space-x-3">
                <Check className="text-green-500" />
                <div>
                  <span className="font-semibold text-green-500">
                    Vendeur vérifié
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30A08B]"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 p-6 rounded-lg text-red-600 max-w-md text-center">
          <h2 className="font-bold text-lg mb-2">Erreur</h2>
          <p>{error || "Impossible de charger les informations du vendeur"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* En-tête du Profil */}
      <div className="relative">
        {/* Couverture (couleur unie) */}
        <div className="bg-[#30A08B] h-32 md:h-56"></div>

        <div className="container mx-auto px-4 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Photo de Profil / Logo */}
            <div className="relative">
              <Image
                src={seller.logo || "/LogoText.png"}
                alt={seller.storeName}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white object-cover shadow-lg"
                width={192}
                height={192}
              />
              {seller.isvalid && (
                <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1">
                  <Check size={16} />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {seller.storeName}
                </h1>
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
                {renderStars(socialStats.rating || 0)}
                <span className="text-gray-600 ml-2">
                  ({socialStats.rating.toFixed(1) || "0.0"}/5)
                </span>
              </div>

              <div className="mt-4 flex flex-col md:flex-row justify-center md:justify-start space-y-4 md:space-y-0 md:space-x-4">
                {/* Bouton Suivre */}
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-[#B17236] text-white hover:scale-105"
                  } shadow-md focus:outline-none flex items-center justify-center space-x-2`}
                  disabled={!isAuthenticated}
                  title={
                    !isAuthenticated
                      ? "Connectez-vous pour suivre ce vendeur"
                      : ""
                  }
                >
                  <span>{isFollowing ? "Suivi" : "Suivre"}</span>
                  {isFollowing ? (
                    <UserCheck size={20} className="inline" />
                  ) : (
                    <UserPlus size={20} className="inline" />
                  )}
                </button>

                {/* Bouton Like Boutique */}
                <button
                  onClick={handleStoreLikeToggle}
                  className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform flex items-center justify-center space-x-2 shadow-md focus:outline-none ${
                    hasLikedStore
                      ? "bg-red-100 text-red-500"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  disabled={!isAuthenticated}
                  title={
                    !isAuthenticated
                      ? "Connectez-vous pour liker cette boutique"
                      : ""
                  }
                >
                  <Heart
                    size={20}
                    className={hasLikedStore ? "fill-current" : ""}
                  />
                  <span>{hasLikedStore ? "Aimé" : "Aimer"}</span>
                </button>

                {/* Bouton Contacter */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert(
                        "Veuillez vous connecter pour contacter ce vendeur"
                      );
                      return;
                    }
                    // Rediriger vers la page de messagerie ou ouvrir une modal
                    router.push(`/ContactSeller/${sellerId}`);
                  }}
                  className="bg-[#30A08B] text-white px-6 py-2 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 transition duration-300 ease-in-out transform hover:bg-opacity-90 hover:scale-105 shadow-md focus:outline-none"
                >
                  <MessageCircle size={20} className="inline" />
                  <span>Contacter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-3 mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Colonne Gauche : Informations principales */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
                À Propos
              </h2>
              <p className="text-gray-600">
                {seller.storeDescription ||
                  "Ce vendeur n'a pas encore ajouté de description."}
              </p>
            </div>

            {/* Navigation des Sections */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="flex overflow-x-auto">
                {["produits", "infos", "avis"].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`flex-1 py-3 px-4 capitalize border-b-2 whitespace-nowrap ${
                      activeSection === section
                        ? "border-[#30A08B] text-[#30A08B]"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>

              {/* Contenu des Sections */}
              {activeSection === "produits" && (
                <div className="p-4 md:p-6">
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          onClick={() =>
                            router.push(`/ProduitDetail/${product._id}`)
                          }
                          className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                        >
                          <Image
                            src={product.image1 || "/placeholder-product.jpg"}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                            width={320}
                            height={192}
                          />
                          <div className="p-4">
                            <h3 className="font-semibold">{product.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[#B17236] font-bold">
                                {product.prix.toLocaleString("fr-FR")} FCFA
                              </span>
                              <div className="flex">
                                {renderStars(product?.rating || 0)}
                              </div>
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {product.category}
                              </span>
                              {product.quantite ? (
                                <span className="text-xs text-green-500">
                                  En stock
                                </span>
                              ) : (
                                <span className="text-xs text-red-500">
                                  Rupture
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500 flex flex-col items-center">
                      <ShoppingBag size={48} className="text-gray-300 mb-4" />
                      <p>Aucun produit disponible actuellement</p>
                    </div>
                  )}

                  {/* Bouton pour voir tous les produits */}
                  {products.length > 0 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => router.push(`/Boutique/${sellerId}`)}
                        className="px-6 py-2 bg-[#30A08B] text-white rounded-full inline-block hover:bg-opacity-90 transition"
                      >
                        Voir tous les produits ({products.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Section Infos */}
              {activeSection === "infos" && (
                <div className="p-4 md:p-6">{renderInfoSection()}</div>
              )}

              {/* Section Avis */}
              {activeSection === "avis" && (
                <div className="p-4 md:p-6">{renderReviews()}</div>
              )}
            </div>
          </div>

          {/* Colonne Droite : Statistiques & Informations */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
                Informations
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-[#30A08B]" />
                  <div>
                    <span className="text-gray-800">{seller.address}</span>
                    <div className="text-sm text-gray-500">
                      {seller.city}, {seller.region} {seller.postalCode}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="text-[#30A08B]" />
                  <div>
                    <span className="text-gray-800">
                      {seller.businessPhone || seller.phone}
                    </span>
                    {seller.businessPhone && seller.phone && (
                      <div className="text-sm text-gray-500">
                        Alt: {seller.phone}
                      </div>
                    )}
                  </div>
                </div>
                {seller.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="text-[#30A08B]" />
                    <span className="text-gray-800">{seller.email}</span>
                  </div>
                )}
                {seller.openingHours && (
                  <div className="flex items-center space-x-3">
                    <Clock className="text-[#30A08B]" />
                    <div>
                      <span className="text-gray-800">Heures d'ouverture</span>
                      <div className="text-sm text-gray-500">
                        {seller.openingHours}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <ShoppingBag className="mx-auto mb-2 text-[#30A08B]" />
                  <span className="font-bold block">{products.length}</span>
                  <span className="text-sm text-gray-500">Produits</span>
                </div>
                <div>
                  <UserPlus className="mx-auto mb-2 text-[#B17236]" />
                  <span className="font-bold block">
                    {socialStats.followersCount || 0}
                  </span>
                  <span className="text-sm text-gray-500">Abonnés</span>
                </div>
                <div>
                  <Star className="mx-auto mb-2 text-yellow-500" />
                  <span className="font-bold block">
                    {socialStats.rating ? socialStats.rating.toFixed(1) : "N/A"}
                  </span>
                  <span className="text-sm text-gray-500">Note</span>
                </div>
              </div>

              {/* Statistiques supplémentaires */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Avis clients</span>
                  <span className="font-medium">
                    {socialStats.reviewsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Likes</span>
                  <span className="font-medium">
                    {socialStats.likesCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Inscrit depuis</span>
                  <span className="font-medium">
                    {new Date(seller.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 mb-3 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-[#30A08B] mb-4">
                Catégorie & Services
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[#30A08B]/10 text-[#30A08B] px-3 py-1 rounded-full text-sm capitalize">
                  {seller.category}
                </span>
                {seller.storeType && (
                  <span className="bg-[#B17236]/10 text-[#B17236] px-3 py-1 rounded-full text-sm capitalize">
                    {seller.storeType === "enligne"
                      ? "En ligne"
                      : seller.storeType}
                  </span>
                )}
              </div>

              {/* Services */}
              <div className="space-y-3 mt-4">
                {seller.isvalid && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check size={16} />
                    <span className="text-sm">Vendeur vérifié</span>
                  </div>
                )}
                {seller.delivery && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Truck size={16} />
                    <span className="text-sm">Livraison disponible</span>
                  </div>
                )}
                {seller.acceptsReturns && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <CreditCard size={16} />
                    <span className="text-sm">Accepte les retours</span>
                  </div>
                )}
                {seller.minimumOrder && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <ShoppingBag size={16} />
                    <span className="text-sm">
                      Commande min: {seller.minimumOrder}
                    </span>
                  </div>
                )}
              </div>

              {/* Bouton pour contacter le vendeur */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    alert("Veuillez vous connecter pour contacter ce vendeur");
                    return;
                  }
                  router.push(`/ContactSeller/${sellerId}`);
                }}
                className="w-full mt-4 bg-[#30A08B] text-white py-2 rounded-full hover:bg-opacity-90 transition flex items-center justify-center space-x-2"
              >
                <MessageCircle size={16} />
                <span>Contacter le vendeur</span>
              </button>
            </div>

            {/* Réseaux sociaux */}
            {(seller.website ||
              seller.facebook ||
              seller.instagram ||
              seller.whatsapp) && (
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-lg font-semibold text-[#30A08B] mb-4">
                  Réseaux sociaux
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {seller.website && (
                    <a
                      href={seller.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:underline"
                    >
                      <Globe size={16} />
                      <span>Site web</span>
                    </a>
                  )}
                  {seller.facebook && (
                    <a
                      href={seller.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:underline"
                    >
                      <Facebook size={16} />
                      <span>Facebook</span>
                    </a>
                  )}
                  {seller.instagram && (
                    <a
                      href={seller.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-rose-600 hover:underline"
                    >
                      <Instagram size={16} />
                      <span>Instagram</span>
                    </a>
                  )}
                  {seller.whatsapp && (
                    <a
                      href={`https://wa.me/${seller.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-green-600 hover:underline"
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}