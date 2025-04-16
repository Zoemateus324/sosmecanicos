"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/services/supabase";

type AuthContextType = {
  session: any;
  userType: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userType: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca sessão e tipo de usuário
  const loadSessionAndUserType = async (session: any) => {
    setSession(session);

    if (session?.user) {
      const { data, error } = await supabase
        .from("usuarios") // ajuste para o nome correto da sua tabela
        .select("tipo")
        .eq("id", session.user.id)
        .single();

      if (!error && data) {
        setUserType(data.tipo); // Ex: "seguradora", "cliente", etc.
      } else {
        setUserType(null);
      }
    } else {
      setUserType(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await loadSessionAndUserType(session);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await loadSessionAndUserType(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, userType, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
