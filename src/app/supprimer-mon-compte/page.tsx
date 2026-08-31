"use client";

import { useState } from "react";
import axios from "axios";
import HomeHeader from "@/components/home/HomeHeader";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

type AccountType = "client" | "vendeur";
type Status = "idle" | "loading" | "success" | "error";

export default function SupprimerMonComptePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("client");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const e: { name?: string; email?: string } = {};
    if (!name.trim()) e.name = "Votre nom est requis.";
    if (!email.trim()) e.email = "Votre adresse email est requise.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Adresse email invalide.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      await axios.post(`${BackendUrl}/api/deletion-request`, { name, email, accountType, reason });
      setStatus("success");
      setMessage("Votre demande a bien été enregistrée. Nous vous contacterons à l'adresse indiquée sous 30 jours.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <>
      <HomeHeader chg={() => {}} />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "#fef2f2" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Supprimer mon compte</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Vous pouvez demander la suppression de votre compte et de toutes vos données personnelles associées.
              Votre demande sera traitée sous <strong>30 jours ouvrés</strong>.
            </p>
          </div>

          {/* Succès */}
          {status === "success" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: "#f0fdf4" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Demande enregistrée</h2>
              <p className="text-gray-500 text-sm">{message}</p>
              <p className="text-gray-400 text-xs mt-4">
                Pour toute question : <a href="mailto:ihambaobab@gmail.com" className="underline" style={{ color: "#30A08B" }}>ihambaobab@gmail.com</a>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

              {/* Avertissement */}
              <div className="rounded-xl p-4 mb-6 text-sm" style={{ backgroundColor: "#fff7ed", borderLeft: "4px solid #B2905F" }}>
                <p className="font-semibold mb-1" style={{ color: "#92400e" }}>Avant de continuer</p>
                <ul className="text-orange-700 space-y-1 list-disc list-inside">
                  <li>Vos commandes en cours seront annulées</li>
                  <li>Vos données personnelles seront supprimées</li>
                  <li>Les données de transactions peuvent être conservées jusqu'à 5 ans pour des raisons légales</li>
                  <li>Cette action est irréversible</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Type de compte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["client", "vendeur"] as AccountType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className="py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all"
                        style={{
                          borderColor: accountType === type ? "#30A08B" : "#e5e7eb",
                          backgroundColor: accountType === type ? "#f0fdf9" : "white",
                          color: accountType === type ? "#30A08B" : "#6b7280",
                        }}
                      >
                        {type === "client" ? "👤 Client" : "🏪 Vendeur"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                    placeholder="Votre nom et prénom"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                    style={{ borderColor: errors.name ? "#fca5a5" : "#e5e7eb" }}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresse email du compte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="email@exemple.com"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                    style={{ borderColor: errors.email ? "#fca5a5" : "#e5e7eb" }}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Raison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Raison <span className="text-gray-400 font-normal">(facultatif)</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                  />
                </div>

                {/* Erreur globale */}
                {status === "error" && (
                  <div className="rounded-xl p-3 text-sm text-red-700 bg-red-50 border border-red-200">
                    {message}
                  </div>
                )}

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {status === "loading" ? "Envoi en cours…" : "Confirmer la demande de suppression"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                  Besoin d'aide ?{" "}
                  <a href="mailto:ihambaobab@gmail.com" className="underline" style={{ color: "#30A08B" }}>
                    Contactez-nous
                  </a>
                </p>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
