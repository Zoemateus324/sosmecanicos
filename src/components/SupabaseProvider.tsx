"use client";

import { createContext, useContext, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const Context = createContext<SupabaseClient<Database>>(createClientComponentClient<Database>());

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
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};