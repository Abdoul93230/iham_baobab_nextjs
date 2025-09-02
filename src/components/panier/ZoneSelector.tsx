"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

interface Zone {
  _id: string;
  name: string;
  type: string;
  fullPath?: string;
  country?: string;
  region?: string;
  city?: string;
  isActive: boolean;
}

interface ZoneSelectorProps {
  selectedZone: Zone | null;
  onSelect: (zone: Zone) => void;
  placeholder?: string;
  className?: string;
}

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  selectedZone,
  onSelect,
  placeholder = "Sélectionner une zone...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchZones = async (query = "") => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BackendUrl}/api/shipping2/zones/search?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setZones(data.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des zones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchZones();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        fetchZones(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const handleSelect = (zone: Zone) => {
    onSelect(zone);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-[#30A08B] focus:border-[#30A08B] bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className={selectedZone ? "text-gray-900" : "text-gray-500"}>
            {selectedZone ? selectedZone.fullPath || selectedZone.name : placeholder}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-[#30A08B] focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#30A08B]"></div>
              </div>
            ) : zones.length > 0 ? (
              zones.map((zone) => (
                <div
                  key={zone._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSelect(zone)}
                >
                  <div className="font-medium text-gray-900">
                    {zone.fullPath || zone.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {zone.type} • {zone.country || zone.region}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "Aucune zone trouvée" : "Chargement..."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneSelector;
