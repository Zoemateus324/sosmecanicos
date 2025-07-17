'use client';

import { createBrowserClient } from '@supabase/ssr';
import React, { useState } from 'react';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { Database } from '@/types/supabase';

export default function SupabaseProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession:  null;
}) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
