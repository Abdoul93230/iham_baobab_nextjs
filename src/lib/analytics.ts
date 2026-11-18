/**
 * Mesure du tunnel d'achat sur le site (même format que l'app) : vue d'article, panier, commande,
 * paiement, achat, et d'où vient le visiteur. Aucune donnée personnelle. Ne bloque jamais la page.
 */
const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
const SOURCE_KEY = "ihamSource";
type Props = { productId?: string; orderRef?: string; value?: number };

let queue: Array<Props & { name: string; ts: number }> = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function visitorId(): string {
  try {
    let v = localStorage.getItem("ihamVisitorId");
    if (!v) {
      v = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem("ihamVisitorId", v);
    }
    return v;
  } catch {
    return "";
  }
}

/** Source d'arrivée (parrainage, campagne), gardée pour toutes les visites suivantes */
export function setSource(source: string) {
  try { if (source) localStorage.setItem(SOURCE_KEY, source.slice(0, 40)); } catch { /* rien */ }
}

function flush(useBeacon = false) {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!queue.length || !BackendUrl) return;
  const events = queue.splice(0, 20);
  let source: string | undefined;
  try { source = localStorage.getItem(SOURCE_KEY) || undefined; } catch { /* rien */ }
  let token = "";
  try { token = JSON.parse(localStorage.getItem("userEcomme") || "null")?.token || ""; } catch { /* rien */ }
  const body = JSON.stringify({ events, platform: "web", source });
  fetch(`${BackendUrl}/api/events`, {
    method: "POST",
    keepalive: useBeacon, // la page peut se fermer : l'envoi continue
    headers: { "Content-Type": "application/json", "x-visitor-id": visitorId(), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body,
  }).catch(() => { /* mesure facultative */ });
}

export function track(name: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  queue.push({ name, ts: Date.now(), ...props });
  if (queue.length >= 10) flush();
  else if (!timer) timer = setTimeout(() => flush(), 5000);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });
}
