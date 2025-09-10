// src/services/socialService.js
import axios from "axios";

// Créer une instance axios avec la base URL
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_Backend_Url || "https://ihambackend.onrender.com",
});

// Intercepteur pour ajouter le token JWT à chaque requête
API.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("userEcomme"))?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services pour les fonctionnalités sociales
const socialService = {
  // Suivre un vendeur
  followSeller: (sellerId) => {
    return API.post(`api/sellers/${sellerId}/follow`);
  },

  // Ne plus suivre un vendeur
  unfollowSeller: (sellerId) => {
    return API.delete(`api/sellers/${sellerId}/follow`);
  },

  // Obtenir les followers d'un vendeur
  getSellerFollowers: (sellerId) => {
    return API.get(`api/sellers/${sellerId}/followers`);
  },

  // Créer un avis
  createReview: (sellerId, reviewData) => {
    return API.post(`api/sellers/${sellerId}/reviews`, reviewData);
  },

  // Mettre à jour un avis
  updateReview: (reviewId, reviewData) => {
    return API.put(`api/reviews/${reviewId}`, reviewData);
  },

  // Supprimer un avis
  deleteReview: (reviewId) => {
    return API.delete(`api/reviews/${reviewId}`);
  },

  // Obtenir tous les avis d'un vendeur
  getSellerReviews: (sellerId, page = 1, limit = 10) => {
    return API.get(
      `api/sellers/${sellerId}/reviews?page=${page}&limit=${limit}`
    );
  },

  // Liker un avis
  likeReview: (reviewId) => {
    return API.post(`api/reviews/${reviewId}/like`);
  },

  // Enlever un like d'un avis
  unlikeReview: (reviewId) => {
    return API.delete(`api/reviews/${reviewId}/like`);
  },

  // Liker une boutique
  likeStore: (sellerId) => {
    return API.post(`api/sellers/${sellerId}/like`);
  },

  // Enlever un like d'une boutique
  unlikeStore: (sellerId) => {
    return API.delete(`api/sellers/${sellerId}/like`);
  },

  // Vérifier si un utilisateur a liké une boutique
  checkStoreLike: (sellerId) => {
    return API.get(`api/sellers/${sellerId}/like`);
  },

  // Obtenir les stats sociales d'un vendeur
  getSellerSocialStats: (sellerId) => {
    return API.get(`api/sellers/${sellerId}/stats`);
  },
};

export default socialService;
