"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  prix: number;
  prixPromo?: number;
  image1: string;
  rating?: number;
}

interface ProduitPageProps {
  name: string;
  products: Product[];
}

const ProduitPage: React.FC<ProduitPageProps> = ({ name, products }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const likedProducts = useAppSelector((state) => state.likes.likedProducts);
  
  // Get user ID from localStorage safely
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userEcomme = localStorage.getItem("userEcomme");
    if (userEcomme) {
      const userData = JSON.parse(userEcomme);
      setUserId(userData?.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserLikes(userId));
    }
  }, [userId, dispatch]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`${product.name} a été ajouté au panier !`);
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLikeClick = async (product: Product, e: React.MouseEvent) => {
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

  const RatingStars: React.FC<{ rating?: number }> = ({ rating = 4 }) => {
    return (
      <div className="flex space-x-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto space-y-4 mt-8">
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

      <div
        className="bg-gradient-to-r from-amber-200 to-amber-500 p-3 rounded-md cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={() => router.push(`/Categorie/${name}`)}
      >
        <h3 className="text-center font-bold text-amber-800 capitalize">{name}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const discountedPrice = product.prixPromo || product.prix?.toFixed(2);
          const discount =
            product.prixPromo && product.prix
              ? Math.round(
                  ((product.prix - product.prixPromo) / product.prix) * 100
                )
              : 0;

          return (
            <div
              key={product._id}
              onClick={() => router.push(`/ProduitDétail/${product._id}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl group overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative">
                <Image
                  src={product.image1 || "/api/placeholder/400/320"}
                  alt={product.name}
                  width={400}
                  height={320}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {discount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                    -{discount}%
                  </span>
                )}

                <button
                  onClick={(e) => handleLikeClick(product, e)}
                  className={cn(
                    "absolute top-3 left-3 p-2 rounded-full shadow-lg transition-all duration-300 z-20",
                    likedProducts.includes(product._id)
                      ? "bg-red-50 hover:bg-red-100"
                      : "bg-white hover:bg-emerald-50"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      likedProducts.includes(product._id)
                        ? "text-red-500 fill-red-500"
                        : "text-emerald-600"
                    )}
                  />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="font-bold text-lg text-gray-800 line-clamp-2">
                  {product.name}
                </h4>

                <RatingStars rating={product.rating || 4} />

                <div className="space-y-1">
                  {product.prixPromo ? (
                    <>
                      <p className="text-sm text-red-600 line-through">
                        {product.prix?.toFixed(2)} FCFA
                      </p>
                      <p className="font-bold text-[#B17236]">
                        {discountedPrice} FCFA
                      </p>
                    </>
                  ) : (
                    <p className="font-bold text-[#B17236]">
                      {discountedPrice} FCFA
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="mt-2 flex justify-center items-center gap-2 w-full bg-[#30A08B] text-white py-2
                           rounded-full hover:bg-opacity-90 transition-colors duration-200 text-sm md:text-base shadow-md hover:shadow-lg"
                >
                  Ajouter au panier
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProduitPage;
