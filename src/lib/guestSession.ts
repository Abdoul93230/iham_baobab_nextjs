/**
 * Commande sans compte : session invité (numéro de téléphone), vérification par SMS
 * seulement quand c'est nécessaire, suivi partageable, création du compte après coup.
 */
import axios from "axios";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
const KEY = "ihamGuestSession";
export const OFFLINE_PAYMENTS = ["payé à la livraison", "payé par téléphone"];

export interface GuestSession {
  token: string;
  verified: boolean;
  phone: string;
  name: string;
  userId: string;
}

const expOf = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return Number(payload.exp || 0) * 1000;
  } catch {
    return 0;
  }
};

export function getGuestSession(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null") as GuestSession | null;
    if (!s?.token || expOf(s.token) < Date.now() + 60_000) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveGuestSession(s: GuestSession) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function clearGuestSession() {
  try { localStorage.removeItem(KEY); } catch {}
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
const fromApi = (d: any, fallback: { phone: string; name: string }): GuestSession => ({
  token: d.token,
  verified: !!d.verified,
  phone: d.user?.phoneNumber || fallback.phone,
  name: d.user?.name || fallback.name,
  userId: d.user?.id,
});

/**
 * Prépare la session invité pour ce numéro, sans SMS si possible.
 * Réutilise une session vérifiée du même numéro (valable 90 jours).
 */
export async function ensureGuestSession(phone: string, name: string): Promise<{ session?: GuestSession; accountExists?: boolean }> {
  const current = getGuestSession();
  if (current && current.phone === phone) return { session: current };
  const r = await axios.post(`${BackendUrl}/api/guest/session`, { phone, name });
  const d = r.data?.data || {};
  if (d.accountExists) return { accountExists: true };
  const session = fromApi(d, { phone, name });
  saveGuestSession(session);
  return { session };
}

export async function sendGuestOtp(phone: string, name: string) {
  const r = await axios.post(`${BackendUrl}/api/guest/send-otp`, { phone, name });
  return r.data?.data || {};
}

export async function verifyGuestOtp(phone: string, code: string, name = ""): Promise<GuestSession> {
  const r = await axios.post(`${BackendUrl}/api/guest/verify-otp`, { phone, code });
  const session = fromApi(r.data?.data || {}, { phone, name });
  saveGuestSession(session);
  return session;
}

/** Crée le compte à partir de la session vérifiée (aucun nouveau SMS) */
export async function claimGuestAccount(password: string, name?: string) {
  const s = getGuestSession();
  if (!s?.verified) throw new Error("Vérifiez d’abord votre numéro.");
  const r = await axios.post(`${BackendUrl}/api/guest/claim`, { password, name }, auth(s.token));
  return { ...r.data, phone: s.phone };
}

export async function fetchGuestOrders() {
  const s = getGuestSession();
  if (!s?.verified) throw new Error("not-verified");
  const r = await axios.get(`${BackendUrl}/api/guest/orders`, auth(s.token));
  return r.data?.data || [];
}

export async function fetchTracking(reference: string, k: string) {
  const r = await axios.get(`${BackendUrl}/api/track/${encodeURIComponent(reference)}`, { params: { k } });
  return r.data?.data;
}

export async function fetchShareLink(orderId: string): Promise<string> {
  const r = await axios.get(`${BackendUrl}/api/orders/${orderId}/share`);
  return r.data?.data?.url;
}

/** Lien de suivi sur ce site (le backend renvoie l'URL publique) */
export const trackingPath = (reference: string, token: string) => `/suivi/${encodeURIComponent(reference)}?k=${token}`;

/** Partage natif (mobile) ou WhatsApp en repli */
export async function shareTracking(url: string, text = "Suivez ma commande Ihambaobab") {
  try {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({ title: "Suivi de commande", text, url });
      return;
    }
  } catch {
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text} : ${url}`)}`, "_blank");
}
