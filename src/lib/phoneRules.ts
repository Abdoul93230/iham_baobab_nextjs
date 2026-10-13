export interface CountryPhoneConfig {
  name: string;
  iso: string;
  flag: string;
  dialCode: string;
  nationalLength: number;
  groups: number[];
  exampleNational: string;
  /** Le 0 initial fait partie du numéro (ex. Côte d'Ivoire depuis 2021) */
  keepLeadingZero?: boolean;
  /** Longueur minimale si les numéros sont de longueur variable (ex. Allemagne) */
  minLength?: number;
}

export const PHONE_COUNTRIES: CountryPhoneConfig[] = [
  {
    name: "Niger",
    iso: "NE",
    flag: "🇳🇪",
    dialCode: "+227",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "90 12 34 56",
  },
  {
    name: "Sénégal",
    iso: "SN",
    flag: "🇸🇳",
    dialCode: "+221",
    nationalLength: 9,
    groups: [2, 3, 2, 2],
    exampleNational: "77 123 45 67",
  },
  {
    name: "Côte d'Ivoire",
    iso: "CI",
    flag: "🇨🇮",
    dialCode: "+225",
    nationalLength: 10,
    groups: [2, 2, 2, 2, 2],
    exampleNational: "07 01 23 45 67",
    keepLeadingZero: true,
  },
  {
    name: "Burkina Faso",
    iso: "BF",
    flag: "🇧🇫",
    dialCode: "+226",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "70 12 34 56",
  },
  {
    name: "Mali",
    iso: "ML",
    flag: "🇲🇱",
    dialCode: "+223",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "65 12 34 56",
  },
  {
    name: "Bénin",
    iso: "BJ",
    flag: "🇧🇯",
    dialCode: "+229",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "90 12 34 56",
  },
  {
    name: "Togo",
    iso: "TG",
    flag: "🇹🇬",
    dialCode: "+228",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "90 12 34 56",
  },
  {
    name: "Nigeria",
    iso: "NG",
    flag: "🇳🇬",
    dialCode: "+234",
    nationalLength: 10,
    groups: [3, 3, 4],
    exampleNational: "803 123 4567",
  },
  {
    name: "France",
    iso: "FR",
    flag: "🇫🇷",
    dialCode: "+33",
    nationalLength: 9,
    groups: [1, 2, 2, 2, 2],
    exampleNational: "6 12 34 56 78",
  },
  {
    name: "États-Unis",
    iso: "US",
    flag: "🇺🇸",
    dialCode: "+1",
    nationalLength: 10,
    groups: [3, 3, 4],
    exampleNational: "201 555 0123",
  },
  {
    name: "Maroc",
    iso: "MA",
    flag: "🇲🇦",
    dialCode: "+212",
    nationalLength: 9,
    groups: [1, 2, 2, 2, 2],
    exampleNational: "6 12 34 56 78",
  },
  {
    name: "Algérie",
    iso: "DZ",
    flag: "🇩🇿",
    dialCode: "+213",
    nationalLength: 9,
    groups: [2, 2, 2, 3],
    exampleNational: "55 12 34 567",
  },
  {
    name: "Royaume-Uni",
    iso: "GB",
    flag: "🇬🇧",
    dialCode: "+44",
    nationalLength: 10,
    groups: [4, 6],
    exampleNational: "7400 123456",
  },
  {
    name: "Allemagne",
    iso: "DE",
    flag: "🇩🇪",
    dialCode: "+49",
    nationalLength: 11,
    minLength: 10, // longueur variable
    groups: [3, 4, 4],
    exampleNational: "151 2345 6789",
  },
  {
    name: "Espagne",
    iso: "ES",
    flag: "🇪🇸",
    dialCode: "+34",
    nationalLength: 9,
    groups: [3, 2, 2, 2],
    exampleNational: "612 34 56 78",
  },
  {
    name: "Italie",
    iso: "IT",
    flag: "🇮🇹",
    dialCode: "+39",
    nationalLength: 10,
    minLength: 9, // longueur variable
    groups: [3, 3, 4],
    exampleNational: "312 345 6789",
  },
  {
    name: "Tunisie",
    iso: "TN",
    flag: "🇹🇳",
    dialCode: "+216",
    nationalLength: 8,
    groups: [2, 3, 3],
    exampleNational: "20 123 456",
  },
  {
    name: "Guinée",
    iso: "GN",
    flag: "🇬🇳",
    dialCode: "+224",
    nationalLength: 9,
    groups: [3, 2, 2, 2],
    exampleNational: "621 12 34 56",
  },
  {
    name: "Ghana",
    iso: "GH",
    flag: "🇬🇭",
    dialCode: "+233",
    nationalLength: 9,
    groups: [2, 3, 4],
    exampleNational: "24 123 4567",
  },
  {
    name: "Tchad",
    iso: "TD",
    flag: "🇹🇩",
    dialCode: "+235",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "66 12 34 56",
  },
  {
    name: "Cameroun",
    iso: "CM",
    flag: "🇨🇲",
    dialCode: "+237",
    nationalLength: 9,
    groups: [1, 2, 2, 2, 2],
    exampleNational: "6 71 23 45 67",
  },
  {
    name: "Maurice",
    iso: "MU",
    flag: "🇲🇺",
    dialCode: "+230",
    nationalLength: 8,
    groups: [4, 4],
    exampleNational: "5251 2345",
  },
  {
    name: "Centrafrique",
    iso: "CF",
    flag: "🇨🇫",
    dialCode: "+236",
    nationalLength: 8,
    groups: [2, 2, 2, 2],
    exampleNational: "75 12 34 56",
  },
  {
    name: "Cap-Vert",
    iso: "CV",
    flag: "🇨🇻",
    dialCode: "+238",
    nationalLength: 7,
    groups: [3, 4],
    exampleNational: "991 1234",
  },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

/*
 * RÈGLE UNIQUE DES NUMÉROS (identique web et mobile — voir New_Iham_Baobab_Mobile/src/utils/phoneRules.js)
 * - Stockage / envoi au backend : E.164 SANS espace → +22787727501
 * - Affichage : indicatif + groupes du pays → +227 87 72 75 01
 * - Saisie tolérante : espaces, tirets, points, +227…, 00227…, 227… collés
 */

const digitsOf = (value = "") => String(value || "").replace(/\D/g, "");
const dialDigits = (country: CountryPhoneConfig) => country.dialCode.replace("+", "");

/** Pays dont l'indicatif préfixe la chaîne (indicatif le plus long d'abord) */
export const findCountryByDialPrefix = (internationalDigits = ""): CountryPhoneConfig | null =>
  PHONE_COUNTRIES.slice()
    .sort((a, b) => dialDigits(b).length - dialDigits(a).length)
    .find((c) => internationalDigits.startsWith(dialDigits(c))) || null;

/** Chiffres nationaux depuis une saisie libre (indicatif et 0 de tête retirés selon le pays) */
export const normalizePhoneDigits = (value = "", country: CountryPhoneConfig = DEFAULT_PHONE_COUNTRY) => {
  const raw = String(value || "").trim();
  let digits = digitsOf(raw);
  const dd = dialDigits(country);
  if (raw.startsWith("+") && digits.startsWith(dd)) digits = digits.slice(dd.length);
  else if (digits.startsWith(`00${dd}`)) digits = digits.slice(dd.length + 2);
  else if (digits.startsWith(dd) && digits.length > country.nationalLength) digits = digits.slice(dd.length);
  if (!country.keepLeadingZero) digits = digits.replace(/^0+/, "");
  return digits;
};

export const truncateToCountryLength = (country: CountryPhoneConfig, digits: string) =>
  normalizePhoneDigits(digits, country).slice(0, country.nationalLength);

/** Groupes nationaux : « 87 72 75 01 » */
export const formatPhoneForDisplay = (country: CountryPhoneConfig, digitsInput = "") => {
  const digits = truncateToCountryLength(country, digitsInput);
  if (!digits) return "";
  const parts: string[] = [];
  let cursor = 0;
  for (const size of country.groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  if (cursor < digits.length) parts.push(digits.slice(cursor));
  return parts.join(" ");
};

/** Frappe ou collage dans le champ national ; un numéro international collé fait changer de pays */
export const applyPhoneInputChange = (country: CountryPhoneConfig, rawInput = "") => {
  const raw = String(rawInput || "").trim();
  let target = country;
  if (raw.startsWith("+") || raw.startsWith("00")) {
    const intl = digitsOf(raw).replace(/^00/, "");
    target = findCountryByDialPrefix(intl) || country;
  }
  const digits = truncateToCountryLength(target, raw);
  return { digits, display: formatPhoneForDisplay(target, digits), country: target };
};

/** Lecture d'un numéro stocké quel que soit son format (E.164, espaces, 00, national) */
export const parseStoredPhone = (rawPhone = "") => {
  const raw = String(rawPhone || "").trim();
  const all = digitsOf(raw);
  let country = DEFAULT_PHONE_COUNTRY;
  if (raw.startsWith("+") || raw.startsWith("00")) {
    country = findCountryByDialPrefix(all.replace(/^00/, "")) || DEFAULT_PHONE_COUNTRY;
  } else if (all.length > DEFAULT_PHONE_COUNTRY.nationalLength) {
    country = findCountryByDialPrefix(all) || DEFAULT_PHONE_COUNTRY;
  }
  const { digits, display } = applyPhoneInputChange(country, raw);
  return { country, digits, display };
};

export const hasTrivialRepeatedSequence = (digits = "") =>
  !!digits && new RegExp(`^(\\d)\\1{${Math.max(1, digits.length - 1)}}$`).test(digits);

export const validatePhone = (country: CountryPhoneConfig, digitsInput: string, required = true) => {
  const digits = truncateToCountryLength(country, digitsInput);
  if (!digits) {
    return required
      ? { isValid: false, message: `Numéro requis (${country.nationalLength} chiffres pour ${country.name}).` }
      : { isValid: true, message: "" };
  }
  const minLength = country.minLength || country.nationalLength;
  if (digits.length < minLength || digits.length > country.nationalLength) {
    return { isValid: false, message: `${country.name} : ${minLength === country.nationalLength ? "" : `${minLength} à `}${country.nationalLength} chiffres attendus (vous en avez saisi ${digits.length}).` };
  }
  if (hasTrivialRepeatedSequence(digits)) {
    return { isValid: false, message: "Ce numéro ne semble pas valide." };
  }
  return { isValid: true, message: "" };
};

/** Format envoyé au backend : E.164 sans espace (+22787727501) */
export const toE164 = (country: CountryPhoneConfig, digitsInput: string) => {
  const digits = truncateToCountryLength(country, digitsInput);
  return digits ? `${country.dialCode}${digits}` : "";
};
export const toBackendPhone = toE164;

/** Affichage lisible d'un numéro stocké : +227 87 72 75 01 */
export const formatPhoneInternational = (rawPhone = "") => {
  if (!rawPhone) return "";
  const { country, display } = parseStoredPhone(rawPhone);
  return display ? `${country.dialCode} ${display}` : String(rawPhone);
};

/** Normalise une saisie complète en E.164 (null si invalide) */
export const normalizeToE164 = (raw: string, fallbackCountry: CountryPhoneConfig = DEFAULT_PHONE_COUNTRY) => {
  const text = String(raw || "").trim();
  const { country, digits } = /^(\+|00)/.test(text) || digitsOf(text).length > fallbackCountry.nationalLength
    ? parseStoredPhone(text)
    : { country: fallbackCountry, digits: truncateToCountryLength(fallbackCountry, text) };
  return validatePhone(country, digits).isValid ? toE164(country, digits) : null;
};

export const getPhonePlaceholder = (country: CountryPhoneConfig) => country.exampleNational;
