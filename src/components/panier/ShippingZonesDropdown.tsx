"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";

interface Zone {
  name: string;
  baseFee: number;
  weightFee: number;
}

interface ShippingZonesDropdownProps {
  zones?: Zone[];
}

const ShippingZonesDropdown: React.FC<ShippingZonesDropdownProps> = ({ zones }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!zones || zones.length === 0) {
    return (
      <div className="text-xs text-gray-500 mt-1">
        <MapPin className="h-3 w-3 inline mr-1" />
        Aucune zone de livraison configurée
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-xs text-gray-600 hover:text-[#30A08B] transition-colors"
      >
        <MapPin className="h-3 w-3 mr-1" />
        <span>Zones de livraison ({zones.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 bg-gray-50 rounded p-2 text-xs">
          {zones.map((zone, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-700">{zone.name}</span>
              <div className="text-right">
                <div className="text-gray-600">Base: {zone.baseFee} F CFA</div>
                <div className="text-gray-600">Poids: {zone.weightFee} F CFA/kg</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingZonesDropdown;