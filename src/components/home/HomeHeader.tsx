"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, User, ChevronDown, ChevronRight,
  ShoppingCart, Heart, Truck, Phone,
  Package, LogOut, HelpCircle, Shield,
  Info, MessageCircle, Grid3X3, Home,
  Search, Store, Plus, Bell, Trees,
} from "lucide-react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout, selectAcces } from "@/redux/userSlice";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import SearchBar from "../SearchBarNew";
import { fetchUserLikes } from "@/redux/likesSlice";
import { selectWallet, fetchWallet } from "@/redux/gamificationSlice";
import HeaderMobile from "./HeaderMobile";
import { triggerNavProgress } from "@/components/NavigationProgress";
import { usePanierSync } from "@/hooks/usePanierSync";
import { cn } from "@/lib/utils";

interface HomeHeaderProps { chg?: () => void; }
interface Category { _id: string; name: string; image: string; }

const HomeHeader: React.FC<HomeHeaderProps> = ({ chg }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = useAppSelector((s) => s.products.categories) as Category[];
  const { panierCount } = usePanierSync();
  const acces = useAppSelector(selectAcces);
  const currentUser = useAppSelector((s) => s.user.user);
  const { likedProducts } = useAppSelector((s) => s.likes);
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

  const wallet = useAppSelector(selectWallet);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [nbr, setNbr] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // ── User ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("userEcomme");
        if (raw) { const d = JSON.parse(raw); setUser(d?.user || d); }
      } catch {}
    }
  }, [currentUser]);

  // ── Scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !BackendUrl) return;
    const s = io(BackendUrl);
    setSocket(s);
    return () => { s.disconnect(); };
  }, [BackendUrl]);

  // ── Likes + wallet ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserLikes(user.id));
      dispatch(fetchWallet(user.id));
    }
  }, [user?.id, dispatch]);

  // ── Messages ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || !BackendUrl) return;
    axios
      .get(`${BackendUrl}/getUserMessagesByClefUser/${user.id}`)
      .then((res) =>
        setNbr(res.data.filter((i: any) => !i.lusUser && i.provenance === false).length)
      )
      .catch(() => {});
  }, [user?.id, BackendUrl]);

  useEffect(() => {
    if (!socket || !user?.id || !BackendUrl) return;
    const refresh = () => {
      axios
        .get(`${BackendUrl}/getUserMessagesByClefUser/${user.id}`)
        .then((res) =>
          setNbr(res.data.filter((i: any) => !i.lusUser && i.provenance === false).length)
        )
        .catch(() => {});
    };
    socket.on("new_message_user", refresh);
    return () => { socket.off("new_message_user", refresh); };
  }, [socket, user?.id, BackendUrl]);

  // ── Click outside to close dropdowns ──────────────────────────────────────
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggleDropdown = (key: string) =>
    setActiveDropdown((prev) => (prev === key ? null : key));

  const closeAll = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    ["orderTotal", "pendingOrder", "cartItems", "userToken"].forEach((k) =>
      localStorage.removeItem(k)
    );
    chg?.();
    closeAll();
    router.push("/");
    setTimeout(() => window.location.reload(), 100);
  };

  // ── Options ────────────────────────────────────────────────────────────────
  const accountOpts = [
    ...(acces === "non"
      ? [
          { icon: User, label: "Se connecter", href: "/auth/login" },
          { icon: Plus, label: "S'inscrire", href: "/auth/register" },
        ]
      : []),
    { icon: Home, label: "Mon compte", href: acces === "oui" ? "/profile" : "/auth/login?returnUrl=/profile" },
    { icon: Package, label: "Mes commandes", href: acces === "oui" ? "/commandes" : "/auth/login?returnUrl=/commandes" },
    { icon: Trees, label: "Baobab Points", href: acces === "oui" ? "/wallet" : "/auth/login?returnUrl=/wallet" },
    { icon: Heart, label: "Inviter des amis", href: acces === "oui" ? "/invite-ami" : "/auth/login?returnUrl=/invite-ami" },
    { icon: Truck, label: "Mes adresses", href: acces === "oui" ? "/livraison" : "/auth/login?returnUrl=/livraison" },
    ...(acces === "oui"
      ? [{ icon: LogOut, label: "Se déconnecter", onClick: handleLogout }]
      : []),
  ];

  const helpOpts = [
    { icon: HelpCircle, label: "Centre d'aide", href: "/centre-aide" },
    { icon: Truck, label: "Adresse de livraison", href: "/livraison" },
    { icon: Bell, label: "Notifications", href: "/" },
    { icon: Shield, label: "Confidentialité", href: "/confidentialite" },
    { icon: HelpCircle, label: "FAQ", href: "/faq" },
    { icon: Info, label: "Informations légales", href: "/informations-legales" },
  ];

  // ── Reusable sub-components ────────────────────────────────────────────────
  const DropdownItem = ({ icon: Icon, label, href, onClick: onClickProp }: any) => (
    <button
      onClick={() => {
        closeAll();
        if (onClickProp) onClickProp();
        else if (href) { triggerNavProgress(); router.push(href); }
      }}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0faf7] hover:text-[#30A08B] transition-colors group"
    >
      <Icon size={16} className="text-gray-400 group-hover:text-[#30A08B] flex-shrink-0" />
      <span className="font-medium text-left flex-1">{label}</span>
      <ChevronRight size={13} className="text-gray-300 group-hover:text-[#30A08B] flex-shrink-0" />
    </button>
  );

  const IconAction = ({ icon: Icon, badge, onClick, ariaLabel }: any) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-[#30A08B] hover:bg-[#f0faf7] transition-all"
    >
      <Icon size={20} />
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#30A08B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* ── Top info bar (desktop only) ───────────────────────────────────────── */}
      <div className="hidden md:block bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 text-gray-400">
            <span className="flex items-center gap-1.5">
              <Phone size={11} /> +227 87727501
            </span>
            <span className="flex items-center gap-1.5 text-[#4bbda5]">
              <Truck size={11} /> Livraison gratuite dès 30&nbsp;000F
            </span>
          </div>
          <div className="flex items-center gap-5 text-gray-400">
            <span className="text-yellow-400 font-medium">
              🎉 Code <strong>BIENVENUE20</strong> → -20% (max 2&nbsp;000F)
            </span>
            <button
              onClick={() => router.push("/become-seller")}
              className="flex items-center gap-1 hover:text-[#4bbda5] transition-colors"
            >
              <Store size={11} /> Vendre sur IhamBaobab
            </button>
          </div>
        </div>
      </div>

      {/* ── Main sticky header ────────────────────────────────────────────────── */}
      <header
        ref={dropdownRef}
        className={cn(
          "sticky top-0 z-30 bg-white transition-all duration-200",
          scrolled ? "shadow-lg" : "shadow-sm border-b border-gray-100"
        )}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5">

          {/* ── Mobile: Row 1 — Hamburger · Logo · Cart ── */}
          <div className="md:hidden flex items-center justify-between py-2 gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

            <div onClick={() => { triggerNavProgress(); router.push("/"); }} className="flex-1 cursor-pointer flex justify-center">
              <Image
                src="/LogoText.png"
                alt="IhamBaobab"
                width={52}
                height={48}
                className="object-contain"
                priority
              />
            </div>

            <IconAction
              icon={ShoppingCart}
              badge={panierCount}
              onClick={() => { triggerNavProgress(); router.push("/Panier"); }}
              ariaLabel="Panier"
            />
          </div>

          {/* ── Mobile: Row 2 — Full-width search ── */}
          <div className="md:hidden pb-2">
            <SearchBar onSearch={(q) => { triggerNavProgress(); router.push(`/Search?q=${encodeURIComponent(q)}`); }} />
          </div>

          {/* ── Desktop: Single row — Logo · Search · Actions ── */}
          <div className="hidden md:flex items-center gap-3 py-2.5">
            {/* Logo */}
            <div onClick={() => { triggerNavProgress(); router.push("/"); }} className="flex-shrink-0 cursor-pointer">
              <Image
                src="/LogoText.png"
                alt="IhamBaobab"
                width={56}
                height={52}
                className="object-contain"
                priority
              />
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0 mx-2">
              <SearchBar onSearch={(q) => { triggerNavProgress(); router.push(`/Search?q=${encodeURIComponent(q)}`); }} />
            </div>

            {/* Desktop action icons */}
            <div className="flex items-center gap-0.5">
              {/* Account dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("account")}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-[#f0faf7] text-gray-700 hover:text-[#30A08B] transition-all"
                >
                  <div className="relative w-7 h-7 rounded-full bg-[#f0faf7] flex items-center justify-center flex-shrink-0">
                    <User size={15} className="text-[#30A08B]" />
                    {wallet?.level && wallet.level !== "Graine" && (
                      <span className="absolute -bottom-1 -right-1 text-[9px] leading-none">
                        {wallet.level === "Grand Baobab" ? "🌳" : "🌿"}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] text-gray-400 leading-none">Bonjour</p>
                    <p className="text-xs font-bold text-gray-700 leading-none mt-0.5">
                      {acces === "oui" ? (user?.name?.split(" ")[0] ?? "Compte") : "Compte"}
                    </p>
                  </div>
                  <ChevronDown
                    size={13}
                    className={cn("text-gray-400 transition-transform", activeDropdown === "account" && "rotate-180")}
                  />
                </button>

                {activeDropdown === "account" && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-popIn">
                    {acces === "oui" && user && (
                      <div className="bg-gradient-to-r from-[#30A08B] to-[#1d7a6a] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-bold text-sm">{user.name || "Mon compte"}</p>
                          {wallet?.level && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              wallet.level === "Grand Baobab" ? "bg-amber-400 text-amber-900" :
                              wallet.level === "Arbre" ? "bg-white/20 text-white" :
                              "bg-white/15 text-white/80"
                            }`}>
                              {wallet.level === "Grand Baobab" ? "🌳" : wallet.level === "Arbre" ? "🌿" : "🌱"} {wallet.level}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-white/70 text-xs truncate">{user.email || ""}</p>
                          {wallet !== null && (
                            <p className="text-white/90 text-xs font-semibold shrink-0 ml-2">{wallet.balance ?? 0} BP</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="py-1">
                      {accountOpts.map((o) => (
                        <DropdownItem key={o.label} {...o} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <IconAction
                icon={Heart}
                badge={likedProducts?.length || 0}
                onClick={() => { triggerNavProgress(); router.push("/like-produit"); }}
                ariaLabel="Favoris"
              />
              <IconAction
                icon={ShoppingCart}
                badge={panierCount}
                onClick={() => { triggerNavProgress(); router.push("/Panier"); }}
                ariaLabel="Panier"
              />
              <IconAction
                icon={MessageCircle}
                badge={nbr}
                onClick={() => { triggerNavProgress(); router.push("/Messagerie"); }}
                ariaLabel="Messages"
              />

              {/* Help dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("help")}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-[#30A08B] hover:bg-[#f0faf7] transition-all"
                  aria-label="Aide"
                >
                  <HelpCircle size={20} />
                </button>
                {activeDropdown === "help" && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-popIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-gray-800 text-sm">Aide & informations</p>
                    </div>
                    <div className="py-1">
                      {helpOpts.map((o) => (
                        <DropdownItem key={o.label} {...o} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Row 2 — Sub-navigation (desktop only) */}
          <nav className="hidden md:flex items-center gap-1 pb-2 pt-0.5 border-t border-gray-50">
            {/* Categories */}
            <div className="relative mr-1">
              <button
                onClick={() => toggleDropdown("categories")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#30A08B] hover:bg-[#268070] transition-colors"
              >
                <Grid3X3 size={14} />
                Catégories
                <ChevronDown
                  size={13}
                  className={cn("transition-transform", activeDropdown === "categories" && "rotate-180")}
                />
              </button>

              {activeDropdown === "categories" && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-popIn">
                  <div className="py-1 max-h-96 overflow-y-auto">
                    {categories
                      .filter((c) => c.name !== "all")
                      .map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => { closeAll(); triggerNavProgress(); router.push(`/Categorie/${cat.name}`); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0faf7] hover:text-[#30A08B] transition-colors"
                        >
                          {cat.image && (
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              width={26}
                              height={26}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <span className="capitalize font-medium flex-1 text-left">{cat.name}</span>
                          <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                        </button>
                      ))}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2.5">
                    <button
                      onClick={() => { closeAll(); triggerNavProgress(); router.push("/voir-plus"); }}
                      className="text-sm text-[#30A08B] font-semibold hover:underline"
                    >
                      Voir toutes les catégories →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {[
              { label: "Promotions", href: "/promotion" },
              { label: "Nouveautés", href: "/nouveaux" },
              { label: "🌳 Baobab Points", href: "/wallet" },
              { label: "Devenir vendeur", href: "/become-seller" },
              { label: "Nos magasins", href: "/suppliers" },
            ].map(({ label, href }) => (
              <button
                key={label}
                onClick={() => { triggerNavProgress(); router.push(href); }}
                className="text-sm font-medium px-3 py-1.5 rounded-lg text-gray-600 hover:text-[#30A08B] hover:bg-[#f0faf7] transition-all"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Mobile bottom navigation bar ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-[60px]">
          {[
            { icon: Home, label: "Accueil", action: () => { triggerNavProgress(); router.push("/"); } },
            { icon: Grid3X3, label: "Catégories", action: () => setIsMobileMenuOpen(true) },
            { icon: Search, label: "Explorer", action: () => { triggerNavProgress(); router.push("/voir-plus"); } },
            { icon: ShoppingCart, label: "Panier", action: () => { triggerNavProgress(); router.push("/Panier"); }, badge: panierCount },
            { icon: Trees, label: "Points", action: () => { triggerNavProgress(); router.push(acces === "oui" ? "/wallet" : "/auth/login?returnUrl=/wallet"); } },
          ].map(({ icon: Icon, label, action, badge }: any) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-[#30A08B] active:text-[#30A08B] transition-colors"
            >
              <div className="relative">
                <Icon size={21} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] bg-[#30A08B] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Mobile full-screen drawer ─────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <HeaderMobile
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          nbr={nbr}
          paniernbr={panierCount}
        />
      )}
    </>
  );
};

export default HomeHeader;
