"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, Zap, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserLikes, toggleLike } from "@/redux/likesSlice";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { triggerNavProgress } from "@/components/NavigationProgress";

export interface ProductCardData {
  _id: string;
  name: string;
  prix: number;
  prixPromo?: number;
  image1: string;
  rating?: number;
  quantite?: number;
  Clefournisseur?: { name?: string; storeName?: string };
}

interface ProduitPageProps {
  name: string;
  products: ProductCardData[];
  /** nb de colonnes (défaut: 4 sur desktop) */
  cols?: 2 | 3 | 4 | 5 | 6;
  /** "grid" ou "compact" (cartes plus petites) */
  variant?: "grid" | "compact";
  showHeader?: boolean;
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userEcomme");
      if (raw) setUserId(JSON.parse(raw)?.id ?? null);
    } catch {}
  }, []);
  return userId;
}

function calcDiscount(prix: number, prixPromo: number) {
  return Math.round(((prix - prixPromo) / prix) * 100);
}

// ─── La carte produit universelle ────────────────────────────────────────────
// Exportée pour être réutilisée dans SliderPage et HomeMain

export const ProductCard: React.FC<{
  product: ProductCardData;
  compact?: boolean;
}> = ({ product, compact = false }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const likedProducts = useAppSelector((state) => state.likes.likedProducts);
  const userId = useCurrentUserId();

  const [imgError, setImgError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = likedProducts.includes(product._id);
  const discount =
    product.prixPromo && product.prixPromo > 0
      ? calcDiscount(product.prix, product.prixPromo)
      : 0;

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!userId) {
        router.push("/auth/login");
        return;
      }
      if (isLiking) return;
      setIsLiking(true);
      try {
        await dispatch(toggleLike({ userId, product })).unwrap();
      } catch {}
      setIsLiking(false);
    },
    [userId, product, dispatch, isLiking, router]
  );

  const goToProduct = () => { triggerNavProgress(); router.push(`/ProduitDetail/${product._id}`); };

  const imageH = compact ? "h-36 sm:h-40" : "h-44 sm:h-52 md:h-56";

  return (
    <div
      onClick={goToProduct}
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden cursor-pointer",
        "border border-gray-100 hover:border-teal/40",
        "shadow-sm hover:shadow-xl",
        "transition-all duration-300 hover:-translate-y-1",
        "flex flex-col"
      )}
    >
      {/* ── Image ── */}
      <div className={cn("relative w-full overflow-hidden bg-gray-50 flex-shrink-0", imageH)}>
        {!imgError ? (
          <Image
            src={product.image1 || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <ShoppingCart size={32} />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              -{discount}%
            </span>
          )}
          {product.quantite !== undefined && product.quantite <= 5 && product.quantite > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex items-center gap-0.5">
              <Zap size={8} />
              Derniers
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "absolute top-2 right-2 z-10 w-8 h-8 rounded-full shadow-md",
            "flex items-center justify-center",
            "transition-all duration-200 hover:scale-110",
            isLiked
              ? "bg-red-50 border border-red-200"
              : "bg-white/90 border border-gray-200 hover:bg-red-50"
          )}
        >
          <Heart
            size={15}
            className={cn(
              "transition-colors duration-200",
              isLiked ? "text-red-500 fill-red-500" : "text-gray-400 group-hover:text-red-400"
            )}
          />
        </button>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          <span className="bg-white/95 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
            <Eye size={12} />
            Voir le produit
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Seller name */}
        {product.Clefournisseur?.storeName && (
          <p className="text-[10px] text-gray-400 truncate font-medium uppercase tracking-wide">
            {product.Clefournisseur.storeName}
          </p>
        )}

        {/* Product name */}
        <h3 className={cn(
          "font-semibold text-gray-800 line-clamp-2 leading-tight",
          compact ? "text-xs" : "text-sm"
        )}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={compact ? 9 : 11}
                className={i <= (product.rating ?? 4) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">(4.0)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className={cn(
            "font-bold text-[#B17236]",
            compact ? "text-sm" : "text-base"
          )}>
            {(product.prixPromo && product.prixPromo > 0 ? product.prixPromo : product.prix).toLocaleString()} F
          </span>
          {product.prixPromo && product.prixPromo > 0 && (
            <span className="text-[11px] text-gray-400 line-through">
              {product.prix.toLocaleString()} F
            </span>
          )}
        </div>

        {/* Add to cart */}
        {!compact && (
          <button
            onClick={(e) => { e.stopPropagation(); goToProduct(); }}
            className="mt-2 w-full flex items-center justify-center gap-1.5 bg-[#30A08B] hover:bg-[#268070] text-white text-xs font-semibold py-2 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <ShoppingCart size={13} />
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
};

// ─── ProduitPage grid section ─────────────────────────────────────────────────

const colsMap: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
};

const ProduitPage: React.FC<ProduitPageProps> = ({
  name,
  products,
  cols = 4,
  variant = "grid",
  showHeader = true,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = useCurrentUserId();

  useEffect(() => {
    if (userId) dispatch(fetchUserLikes(userId));
  }, [userId, dispatch]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-8">
      {showHeader && (
        <div
          className="flex items-center justify-between mb-4 cursor-pointer group"
          onClick={() => router.push(`/Categorie/${name}`)}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#30A08B] rounded-full" />
            <h2 className="text-lg font-bold text-gray-800 capitalize group-hover:text-[#30A08B] transition-colors">
              {name}
            </h2>
          </div>
          <span className="text-sm text-[#30A08B] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir tout <span>→</span>
          </span>
        </div>
      )}

      <div className={cn("grid gap-3", colsMap[cols] ?? colsMap[4])}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} compact={variant === "compact"} />
        ))}
      </div>
    </section>
  );
};

export default ProduitPage;
