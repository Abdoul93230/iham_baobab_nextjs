"use client";

import { Provider } from "react-redux";
import { store } from "./store";
// Jeton client ajouté automatiquement aux appels API (endpoints personnels protégés)
import "@/lib/axiosAuth";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
