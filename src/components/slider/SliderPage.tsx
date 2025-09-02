"use client";

import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { ShoppingCart, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
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
}

interface SliderPageProps {
  products: Product[];
  name: string;
}

interface ProductCardProps {
  product: Product;
  onProductClick: (productId: string) => void;
  likedProducts: string[];
  onLikeClick: (product: Product, e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  likedProducts,
  onLikeClick,
}) => {
  const calculateDiscount = (originalPrice: number, promoPrice: number): number => {
    return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeClick(product, e);
  };

  return (
    <div className="group relative border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl overflow-hidden">
      {/* Promo Badge */}
      {product.prixPromo && product.prixPromo > 0 ? (
        <div className="absolute z-10 right-3 top-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
          -{calculateDiscount(product.prix, product.prixPromo)}%
          
        </div>
      ) : null}

      {/* Image Section */}
      <div
        onClick={() => onProductClick(product._id)}
        className="relative aspect-square overflow-hidden cursor-pointer"
      >
        <Image
          src={product.image1}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
        />

        {/* Like Button - Always visible on the left */}
        <button
          onClick={handleLikeClick}
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

        {/* Overlay Actions - Only Cart button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              className="bg-white hover:bg-emerald-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product._id);
              }}
            >
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h2 className="font-medium text-gray-800 line-clamp-1 text-sm md:text-base">
          {product.name}
        </h2>
        <div className="mt-2 space-y-1">
          {product.prixPromo && product.prixPromo > 0 ? (
            <>
              <div className="text-emerald-600 font-semibold text-base md:text-lg">
                {product.prixPromo.toLocaleString()} FCFA
              </div>
              <div className="text-sm text-gray-400 line-through">
                {product.prix.toLocaleString()} FCFA
              </div>
            </>
          ) : (
            <div className="text-emerald-600 font-semibold text-base md:text-lg">
              {product.prix.toLocaleString()} FCFA
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SliderPage: React.FC<SliderPageProps> = ({ products, name }) => {
  const swiperRef = useRef<any>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  const [userId, setUserId] = useState<string | null>(null);

  const likedProducts = useAppSelector((state) => state.likes.likedProducts);

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

  const handleProductClick = (productId: string) => {
    router.push(`/ProduitDetail/${productId}`);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative max-w-[98%] mx-auto my-12">
      {/* Notification Toast */}
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

      <div className="flex items-center justify-between mb-6 px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 capitalize">
          {name}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => swiperRef.current?.swiper.slidePrev()}
            className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 p-2 border border-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => swiperRef.current?.swiper.slideNext()}
            className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 p-2 border border-gray-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Navigation, EffectFade]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        navigation={false}
        slidesPerView={2}
        spaceBetween={24}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        className="px-2"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard
              product={product}
              onProductClick={handleProductClick}
              onLikeClick={handleLikeClick}
              likedProducts={likedProducts}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SliderPage;
