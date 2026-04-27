"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import Image from "next/image";
import { triggerNavProgress } from "@/components/NavigationProgress";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Rechercher un produit…",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allProducts = useSelector((state: any) => state.products.data || []);

  useEffect(() => {
    try {
      const h = localStorage.getItem("searchHistory");
      if (h) setSearchHistory(JSON.parse(h));
    } catch {}
  }, []);

  const doSearch = debounce((term: string) => {
    if (!term.trim()) { setSearchResults([]); return; }
    const results = allProducts
      .filter((p: any) =>
        p.name?.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 6);
    setSearchResults(results);
  }, 250);

  useEffect(() => {
    doSearch(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, allProducts]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "Escape") { setShowResults(false); inputRef.current?.blur(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const saveToHistory = (term: string) => {
    if (term.length < 2) return;
    const next = [term, ...searchHistory.filter((h) => h !== term)].slice(0, 5);
    setSearchHistory(next);
    try { localStorage.setItem("searchHistory", JSON.stringify(next)); } catch {}
  };

  const handleSubmit = (term = searchTerm) => {
    if (!term.trim()) return;
    saveToHistory(term.trim());
    setShowResults(false);
    triggerNavProgress();
    if (onSearch) onSearch(term.trim());
    else router.push(`/Search?q=${encodeURIComponent(term.trim())}`);
  };

  const handleProductClick = (productId: string) => {
    setShowResults(false);
    setSearchTerm("");
    triggerNavProgress();
    router.push(`/ProduitDetail/${productId}`);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try { localStorage.removeItem("searchHistory"); } catch {}
  };

  const showDropdown = showResults && (searchResults.length > 0 || (searchHistory.length > 0 && !searchTerm));

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Input row */}
      <div className="flex items-center h-10 sm:h-11 bg-gray-100 hover:bg-gray-50 border border-transparent hover:border-[#30A08B]/40 focus-within:bg-white focus-within:border-[#30A08B] rounded-full transition-all duration-200 overflow-hidden shadow-sm">
        <Search className="flex-shrink-0 ml-3 sm:ml-4 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent px-2 sm:px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(""); setSearchResults([]); inputRef.current?.focus(); }}
            className="flex-shrink-0 w-6 h-6 mr-1 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
          >
            <X size={13} />
          </button>
        )}
        <button
          onClick={() => handleSubmit()}
          className="flex-shrink-0 h-10 sm:h-11 px-3 sm:px-5 bg-[#30A08B] hover:bg-[#268070] text-white text-xs sm:text-sm font-bold transition-colors"
          style={{ borderRadius: "0 9999px 9999px 0" }}
        >
          <span className="hidden sm:inline">Chercher</span>
          <Search className="sm:hidden w-4 h-4" />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-popIn">
          {/* History (when no search term) */}
          {!searchTerm && searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={12} /> Recherches récentes
                </span>
                <button onClick={clearHistory} className="text-[10px] text-red-400 hover:text-red-600 font-medium">
                  Effacer
                </button>
              </div>
              <ul className="pb-2">
                {searchHistory.map((h) => (
                  <li key={h}>
                    <button
                      onClick={() => { setSearchTerm(h); handleSubmit(h); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#f0faf7] hover:text-[#30A08B] transition-colors text-left"
                    >
                      <Clock size={13} className="text-gray-300 flex-shrink-0" />
                      {h}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp size={12} /> Produits correspondants
                </span>
              </div>
              <ul className="pb-2">
                {searchResults.map((p) => {
                  const price = p.prixPromo || p.prix || 0;
                  const hasPromo = p.prixPromo && p.prixPromo < p.prix;
                  return (
                    <li key={p._id}>
                      <button
                        onClick={() => handleProductClick(p._id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f0faf7] transition-colors text-left"
                      >
                        {p.image1 && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image src={p.image1} alt={p.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-bold text-[#30A08B]">
                              {price.toLocaleString()} F
                            </span>
                            {hasPromo && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {p.prix.toLocaleString()} F
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* See all results */}
              <div className="border-t border-gray-50 px-4 py-2.5">
                <button
                  onClick={() => handleSubmit()}
                  className="text-sm text-[#30A08B] font-semibold hover:underline flex items-center gap-1"
                >
                  Voir tous les résultats pour "{searchTerm}" →
                </button>
              </div>
            </div>
          )}

          {/* No results */}
          {searchTerm && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">Aucun résultat pour <strong>"{searchTerm}"</strong></p>
              <button onClick={() => handleSubmit()} className="mt-2 text-xs text-[#30A08B] font-semibold hover:underline">
                Rechercher quand même →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
