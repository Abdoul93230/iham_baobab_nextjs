"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { loginUser } from "@/redux/userSlice";
import Alert from "@/components/Alert";
import { getPasswordChecks, getPasswordStrength, validatePassword } from "@/lib/passwordRules";

type FlowType = "quick-register" | "password-reset";
type Step = "verify-otp" | "set-password";

const formatDuration = (seconds: number) => {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
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

const VerifyOTP: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const flowType = (searchParams.get("type") as FlowType) || "quick-register";
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";
  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<Step>("verify-otp");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState(searchParams.get("devCode") || "");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    searchParams.get("attemptsRemaining") ? Number(searchParams.get("attemptsRemaining")) : null
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(
    searchParams.get("cooldownSeconds") ? Number(searchParams.get("cooldownSeconds")) : 0
  );
  const [expiresInSeconds, setExpiresInSeconds] = useState(
    searchParams.get("expiresInSeconds") ? Number(searchParams.get("expiresInSeconds")) : 0
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const canVerify = useMemo(() => otp.length === 6, [otp.length]);

  useEffect(() => {
    if (cooldownSeconds <= 0 && expiresInSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((v) => (v > 0 ? v - 1 : 0));
      setExpiresInSeconds((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds, expiresInSeconds]);

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => setAlert({ visible: true, type, message });

  const hideAlert = () => setAlert({ visible: false, type: "info", message: "" });

  const loginAfterDone = async (pwd: string) => {
    const result = await dispatch(
      loginUser({
        identifier: phone,
        phoneNumber: phone,
        password: pwd,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      router.push(redirect);
      return;
    }

    showAlert("error", getErrorMessage(result.payload));
  };

  const handleVerify = async () => {
    if (!canVerify) {
      showAlert("error", "Veuillez saisir les 6 chiffres du code OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        const remaining = Number(data?.data?.attemptsRemaining);
        if (!Number.isNaN(remaining)) setAttemptsRemaining(remaining);
        showAlert("error", data?.message || "Code OTP invalide");
        return;
      }

      const remaining = Number(data?.data?.attemptsRemaining);
      if (!Number.isNaN(remaining)) setAttemptsRemaining(remaining);
      setStep("set-password");
    } catch (error) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        flowType === "password-reset"
          ? "/auth/request-password-reset-otp"
          : "/auth/send-otp";

      const body =
        flowType === "password-reset"
          ? { phone }
          : { phone, name: name || null };

      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert("error", data?.message || "Impossible de renvoyer le code");
        return;
      }

      setDevCode(data?.data?.devOTP || "");
      setAttemptsRemaining(
        typeof data?.data?.attemptsRemaining === "number" ? data.data.attemptsRemaining : attemptsRemaining
      );
      setCooldownSeconds(typeof data?.data?.cooldownSeconds === "number" ? data.data.cooldownSeconds : 0);
      setExpiresInSeconds(typeof data?.data?.expiresInSeconds === "number" ? data.data.expiresInSeconds : 0);
      setOtp("");
      showAlert("success", "Nouveau code OTP envoyé.");
    } catch (error) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    const validation = validatePassword(password);
    if (!validation.valid) {
      showAlert("error", validation.message);
      return;
    }

    if (password !== confirmPassword) {
      showAlert("error", "Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        flowType === "password-reset" ? "/auth/reset-password-phone" : "/auth/quick-register";

      const body =
        flowType === "password-reset"
          ? { phone, code: otp, newPassword: password }
          : { phone, name, password, code: otp };

      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlert("error", data?.message || "Echec de finalisation");
        return;
      }

      await loginAfterDone(password);
    } catch (error) {
      showAlert("error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900">Session OTP invalide</h2>
          <p className="text-sm text-gray-600 mt-2">Veuillez recommencer depuis la page de connexion.</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-4 h-[44px] px-4 rounded-lg bg-[#30A08B] text-white font-semibold"
          >
            Retour à QuickAuth
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f8a70] via-[#2aa286] to-[#30A08B] p-8 text-white text-center">
            <div className="relative w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <Image src="/logo.png" alt="IhamBaobab" fill className="object-contain p-2" />
            </div>
            <h1 className="text-2xl font-bold">Vérification OTP</h1>
            <p className="text-white/90 mt-2 text-sm">Code envoyé à {phone}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {devCode ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Mode développement</p>
                <p className="text-lg font-bold text-emerald-800 tracking-widest mt-1">{devCode}</p>
              </div>
            ) : null}

            {typeof attemptsRemaining === "number" && (
              <p className="text-sm text-gray-600 text-center">Tentatives restantes: {attemptsRemaining}</p>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">Expiration du code</p>
              <p className="text-2xl font-bold text-[#30A08B] mt-1">{formatDuration(expiresInSeconds)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {expiresInSeconds > 0 ? "Le code est valide." : "Le code a expiré."}
              </p>
            </div>

            {step === "verify-otp" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code OTP</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full h-[52px] border border-gray-300 rounded-lg px-3 text-center text-xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-[#30A08B]"
                  />
                </div>

                <button
                  type="button"
                  disabled={isLoading || !canVerify}
                  onClick={handleVerify}
                  className="w-full h-[48px] rounded-lg bg-[#30A08B] hover:bg-[#288975] text-white font-semibold disabled:opacity-60"
                >
                  {isLoading ? "Vérification..." : "Vérifier le code"}
                </button>

                <button
                  type="button"
                  disabled={isLoading || cooldownSeconds > 0}
                  onClick={handleResend}
                  className="w-full h-[44px] rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {cooldownSeconds > 0
                    ? `Renvoyer dans ${formatDuration(cooldownSeconds)}`
                    : "Renvoyer le code"}
                </button>
              </>
            )}

            {step === "set-password" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[48px] border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#30A08B]"
                    placeholder="Choisissez un mot de passe"
                  />
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Force du mot de passe</span>
                      <span className="font-semibold text-gray-800">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${passwordStrength.colorClass}`}
                        style={{ width: `${Math.max(8, (passwordStrength.score / 6) * 100)}%` }}
                      />
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className={passwordChecks.minLength ? "text-emerald-700" : "text-gray-500"}>8 caractères minimum</li>
                      <li className={passwordChecks.upper ? "text-emerald-700" : "text-gray-500"}>Au moins une majuscule</li>
                      <li className={passwordChecks.lower ? "text-emerald-700" : "text-gray-500"}>Au moins une minuscule</li>
                      <li className={passwordChecks.number ? "text-emerald-700" : "text-gray-500"}>Au moins un chiffre</li>
                      <li className={passwordChecks.special ? "text-emerald-700" : "text-gray-500"}>Au moins un caractère spécial</li>
                      <li className={passwordChecks.noSpaces ? "text-emerald-700" : "text-gray-500"}>Sans espace</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[48px] border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#30A08B]"
                    placeholder="Retapez votre mot de passe"
                  />
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleFinalize}
                  className="w-full h-[48px] rounded-lg bg-[#30A08B] hover:bg-[#288975] text-white font-semibold disabled:opacity-60"
                >
                  {isLoading
                    ? "Finalisation..."
                    : flowType === "password-reset"
                    ? "Réinitialiser le mot de passe"
                    : "Terminer l'inscription"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {alert.visible && <Alert type={alert.type} message={alert.message} onClose={hideAlert} />}
    </div>
  );
};

export default VerifyOTP;
