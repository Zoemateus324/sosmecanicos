"use client";

import { createContext, useContext, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

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