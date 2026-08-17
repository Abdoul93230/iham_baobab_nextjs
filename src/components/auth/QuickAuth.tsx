"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronDown, Lock, Phone, User, Eye, EyeOff,
  ShieldCheck, Truck, Headphones, ArrowRight, ArrowLeft,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { loginUser } from "@/redux/userSlice";
import Alert from "@/components/Alert";
import CountryFlag from "@/components/ui/CountryFlag";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  applyPhoneInputChange,
  getPhonePlaceholder,
  toBackendPhone,
  validatePhone,
} from "@/lib/phoneRules";

type QuickAuthMode = "auto" | "login" | "register" | "reset";
type Step = "phone" | "login" | "register";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return "Une erreur est survenue";
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Paiement 100% sécurisé", sub: "SSL & chiffrement bancaire" },
  { icon: Truck,       label: "Livraison rapide",        sub: "Partout au Niger" },
  { icon: Headphones,  label: "Support 7j/7",            sub: "Toujours disponible" },
];

const STEP_META: Record<Step, { title: string; sub: string }> = {
  phone:    { title: "Bienvenue sur IhamBaobab",  sub: "Entrez votre numéro pour continuer" },
  login:    { title: "Bon retour !",              sub: "Entrez votre mot de passe" },
  register: { title: "Créer mon compte",          sub: "Une étape de plus — votre prénom" },
};

interface QuickAuthProps { initialMode?: QuickAuthMode; }

const QuickAuth: React.FC<QuickAuthProps> = ({ initialMode = "auto" }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState(DEFAULT_PHONE_COUNTRY);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [dropdownDir, setDropdownDir] = useState<"down" | "up">("down");
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 260, maxHeight: 320 });
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [otpChannel, setOtpChannel] = useState<"sms" | "whatsapp">("sms");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: "info" as "success"|"error"|"warning"|"info", message: "" });

  const countryRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!countryRef.current?.contains(e.target as Node)) setIsCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fullPhone  = useMemo(() => toBackendPhone(country, phoneDigits), [country, phoneDigits]);
  const fmtPhone   = useMemo(() => applyPhoneInputChange(country, phoneDigits).display, [country, phoneDigits]);

  const showAlert = (type: "success"|"error"|"warning"|"info", message: string) =>
    setAlert({ visible: true, type, message });
  const hideAlert = () => setAlert({ visible: false, type: "info", message: "" });

  const goAfterAuth = () => {
    const r = searchParams.get("redirect") || searchParams.get("returnUrl") || "/";
    router.push(r);
  };

  const validatePhoneField = () => {
    const res = validatePhone(country, phoneDigits, true);
    setPhoneError(res.message);
    if (!res.isValid) { showAlert("error", res.message); return false; }
    return true;
  };

  const handlePhoneChange = (raw: string) => {
    const next = applyPhoneInputChange(country, raw);
    setPhoneDigits(next.digits);
    if (!next.digits) { setPhoneError(""); return; }
    setPhoneError(validatePhone(country, next.digits, true).message);
  };

  const handleCountrySelect = (entry: typeof PHONE_COUNTRIES[number]) => {
    setCountry(entry);
    setIsCountryOpen(false);
    const next = applyPhoneInputChange(entry, phoneDigits);
    setPhoneDigits(next.digits);
    if (!next.digits) { setPhoneError(""); return; }
    setPhoneError(validatePhone(entry, next.digits, true).message);
  };

  const updateDropdownPos = () => {
    const rect = countryRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxH = Math.min(320, Math.floor(vh * 0.55));
    const w = Math.min(260, vw - 16);
    const left = Math.min(Math.max(rect.left, 8), vw - w - 8);
    const shouldUp = vh - rect.bottom < maxH && rect.top > vh - rect.bottom;
    setDropdownDir(shouldUp ? "up" : "down");
    setDropdownCoords({ top: shouldUp ? rect.top - 6 : rect.bottom + 6, left, width: w, maxHeight: maxH });
  };

  const toggleCountryDropdown = () => {
    if (isCountryOpen) { setIsCountryOpen(false); return; }
    updateDropdownPos();
    setIsCountryOpen(true);
  };

  useEffect(() => {
    if (!isCountryOpen) return;
    const fn = () => updateDropdownPos();
    window.addEventListener("resize", fn);
    window.addEventListener("scroll", fn, true);
    return () => { window.removeEventListener("resize", fn); window.removeEventListener("scroll", fn, true); };
  }, [isCountryOpen]);

  const buildVerifyUrl = (params: Record<string, string | number | null | undefined>) => {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") qp.set(k, String(v)); });
    const r = searchParams.get("redirect") || searchParams.get("returnUrl");
    if (r) qp.set("redirect", r);
    return `/auth/verify-otp?${qp.toString()}`;
  };

  const handleCheckPhone = async () => {
    if (!validatePhoneField()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/check-phone`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert("error", data?.message || "Impossible de vérifier le numéro"); return; }
      const exists = Boolean(data?.data?.exists);

      if (initialMode === "register") { setStep(exists ? "login" : "register"); return; }
      if (initialMode === "reset")    { if (!exists) { showAlert("error", "Aucun compte trouvé."); return; } await handleForgotPassword(); return; }
      if (initialMode === "login")    { setStep(exists ? "login" : "register"); return; }
      setStep(exists ? "login" : "register");
    } catch (e) { showAlert("error", getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  const handleLogin = async () => {
    if (!password || password.length < 6) { showAlert("error", "Mot de passe de 6 caractères minimum."); return; }
    setIsLoading(true);
    try {
      const result = await dispatch(loginUser({ identifier: fullPhone, phoneNumber: fullPhone, password }));
      if (loginUser.fulfilled.match(result)) goAfterAuth();
      else showAlert("error", getErrorMessage(result.payload));
    } finally { setIsLoading(false); }
  };

  const handleStartRegister = async () => {
    if (!name || name.trim().length < 2) { showAlert("error", "Veuillez saisir votre prénom (min 2 caractères)."); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, name: name.trim(), refCode: refCode.trim() || undefined, channel: otpChannel }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert("error", data?.message || "Impossible d'envoyer le code OTP"); return; }
      router.push(buildVerifyUrl({ type: "quick-register", phone: fullPhone, name: name.trim(), refCode: refCode.trim() || undefined, channel: otpChannel, attemptsRemaining: data?.data?.attemptsRemaining, cooldownSeconds: data?.data?.cooldownSeconds, expiresInSeconds: data?.data?.expiresInSeconds }));
    } catch (e) { showAlert("error", getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!validatePhoneField()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/request-password-reset-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) { showAlert("error", data?.message || "Impossible de lancer la réinitialisation"); return; }
      router.push(buildVerifyUrl({ type: "password-reset", phone: fullPhone, attemptsRemaining: data?.data?.attemptsRemaining, cooldownSeconds: data?.data?.cooldownSeconds, expiresInSeconds: data?.data?.expiresInSeconds }));
    } catch (e) { showAlert("error", getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  const meta = STEP_META[step];

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT PANEL (desktop) ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d6e5c] via-[#30A08B] to-[#1a8a74]" />
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-white/5" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Image src="/logo.png" alt="IhamBaobab" width={28} height={28} className="object-contain" />
              </div>
              <span className="text-white font-black text-2xl tracking-tight">IhamBaobab</span>
            </div>
            <p className="text-white/70 text-sm">La marketplace du Niger 🌍</p>
          </div>

          {/* Central message */}
          <div>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-tight mb-6">
              Des milliers<br />
              de produits,<br />
              <span className="text-white/60">livrés chez vous.</span>
            </h2>
            <p className="text-white/80 text-base mb-10 max-w-sm leading-relaxed">
              Rejoignez des centaines de milliers d'acheteurs et vendeurs sur la première marketplace du Niger.
            </p>

            {/* Trust items */}
            <div className="space-y-4">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">{label}</p>
                    <p className="text-white/60 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8">
            {[
              { value: "50K+", label: "Acheteurs" },
              { value: "2K+",  label: "Vendeurs" },
              { value: "10K+", label: "Produits" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white font-black text-2xl">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 bg-[#fafbfc]">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#30A08B] flex items-center justify-center">
            <Image src="/logo.png" alt="IhamBaobab" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">IhamBaobab</span>
        </div>

        <div className="w-full max-w-md">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {(["phone", "login", "register"] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s === step ? "bg-[#30A08B] text-white scale-110 shadow-md shadow-[#30A08B]/30"
                  : i < ["phone","login","register"].indexOf(step) ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-400"
                }`}>{i + 1}</div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${i < ["phone","login","register"].indexOf(step) ? "bg-[#30A08B]" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{meta.title}</h1>
            <p className="text-gray-500 text-sm mt-1.5">{meta.sub}</p>
          </div>

          {/* Phone field — always visible */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Numéro de téléphone
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm focus-within:border-[#30A08B] focus-within:ring-2 focus-within:ring-[#30A08B]/20 transition-all">
              {/* Country selector */}
              <div className="relative flex-shrink-0" ref={countryRef}>
                <button
                  type="button"
                  onClick={toggleCountryDropdown}
                  disabled={step !== "phone"}
                  className="h-[52px] px-3 bg-gray-50 border-r border-gray-200 flex items-center gap-1.5 hover:bg-gray-100 transition-colors disabled:opacity-60"
                >
                  <CountryFlag iso={country.iso} emoji={country.flag} countryName={country.name} className="h-4 w-6 rounded-sm" />
                  <span className="text-sm font-semibold text-gray-700">{country.dialCode}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              </div>
              {/* Phone input */}
              <div className="relative flex-1">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={fmtPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={getPhonePlaceholder(country)}
                  disabled={step !== "phone"}
                  className="w-full h-[52px] pl-9 pr-4 text-sm text-gray-900 bg-transparent focus:outline-none disabled:text-gray-500"
                  maxLength={country.nationalLength + country.groups.length - 1}
                />
              </div>
              {/* Edit button when not on phone step */}
              {step !== "phone" && (
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="px-3 text-xs font-semibold text-[#30A08B] hover:text-[#27897A] border-l border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Modifier
                </button>
              )}
            </div>
            {phoneError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{phoneError}</p>}
          </div>

          {/* Name field (register) */}
          {step === "register" && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prénom / Nom</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm focus-within:border-[#30A08B] focus-within:ring-2 focus-within:ring-[#30A08B]/20 transition-all">
                <div className="flex items-center pl-3 pr-1">
                  <User size={15} className="text-gray-400" />
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Moussa Maïga"
                  className="flex-1 h-[52px] px-3 text-sm text-gray-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Referral code field (register) */}
          {step === "register" && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Code parrainage <span className="text-gray-400 font-normal normal-case">(optionnel)</span></label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm focus-within:border-[#B17236] focus-within:ring-2 focus-within:ring-[#B17236]/20 transition-all">
                <div className="flex items-center pl-3 pr-1">
                  <span className="text-gray-400 text-sm">🌿</span>
                </div>
                <input
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="Ex : MOUSSA-AB12"
                  className="flex-1 h-[52px] px-3 text-sm text-gray-900 bg-transparent focus:outline-none uppercase placeholder:normal-case placeholder:text-gray-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Entrez le code d'un ami pour gagner des Baobab Points à votre première commande.</p>
            </div>
          )}

          {/* Canal OTP (register) — temporairement désactivé, SMS uniquement */}
          {/* {step === "register" && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Recevoir le code de vérification par
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOtpChannel("sms")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    otpChannel === "sms"
                      ? "border-[#30A08B] bg-[#30A08B]/5 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">💬</span>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${otpChannel === "sms" ? "text-[#30A08B]" : "text-gray-700"}`}>SMS</p>
                    <p className="text-xs text-gray-400">Message texte</p>
                  </div>
                  {otpChannel === "sms" && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#30A08B] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpChannel("whatsapp")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    otpChannel === "whatsapp"
                      ? "border-[#25D366] bg-[#25D366]/5 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">📱</span>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${otpChannel === "whatsapp" ? "text-[#25D366]" : "text-gray-700"}`}>WhatsApp</p>
                    <p className="text-xs text-gray-400">Message WhatsApp</p>
                  </div>
                  {otpChannel === "whatsapp" && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )} */}

          {/* Password field (login) */}
          {step === "login" && (
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mot de passe</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm focus-within:border-[#30A08B] focus-within:ring-2 focus-within:ring-[#30A08B]/20 transition-all">
                <div className="flex items-center pl-3 pr-1">
                  <Lock size={15} className="text-gray-400" />
                </div>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Votre mot de passe"
                  className="flex-1 h-[52px] px-3 text-sm text-gray-900 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="px-3 text-gray-400 hover:text-gray-600 border-l border-gray-200"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-xs font-semibold text-[#B17236] hover:text-[#9a5f2d] transition-colors disabled:opacity-50"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            disabled={isLoading}
            onClick={step === "phone" ? handleCheckPhone : step === "login" ? handleLogin : handleStartRegister}
            className="w-full h-[52px] mt-4 rounded-xl bg-[#30A08B] hover:bg-[#27897A] active:bg-[#1f7060] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#30A08B]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <>
                {step === "phone" ? "Continuer" : step === "login" ? "Se connecter" : "Envoyer le code OTP"}
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Back to phone */}
          {step !== "phone" && (
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full h-[44px] mt-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={14} />
              Retour
            </button>
          )}

          {/* Switch link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {step === "login" ? (
              <>Pas encore de compte ?{" "}
                <button onClick={() => setStep("register")} className="text-[#30A08B] font-semibold hover:underline">
                  S'inscrire
                </button>
              </>
            ) : step === "register" ? (
              <>Déjà un compte ?{" "}
                <button onClick={() => setStep("login")} className="text-[#30A08B] font-semibold hover:underline">
                  Se connecter
                </button>
              </>
            ) : (
              <>Votre numéro sera utilisé pour la connexion et la livraison.</>
            )}
          </p>

          {/* Legal */}
          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            En continuant, vous acceptez nos{" "}
            <a href="/cgu" className="underline hover:text-gray-600">conditions d'utilisation</a>
            {" "}et notre{" "}
            <a href="/confidentialite" className="underline hover:text-gray-600">politique de confidentialité</a>.
          </p>
        </div>
      </div>

      {/* Country dropdown portal */}
      {isCountryOpen && createPortal(
        <div
          className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl z-[120] overflow-y-auto"
          style={{
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
            width: `${dropdownCoords.width}px`,
            maxHeight: `${dropdownCoords.maxHeight}px`,
            transform: dropdownDir === "up" ? "translateY(-100%)" : "none",
          }}
        >
          {PHONE_COUNTRIES.map((entry) => (
            <button
              key={entry.dialCode}
              type="button"
              onClick={() => handleCountrySelect(entry)}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl transition-colors"
            >
              <CountryFlag iso={entry.iso} emoji={entry.flag} countryName={entry.name} className="h-4 w-6 rounded-sm flex-shrink-0" />
              <span className="font-semibold text-sm text-gray-800">{entry.dialCode}</span>
              <span className="text-xs text-gray-500 truncate">{entry.name}</span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {alert.visible && <Alert type={alert.type} message={alert.message} onClose={hideAlert} />}
    </div>
  );
};

export default QuickAuth;
