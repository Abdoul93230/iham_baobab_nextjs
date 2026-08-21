"use client";

import React, { useState } from "react";
import {
  FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Phone, Mail, MapPin, ChevronRight, Send, CheckCircle, AlertCircle } from "lucide-react";

const SECTIONS = [
  {
    title: "IhamBaobab",
    links: [
      { label: "Qui sommes-nous", href: "/about" },
      { label: "Nos magasins", href: "/suppliers" },
      { label: "Devenir vendeur", href: "/become-seller" },
      { label: "Partout au Niger", href: "/niger-presence" },
      { label: "Anniversaire", href: "/anniversary" },
    ],
  },
  {
    title: "Service client",
    links: [
      { label: "Contactez-nous", href: "/contact" },
      { label: "Centre d'aide", href: "/centre-aide" },
      { label: "Mes commandes", href: "/commandes" },
      { label: "Retourner un article", href: "/ReturnPolicyPage" },
      { label: "Expédition", href: "/ShippingPage" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions générales", href: "/informations-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "FAQ", href: "/faq" },
      { label: "Cookies", href: "/confidentialite" },
    ],
  },
];

const SOCIALS = [
  { icon: FaFacebook, href: process.env.NEXT_PUBLIC_FACEBOOK_PAGE, label: "Facebook", color: "#1877F2" },
  { icon: FaXTwitter, href: "#", label: "X (Twitter)", color: "#000" },
  { icon: FaInstagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_PAGE, label: "Instagram", color: "#E1306C" },
  { icon: FaTiktok, href: process.env.NEXT_PUBLIC_INSTAGRAM_PAGE, label: "TikTok", color: "#010101" },
  { icon: FaWhatsapp, href: "https://api.whatsapp.com/send/?phone=22787727501", label: "WhatsApp", color: "#25D366" },
  { icon: FaLinkedin, href: "#", label: "LinkedIn", color: "#0A66C2" },
];

// Indicatifs avec format d'affichage (X = chiffre)
const COUNTRY_CODES = [
  { code: "+227", flag: "🇳🇪", name: "Niger",        format: "XX XX XX XX",  digits: 8  },
  { code: "+223", flag: "🇲🇱", name: "Mali",         format: "XX XX XX XX",  digits: 8  },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso", format: "XX XX XX XX",  digits: 8  },
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire",format: "XX XX XX XX XX",digits: 10 },
  { code: "+221", flag: "🇸🇳", name: "Sénégal",      format: "XX XXX XX XX", digits: 9  },
  { code: "+229", flag: "🇧🇯", name: "Bénin",        format: "XX XX XX XX",  digits: 8  },
  { code: "+228", flag: "🇹🇬", name: "Togo",         format: "XX XX XX XX",  digits: 8  },
  { code: "+234", flag: "🇳🇬", name: "Nigeria",      format: "XXX XXX XXXX", digits: 10 },
  { code: "+33",  flag: "🇫🇷", name: "France",       format: "X XX XX XX XX",digits: 10 },
  { code: "+212", flag: "🇲🇦", name: "Maroc",        format: "XX XX XX XX XX",digits: 10 },
];

// Formate les digits saisis selon le pattern (groupes séparés par espace)
function formatPhoneInput(raw: string, format: string): string {
  const digits = raw.replace(/\D/g, "");
  const groups = format.split(" ").map(g => g.length);
  let result = "";
  let idx = 0;
  for (let g = 0; g < groups.length; g++) {
    const chunk = digits.slice(idx, idx + groups[g]);
    if (!chunk) break;
    result += (g > 0 && result ? " " : "") + chunk;
    idx += groups[g];
  }
  return result;
}

const HomeFooter: React.FC = () => {
  const router = useRouter();
  const [nlEmail, setNlEmail] = useState("");
  const [nlPhone, setNlPhone] = useState("");
  const [nlMode, setNlMode] = useState<"email" | "phone">("email");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value, countryCode.format);
    setNlPhone(formatted);
  };

  const handleCountrySelect = (c: typeof COUNTRY_CODES[0]) => {
    setCountryCode(c);
    setNlPhone("");
    setShowCountryPicker(false);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailVal = nlEmail.trim();
    const rawDigits = nlPhone.replace(/\s/g, "");

    if (nlMode === "email") {
      if (!emailVal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setErrorMsg("Adresse e-mail invalide.");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }
    } else {
      if (rawDigits.length < countryCode.digits) {
        setErrorMsg(`Numéro incomplet — ${countryCode.digits} chiffres requis pour ${countryCode.name}.`);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }
    }

    setStatus("loading");
    try {
      await axios.post(`${BackendUrl}/api/newsletter`, {
        email: nlMode === "email" ? emailVal : undefined,
        // Envoyer le numéro complet avec indicatif
        phone: nlMode === "phone" ? `${countryCode.code} ${nlPhone}` : undefined,
      });
      setStatus("success");
      setNlEmail("");
      setNlPhone("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setErrorMsg("Une erreur est survenue. Réessayez.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="bg-[#111827] text-gray-300 mt-8">
      {/* ── Newsletter band ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#30A08B] to-[#1a6b5c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: text */}
            <div className="text-center lg:text-left">
              <h3 className="text-white font-black text-2xl leading-tight">
                Restez dans la boucle ! 🎉
              </h3>
              <p className="text-white/75 text-sm mt-1.5 max-w-sm">
                Promos exclusives, nouveautés et bons plans — directement chez vous.
              </p>
            </div>

            {/* Right: form */}
            <div className="w-full max-w-md">
              {status === "success" ? (
                <div className="flex flex-col items-center gap-2 bg-white/15 rounded-2xl px-6 py-5 text-center">
                  <CheckCircle size={32} className="text-white" />
                  <p className="text-white font-bold text-base">Inscription confirmée !</p>
                  <p className="text-white/75 text-xs">Merci, vous recevrez bientôt nos offres.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col gap-3">
                  {/* Toggle email / téléphone */}
                  <div className="flex items-center bg-white/15 rounded-full p-1 gap-1 self-start mx-auto lg:mx-0">
                    <button
                      type="button"
                      onClick={() => setNlMode("email")}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        nlMode === "email" ? "bg-white text-[#1a6b5c]" : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Mail size={12} /> E-mail
                    </button>
                    <button
                      type="button"
                      onClick={() => setNlMode("phone")}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        nlMode === "phone" ? "bg-white text-[#1a6b5c]" : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Phone size={12} /> Téléphone
                    </button>
                  </div>

                  {/* Input + bouton */}
                  <div className="flex gap-0 shadow-lg relative">
                    {nlMode === "email" ? (
                      <input
                        type="email"
                        value={nlEmail}
                        onChange={(e) => setNlEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="flex-1 px-4 py-3 rounded-l-2xl text-sm text-gray-800 bg-white focus:outline-none placeholder-gray-400"
                      />
                    ) : (
                      <div className="flex flex-1 bg-white rounded-l-2xl overflow-visible relative">
                        {/* Sélecteur indicatif */}
                        <button
                          type="button"
                          onClick={() => setShowCountryPicker(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors shrink-0 rounded-l-2xl"
                        >
                          <span className="text-base leading-none">{countryCode.flag}</span>
                          <span className="text-xs font-bold text-gray-600">{countryCode.code}</span>
                          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {/* Dropdown pays */}
                        {showCountryPicker && (
                          <div className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-64 max-h-60 overflow-y-auto">
                            {COUNTRY_CODES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => handleCountrySelect(c)}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${countryCode.code === c.code ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700'}`}
                              >
                                <span className="text-lg">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-xs text-gray-400 font-mono">{c.code}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Champ numéro */}
                        <input
                          type="tel"
                          value={nlPhone}
                          onChange={handlePhoneChange}
                          placeholder={countryCode.format.replace(/X/g, "0")}
                          maxLength={countryCode.format.length}
                          className="flex-1 px-3 py-3 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 font-mono tracking-wide"
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="flex items-center gap-2 bg-[#0d1117] text-white px-5 py-3 rounded-r-2xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      {status === "loading" ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      S'abonner
                    </button>
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <div className="flex items-center gap-2 text-red-200 text-xs">
                      <AlertCircle size={13} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <p className="text-white/50 text-[11px] text-center lg:text-left">
                    Pas de spam. Désinscription possible à tout moment.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-4 bg-white/10 rounded-xl overflow-hidden" style={{ position: 'relative', width: 176, height: 56 }}>
              <Image src="/LogoText.png" alt="IhamBaobab" fill style={{ objectFit: 'cover', objectPosition: '45% 50%' }} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              La marketplace de référence au Niger. Achetez et vendez en toute confiance, partout au pays.
            </p>
            {/* Contact info */}
            <div className="mt-5 space-y-2.5 text-sm">
              <a
                href="tel:+22787727501"
                className="flex items-center gap-2.5 text-gray-400 hover:text-[#4bbda5] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone size={13} />
                </div>
                +227 87727501
              </a>
              <a
                href="mailto:contact@ihambaobab.com"
                className="flex items-center gap-2.5 text-gray-400 hover:text-[#4bbda5] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail size={13} />
                </div>
                contact@ihambaobab.com
              </a>
              <div className="flex items-center gap-2.5 text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin size={13} />
                </div>
                Niamey, Niger
              </div>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {SOCIALS.map(({ icon: Icon, href, label, color }) =>
                href && href !== "#" ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/15 transition-colors"
                    style={{ color }}
                  >
                    <Icon size={16} />
                  </a>
                ) : (
                  <button
                    key={label}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/15 transition-colors"
                    style={{ color }}
                  >
                    <Icon size={16} />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Link columns */}
          {SECTIONS.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => router.push(href)}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#4bbda5] transition-colors group text-left"
                    >
                      <ChevronRight
                        size={12}
                        className="text-gray-600 group-hover:text-[#4bbda5] flex-shrink-0 transition-colors"
                      />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 py-5 pb-[80px] md:pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} IhamBaobab. Tous droits réservés.
          </p>
          {/* Payment methods */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-gray-500 mr-1">Paiement :</span>
            {[
              { src: "/payment/masterCard.jpeg", alt: "MasterCard" },
              { src: "/payment/VisaCard.png", alt: "Visa" },
              { src: "/payment/domicile.jpeg", alt: "Domicile" },
              { src: "/payment/MobileMoney.png", alt: "Mobile Money" },
            ].map(({ src, alt }) => (
              <div
                key={alt}
                className="w-10 h-6 rounded-md overflow-hidden bg-white flex items-center justify-center p-0.5"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={36}
                  height={22}
                  style={{ width: '100%', height: 'auto' }}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
