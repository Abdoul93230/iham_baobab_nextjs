"use client";

import React, { useState } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaLinkedin,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const HomeFooter: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

  const showAlert = (type: string, message: string) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "", message: "" });
    }, 5000);
  };

  const handleSuccess = (message: string) => {
    showAlert("success", message);
  };

  const handleWarning = (message: string) => {
    showAlert("warn", message);
  };

  const handleError = (message: string) => {
    handleWarning(message);
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.length === 0) {
      handleError("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    
    if (!regexMail.test(email)) {
      handleError("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    handleSuccess("Envoi en cours...");

    try {
      const emailData = {
        senderEmail: "abdoulrazak9323@gmail.com",
        subject: "Inscription NewsLetter Ihambaobab",
        message: email,
        titel: "NewsLetter Ihambaobab",
      };

      if (BackendUrl) {
        await axios.post(`${BackendUrl}/SendMail`, emailData);
      }

      handleSuccess("Inscription envoyée !");
      setEmail("");
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      handleError("Une erreur est survenue lors de l'inscription.");
    }
  };

  return (
    <footer className="bg-gradient-to-r mt-4 from-[#30A08B] to-[#B2905F] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-bold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push("/about")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Qui sommes-nous
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/suppliers")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Nos magasins
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/anniversary")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  IHAM Baobab Anniversery {new Date().getFullYear()}
                </button>
              </li>
            </ul>
          </div>

          {/* Service client */}
          <div>
            <h3 className="text-lg font-bold mb-4">Service client</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push("/contact")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Contactez-nous
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/become-seller")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Devenir vendeur
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/ShippingPage")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Expédier votre commande
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/niger-presence")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Partout au Niger
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/ReturnPolicyPage")}
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105 text-left"
                >
                  Retourner une commande
                </button>
              </li>
            </ul>
          </div>

          {/* Suivez-nous */}
          <div>
            <h3 className="text-lg font-bold mb-4">Suivez-nous</h3>
            <ul className="flex flex-wrap space-x-4">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61564475374925"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105"
                >
                  <FaFacebook size={20} />
                </a>
              </li>
              <li>
                <button className="hover:text-emerald-300 transition duration-300 transform hover:scale-105">
                  <FaTwitter size={20} />
                </button>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/iham_baobab?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105"
                >
                  <FaInstagram size={20} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/iham_baobab?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105"
                >
                  <FaTiktok size={20} />
                </a>
              </li>
              <li>
                <button className="hover:text-emerald-300 transition duration-300 transform hover:scale-105">
                  <FaLinkedin size={20} />
                </button>
              </li>
              <li>
                <a
                  href="https://api.whatsapp.com/send/?phone=22787727501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition duration-300 transform hover:scale-105"
                >
                  <FaWhatsapp size={20} />
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="mb-4">
              Inscrivez-vous pour recevoir nos dernières offres :
            </p>
            <form
              onSubmit={envoyer}
              className="flex flex-col md:flex-row items-center"
            >
              <div className="flex w-full mb-2 md:mb-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="border-2 text-[#30A08B] border-emerald-600 p-3 rounded-l-full w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ease-in-out shadow-md"
                />
                <button
                  className="bg-emerald-600 text-white rounded-r-full px-6 py-3 hover:bg-emerald-700 transition duration-200 ease-in-out shadow-md transform hover:scale-105"
                  type="submit"
                >
                  S&apos;abonner
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex justify-center items-center mb-4 md:mb-0">
              <p
                className="text-sm mr-4"
                style={{
                  background: "linear-gradient(90deg, #B17236, #FAFAFA)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                &copy; {new Date().getFullYear()} IHAM Baobab. Tous droits
                réservés.
              </p>
              <Image
                src="/LogoText.png"
                alt="Logo IHAM Baobab"
                width={80}
                height={40}
                className="max-h-20 transition-transform duration-300 transform hover:scale-105"
              />
            </div>

            {/* Payment methods */}
            <div className="flex space-x-4">
              <Image
                src="/payment/masterCard.jpeg"
                alt="MasterCard"
                width={32}
                height={20}
                className="h-8 border-2"
                style={{
                  borderColor: "#30A08B",
                }}
              />
              <Image
                src="/payment/VisaCard.png"
                alt="Visa"
                width={32}
                height={20}
                className="h-8 border-2"
                style={{
                  borderColor: "#B2905F",
                }}
              />
              <Image
                src="/payment/domicile.jpeg"
                alt="Domicile"
                width={32}
                height={20}
                className="h-8 border-2"
                style={{
                  borderColor: "#B17236",
                }}
              />
              <Image
                src="/payment/MobileMoney.png"
                alt="Mobile Money"
                width={32}
                height={20}
                className="h-8 border-2"
                style={{
                  borderColor: "#B17236",
                }}
              />
            </div>
          </div>
        </div>

        {/* Alert Notification */}
        {alert.visible && (
          <div
            className={`fixed top-4 right-4 z-50 max-w-md border px-4 py-3 rounded shadow-lg transition-all duration-300 ${
              alert.type === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
            <p className="text-sm">{alert.message}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default HomeFooter;
