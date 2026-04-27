"use client";

import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { fetchUserLikes } from "@/redux/likesSlice";
import { ProductCard, ProductCardData } from "@/components/ProduitDetail/ProduitPage";

interface SliderPageProps {
  products: ProductCardData[];
  name: string;
  showHeader?: boolean;
  autoplay?: boolean;
}

const SliderPage: React.FC<SliderPageProps> = ({
  products,
  name,
  showHeader = true,
  autoplay = false,
}) => {
  const swiperRef = useRef<any>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userEcomme");
      if (raw) {
        const userId = JSON.parse(raw)?.id;
        if (userId) dispatch(fetchUserLikes(userId));
      }
    } catch {}
  }, [dispatch]);

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push(`/Categorie/${name}`)}
          >
            <div className="w-1 h-5 bg-[#B17236] rounded-full" />
            <h2 className="text-base font-bold text-gray-700 capitalize hover:text-[#30A08B] transition-colors">
              {name} — Plus de produits
            </h2>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => swiperRef.current?.swiper.slidePrev()}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-[#30A08B] hover:border-[#30A08B] hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 shadow-sm"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => swiperRef.current?.swiper.slideNext()}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-[#30A08B] hover:border-[#30A08B] hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200 shadow-sm"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      <Swiper
        ref={swiperRef}
        modules={autoplay ? [Autoplay, Navigation] : [Navigation]}
        {...(autoplay ? { autoplay: { delay: 3500, disableOnInteraction: false } } : {})}
        navigation={false}
        slidesPerView={2.2}
        spaceBetween={10}
        loop={products.length > 4}
        breakpoints={{
          480:  { slidesPerView: 3.2, spaceBetween: 12 },
          768:  { slidesPerView: 4.2, spaceBetween: 14 },
          1024: { slidesPerView: 5.2, spaceBetween: 14 },
          1280: { slidesPerView: 6.2, spaceBetween: 16 },
        }}
        className="px-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} compact />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SliderPage;
