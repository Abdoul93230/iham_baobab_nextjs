"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { loginUser } from "@/redux/userSlice";
import Alert from "@/components/Alert";
import { getPasswordChecks, getPasswordStrength, validatePassword } from "@/lib/passwordRules";
import {
  Eye, EyeOff, Lock, CheckCircle2, RefreshCcw,
  ShieldCheck, Truck, Headphones, ArrowLeft,
} from "lucide-react";

type FlowType = "quick-register" | "password-reset";
type Step = "verify-otp" | "set-password" | "success";

const fmt = (s: number) => {
  const safe = Math.max(0, Math.floor(Number(s) || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
};

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
  { icon: ShieldCheck, label: "Paiement 100% sécurisé",  sub: "SSL & chiffrement bancaire" },
  { icon: Truck,       label: "Livraison rapide",          sub: "Partout au Niger" },
  { icon: Headphones,  label: "Support 7j/7",              sub: "Toujours disponible" },
];

const STRENGTH_COLORS: Record<string, string> = {
  "Très faible": "bg-red-400",
  "Faible":      "bg-orange-400",
  "Moyen":       "bg-yellow-400",
  "Fort":        "bg-emerald-400",
  "Très fort":   "bg-emerald-600",
};

const OTP_LEN = 6;

const VerifyOTP: React.FC = () => {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const searchParams = useSearchParams();

  const flowType = (searchParams.get("type") as FlowType) || "quick-register";
  const phone    = searchParams.get("phone") || "";
  const name     = searchParams.get("name")  || "";
  const refCode  = searchParams.get("refCode") || "";
  // const channel = (searchParams.get("channel") || "sms") as "sms" | "whatsapp"; // DÉSACTIVÉ
  const channel = "sms" as "sms" | "whatsapp";
  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep]         = useState<Step>("verify-otp");
  const [digits, setDigits]     = useState<string[]>(Array(OTP_LEN).fill(""));
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(
    searchParams.get("attemptsRemaining") ? Number(searchParams.get("attemptsRemaining")) : null
  );
  const [cooldown, setCooldown]   = useState(Number(searchParams.get("cooldownSeconds") || 0));
  const [expires,  setExpires]    = useState(Number(searchParams.get("expiresInSeconds") || 0));
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [showPwd,  setShowPwd]    = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: "info" as "success"|"error"|"warning"|"info", message: "" });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join("");
  const canVerify = otp.length === OTP_LEN;

  const passwordChecks  = useMemo(() => getPasswordChecks(password),  [password]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Countdown
  useEffect(() => {
    if (cooldown <= 0 && expires <= 0) return;
    const id = setInterval(() => {
      setCooldown((v) => (v > 0 ? v - 1 : 0));
      setExpires((v)  => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const showAlert = (type: "success"|"error"|"warning"|"info", message: string) =>
    setAlert({ visible: true, type, message });
  const hideAlert = () => setAlert({ visible: false, type: "info", message: "" });

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LEN - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && index > 0)          inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LEN - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    const next = [...digits];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LEN - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const loginAfterDone = async (pwd: string) => {
    const result = await dispatch(loginUser({ identifier: phone, phoneNumber: phone, password: pwd }));
    if (loginUser.fulfilled.match(result)) { router.push(redirect); return; }
    showAlert("error", getErrorMessage(result.payload));
  };

  const handleVerify = async () => {
    if (!canVerify) { showAlert("error", "Saisissez les 6 chiffres."); return; }
    setIsLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        const rem = Number(data?.data?.attemptsRemaining);
        if (!isNaN(rem)) setAttemptsLeft(rem);
        showAlert("error", data?.message || "Code OTP invalide");
        return;
      }
      setStep("set-password");
    } catch (e) { showAlert("error", getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const endpoint = flowType === "password-reset" ? "/auth/request-password-reset-otp" : "/auth/send-otp";
      const body     = flowType === "password-reset" ? { phone } : { phone, name: name || null, channel };
      const res  = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { showAlert("error", data?.message || "Impossible de renvoyer le code"); return; }
      if (typeof data?.data?.attemptsRemaining === "number") setAttemptsLeft(data.data.attemptsRemaining);
      if (typeof data?.data?.cooldownSeconds   === "number") setCooldown(data.data.cooldownSeconds);
      if (typeof data?.data?.expiresInSeconds  === "number") setExpires(data.data.expiresInSeconds);
      setDigits(Array(OTP_LEN).fill(""));
      inputRefs.current[0]?.focus();
      showAlert("success", "Nouveau code envoyé !");
    } catch (e) { showAlert("error", getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  const handleFinalize = async () => {
    const v = validatePassword(password);
    if (!v.valid)               { showAlert("error", v.message); return; }
    if (password !== confirm)   { showAlert("error", "Les mots de passe ne correspondent pas."); return; }
    setIsLoading(true);
    try {
      const endpoint = flowType === "password-reset" ? "/auth/reset-password-phone" : "/auth/quick-register";
      const body     = flowType === "password-reset"
        ? { phone, code: otp, newPassword: password }
        : { phone, name, password, code: otp, ...(refCode ? { refCode } : {}) };
      const res  = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { showAlert("error", data?.message || "Échec de finalisation"); return; }
      setStep("success");
      setTimeout(() => loginAfterDone(password), 1800);
    } catch (e) { showAlert("error", getErrorMessage(e)); }
    finally { setIsLoading(false); }
  };

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Session invalide</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">Recommencez depuis la page de connexion.</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full h-[48px] rounded-xl bg-[#30A08B] text-white font-bold text-sm hover:bg-[#27897A] transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const strengthColor = STRENGTH_COLORS[passwordStrength.label] || "bg-gray-300";
  const strengthScore = Math.max(4, (passwordStrength.score / 6) * 100);

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d6e5c] via-[#30A08B] to-[#1a8a74]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-white/5" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-14">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Image src="/logo.png" alt="IhamBaobab" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-white font-black text-2xl tracking-tight">IhamBaobab</span>
          </div>

          <div>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-tight mb-6">
              {step === "verify-otp" ? <>Confirmez<br />votre identité.</> : step === "success" ? <>Bienvenue !<br /><span className="text-white/60">Vous êtes connecté.</span></> : <>Choisissez<br />votre mot<br />de passe.</>}
            </h2>
            <p className="text-white/80 text-base mb-10 max-w-sm leading-relaxed">
              {step === "verify-otp"
                ? `Un code à 6 chiffres a été envoyé au ${phone}. Il est valable quelques minutes.`
                : step === "success"
                ? "Votre compte est prêt. Vous allez être redirigé automatiquement."
                : "Choisissez un mot de passe fort pour protéger votre compte."}
            </p>
            <div className="space-y-4">
              {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-white/60 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
            {[{ value: "50K+", label: "Acheteurs" }, { value: "2K+", label: "Vendeurs" }, { value: "10K+", label: "Produits" }].map((s) => (
              <div key={s.label}>
                <p className="text-white font-black text-2xl">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 bg-[#fafbfc]">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#30A08B] flex items-center justify-center">
            <Image src="/logo.png" alt="IhamBaobab" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">IhamBaobab</span>
        </div>

        <div className="w-full max-w-md">

          {/* ── SUCCESS ─────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 size={44} className="text-[#30A08B]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {flowType === "password-reset" ? "Mot de passe mis à jour !" : "Compte créé !"}
              </h2>
              <p className="text-gray-500 text-sm">Vous allez être redirigé automatiquement…</p>
              <div className="mt-6 flex justify-center">
                <svg className="animate-spin h-6 w-6 text-[#30A08B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            </div>
          )}

          {/* ── VERIFY OTP ───────────────────────────────────────────────── */}
          {step === "verify-otp" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Code de vérification</h1>
                <p className="text-gray-500 text-sm mt-1.5">
                  Code envoyé{" "}
                  {/* Canal WhatsApp temporairement désactivé — SMS uniquement */}
                  {/* {channel === "whatsapp" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#25D366]">
                      <span>📱</span> via WhatsApp
                    </span>
                  ) : ( */}
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                      <span>💬</span> par SMS
                    </span>
                  {/* )} */}{" "}
                  au <span className="font-semibold text-gray-700">{phone}</span>
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3.5 mb-6 shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Expire dans</p>
                  <p className={`text-2xl font-black mt-0.5 tabular-nums ${expires > 0 ? "text-[#30A08B]" : "text-red-500"}`}>
                    {fmt(expires)}
                  </p>
                </div>
                {typeof attemptsLeft === "number" && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Tentatives</p>
                    <p className={`text-2xl font-black mt-0.5 ${attemptsLeft <= 1 ? "text-red-500" : "text-gray-800"}`}>
                      {attemptsLeft}
                    </p>
                  </div>
                )}
              </div>

              {/* OTP boxes */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Code à 6 chiffres
                </label>
                <div className="flex gap-2 sm:gap-3 justify-between" onPaste={handleOtpPaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-full max-w-[52px] h-[60px] text-center text-xl font-black rounded-xl border-2 transition-all outline-none
                        ${d ? "border-[#30A08B] bg-emerald-50 text-[#30A08B]" : "border-gray-200 bg-white text-gray-900"}
                        focus:border-[#30A08B] focus:ring-2 focus:ring-[#30A08B]/20`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading || !canVerify}
                onClick={handleVerify}
                className="w-full h-[52px] rounded-xl bg-[#30A08B] hover:bg-[#27897A] active:bg-[#1f7060] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#30A08B]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : "Vérifier le code"}
              </button>

              <button
                type="button"
                disabled={isLoading || cooldown > 0}
                onClick={handleResend}
                className="w-full h-[44px] rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <RefreshCcw size={14} />
                {cooldown > 0 ? `Renvoyer dans ${fmt(cooldown)}` : "Renvoyer le code"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="w-full h-[40px] mt-2 text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} />
                Retour à la connexion
              </button>
            </>
          )}

          {/* ── SET PASSWORD ─────────────────────────────────────────────── */}
          {step === "set-password" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  {flowType === "password-reset" ? "Nouveau mot de passe" : "Créez votre mot de passe"}
                </h1>
                <p className="text-gray-500 text-sm mt-1.5">Choisissez un mot de passe sécurisé</p>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Mot de passe
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm focus-within:border-[#30A08B] focus-within:ring-2 focus-within:ring-[#30A08B]/20 transition-all">
                  <div className="flex items-center pl-3 pr-1">
                    <Lock size={15} className="text-gray-400" />
                  </div>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choisissez un mot de passe"
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

                {/* Strength bar */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Force du mot de passe</span>
                      <span className={`text-xs font-bold ${strengthColor.replace("bg-", "text-")}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strengthScore}%` }} />
                    </div>
                    {/* Checks */}
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        { ok: passwordChecks.minLength, label: "8 caractères min" },
                        { ok: passwordChecks.upper,     label: "Une majuscule" },
                        { ok: passwordChecks.lower,     label: "Une minuscule" },
                        { ok: passwordChecks.number,    label: "Un chiffre" },
                        { ok: passwordChecks.special,   label: "Un caractère spécial" },
                        { ok: passwordChecks.noSpaces,  label: "Sans espace" },
                      ].map(({ ok, label }) => (
                        <div key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600" : "text-gray-400"}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center ${ok ? "bg-emerald-100" : "bg-gray-100"}`}>
                            {ok ? <CheckCircle2 size={9} className="text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />}
                          </div>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Confirmer le mot de passe
                </label>
                <div className={`flex rounded-xl overflow-hidden border bg-white shadow-sm focus-within:ring-2 transition-all ${
                  confirm && password !== confirm
                    ? "border-red-300 focus-within:ring-red-200"
                    : confirm && password === confirm
                    ? "border-emerald-300 focus-within:ring-emerald-200"
                    : "border-gray-200 focus-within:border-[#30A08B] focus-within:ring-[#30A08B]/20"
                }`}>
                  <div className="flex items-center pl-3 pr-1">
                    <Lock size={15} className="text-gray-400" />
                  </div>
                  <input
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Retapez votre mot de passe"
                    className="flex-1 h-[52px] px-3 text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf(!showConf)}
                    className="px-3 text-gray-400 hover:text-gray-600 border-l border-gray-200"
                  >
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="mt-1.5 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                )}
                {confirm && password === confirm && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Les mots de passe correspondent
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleFinalize}
                className="w-full h-[52px] rounded-xl bg-[#30A08B] hover:bg-[#27897A] active:bg-[#1f7060] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#30A08B]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : flowType === "password-reset" ? "Réinitialiser le mot de passe" : "Terminer l'inscription"}
              </button>
            </>
          )}
        </div>
      </div>

      {alert.visible && <Alert type={alert.type} message={alert.message} onClose={hideAlert} />}
    </div>
  );
};

export default VerifyOTP;
