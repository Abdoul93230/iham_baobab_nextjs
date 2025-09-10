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

// Fonction pour formater les dates
export function formatDate(date: string | Date, locale: string = 'fr-FR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Fonction pour générer un slug à partir d'un texte
// export function generateSlug(text: string): string {
//   return text
//     .toLowerCase()
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9\s-]/g, '')
//     .replace(/\s+/g, '-')
//     .replace(/-+/g, '-')
//     .trim('-');
// }
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime accents
    .replace(/[^a-z0-9\s-]/g, '')    // supprime caractères spéciaux
    .replace(/\s+/g, '-')            // remplace espaces par "-"
    .replace(/-+/g, '-')             // évite plusieurs "-"
    .replace(/^-+|-+$/g, '');        // supprime "-" au début et à la fin
}


// Fonction pour tronquer un texte
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}