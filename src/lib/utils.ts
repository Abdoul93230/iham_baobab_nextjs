import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction de validation du numéro de téléphone
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Supprime tous les espaces, tirets, parenthèses et autres caractères non numériques sauf le +
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Vérifie que le numéro commence par + et a entre 8 et 15 chiffres (normes internationales)
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  
  // Ou vérifie un numéro local français (10 chiffres commençant par 0)
  const frenchPhoneRegex = /^0[1-9](\d{8})$/;
  
  return phoneRegex.test(cleanedNumber) || frenchPhoneRegex.test(cleanedNumber);
}

// Fonction de formatage de devise
export function formatCurrency(amount: number, currency = 'CFA'): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `0 ${currency}`;
  }
  
  // Formate le nombre avec des espaces comme séparateurs de milliers
  const formattedAmount = new Intl.NumberFormat('fr-FR').format(amount);
  
  return `${formattedAmount} ${currency}`;
}

// Fonction de formatage de prix simple
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0';
  }
  
  return new Intl.NumberFormat('fr-FR').format(price);
}
