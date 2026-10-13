/**
 * Livraison v3 côté web : zones (liste complète, recherche locale), position, devis du panier.
 * Même calcul que celui appliqué à la commande : le prix affiché est le prix facturé.
 */
import axios from "axios";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

export interface ZoneV3 {
  _id: string;
  name: string;
  type: "country" | "region" | "city" | "district";
  parent: string | null;
  fullPath: string;
  aliases?: string[];
  center?: { lat: number; lng: number };
}

export interface ParcelQuote {
  sellerId: string;
  storeName: string;
  origin: { zoneId: string; label: string; name: string; source: string } | null;
  relation: string | null;
  relationLabel: string | null;
  deliverable: boolean;
  quoteRequired: boolean;
  reason: string | null;
  message: string | null;
  fee: number | null;
  weightKg: number;
  delay?: { label: string; sameDay?: boolean; minDays?: number; maxDays?: number; cutoff?: string };
  free?: { campaignId: string; name: string; amount: number } | null;
  freeHint?: { campaignId: string; name: string; remaining: number } | null;
  breakdown?: { label: string; amount: number }[];
}

export interface CartQuote {
  destination: { zoneId: string; label: string } | null;
  parcels: ParcelQuote[];
  totalFee: number;
  allDeliverable: boolean;
  quoteRequired: boolean;
}

// ─── Zones ───────────────────────────────────────────────────────────────────

const CACHE_KEY = "zonesV3";
const CACHE_TTL = 10 * 60 * 1000;
let memo: { at: number; data: ZoneV3[] } | null = null;
let pending: Promise<ZoneV3[]> | null = null;

/** Toutes les zones actives (une seule requête, mise en cache 10 min) */
export async function getZones(): Promise<ZoneV3[]> {
  if (memo && Date.now() - memo.at < CACHE_TTL) return memo.data;
  if (typeof window !== "undefined" && !memo) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached?.data?.length && Date.now() - cached.at < CACHE_TTL) {
        memo = cached;
        return cached.data;
      }
    } catch {}
  }
  if (!pending) {
    pending = axios
      .get(`${BackendUrl}/api/shipping-v3/zones`, { timeout: 10000 })
      .then((r) => {
        const data: ZoneV3[] = (r.data?.data || []).map((z: any) => ({ ...z, _id: String(z._id), parent: z.parent ? String(z.parent) : null }));
        memo = { at: Date.now(), data };
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(memo)); } catch {}
        return data;
      })
      .finally(() => { pending = null; });
  }
  return pending;
}

export const normalize = (s: string) =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Libellé lisible : « Yantala Bas » + « Commune 1, Niamey » */
export function zoneLabel(z: Pick<ZoneV3, "name" | "fullPath">) {
  const parts = String(z.fullPath || z.name).split(" > ");
  const context = parts.slice(1, -1).reverse().join(", ");
  return { title: z.name, subtitle: context || (parts[0] !== z.name ? parts[0] : "") };
}

const TYPE_RANK: Record<string, number> = { district: 0, city: 1, region: 2, country: 3 };

/**
 * Recherche locale (nom, autres noms, chemin) — classement : début du nom > mot > chemin ;
 * Niger d'abord, quartiers avant villes. Les pays seuls ne sont pas proposés.
 */
export function searchZones(zones: ZoneV3[], query: string, limit = 40): ZoneV3[] {
  const q = normalize(query);
  const usable = zones.filter((z) => z.type !== "country");
  if (!q) {
    // Sans recherche : villes et communes (les plus demandées en premier)
    return usable
      .filter((z) => z.type === "city")
      .sort((a, b) => Number(!a.fullPath.startsWith("Niger > Niamey")) - Number(!b.fullPath.startsWith("Niger > Niamey")) || a.fullPath.localeCompare(b.fullPath, "fr"))
      .slice(0, limit);
  }
  const scored: { z: ZoneV3; s: number }[] = [];
  for (const z of usable) {
    const names = [z.name, ...(z.aliases || [])].map(normalize);
    let s = -1;
    if (names.some((n) => n === q)) s = 100;
    else if (names.some((n) => n.startsWith(q))) s = 80;
    else if (names.some((n) => n.split(" ").some((w) => w.startsWith(q)))) s = 60;
    else if (normalize(z.fullPath).includes(q)) s = 30;
    if (s < 0) continue;
    if (z.fullPath.startsWith("Niger")) s += 10;
    s -= TYPE_RANK[z.type] || 0;
    scored.push({ z, s });
  }
  return scored.sort((a, b) => b.s - a.s || a.z.fullPath.localeCompare(b.z.fullPath, "fr")).slice(0, limit).map((x) => x.z);
}

const toRad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const h = Math.sin(toRad(b.lat - a.lat) / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(toRad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Zone géolocalisée la plus proche (quartier si renseigné, sinon ville) — null au-delà de 40 km */
export function nearestZone(zones: ZoneV3[], pos: { lat: number; lng: number }): ZoneV3 | null {
  let best: { z: ZoneV3; d: number } | null = null;
  for (const z of zones) {
    if (!z.center || z.type === "country") continue;
    // Région : simple repli quand aucune ville / commune géolocalisée n'est plus proche
    const d = distanceKm(pos, z.center) - (z.type === "district" ? 0.5 : 0) + (z.type === "region" ? 8 : 0);
    if (!best || d < best.d) best = { z, d };
  }
  return best && best.d <= 40 ? best.z : null;
}

/** Position du navigateur (demande l'autorisation) */
export function getBrowserPosition(): Promise<{ lat: number; lng: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) => reject(e),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

// ─── Zone mémorisée ──────────────────────────────────────────────────────────

const ZONE_KEY = "deliveryZoneV3";
export function rememberZone(z: ZoneV3 | null) {
  try {
    if (z) localStorage.setItem(ZONE_KEY, JSON.stringify(z));
    else localStorage.removeItem(ZONE_KEY);
  } catch {}
}
export function getRememberedZone(): ZoneV3 | null {
  try { return JSON.parse(localStorage.getItem(ZONE_KEY) || "null"); } catch { return null; }
}

// ─── Devis ───────────────────────────────────────────────────────────────────

export async function quoteCart(destinationZoneId: string, items: { productId: string; quantity: number }[]): Promise<CartQuote> {
  const r = await axios.post(`${BackendUrl}/api/shipping-v3/quote`, { destinationZoneId, items }, { timeout: 12000 });
  return r.data.data;
}

/** Texte des frais d'un colis */
export function parcelFeeText(p: ParcelQuote, format: (n: number) => string) {
  if (!p.deliverable) return p.quoteRequired ? "Sur devis" : "Non livrable";
  if (p.free) return "Offerte";
  return format(p.fee || 0);
}

// ─── Ville d'expédition des boutiques (badge « 📍 ville ») ───────────────────

export interface OriginBadge {
  city: string;
  detail: string | null;
  regionId: string | null;
  source: string;
}

const originCache = new Map<string, OriginBadge | null>();
const originWaiters = new Map<string, ((v: OriginBadge | null) => void)[]>();
let originTimer: ReturnType<typeof setTimeout> | null = null;

/** Regroupe les demandes de toutes les cartes affichées en un seul appel (fenêtre de 40 ms) */
export function loadSellerOrigin(sellerId: string): Promise<OriginBadge | null> {
  if (!sellerId || !/^[a-f\d]{24}$/i.test(sellerId)) return Promise.resolve(null);
  if (originCache.has(sellerId)) return Promise.resolve(originCache.get(sellerId) ?? null);
  return new Promise((resolve) => {
    originWaiters.set(sellerId, [...(originWaiters.get(sellerId) || []), resolve]);
    if (originTimer) return;
    originTimer = setTimeout(async () => {
      originTimer = null;
      const batch = [...originWaiters.entries()];
      originWaiters.clear();
      const ids = batch.map(([id]) => id);
      let data: Record<string, OriginBadge | null> = {};
      try {
        for (let i = 0; i < ids.length; i += 200) {
          const r = await axios.get(`${BackendUrl}/api/shipping-v3/origins`, { params: { ids: ids.slice(i, i + 200).join(",") }, timeout: 10000 });
          data = { ...data, ...(r.data?.data || {}) };
        }
      } catch {}
      for (const [id, resolvers] of batch) {
        const v = data[id] ?? null;
        if (id in data) originCache.set(id, v);
        resolvers.forEach((fn) => fn(v));
      }
    }, 40);
  });
}

/** Identifiant de la boutique d'un produit (Clefournisseur peuplé ou brut) */
export function sellerIdOf(product: any): string | null {
  const c = product?.Clefournisseur;
  const id = (c && typeof c === "object" ? c._id : c) || product?.createdBy || null;
  return id ? String(id) : null;
}

// ─── « Près de chez moi » ────────────────────────────────────────────────────

export interface NearbyPage {
  destination: { zoneId: string; name: string; label: string };
  products: any[];
  total: number;
  page: number;
  pages: number;
  relationBySeller: Record<string, string>;
  sellerCount: number;
}

/** Produits des boutiques les plus proches (même quartier → même ville → même région) */
export async function fetchNearby(zoneId: string, page = 1, limit = 20): Promise<NearbyPage> {
  const r = await axios.get(`${BackendUrl}/api/shipping-v3/nearby`, { params: { zoneId, page, limit }, timeout: 12000 });
  return r.data.data;
}
