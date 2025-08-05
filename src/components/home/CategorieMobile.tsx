"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  image: string;
}

const CategorieMobile: React.FC = () => {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const DATA_Categories = useAppSelector((state) => state.products.categories) as Category[];

  const scrollLeft = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const colors = ["#30A08B", "#B2905F", "#B17236"];

  return (
    <div className="md:hidden mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#30A08B]">Catégories</h2>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full bg-[#30A08B] text-white hover:bg-opacity-80 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-[#30A08B] text-white hover:bg-opacity-80 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={categoriesRef}
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {DATA_Categories.filter(cat => cat.name !== "all").map((category, index) => (
          <div
            key={category._id}
            onClick={() => router.push(`/Categorie/${category.name}`)}
            className="flex-shrink-0 w-20 cursor-pointer group"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto transition-transform duration-200 group-hover:scale-110 shadow-lg"
              style={{ backgroundColor: colors[index % colors.length] }}
            >
              <Image
                src={category.image}
                alt={category.name}
                width={32}
                height={32}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <p className="text-xs text-center font-medium text-gray-700 leading-tight">
              {category.name.length > 12 
                ? `${category.name.slice(0, 12)}...` 
                : category.name
              }
            </p>
          </div>
        ))}
        
        <div
          onClick={() => router.push("/Voir-plus")}
          className="flex-shrink-0 w-20 cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto transition-transform duration-200 group-hover:scale-110 shadow-lg bg-gray-300">
            <span className="text-2xl">➡️</span>
          </div>
          <p className="text-xs text-center font-medium text-gray-700 leading-tight">
            Voir plus
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategorieMobile;
