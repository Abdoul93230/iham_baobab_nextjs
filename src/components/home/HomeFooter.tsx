"use client";

import React, { useState } from "react";
import {
  FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Phone, Mail, MapPin, ChevronRight, Send } from "lucide-react";

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

const HomeFooter: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    setStatus("loading");
    try {
      if (BackendUrl) {
        await axios.post(`${BackendUrl}/SendMail`, {
          senderEmail: "abdoulrazak9323@gmail.com",
          subject: "Inscription NewsLetter Ihambaobab",
          message: email,
          titel: "NewsLetter Ihambaobab",
        });
      }
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="bg-[#111827] text-gray-300 mt-8">
      {/* ── Newsletter band ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#30A08B] to-[#1d7a6a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-white font-black text-xl">Restez connecté !</h3>
            <p className="text-white/80 text-sm mt-0.5">
              Promotions exclusives, nouveautés et bons plans direct dans votre boîte mail.
            </p>
          </div>
          <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              className="flex-1 md:w-72 px-4 py-3 rounded-l-full text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center gap-2 bg-[#0d1117] text-white px-5 py-3 rounded-r-full text-sm font-bold hover:bg-black transition-colors disabled:opacity-60"
            >
              {status === "loading" ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {status === "success" ? "Envoyé !" : "S'abonner"}
            </button>
          </form>
          {status === "error" && (
            <p className="text-red-200 text-xs md:absolute md:mt-16">
              E-mail invalide. Réessayez.
            </p>
          )}
        </div>
      </div>

      {/* ── Main footer grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="relative w-44 h-14 mb-4 bg-white/10 rounded-xl p-2">
              <Image src="/LogoText.png" alt="IhamBaobab" fill className="object-contain" />
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
                  className="object-contain w-full h-full"
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
