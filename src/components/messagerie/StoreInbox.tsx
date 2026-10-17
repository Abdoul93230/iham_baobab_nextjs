"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Headphones, ImageIcon, Loader2, Package, Receipt, Send, ShieldCheck, Store, WifiOff, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import {
  ChatMessage, ConversationSummary, MessageCard, StoreInfo,
  emit, emitWithAck, fcfa, messagingApi, setUnread, useMessagingConnection, useMessagingEvents, useMessagingState,
} from "@/lib/messaging";

const STARTERS = ["Est-il toujours disponible ?", "Quels sont les délais de livraison ?", "Avez-vous d'autres tailles ou couleurs ?", "Pouvez-vous me montrer plus de photos ?"];

const when = (d?: string | null) => {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const y = new Date(); y.setDate(now.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};
const dayLabel = (d: string) => {
  const date = new Date(d);
  const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === y.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};
const tempId = () => `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function StoreAvatar({ store, size = 44 }: { store: StoreInfo | null; size?: number }) {
  const name = store?.name || "Boutique";
  return store?.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={store.logo} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
  ) : (
    <div style={{ width: size, height: size }} className="rounded-full bg-[#E8F5F2] text-[#1F7A69] font-bold flex items-center justify-center shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function CardView({ card }: { card: MessageCard | null }) {
  if (!card?.id) return null;
  const href = card.kind === "product" ? `/ProduitDetail/${card.id}` : `/commandes/${card.id}`;
  const Icon = card.kind === "order" ? Receipt : Package;
  return (
    <Link href={href} className="flex items-center gap-2.5 p-2 mb-1.5 rounded-xl bg-white border border-black/5 text-gray-800 hover:bg-gray-50 min-w-[220px]">
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
      ) : <div className="w-12 h-12 rounded-lg bg-[#E8F5F2] flex items-center justify-center"><Icon className="w-5 h-5 text-[#1F7A69]" /></div>}
      <div className="min-w-0">
        <p className="text-xs font-semibold line-clamp-2">{card.title}</p>
        {card.subtitle ? <p className="text-[11px] text-gray-500 truncate">{card.subtitle}</p> : null}
        <p className="text-xs font-bold text-[#1F7A69]">{fcfa(card.price)}</p>
      </div>
    </Link>
  );
}

// ─── Fil de discussion ─────────────────────────────────────────────────────────
function Chat({ conversationId, initialContext, initialOnline, onBack }: {
  conversationId: string; initialContext: MessageCard | null; initialOnline: boolean; onBack: () => void;
}) {
  const { connected } = useMessagingState();
  const [conv, setConv] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // ordre chronologique
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<MessageCard | null>(initialContext);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(initialOnline);
  const [storeTyping, setStoreTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const storeTypingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ conversation, storeOnline }, rows] = await Promise.all([messagingApi.get(conversationId), messagingApi.messages(conversationId)]);
      setConv(conversation);
      setOnline((o) => o || storeOnline);
      setMessages(rows.reverse());
      setHasMore(rows.length >= 30);
      messagingApi.read(conversationId);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e?.response?.data?.message || "Impossible d'ouvrir la conversation.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { load(); }, [load]);

  // Conversation à l'écran : pas de notification, lecture immédiate
  useEffect(() => {
    if (!connected) return;
    emit("conversation:view", { conversationId });
    const onVis = () => emit(document.visibilityState === "visible" ? "conversation:view" : "conversation:leave", { conversationId });
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); emit("conversation:leave", {}); };
  }, [connected, conversationId]);

  useMessagingEvents({
    "message:new": ({ conversationId: cid, message }: { conversationId: string; message: ChatMessage }) => {
      if (cid !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        const i = message.clientTempId ? prev.findIndex((m) => m.clientTempId === message.clientTempId) : -1;
        if (i >= 0) { const n = [...prev]; n[i] = message; return n; }
        return [...prev, message];
      });
      if (message.from === "store") {
        setStoreTyping(false);
        if (document.visibilityState === "visible") messagingApi.read(conversationId);
      }
    },
    "message:read": ({ conversationId: cid, by, at }: { conversationId: string; by: string; at: string }) => {
      if (cid !== conversationId || by !== "store") return;
      setMessages((prev) => prev.map((m) => (m.from === "client" && !m.readAt && !m.pending ? { ...m, readAt: at } : m)));
    },
    typing: ({ conversationId: cid, typing, from }: { conversationId: string; typing: boolean; from: string }) => {
      if (cid !== conversationId || from !== "store") return;
      setStoreTyping(typing);
      clearTimeout(storeTypingTimer.current);
      if (typing) storeTypingTimer.current = setTimeout(() => setStoreTyping(false), 8000);
    },
    "store:presence": ({ sellerId, online: on }: { sellerId: string; online: boolean }) => {
      if (conv?.store?.id === sellerId) setOnline(on);
    },
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [messages.length, storeTyping]);

  const loadOlder = async () => {
    const first = messages.find((m) => !m.pending && !m.failed);
    if (!first) return;
    const rows = await messagingApi.messages(conversationId, first.id).catch(() => []);
    setMessages((prev) => [...rows.reverse(), ...prev]);
    setHasMore(rows.length >= 30);
  };

  const deliver = async (msg: ChatMessage) => {
    const body = {
      text: msg.text, attachments: msg.attachments, clientTempId: msg.clientTempId,
      productId: msg.card?.kind === "product" ? msg.card.id : undefined,
      orderId: msg.card?.kind === "order" ? msg.card.id : undefined,
    };
    try {
      let saved: ChatMessage;
      try {
        const ack = await emitWithAck<{ ok: boolean; message: ChatMessage; error?: string }>("message:send", { conversationId, ...body });
        if (!ack?.ok) throw new Error(ack?.error);
        saved = ack.message;
      } catch {
        saved = await messagingApi.send(conversationId, body); // repli HTTP
      }
      setMessages((prev) => prev.map((m) => (m.clientTempId === msg.clientTempId ? saved : m)));
    } catch {
      setMessages((prev) => prev.map((m) => (m.clientTempId === msg.clientTempId ? { ...m, pending: false, failed: true } : m)));
    }
  };

  const send = (value = text, attachments: string[] = []) => {
    const message = value.trim();
    if (!message && !attachments.length) return;
    const id = tempId();
    const msg: ChatMessage = { id, clientTempId: id, from: "client", text: message, attachments, card: context, createdAt: new Date().toISOString(), readAt: null, pending: true };
    setMessages((prev) => [...prev, msg]);
    setText("");
    setContext(null);
    emit("typing:stop", { conversationId });
    deliver(msg);
  };

  const onType = (v: string) => {
    setText(v);
    emit("typing:start", { conversationId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emit("typing:stop", { conversationId }), 2500);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try { send(text, [await messagingApi.upload(file)]); } catch { alert("Photo non envoyée. Vérifiez votre connexion."); } finally { setUploading(false); }
  };

  const store = conv?.store || null;
  const lastMine = [...messages].reverse().find((m) => m.from === "client" && !m.pending && !m.failed);

  const rows = useMemo(() => {
    const out: Array<{ kind: "day"; key: string; date: string } | { kind: "msg"; key: string; m: ChatMessage }> = [];
    let last = "";
    messages.forEach((m) => {
      const d = new Date(m.createdAt).toDateString();
      if (d !== last) { out.push({ kind: "day", key: `d-${d}`, date: m.createdAt }); last = d; }
      out.push({ kind: "msg", key: m.id, m });
    });
    return out;
  }, [messages]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#30A08B]" /></div>;
  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm text-gray-600">{error}</p>
      <button onClick={load} className="px-4 py-2 rounded-full bg-[#30A08B] text-white text-sm font-semibold">Réessayer</button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={onBack} className="md:hidden p-1.5 rounded-full hover:bg-gray-100" aria-label="Retour"><ArrowLeft className="w-5 h-5" /></button>
        <Link href={store ? `/boutique/${encodeURIComponent(store.name)}` : "#"} className="flex items-center gap-3 min-w-0 flex-1">
          <StoreAvatar store={store} size={40} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{store?.name || "Boutique"}</p>
            <p className={`text-xs flex items-center gap-1.5 ${storeTyping ? "text-[#30A08B]" : "text-gray-500"}`}>
              {online || storeTyping ? <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> : null}
              {storeTyping ? "écrit…" : online ? "En ligne" : "Vous répond ici dès que possible"}
            </p>
          </div>
        </Link>
        {!connected ? <WifiOff className="w-4 h-4 text-gray-400" aria-label="Reconnexion…" /> : null}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#FAFAF8]">
        <div className="flex gap-2 items-start p-3 mb-3 rounded-2xl bg-[#E8F5F2] text-[#0F3D34] text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#1F7A69]" />
          <p>Échangez et payez uniquement sur Ihambaobab : votre achat reste protégé. Les numéros et liens externes sont masqués.</p>
        </div>
        {hasMore ? <div className="text-center mb-2"><button onClick={loadOlder} className="text-xs text-[#1F7A69] font-semibold hover:underline">Messages plus anciens</button></div> : null}
        {rows.map((r) => r.kind === "day" ? (
          <p key={r.key} className="text-center text-[11px] text-gray-400 my-3 capitalize">{dayLabel(r.date)}</p>
        ) : (
          <div key={r.key} className={`flex my-1 ${r.m.from === "client" ? "justify-end" : "justify-start"}`}>
            <div
              onClick={r.m.failed ? () => { setMessages((p) => p.map((x) => x.id === r.m.id ? { ...x, failed: false, pending: true } : x)); deliver(r.m); } : undefined}
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${r.m.from === "client" ? "bg-[#30A08B] text-white rounded-br-md" : "bg-white border border-gray-100 text-gray-900 rounded-bl-md"} ${r.m.pending ? "opacity-70" : ""} ${r.m.failed ? "ring-2 ring-red-400 cursor-pointer" : ""}`}
            >
              <CardView card={r.m.card} />
              {r.m.attachments?.map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" className="rounded-xl mb-1.5 max-h-64 object-cover" /></a>
              ))}
              {r.m.text ? <p className="text-sm whitespace-pre-wrap break-words">{r.m.text}</p> : null}
              {r.m.from === "store" && r.m.signature ? <p className="text-[11px] text-gray-400 mt-1">— {r.m.signature}</p> : null}
              <p className={`text-[10px] mt-0.5 text-right ${r.m.from === "client" ? "text-white/75" : "text-gray-400"}`}>
                {r.m.failed ? "Non envoyé · cliquer pour réessayer" : r.m.pending ? "Envoi…" : when(r.m.createdAt)}
                {lastMine?.id === r.m.id ? (r.m.readAt ? " · Lu" : " · Envoyé") : ""}
              </p>
            </div>
          </div>
        ))}
        {storeTyping ? <div className="flex my-1"><div className="bg-white border border-gray-100 rounded-2xl px-3 py-2 text-xs text-gray-500 italic">{store?.name} écrit…</div></div> : null}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-2 px-4 pb-2 bg-[#FAFAF8]">
          {STARTERS.map((s) => <button key={s} onClick={() => send(s)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#E8F5F2] text-[#1F7A69] hover:bg-[#d6eee8]">{s}</button>)}
        </div>
      ) : null}

      {/* Aperçu de l'article joint au prochain message */}
      {context ? (
        <div className="px-4 pt-2 pb-1 bg-white border-t border-gray-100">
          <p className="text-[11px] text-gray-500 mb-1.5">{context.kind === "order" ? "Commande jointe à votre message" : "Article joint à votre message"}</p>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#E8F5F2] border-l-4 border-[#30A08B]">
            {context.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={context.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center">
                {context.kind === "order" ? <Receipt className="w-5 h-5 text-[#1F7A69]" /> : <Package className="w-5 h-5 text-[#1F7A69]" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2">{context.title}</p>
              {context.subtitle ? <p className="text-xs text-gray-500 truncate">{context.subtitle}</p> : null}
              <p className="text-sm font-bold text-[#1F7A69]">{fcfa(context.price)}</p>
            </div>
            <button onClick={() => setContext(null)} className="p-1.5 rounded-full bg-white hover:bg-gray-100" aria-label="Retirer l'article"><X className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-100">
        <label className={`p-2.5 rounded-full hover:bg-gray-100 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`} title="Envoyer une photo">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : <ImageIcon className="w-5 h-5 text-gray-500" />}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        <textarea
          value={text}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={Math.min(4, Math.max(1, text.split("\n").length))}
          maxLength={2000}
          placeholder={`Écrire à ${store?.name || "la boutique"}…`}
          className="flex-1 resize-none text-sm rounded-2xl px-4 py-2.5 bg-[#FAFAF8] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30"
        />
        <button onClick={() => send()} disabled={!text.trim()} className="p-2.5 rounded-full bg-[#30A08B] text-white disabled:opacity-40" aria-label="Envoyer">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Boîte de réception ────────────────────────────────────────────────────────
export default function StoreInbox() {
  const { user } = useAuth();
  const userId = (user as { id?: string; _id?: string } | null)?.id || (user as { _id?: string } | null)?._id || null;
  const router = useRouter();
  const sp = useSearchParams();
  const activeId = sp.get("c");
  const [list, setList] = useState<ConversationSummary[] | null>(null);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<{ id: string; context: MessageCard | null; online: boolean } | null>(null);
  const [typing, setTyping] = useState<Record<string, boolean>>({});

  useMessagingConnection(userId);

  const loadList = useCallback(async () => {
    try {
      const rows = await messagingApi.list();
      setList(rows);
      setUnread(rows.reduce((s, c) => s + (c.unread || 0), 0));
    } catch { setList((l) => l || []); }
  }, []);
  useEffect(() => { if (userId) loadList(); }, [userId, loadList]);

  // Arrivée depuis « Contacter la boutique » (?seller=&product=|order=)
  const seller = sp.get("seller");
  useEffect(() => {
    if (!userId || !seller) return;
    setOpening(true);
    setOpenError(null);
    messagingApi.open({ sellerId: seller, productId: sp.get("product") || undefined, orderId: sp.get("order") || undefined })
      .then((r) => {
        setCtx({ id: r.conversation.id, context: r.context, online: r.storeOnline });
        router.replace(`/Messagerie?c=${r.conversation.id}`);
        loadList();
      })
      .catch((e) => setOpenError(e?.response?.data?.message || "Impossible de contacter la boutique."))
      .finally(() => setOpening(false));
  }, [userId, seller]); // eslint-disable-line react-hooks/exhaustive-deps

  useMessagingEvents({
    "conversation:updated": (c: ConversationSummary) => setList((prev) => (prev ? [c.id === activeId ? { ...c, unread: 0 } : c, ...prev.filter((x) => x.id !== c.id)] : prev)),
    typing: ({ conversationId, typing: on, from }: { conversationId: string; typing: boolean; from: string }) => {
      if (from === "store") setTyping((t) => ({ ...t, [conversationId]: on }));
    },
  });

  useEffect(() => { if (activeId) setList((prev) => prev?.map((x) => (x.id === activeId ? { ...x, unread: 0 } : x)) || prev); }, [activeId]);

  return (
    <div className="flex-1 flex min-h-0 max-w-6xl w-full mx-auto md:my-4 bg-white md:rounded-2xl md:border md:border-gray-200 overflow-hidden" style={{ height: "calc(100dvh - 9rem)" }}>
      <aside className={`${activeId || seller ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100`}>
        <div className="px-4 py-3 border-b border-gray-100"><h1 className="text-lg font-bold text-gray-900">Messages</h1></div>
        <div className="flex-1 overflow-y-auto">
          <Link href="/Messagerie/support" className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
            <div className="w-11 h-11 rounded-full bg-[#30A08B] flex items-center justify-center"><Headphones className="w-5 h-5 text-white" /></div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Support Ihambaobab</p>
              <p className="text-xs text-gray-500 truncate">Commande, paiement, livraison : on vous aide</p>
            </div>
          </Link>
          {list?.length ? <p className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-gray-400">BOUTIQUES</p> : null}
          {list === null ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
          ) : list.length === 0 ? (
            <div className="text-center px-8 py-10">
              <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-sm">Une question sur un produit ?</p>
              <p className="text-xs text-gray-500 mt-1">Cliquez sur « Contacter la boutique » depuis une fiche produit : la discussion apparaîtra ici.</p>
            </div>
          ) : list.map((c) => (
            <button key={c.id} onClick={() => router.push(`/Messagerie?c=${c.id}`)} className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 ${c.id === activeId ? "bg-[#E8F5F2]" : "hover:bg-gray-50"}`}>
              <StoreAvatar store={c.store} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className={`truncate text-sm ${c.unread ? "font-bold" : "font-semibold"} text-gray-900`}>{c.store?.name || "Boutique"}</p>
                  <span className={`text-[11px] shrink-0 ${c.unread ? "text-[#30A08B]" : "text-gray-400"}`}>{when(c.lastMessage?.at || c.updatedAt)}</span>
                </div>
                <div className="flex justify-between gap-2 items-center">
                  <p className={`text-xs truncate ${typing[c.id] ? "text-[#30A08B] italic" : c.unread ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                    {typing[c.id] ? "écrit…" : `${c.lastMessage?.from === "client" ? "Vous : " : ""}${c.lastMessage?.text || ""}`}
                  </p>
                  {c.unread ? <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#30A08B] text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span> : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className={`${activeId || seller ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col`}>
        {opening ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#30A08B]" /></div>
        ) : openError ? (
          <div className="flex-1 flex items-center justify-center text-sm text-red-600 p-8 text-center">{openError}</div>
        ) : activeId ? (
          <Chat
            key={activeId}
            conversationId={activeId}
            initialContext={ctx?.id === activeId ? ctx.context : null}
            initialOnline={ctx?.id === activeId ? ctx.online : false}
            onBack={() => router.push("/Messagerie")}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10 bg-[#FAFAF8]">
            <Store className="w-10 h-10 text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700">Vos conversations avec les boutiques</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Posez vos questions avant d'acheter, suivez une commande : les boutiques vous répondent ici.</p>
          </div>
        )}
      </section>
    </div>
  );
}
