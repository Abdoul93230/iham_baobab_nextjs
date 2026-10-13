"use client";

import axios from "axios";
import { AuthService } from "./auth";
import { getGuestSession } from "./guestSession";

/**
 * Joint automatiquement le jeton du client connecté à toute requête axios vers l'API
 * (profil, adresses, commandes…). Les en-têtes déjà fournis ne sont jamais écrasés.
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_Backend_Url || "";
let installed = false;

const currentToken = (): string | null => {
  const token = AuthService.getToken();
  if (token) return token;
  try {
    const user = JSON.parse(localStorage.getItem("userEcomme") || "null");
    return user?.token || null;
  } catch {
    return null;
  }
};

/** Routes ouvertes à la commande sans compte (jeton invité si aucun compte connecté) */
const GUEST_ROUTES = /\/(createCommande|updateCommande|getCommandesById\/|getCommandeByReference\/|api\/orders\/[^/]+\/share)/;

export function installAxiosAuth(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const url = String(config.url || "");
    const toApi = BACKEND_URL ? url.startsWith(BACKEND_URL) : false;
    const headers = config.headers as Record<string, unknown> | undefined;
    const hasAuth = !!(headers && (headers.Authorization || headers.authorization));
    if (toApi && !hasAuth) {
      const token = currentToken() || (GUEST_ROUTES.test(url) ? getGuestSession()?.token : null);
      if (token) config.headers.set?.("Authorization", `Bearer ${token}`);
    }
    return config;
  });
}

installAxiosAuth();
