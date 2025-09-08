import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";

interface UseCategoryDataResult {
  category: any;
  types: any[];
  products: any[];
  comments: any[];
  isLoading: boolean;
  error: string | null;
}

export const useCategoryData = (categoryParam: string): UseCategoryDataResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redux selectors
  const DATA_Products = useAppSelector((state: any) => state.products.data);
  const DATA_Types = useAppSelector((state: any) => state.products.types);
  const DATA_Categories = useAppSelector((state: any) => state.products.categories);
  const DATA_Commentes = useAppSelector((state: any) => state.products.products_Commentes)?.data;

  // Derived data
  const category = DATA_Categories?.find((item: any) => item.name === categoryParam);
  
  const types = DATA_Types?.filter(
    (type: any) => type.clefCategories === category?._id
  ) || [];

  const products = DATA_Products?.filter((item: any) =>
    types.some((type: any) => item.ClefType === type._id)
  ) || [];

  const comments = DATA_Commentes?.filter((comment: any) =>
    types.some((type: any) => type._id === comment.clefType)
  ) || [];

  useEffect(() => {
    // Vérifier si toutes les données principales sont disponibles
    if (DATA_Products && DATA_Types && DATA_Categories) {
      if (!category) {
        setError(`Catégorie "${categoryParam}" non trouvée`);
      } else if (types.length === 0) {
        setError(`Aucun type trouvé pour la catégorie "${categoryParam}"`);
      } else {
        setError(null);
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setError(null);
    }
  }, [categoryParam, DATA_Products, DATA_Types, DATA_Categories, category, types.length]);

  return {
    category,
    types,
    products,
    comments,
    isLoading,
    error,
  };
};
