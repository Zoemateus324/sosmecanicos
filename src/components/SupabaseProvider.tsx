"use client";

import { createContext, useContext, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import SupabaseProvider, { useSupabase } from "@/components/SupabaseProvider";

const Context = createContext<SupabaseClient<Database> | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClientComponentClient<Database>());

  return (
    <Context.Provider value={supabase}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    
  }
  return context;
};