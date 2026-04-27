"use client";

import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import {
  Flame, Tag, Grid3X3, ChevronRight,
  Truck, ShieldCheck, RefreshCw, Headphones,
  TrendingUp, Sparkles, Loader2,
} from "lucide-react";
import axios from "axios";

import { ProductCard, ProductCardData } from "@/components/ProduitDetail/ProduitPage";
import SliderPage from "@/components/slider/SliderPage";
import CategorieMobile from "./CategorieMobile";
import DailyCheckinBanner from "@/components/wallet/DailyCheckinBanner";
import EventBanner from "@/components/wallet/EventBanner";

interface HomeMainProps { isOpen?: boolean; }

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ compact = false }: { compact?: boolean }) {
  const h = compact ? "h-36" : "h-48";
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className={`w-full ${h} bg-gray-200`} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon, title, subtitle, href, accent = "#30A08B",
}: {
  icon: React.ReactNode; title: string; subtitle?: string; href?: string; accent?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <button
          onClick={() => router.push(href)}
          className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#30A08B] hover:text-[#30A08B] transition-all text-gray-500"
        >
          Voir tout <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
const TRUST = [
  { icon: Truck,       label: "Livraison rapide",   sub: "Partout au Niger" },
  { icon: ShieldCheck, label: "Paiement sécurisé",  sub: "Mobile Money & +" },
  { icon: RefreshCw,   label: "Retour facile",       sub: "Sous 7 jours" },
  { icon: Headphones,  label: "Support 7j/7",        sub: "Toujours disponible" },
];

// ─── Flash sale countdown ─────────────────────────────────────────────────────
function FlashCountdown() {
  const [time, setTime] = useState({ h: 5, m: 59, s: 59 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 text-white">
      <span className="text-xs opacity-80">Fin dans</span>
      {[fmt(time.h), fmt(time.m), fmt(time.s)].map((v, i) => (
        <React.Fragment key={i}>
          <span className="bg-white/20 rounded px-1.5 py-0.5 text-sm font-mono font-bold tabular-nums">{v}</span>
          {i < 2 && <span className="font-bold text-sm">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Infinite feed ────────────────────────────────────────────────────────────
function InfiniteFeed() {
  const [items, setItems] = useState<ProductCardData[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadNext = useCallback(async () => {
    if (!BackendUrl || loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      // Use random skip via page param — server does Math.random skip for variety
      const res = await axios.get(
        `${BackendUrl}/ProductsHome?limit=24&page=${pageRef.current}`
      );
      const incoming: ProductCardData[] = res.data.products ?? res.data.data ?? [];

      // Strict deduplication — only add items we haven't seen yet
      const fresh = incoming.filter((p) => {
        if (seenIds.current.has(p._id)) return false;
        seenIds.current.add(p._id);
        return true;
      });

      if (fresh.length === 0 && incoming.length > 0) {
        // Server returned only duplicates — likely looped, stop
        setHasMore(false);
      } else {
        if (incoming.length < 24) setHasMore(false);
        setItems((prev) => [...prev, ...fresh]);
        pageRef.current += 1;
      }
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore]);

  // Initial load
  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intersection observer — fires when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNext();
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext]);

  if (items.length === 0 && loadingMore) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <SectionHeader
        icon={<Sparkles size={17} />}
        title="Pour vous"
        subtitle="Découvrez des milliers d'articles"
        href="/voir-plus"
        accent="#30A08B"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
        {loadingMore &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>
      {/* Sentinel — placed outside the grid so it's always visible */}
      <div ref={sentinelRef} className="h-4 mt-2" />
      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4 py-2">
          Vous avez tout vu ! 🎉
        </p>
      )}
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-[#30A08B]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-medium">Chargement…</span>
        </div>
      )}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const HomeMain: React.FC<HomeMainProps> = () => {
  const router = useRouter();
  const bannerRef = useRef<any>(null);

  const allProducts = useAppSelector((state) => state.products.data) as ProductCardData[];
  const DATA_Types   = useAppSelector((state) => state.products.types) as any[];
  const DATA_Cats    = useAppSelector((state) => state.products.categories) as any[];
  const DATA_Pubs    = useAppSelector((state) => state.products.products_Pubs) as any[];
  const isLoading    = useAppSelector((state) => state.products.loading);

  // ── Derived data ────────────────────────────────────────────────────────────
  const featured = useMemo(() => allProducts.slice(0, 8), [allProducts]);
  const flashDeals = useMemo(
    () => allProducts.filter((p) => p.prixPromo && p.prixPromo > 0).slice(0, 12),
    [allProducts]
  );
  const newArrivals = useMemo(() => allProducts.slice(8, 16), [allProducts]);

  const categorySections = useMemo(() => {
    if (!allProducts.length || !DATA_Types.length || !DATA_Cats.length) return [];
    return DATA_Cats.filter((c) => c.name !== "all")
      .map((cat) => {
        const typeIds = new Set(
          DATA_Types.filter((t: any) => t.clefCategories === cat._id).map((t: any) => t._id)
        );
        const products = allProducts.filter((p: any) => typeIds.has(p.ClefType));
        return { cat, products };
      })
      .filter(({ products }) => products.length >= 2);
  }, [allProducts, DATA_Types, DATA_Cats]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-16 md:pb-0">

      {/* ══ HERO BANNER ════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Category sidebar — desktop only */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
                <div className="bg-[#30A08B] px-4 py-3">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <Grid3X3 size={15} /> Catégories
                  </p>
                </div>
                <ul className="py-2">
                  {DATA_Cats.filter((c) => c.name !== "all").slice(0, 10).map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => router.push(`/Categorie/${cat.name}`)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#f0faf7] hover:text-[#30A08B] transition-colors"
                      >
                        {cat.image && (
                          <Image src={cat.image} alt={cat.name} width={22} height={22} className="rounded object-cover flex-shrink-0" />
                        )}
                        <span className="truncate capitalize">{cat.name}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => router.push("/voir-plus")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#30A08B] font-semibold hover:bg-[#f0faf7] transition-colors"
                    >
                      <ChevronRight size={16} /> Toutes les catégories
                    </button>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Main banner carousel */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100">
              {DATA_Pubs.length > 0 ? (
                <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[340px]">
                  <Swiper
                    ref={bannerRef}
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 4500, disableOnInteraction: false }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    loop
                    className="w-full h-full banner-swiper"
                  >
                    {DATA_Pubs.map((pub: any, i: number) => (
                      <SwiperSlide key={i} className="!h-full">
                        <div className="relative w-full h-full">
                          <Image
                            src={pub.image}
                            alt={`Bannière ${i + 1}`}
                            fill
                            className="object-cover object-center"
                            priority={i === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <button
                    onClick={() => bannerRef.current?.swiper.slidePrev()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 transition-all text-lg font-bold"
                  >‹</button>
                  <button
                    onClick={() => bannerRef.current?.swiper.slideNext()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 transition-all text-lg font-bold"
                  >›</button>
                </div>
              ) : (
                <div className="w-full h-[200px] sm:h-[280px] lg:h-[340px] bg-gradient-to-br from-[#30A08B] to-[#1d7a6a] flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h1 className="text-2xl sm:text-4xl font-black mb-2">IhamBaobab</h1>
                    <p className="text-sm sm:text-base opacity-90">La marketplace du Niger 🌍</p>
                    <button
                      onClick={() => router.push("/voir-plus")}
                      className="mt-4 bg-white text-[#30A08B] font-bold text-sm px-6 py-2 rounded-full hover:bg-opacity-90 transition-all"
                    >
                      Découvrir →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Side banners — desktop XL */}
            <div className="hidden xl:flex flex-col gap-3 w-48 flex-shrink-0">
              <div
                onClick={() => router.push("/promotion")}
                className="rounded-2xl bg-gradient-to-br from-[#30A08B] to-[#1d7a6a] p-4 text-white flex-1 flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Tag size={22} />
                <div>
                  <p className="font-black text-lg leading-tight">Promos</p>
                  <p className="text-xs opacity-80">Jusqu'à -70%</p>
                </div>
              </div>
              <div
                onClick={() => router.push("/nouveaux")}
                className="rounded-2xl bg-gradient-to-br from-[#B17236] to-[#8a5427] p-4 text-white flex-1 flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Sparkles size={22} />
                <div>
                  <p className="font-black text-lg leading-tight">Nouveautés</p>
                  <p className="text-xs opacity-80">Arrivages récents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EVENT BANNER ════════════════════════════════════════════════════════ */}
      <EventBanner />

      {/* ══ DAILY CHECKIN BANNER ════════════════════════════════════════════════ */}
      <DailyCheckinBanner />

      {/* ══ CATEGORY STRIP ══════════════════════════════════════════════════════ */}
      {/* top-14 = 56px ≈ mobile header height; md:top-[120px] ≈ desktop header with subnav */}
      <section className="bg-white border-b border-gray-100 sticky top-14 md:top-[120px] z-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <CategorieMobile />
        </div>
      </section>

      {/* ══ TRUST BADGES ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl px-3 py-3 flex items-center gap-3 border border-gray-100 hover:border-[#30A08B]/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f0faf7] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#30A08B]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 leading-tight truncate">{label}</p>
                <p className="text-[10px] text-gray-400 truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-8 space-y-6">

        {/* ══ FEATURED PRODUCTS ═══════════════════════════════════════════════ */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <SectionHeader
            icon={<TrendingUp size={17} />}
            title="Produits vedettes"
            subtitle="Sélection du moment"
            href="/voir-plus"
          />
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        {/* ══ FLASH DEALS ════════════════════════════════════════════════════= */}
        {(isLoading || flashDeals.length > 0) && (
          <section className="rounded-2xl overflow-hidden shadow-sm border border-red-100">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-white animate-pulse" />
                <span className="text-white font-black text-base sm:text-lg tracking-wide">FLASH DEALS</span>
              </div>
              <FlashCountdown />
            </div>
            <div className="bg-white p-4">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} compact />)}
                </div>
              ) : flashDeals.length > 0 ? (
                <SliderPage products={flashDeals} name="flash" showHeader={false} autoplay />
              ) : null}
            </div>
          </section>
        )}

        {/* ══ NEW ARRIVALS ════════════════════════════════════════════════════ */}
        {(isLoading || newArrivals.length > 0) && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionHeader
              icon={<Sparkles size={17} />}
              title="Nouveautés"
              subtitle="Arrivages récents"
              href="/nouveaux"
              accent="#B17236"
            />
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <SliderPage products={newArrivals} name="nouveaux" showHeader={false} autoplay />
            )}
          </section>
        )}

        {/* ══ PROMO BANNERS ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => router.push("/promotion")}
            className="rounded-2xl bg-gradient-to-br from-[#30A08B] to-[#1d7a6a] p-6 cursor-pointer hover:opacity-95 transition-all hover:shadow-lg"
          >
            <Tag size={28} className="text-white/80 mb-3" />
            <h3 className="text-white font-black text-xl leading-tight">Meilleures Promos</h3>
            <p className="text-white/80 text-sm mt-1">Jusqu'à <span className="font-bold text-yellow-300">-70%</span> sur des milliers d'articles</p>
            <span className="inline-flex items-center gap-1 mt-4 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Voir les promos <ChevronRight size={15} />
            </span>
          </div>
          <div
            onClick={() => router.push("/become-seller")}
            className="rounded-2xl bg-gradient-to-br from-[#B17236] to-[#8a5427] p-6 cursor-pointer hover:opacity-95 transition-all hover:shadow-lg"
          >
            <TrendingUp size={28} className="text-white/80 mb-3" />
            <h3 className="text-white font-black text-xl leading-tight">Vendre sur IhamBaobab</h3>
            <p className="text-white/80 text-sm mt-1">Rejoignez des milliers de vendeurs et développez votre business</p>
            <span className="inline-flex items-center gap-1 mt-4 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Commencer <ChevronRight size={15} />
            </span>
          </div>
        </div>

        {/* ══ CATEGORY SECTIONS ═══════════════════════════════════════════════ */}
        {isLoading && categorySections.length === 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </section>
        )}

        {categorySections.map(({ cat, products }) => (
          <section key={cat._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SectionHeader
              icon={
                cat.image
                  ? <Image src={cat.image} alt={cat.name} width={18} height={18} className="rounded object-cover" />
                  : <Grid3X3 size={16} />
              }
              title={cat.name}
              subtitle={`${products.length} produit${products.length > 1 ? "s" : ""}`}
              href={`/Categorie/${cat.name}`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {products.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {products.length > 4 && (
              <SliderPage products={products.slice(4)} name={cat.name} showHeader={false} />
            )}
          </section>
        ))}

        {/* ══ INFINITE FEED ═══════════════════════════════════════════════════ */}
        <InfiniteFeed />

        {/* ══ BOTTOM CTA ══════════════════════════════════════════════════════ */}
        <section
          className="rounded-2xl bg-gradient-to-r from-[#30A08B] via-[#2a9075] to-[#1d7a6a] p-8 text-center shadow-lg cursor-pointer"
          onClick={() => router.push("/voir-plus")}
        >
          <h2 className="text-white font-black text-2xl sm:text-3xl mb-2">Des milliers d'articles vous attendent</h2>
          <p className="text-white/80 text-sm sm:text-base mb-6">Mode, électronique, maison, beauté et bien plus…</p>
          <button className="bg-white text-[#30A08B] font-black text-sm sm:text-base px-8 py-3 rounded-full hover:bg-opacity-90 transition-all hover:shadow-xl active:scale-95">
            Explorer tout le catalogue →
          </button>
        </section>
      </div>
    </div>
  );
};

export default HomeMain;
