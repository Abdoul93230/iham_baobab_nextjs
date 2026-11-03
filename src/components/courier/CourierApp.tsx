"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, LogOut, MapPin, Package, Store, Truck, Wallet } from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_Backend_Url || ""}/api/courier`;
const STORAGE = "ihamCourier";

interface Courier { id: string; name: string; phone: string; deliveries: number; pickups: number }
interface OrderSummary {
  reference: string;
  items: number;
  total: number;
  cashToCollect: number;
  customer: string;
  zone: string;
  stores: { storeId: string; storeName: string; pickedUp: boolean; pickedUpAt: string | null }[];
  delivered: boolean;
}

const fcfa = (n: number) => `${Math.round(n || 0).toLocaleString("fr-FR")} F`;

async function api<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.message || "Connexion impossible. Réessayez."), { status: r.status });
  return data as T;
}

/** 4 cases de code, grand format, clavier numérique */
function CodeInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="absolute inset-0 opacity-0"
        aria-label="Code à 4 chiffres"
      />
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold tabular-nums ${value.length === i ? "border-[#30A08B]" : "border-gray-200"} bg-white`}>
            {value[i] || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

const Btn = ({ children, loading, disabled, onClick, tone = "primary" }: { children: React.ReactNode; loading?: boolean; disabled?: boolean; onClick: () => void; tone?: "primary" | "ghost" }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full h-14 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-40 ${tone === "primary" ? "bg-[#30A08B] text-white" : "bg-white text-gray-700 border border-gray-200"}`}
  >
    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
  </button>
);

export default function CourierApp() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<Courier | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE) || "null");
      if (s?.token) {
        setToken(s.token);
        setMe(s.courier);
        api<{ courier: Courier }>("/me", undefined, s.token)
          .then((r) => setMe(r.courier))
          .catch((e) => { if (e.status === 401) { localStorage.removeItem(STORAGE); setToken(null); } });
      }
    } catch { /* stockage indisponible */ }
    setReady(true);
  }, []);

  const logout = () => { try { localStorage.removeItem(STORAGE); } catch {} setToken(null); setMe(null); };

  if (!ready) return null;
  return (
    <div className="min-h-[100dvh] bg-[#F6F7F5] text-gray-900">
      <div className="max-w-md mx-auto px-4 pb-10">
        {token && me ? (
          <Work token={token} me={me} onLogout={logout} onExpired={logout} />
        ) : (
          <Login onDone={(t, c) => { setToken(t); setMe(c); try { localStorage.setItem(STORAGE, JSON.stringify({ token: t, courier: c })); } catch {} }} />
        )}
      </div>
    </div>
  );
}

// ─── Connexion : numéro + code ─────────────────────────────────────────────────
function Login({ onDone }: { onDone: (token: string, c: Courier) => void }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const digits = phone.replace(/\D/g, "");

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const r = await api<{ token: string; courier: Courier }>("/login", { phone: digits.length === 8 ? `+227${digits}` : phone, pin });
      onDone(r.token, r.courier);
    } catch (e) {
      setError((e as Error).message); setPin("");
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-14">
      <div className="w-14 h-14 rounded-2xl bg-[#30A08B] flex items-center justify-center mb-6"><Truck className="w-7 h-7 text-white" /></div>
      <h1 className="text-2xl font-bold">Espace livreur</h1>
      <p className="text-gray-500 mt-1">Connectez-vous avec votre numéro et votre code.</p>

      <label className="block mt-8 text-sm font-medium text-gray-600">Numéro de téléphone</label>
      <div className="mt-2 flex items-center h-14 rounded-2xl border-2 border-gray-200 bg-white px-4 focus-within:border-[#30A08B]">
        <span className="text-gray-400 font-medium mr-2">+227</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="90 12 34 56" className="flex-1 text-lg outline-none bg-transparent" autoFocus />
      </div>

      <label className="block mt-6 mb-2 text-sm font-medium text-gray-600">Code secret (4 chiffres)</label>
      <CodeInput value={pin} onChange={setPin} />

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <div className="mt-8"><Btn onClick={submit} loading={loading} disabled={digits.length < 8 || pin.length !== 4}>Se connecter</Btn></div>
      <p className="mt-6 text-xs text-gray-400 text-center">Pas de compte ? Demandez-le à l'équipe Ihambaobab.</p>
    </div>
  );
}

// ─── Travail : référence → retrait(s) → livraison ──────────────────────────────
function Work({ token, me, onLogout, onExpired }: { token: string; me: Courier; onLogout: () => void; onExpired: () => void }) {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ title: string; text: string } | null>(null);

  const call = async <T,>(path: string, body: unknown): Promise<T | null> => {
    setLoading(true); setError("");
    try {
      return await api<T>(path, body, token);
    } catch (e) {
      if ((e as { status?: number }).status === 401) onExpired();
      setError((e as Error).message);
      return null;
    } finally { setLoading(false); }
  };

  const open = async () => {
    const r = await call<{ order: OrderSummary }>("/lookup", { reference: reference.trim() });
    if (r) { setOrder(r.order); setCode(""); }
  };

  const pending = order?.stores.filter((s) => !s.pickedUp) || [];
  const step: "pickup" | "deliver" | "done" = !order ? "pickup" : order.delivered ? "done" : pending.length ? "pickup" : "deliver";

  const confirm = async () => {
    if (!order) return;
    if (step === "pickup") {
      const r = await call<{ message: string; order: OrderSummary }>("/pickup", { reference: order.reference, code });
      if (r) {
        setOrder(r.order); setCode("");
        if (!r.order.stores.some((s) => !s.pickedUp)) setDone({ title: "Colis récupéré", text: `Tous les colis de la commande ${r.order.reference} sont avec vous. Direction le client.` });
      }
    } else {
      const r = await call<{ order: OrderSummary }>("/deliver", { reference: order.reference, code });
      if (r) { setOrder(r.order); setDone({ title: "Livraison confirmée", text: `Commande ${r.order.reference} remise à ${r.order.customer}.${r.order.cashToCollect ? ` Encaissé : ${fcfa(r.order.cashToCollect)}.` : ""}` }); }
    }
  };

  const reset = () => { setOrder(null); setReference(""); setCode(""); setError(""); setDone(null); };

  // ── Écran de succès ──
  if (done) {
    return (
      <div className="pt-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#30A08B] flex items-center justify-center"><Check className="w-10 h-10 text-white" strokeWidth={3} /></div>
        <h2 className="text-2xl font-bold mt-6">{done.title}</h2>
        <p className="text-gray-600 mt-2">{done.text}</p>
        <div className="mt-10 space-y-3">
          {step === "deliver" ? <Btn onClick={() => setDone(null)}>Livrer maintenant</Btn> : null}
          <Btn tone={step === "deliver" ? "ghost" : "primary"} onClick={reset}>Autre commande</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between pt-6 pb-4">
        {order ? (
          <button onClick={reset} className="p-2 -ml-2 rounded-full hover:bg-white" aria-label="Retour"><ArrowLeft className="w-6 h-6" /></button>
        ) : (
          <div>
            <p className="text-sm text-gray-500">Bonjour</p>
            <p className="text-xl font-bold">{me.name}</p>
          </div>
        )}
        <button onClick={onLogout} className="p-2 -mr-2 rounded-full hover:bg-white text-gray-500" aria-label="Se déconnecter"><LogOut className="w-5 h-5" /></button>
      </header>

      {!order ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-2xl bg-white p-4"><p className="text-2xl font-bold">{me.pickups}</p><p className="text-xs text-gray-500">colis récupérés</p></div>
            <div className="rounded-2xl bg-white p-4"><p className="text-2xl font-bold">{me.deliveries}</p><p className="text-xs text-gray-500">livraisons</p></div>
          </div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Référence de la commande</label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value.trim())}
            onKeyDown={(e) => { if (e.key === "Enter" && reference) open(); }}
            placeholder="Ex. 20261103ABCD"
            className="w-full h-14 rounded-2xl border-2 border-gray-200 bg-white px-4 text-lg font-semibold tracking-wide outline-none focus:border-[#30A08B]"
            autoFocus
          />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-6"><Btn onClick={open} loading={loading} disabled={!reference}>Continuer</Btn></div>
          <p className="mt-6 text-xs text-gray-400 text-center">La référence est écrite sur le colis et dans la commande.</p>
        </>
      ) : (
        <>
          {/* Résumé */}
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-gray-400">Commande</p>
            <p className="text-lg font-bold">{order.reference}</p>
            <div className="mt-3 space-y-1.5 text-sm text-gray-700">
              <p className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" />{order.items} article{order.items > 1 ? "s" : ""}</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{order.customer}{order.zone ? ` · ${order.zone}` : ""}</p>
            </div>
            {order.cashToCollect ? (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-600" />
                <p className="text-sm">À encaisser : <span className="font-bold">{fcfa(order.cashToCollect)}</span></p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-emerald-700 font-medium">Déjà payée : rien à encaisser</p>
            )}
          </div>

          {/* Étapes */}
          <ol className="mt-4 space-y-2">
            {order.stores.map((s) => (
              <li key={s.storeId} className={`rounded-2xl p-4 flex items-center gap-3 ${s.pickedUp ? "bg-emerald-50" : "bg-white"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.pickedUp ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>{s.pickedUp ? <Check className="w-5 h-5" /> : <Store className="w-4 h-4" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.storeName || "Boutique"}</p>
                  <p className="text-xs text-gray-500">{s.pickedUp ? "Colis récupéré" : "Colis à récupérer"}</p>
                </div>
              </li>
            ))}
            <li className={`rounded-2xl p-4 flex items-center gap-3 ${order.delivered ? "bg-emerald-50" : "bg-white"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${order.delivered ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>{order.delivered ? <Check className="w-5 h-5" /> : <Truck className="w-4 h-4" />}</div>
              <div className="flex-1"><p className="font-medium">Livraison à {order.customer}</p><p className="text-xs text-gray-500">{order.delivered ? "Livrée" : pending.length ? "Après le retrait" : "À faire maintenant"}</p></div>
            </li>
          </ol>

          {step !== "done" ? (
            <div className="mt-6">
              <p className="font-semibold text-lg">{step === "pickup" ? `Code de ${pending.length > 1 ? "la boutique" : pending[0]?.storeName || "la boutique"}` : "Code du client"}</p>
              <p className="text-sm text-gray-500 mb-4">
                {step === "pickup" ? "La boutique voit ce code dans sa commande. Demandez-le en prenant le colis." : "Le client voit ce code dans sa commande. Demandez-le en lui remettant le colis."}
              </p>
              <CodeInput value={code} onChange={setCode} autoFocus />
              {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
              <div className="mt-6"><Btn onClick={confirm} loading={loading} disabled={code.length !== 4}>{step === "pickup" ? "Valider le retrait" : "Confirmer la livraison"}</Btn></div>
            </div>
          ) : (
            <p className="mt-6 text-center text-emerald-700 font-medium">Commande déjà livrée.</p>
          )}
        </>
      )}
    </div>
  );
}
