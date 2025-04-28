"use client";

import { createComponentClient } from "@/models/supabase";
import { createContext, useContext, ReactNode } from "react";

const SupabaseContext = createContext<any>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createComponentClient();
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}