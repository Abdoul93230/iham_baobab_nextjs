"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Camera } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Rechercher des produits..." 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Charger l'historique de recherche depuis localStorage
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  const performSearch = (query: string) => {
    // Ajouter à l'historique
    const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    
    // Fermer le dropdown
    setIsDropdownOpen(false);
    
    // Callback de recherche
    if (onSearch) {
      onSearch(query);
    }
    
    // Navigation (vous pouvez adapter selon votre routing)
    console.log("Recherche:", query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(prev => 
          prev < searchHistory.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < searchHistory.length) {
          const selectedQuery = searchHistory[activeIndex];
          setSearchQuery(selectedQuery);
          performSearch(selectedQuery);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleHistoryClick = (historyItem: string) => {
    setSearchQuery(historyItem);
    performSearch(historyItem);
  };

  const removeFromHistory = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const updatedHistory = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
    setIsDropdownOpen(false);
  };

  const filteredHistory = searchHistory.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={searchInputRef}
          className="border-2 text-[#30A08B] border-emerald-600 p-2 pr-24 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchHistory.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
          placeholder={placeholder}
          maxLength={45}
          aria-label="Search products"
        />
        
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <button
            type="button"
            className="p-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            aria-label="Camera search"
          >
            <Camera className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            className="p-2 bg-emerald-600 text-white rounded-full px-4 hover:bg-emerald-700 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Dropdown de l'historique */}
      {isDropdownOpen && (searchHistory.length > 0 || searchQuery) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {searchQuery && (
            <div className="px-4 py-2 border-b border-gray-100">
              <button
                onClick={() => performSearch(searchQuery)}
                className="w-full text-left flex items-center text-gray-700 hover:bg-gray-50 p-2 rounded"
              >
                <Search className="h-4 w-4 mr-3 text-emerald-600" />
                Rechercher "{searchQuery}"
              </button>
            </div>
          )}

          {filteredHistory.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Recherches récentes
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Effacer tout
                </button>
              </div>
              
              <div className="py-1">
                {filteredHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 flex items-center justify-between group cursor-pointer transition-colors ${
                      index === activeIndex ? "bg-emerald-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="flex items-center flex-1">
                      <Search className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="text-gray-700 truncate">{item}</span>
                    </div>
                    <button
                      onClick={(e) => removeFromHistory(e, item)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                      aria-label="Supprimer de l'historique"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
