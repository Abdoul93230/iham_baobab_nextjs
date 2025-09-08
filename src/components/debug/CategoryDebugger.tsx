"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";

interface CategoryDebuggerProps {
  categoryParam: string;
}

export const CategoryDebugger: React.FC<CategoryDebuggerProps> = ({ categoryParam }) => {
  const DATA_Products = useAppSelector((state: any) => state.products.data);
  const DATA_Types = useAppSelector((state: any) => state.products.types);
  const DATA_Categories = useAppSelector((state: any) => state.products.categories);

  // Debug de développement seulement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const ClefCate = DATA_Categories?.find((item: any) => item.name === categoryParam);
  const typeesInCategory = DATA_Types?.filter(
    (type: any) => type.clefCategories === ClefCate?._id
  );
  const productsInCategory = DATA_Products?.filter((item: any) =>
    DATA_Types?.some(
      (type: any) =>
        type.clefCategories === ClefCate?._id &&
        item.ClefType === type._id
    )
  );

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Debug Catégorie: {categoryParam}</h3>
      
      <div className="text-xs space-y-1">
        <div>
          <strong>Catégorie trouvée:</strong> {ClefCate ? `✅ ${ClefCate.name} (${ClefCate._id})` : '❌ Non trouvée'}
        </div>
        
        <div>
          <strong>Types dans cette catégorie:</strong> {typeesInCategory?.length || 0}
          {typeesInCategory?.length > 0 && (
            <ul className="ml-2">
              {typeesInCategory.slice(0, 3).map((type: any) => (
                <li key={type._id} className="text-xs">• {type.name}</li>
              ))}
              {typeesInCategory.length > 3 && <li className="text-xs">• ... et {typeesInCategory.length - 3} autres</li>}
            </ul>
          )}
        </div>
        
        <div>
          <strong>Produits trouvés:</strong> {productsInCategory?.length || 0}
        </div>
        
        <div>
          <strong>Total données:</strong>
          <ul className="ml-2">
            <li>Produits: {DATA_Products?.length || 0}</li>
            <li>Catégories: {DATA_Categories?.length || 0}</li>
            <li>Types: {DATA_Types?.length || 0}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryDebugger;
