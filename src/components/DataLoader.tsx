"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getProducts,
  getCategories,
  getTypes,
  getProducts_Pubs,
  getProducts_Commentes,
} from "@/redux/productsSlice";
import { loadPanier } from "@/redux/panierSlice";
import { loadUser } from "@/redux/userSlice";

interface DataLoaderProps {
  children: React.ReactNode;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function DataLoader({ children }: DataLoaderProps) {
  const dispatch = useAppDispatch();
  const { data: products, categories, types, lastFetched } = useAppSelector(
    (state) => state.products
  );

  const hasData = products.length > 0 && categories.length > 0 && types.length > 0;
  const isCacheValid = !!lastFetched && Date.now() - lastFetched < CACHE_DURATION;

  useEffect(() => {
    dispatch(loadPanier());
    dispatch(loadUser());

    if (!hasData || !isCacheValid) {
      // Fire all requests in parallel — children render immediately,
      // components pick up data from Redux as it arrives.
      dispatch(getProducts());
      dispatch(getCategories());
      dispatch(getTypes());
      dispatch(getProducts_Pubs());
      dispatch(getProducts_Commentes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render children immediately — no blocking spinner on app load.
  // Individual components show their own loading skeletons.
  return <>{children}</>;
}
