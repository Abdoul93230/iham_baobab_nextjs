"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchPublicConfig, selectActiveEvents } from "@/redux/gamificationSlice";
import { selectUser } from "@/redux/userSlice";
import { Zap, X, Clock } from "lucide-react";

function useCountdown(endDate: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setLabel(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h > 48) {
        const d = Math.floor(h / 24);
        setLabel(`${d}j`);
      } else {
        setLabel(`${h}h${String(m).padStart(2, "0")}`);
      }
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [endDate]);

  return label;
}

function EventCard({ event, onDismiss }: { event: any; onDismiss: () => void }) {
  const countdown = useCountdown(event.endDate);
  const typeLabels: Record<string, string> = {
    PURCHASE: "achats", CHECKIN: "check-in", REVIEW: "avis", FIRST_ORDER: "1ère commande",
  };
  const typesText = event.applicableTypes?.length
    ? event.applicableTypes.map((t: string) => typeLabels[t] || t).join(", ")
    : "tous les gains";

  return (
    <div className="relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white shadow-md overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Zap size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">
          ×{event.multiplier} BP — {event.name}
        </p>
        <p className="text-xs opacity-85 truncate">
          {event.description || `${typesText}`}
          {countdown && <span className="ml-2 opacity-75 flex-shrink-0 inline-flex items-center gap-0.5"><Clock size={10} className="inline" /> {countdown}</span>}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function EventBanner() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const activeEvents = useSelector(selectActiveEvents);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchPublicConfig());
  }, [dispatch]);

  const visible = (activeEvents || []).filter((e) => !dismissed.has(e.name));
  if (!visible.length) return null;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 mt-3 space-y-2">
      {visible.map((evt) => (
        <EventCard
          key={evt.name}
          event={evt}
          onDismiss={() => setDismissed((prev) => new Set([...prev, evt.name]))}
        />
      ))}
    </div>
  );
}
