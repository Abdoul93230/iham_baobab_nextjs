export interface PasswordChecks {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
}

export const getPasswordChecks = (password = ""): PasswordChecks => ({
  minLength: password.length >= 8,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>\-_[\]\\/+=~`]/.test(password),
  noSpaces: !/\s/.test(password),
});

export const getPasswordStrength = (password = "") => {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;

  if (score <= 2) {
    return { score, label: "Faible", colorClass: "bg-red-500" };
  }
  if (score <= 4) {
    return { score, label: "Moyen", colorClass: "bg-amber-500" };
  }
  if (score === 5) {
    return { score, label: "Fort", colorClass: "bg-lime-500" };
  }
  return { score, label: "Très fort", colorClass: "bg-emerald-600" };
};

export const validatePassword = (password = "") => {
  const checks = getPasswordChecks(password);
  const valid =
    checks.minLength && checks.upper && checks.lower && checks.number && checks.special && checks.noSpaces;

  const message = valid
    ? ""
    : "Mot de passe invalide: 8 caractères min, majuscule, minuscule, chiffre, spécial, sans espace.";

  return { valid, checks, message };
};
