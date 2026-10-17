"use client";

/**
 * Messagerie boutiques — API + connexion temps réel partagée (namespace Socket.IO /messaging).
 * La plateforme reste l'intermédiaire : le client écrit à la boutique, l'équipe répond en son nom.
 */
import axios from "axios";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { io, Socket } from "socket.io-client";
import { AuthService } from "./auth";

const API = process.env.NEXT_PUBLIC_Backend_Url || "";

export interface StoreInfo { id: string; name: string; logo: string | null; active?: boolean }
export interface MessageCard { kind: "product" | "order"; id: string | null; title: string; image?: string | null; price?: number; subtitle?: string }
export interface ChatMessage {
  id: string;
  conversationId?: string;
  from: "client" | "store" | "system";
  text: string;
  attachments: string[];
  audio?: { url: string | null; durationMs: number } | null;
  localUrl?: string;
  card: MessageCard | null;
  signature?: string;
  createdAt: string;
  readAt: string | null;
  clientTempId?: string | null;
  pending?: boolean;
  failed?: boolean;
}
export interface ConversationSummary {
  id: string;
  store: StoreInfo | null;
  lastMessage: { text: string; from: string; at: string | null };
  unread: number;
  updatedAt: string;
}

export const currentToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const t = AuthService.getToken();
  if (t) return t;
  try {
    return JSON.parse(localStorage.getItem("userEcomme") || "null")?.token || null;
  } catch {
    return null;
  }
};
const auth = () => ({ headers: { Authorization: `Bearer ${currentToken()}` } });

export const messagingApi = {
  open: (body: { sellerId: string; productId?: string; orderId?: string }) =>
    axios.post(`${API}/api/messaging/conversations`, body, auth()).then((r) => r.data as { conversation: ConversationSummary; context: MessageCard | null; storeOnline: boolean }),
  get: (id: string) => axios.get(`${API}/api/messaging/conversations/${id}`, auth()).then((r) => r.data as { conversation: ConversationSummary; storeOnline: boolean }),
  list: () => axios.get(`${API}/api/messaging/conversations`, { ...auth(), params: { limit: 50 } }).then((r) => (r.data.data || []) as ConversationSummary[]),
  messages: (id: string, before?: string) =>
    axios.get(`${API}/api/messaging/conversations/${id}/messages`, { ...auth(), params: { before, limit: 30 } }).then((r) => (r.data.data || []) as ChatMessage[]),
  send: (id: string, body: Record<string, unknown>) => axios.post(`${API}/api/messaging/conversations/${id}/messages`, body, auth()).then((r) => r.data.message as ChatMessage),
  read: (id: string) => axios.put(`${API}/api/messaging/conversations/${id}/read`, {}, auth()).catch(() => {}),
  archive: (id: string) => axios.delete(`${API}/api/messaging/conversations/${id}`, auth()),
  unread: () => axios.get(`${API}/api/messaging/unread`, auth()).then((r) => Number(r.data.count) || 0),
  uploadAudio: (blob: Blob) => {
    const ext = /mp4/.test(blob.type) ? "m4a" : /ogg/.test(blob.type) ? "ogg" : "webm";
    const fd = new FormData();
    fd.append("audio", blob, `vocal-${Date.now()}.${ext}`);
    return axios.post(`${API}/api/messaging/upload-audio`, fd, { ...auth(), timeout: 90000 }).then((r) => r.data as { url: string; durationMs: number });
  },
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return axios.post(`${API}/api/messaging/upload`, fd, auth()).then((r) => r.data.url as string);
  },
};

// ─── Connexion partagée ────────────────────────────────────────────────────────
type Handler = (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
let socket: Socket | null = null;
let socketToken: string | null = null;
const listeners = new Map<string, Set<Handler>>();
const EVENTS = ["message:new", "message:read", "conversation:updated", "typing", "unread:count", "store:presence"];

let state = { connected: false, unread: 0 };
const subs = new Set<() => void>();
const setState = (patch: Partial<typeof state>) => { state = { ...state, ...patch }; subs.forEach((f) => f()); };
const SERVER_STATE = { connected: false, unread: 0 };

export function connectMessaging(): Socket | null {
  const token = currentToken();
  if (!token) { disconnectMessaging(); return null; }
  if (socket && socketToken === token) return socket;
  disconnectMessaging();
  socketToken = token;
  socket = io(`${API}/messaging`, { auth: { token }, transports: ["websocket", "polling"], reconnectionDelayMax: 10000 });
  socket.on("connect", () => setState({ connected: true }));
  socket.on("disconnect", (reason) => {
    setState({ connected: false });
    if (reason === "io server disconnect") setTimeout(() => socket?.connect(), 2000);
  });
  socket.on("unread:count", ({ count }) => setState({ unread: Number(count) || 0 }));
  EVENTS.forEach((ev) => socket!.on(ev, (d) => listeners.get(ev)?.forEach((fn) => { try { fn(d); } catch { /* composant démonté */ } })));
  return socket;
}

export function disconnectMessaging() {
  socket?.removeAllListeners();
  socket?.close();
  socket = null;
  socketToken = null;
  setState({ connected: false, unread: 0 });
}

export const emit = (event: string, payload: unknown) => { if (socket?.connected) socket.emit(event, payload); };
export function emitWithAck<T = any>(event: string, payload: unknown, ms = 10000): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error("offline"));
    socket.timeout(ms).emit(event, payload, (err: unknown, res: T) => (err ? reject(err) : resolve(res)));
  });
}
export const setUnread = (n: number) => setState({ unread: Math.max(0, n || 0) });

export function useMessagingState() {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => state, () => SERVER_STATE);
}

export function useMessagingEvents(handlers: Record<string, Handler>) {
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    const wrapped: Record<string, Handler> = {};
    Object.keys(ref.current).forEach((ev) => {
      wrapped[ev] = (d) => ref.current[ev]?.(d);
      if (!listeners.has(ev)) listeners.set(ev, new Set());
      listeners.get(ev)!.add(wrapped[ev]);
    });
    return () => Object.entries(wrapped).forEach(([ev, fn]) => listeners.get(ev)?.delete(fn));
  }, []);
}

/** Ouvre la connexion pour le client connecté et charge ses non-lus */
export function useMessagingConnection(userId?: string | null) {
  useEffect(() => {
    if (!userId) { disconnectMessaging(); return; }
    connectMessaging();
    messagingApi.unread().then(setUnread).catch(() => {});
  }, [userId]);
}

/** Lien vers la conversation avec une boutique (connexion demandée au besoin par la page) */
export const contactStoreHref = (p: { sellerId: string; productId?: string; orderId?: string }) => {
  const q = new URLSearchParams({ seller: p.sellerId });
  if (p.productId) q.set("product", p.productId);
  if (p.orderId) q.set("order", p.orderId);
  return `/Messagerie?${q.toString()}`;
};

export const fcfa = (n?: number) => `${Number(n || 0).toLocaleString("fr-FR")} F`;
