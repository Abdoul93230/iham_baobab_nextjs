"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const DATA_Categories = useAppSelector((state) => state.products.categories) as Category[];

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  const categories = DATA_Categories.filter((c) => c.name !== "all");

  return (
    <div className="relative flex items-center px-2 py-2">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#30A08B] hover:text-[#30A08B] flex items-center justify-center text-gray-500 transition-all z-10"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Scrollable pills */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1 px-2"
      >
        {/* "Tout" pill */}
        <button
          onClick={() => router.push("/voir-plus")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30A08B] text-white text-xs font-bold whitespace-nowrap hover:bg-[#268070] transition-colors shadow-sm"
        >
          <LayoutGrid size={12} />
          Tout
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => router.push(`/Categorie/${cat.name}`)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#30A08B] hover:text-[#30A08B] hover:bg-[#f0faf7] text-gray-600 text-xs font-medium whitespace-nowrap transition-all shadow-sm"
          >
            {cat.image && (
              <Image
                src={cat.image}
                alt={cat.name}
                width={16}
                height={16}
                className="rounded-full object-cover flex-shrink-0"
              />
            )}
            <span className="capitalize">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:border-[#30A08B] hover:text-[#30A08B] flex items-center justify-center text-gray-500 transition-all z-10"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default CategorieMobile;
