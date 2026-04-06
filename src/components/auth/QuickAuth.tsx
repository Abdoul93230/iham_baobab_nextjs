"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Lock, Phone, User } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { loginUser } from "@/redux/userSlice";
import Alert from "@/components/Alert";

type QuickAuthMode = "auto" | "login" | "register" | "reset";
type Step = "phone" | "login" | "register";

const countryCodes = [
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+1", country: "États-Unis", flag: "🇺🇸" },
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+213", country: "Algérie", flag: "🇩🇿" },
];

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return "Une erreur est survenue";
};

interface QuickAuthProps {
  initialMode?: QuickAuthMode;
}

const QuickAuth: React.FC<QuickAuthProps> = ({ initialMode = "auto" }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const fullPhone = useMemo(() => {
    const normalized = phoneDigits.replace(/\D/g, "");
    return normalized ? `${countryCode.code}${normalized}` : "";
  }, [countryCode.code, phoneDigits]);

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => {
    setAlert({ visible: true, type, message });
  };

  const hideAlert = () => {
    setAlert({ visible: false, type: "info", message: "" });
  };

  const goAfterAuth = () => {
    const redirect = searchParams.get("redirect") || searchParams.get("returnUrl") || "/";
    router.push(redirect);
  };

  const validatePhone = () => {
    if (!fullPhone) {
      showAlert("error", "Veuillez saisir votre numéro de téléphone.");
      return false;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(fullPhone)) {
      showAlert("error", "Numéro invalide. Format attendu: +22790123456");
      return false;
    }

    return true;
  };

  const buildVerifyUrl = (params: Record<string, string | number | null | undefined>) => {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        qp.set(key, String(value));
      }
    });

    const redirect = searchParams.get("redirect") || searchParams.get("returnUrl");
    if (redirect) qp.set("redirect", redirect);

    return `/auth/verify-otp?${qp.toString()}`;
  };

  const handleCheckPhone = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert("error", data?.message || "Impossible de vérifier le numéro");
        return;
      }

      const exists = Boolean(data?.data?.exists);

      if (initialMode === "register") {
        if (exists) {
          showAlert("info", "Un compte existe déjà pour ce numéro. Connectez-vous.");
          setStep("login");
        } else {
          setStep("register");
        }
        return;
      }

      if (initialMode === "reset") {
        if (!exists) {
          showAlert("error", "Aucun compte actif trouvé pour ce numéro.");
          return;
        }
        // Directement demander le code OTP pour reset, pas le login
        await handleForgotPassword();
        return;
      }

      if (initialMode === "login") {
        if (!exists) {
          showAlert("warning", "Ce numéro n'a pas encore de compte. Continuez avec l'inscription.");
          setStep("register");
          return;
        }
        setStep("login");
        return;
      }

      setStep(exists ? "login" : "register");
    } catch (error) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password || password.length < 6) {
      showAlert("error", "Veuillez saisir un mot de passe de 6 caractères minimum.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        loginUser({
          identifier: fullPhone,
          phoneNumber: fullPhone,
          password,
        })
      );

      if (loginUser.fulfilled.match(result)) {
        goAfterAuth();
      } else {
        showAlert("error", getErrorMessage(result.payload));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRegister = async () => {
    if (!name || name.trim().length < 2) {
      showAlert("error", "Veuillez saisir votre nom (min 2 caractères).");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          name: name.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert("error", data?.message || "Impossible d'envoyer le code OTP");
        return;
      }

      router.push(
        buildVerifyUrl({
          type: "quick-register",
          phone: fullPhone,
          name: name.trim(),
          devCode: data?.data?.devOTP,
          attemptsRemaining: data?.data?.attemptsRemaining,
          cooldownSeconds: data?.data?.cooldownSeconds,
          expiresInSeconds: data?.data?.expiresInSeconds,
        })
      );
    } catch (error) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/request-password-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert("error", data?.message || "Impossible de lancer la réinitialisation");
        return;
      }

      router.push(
        buildVerifyUrl({
          type: "password-reset",
          phone: fullPhone,
          devCode: data?.data?.devOTP,
          attemptsRemaining: data?.data?.attemptsRemaining,
          cooldownSeconds: data?.data?.cooldownSeconds,
          expiresInSeconds: data?.data?.expiresInSeconds,
        })
      );
    } catch (error) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f8a70] via-[#2aa286] to-[#30A08B] p-8 text-white text-center">
            <div className="relative w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <Image src="/logo.png" alt="IhamBaobab" fill className="object-contain p-2" />
            </div>
            <h1 className="text-2xl font-bold">QuickAuth</h1>
            <p className="text-white/90 mt-2 text-sm">Connexion phone-first rapide et sécurisée</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
              <div className="flex">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen((v) => !v)}
                    className="h-[48px] px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>{countryCode.flag}</span>
                    <span className="text-sm font-medium">{countryCode.code}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span>{country.flag}</span>
                          <span className="font-medium text-sm">{country.code}</span>
                          <span className="text-xs text-gray-500">{country.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex-1">
                  <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ""))}
                    placeholder="90123456"
                    className="w-full h-[48px] border border-gray-300 rounded-r-lg pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[#30A08B]"
                  />
                </div>
              </div>
            </div>

            {step === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <div className="relative">
                  <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full h-[48px] border border-gray-300 rounded-lg pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[#30A08B]"
                  />
                </div>
              </div>
            )}

            {step === "login" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full h-[48px] border border-gray-300 rounded-lg pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[#30A08B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#B17236] hover:text-[#9a5f2d] font-semibold mt-2"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <div className="flex gap-3">
              {step !== "phone" && (
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="flex-1 h-[48px] rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </button>
              )}

              {step === "phone" && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCheckPhone}
                  className="w-full h-[48px] rounded-lg bg-[#30A08B] hover:bg-[#288975] text-white font-semibold disabled:opacity-60"
                >
                  {isLoading ? "Vérification..." : "Continuer"}
                </button>
              )}

              {step === "login" && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleLogin}
                  className="flex-1 h-[48px] rounded-lg bg-[#30A08B] hover:bg-[#288975] text-white font-semibold disabled:opacity-60"
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </button>
              )}

              {step === "register" && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleStartRegister}
                  className="flex-1 h-[48px] rounded-lg bg-[#30A08B] hover:bg-[#288975] text-white font-semibold disabled:opacity-60"
                >
                  {isLoading ? "Envoi OTP..." : "Envoyer le code OTP"}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-gray-500">
              Utilisez ce flux unique pour la connexion, l'inscription et la réinitialisation du mot de passe.
            </p>
          </div>
        </div>
      </div>

      {alert.visible && <Alert type={alert.type} message={alert.message} onClose={hideAlert} />}
    </div>
  );
};

export default QuickAuth;
