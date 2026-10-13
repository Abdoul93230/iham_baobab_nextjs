"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LocateFixed, Loader2, MapPin, Search, X } from "lucide-react";
import { getBrowserPosition, getZones, nearestZone, searchZones, zoneLabel, ZoneV3 } from "@/lib/shippingV3";

interface ZoneSelectorProps {
  selectedZone: ZoneV3 | null;
  onSelect: (zone: ZoneV3, meta?: { location?: { lat: number; lng: number; accuracy: number } }) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Choix de la zone de livraison : quartier ou ville, recherche instantanée
 * (noms officiels et autres noms), ou position GPS → zone la plus proche.
 */
const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  selectedZone,
  onSelect,
  placeholder = "Quartier ou ville de livraison…",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [zones, setZones] = useState<ZoneV3[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [locating, setLocating] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open || zones.length) return;
    setLoading(true);
    getZones()
      .then(setZones)
      .catch(() => setError("Impossible de charger les zones. Vérifiez votre connexion."))
      .finally(() => setLoading(false));
  }, [open, zones.length]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const results = useMemo(() => searchZones(zones, q), [zones, q]);
  useEffect(() => setActive(0), [q]);

  const pick = (z: ZoneV3, meta?: { location?: { lat: number; lng: number; accuracy: number } }) => {
    onSelect(z, meta);
    setOpen(false);
    setQ("");
    setError("");
  };

  const locate = async () => {
    setLocating(true);
    setError("");
    try {
      const pos = await getBrowserPosition();
      const list = zones.length ? zones : await getZones();
      if (!zones.length) setZones(list);
      const z = nearestZone(list, pos);
      if (z) pick(z, { location: pos });
      else setError("Aucune zone proche trouvée : recherchez votre quartier ou votre ville.");
    } catch (e: any) {
      setError(e?.code === 1 ? "Autorisez l’accès à votre position, ou recherchez votre quartier." : "Position indisponible : recherchez votre quartier ou votre ville.");
    } finally {
      setLocating(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const sel = selectedZone ? zoneLabel(selectedZone) : null;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center gap-2.5 p-3 border rounded-xl bg-white text-left transition-colors ${open ? "border-[#30A08B] ring-2 ring-[#30A08B]/15" : "border-gray-200 hover:border-[#30A08B]"}`}
      >
        <MapPin className={`h-4 w-4 flex-shrink-0 ${sel ? "text-[#30A08B]" : "text-gray-400"}`} />
        <span className="flex-1 min-w-0">
          {sel ? (
            <>
              <span className="block text-sm font-medium text-gray-900 truncate">{sel.title}</span>
              {sel.subtitle ? <span className="block text-xs text-gray-500 truncate">{sel.subtitle}</span> : null}
            </>
          ) : (
            <span className="text-sm text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2.5 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ex. Yantala, Tessaoua, Konni…"
                autoFocus
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30A08B]/30 focus:border-[#30A08B]"
                role="combobox"
                aria-controls="zone-options"
                aria-expanded
              />
              {q ? (
                <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600" aria-label="Effacer">
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-[#30A08B] bg-[#30A08B]/5 hover:bg-[#30A08B]/10 rounded-lg transition-colors disabled:opacity-60"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              {locating ? "Localisation…" : "Utiliser ma position"}
            </button>
            {error ? <p className="text-xs text-amber-700 px-1">{error}</p> : null}
          </div>

          <ul id="zone-options" ref={listRef} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {loading ? (
              <li className="flex items-center justify-center gap-2 p-5 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#30A08B]" /> Chargement des zones…
              </li>
            ) : results.length ? (
              <>
                {!q ? <li className="px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Villes et communes · tapez votre quartier</li> : null}
                {results.map((z, i) => {
                  const l = zoneLabel(z);
                  const on = selectedZone?._id === z._id;
                  return (
                    <li key={z._id} data-idx={i} role="option" aria-selected={on}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => pick(z)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${i === active ? "bg-gray-50" : ""}`}
                      >
                        <MapPin className={`h-4 w-4 flex-shrink-0 ${z.type === "district" ? "text-[#30A08B]" : "text-[#B2905F]"}`} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-gray-900 truncate">{l.title}</span>
                          <span className="block text-xs text-gray-500 truncate">{l.subtitle}</span>
                        </span>
                        {on ? <Check className="h-4 w-4 text-[#30A08B]" /> : null}
                      </button>
                    </li>
                  );
                })}
              </>
            ) : (
              <li className="p-5 text-center text-sm text-gray-500">
                Aucune zone « {q} ».<br />
                <span className="text-xs">Choisissez la ville la plus proche : le livreur vous appellera.</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ZoneSelector;
