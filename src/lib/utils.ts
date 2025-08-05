import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Générer un ID unique
export const generateUniqueID = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Formatter les prix
export const formatPrice = (price: number, currency = "XOF"): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(price);
};

// Valider email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Valider numéro de téléphone (format africain)
export const isValidPhoneNumber = (phone: string): boolean => {
  // Format: 8 chiffres ou 11 chiffres avec indicatif
  const phoneRegex = /^(\+227|\+229|227|229)?[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Formater l'URL des images
export const getImageUrl = (imagePath: string, baseUrl?: string): string => {
  if (!imagePath) return "/placeholder-image.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  const base = baseUrl || process.env.NEXT_PUBLIC_Images_Url || "";
  return `${base}/${imagePath}`;
};
