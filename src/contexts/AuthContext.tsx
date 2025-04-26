"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createComponentClient } from "@/models/supabase"; // Verifique a importação do Supabase
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  userType: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userType: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Agora criamos o supabase corretamente aqui dentro
  const supabase = createComponentClient();

  const loadUserType = async (session: Session) => {
    try {
      console.log("Fetching user type for ID:", session.user.id);
      
      // Buscar o perfil do usuário
      const { data, error } = await supabase
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data?.tipo_usuario || null;
    } catch (error) {
      console.error("Error in loadUserType:", error);
      return null;
    }
  };

  const loadSessionAndUserType = async (session: Session) => {
    try {
      console.log("Loading session and user type for:", session.user.email);
      setSession(session);

      if (session?.user) {
        const userType = await loadUserType(session);
        setUserType(userType);
      } else {
        setUserType(null);
      }
    } catch (error) {
      console.error("Error in loadSessionAndUserType:", error);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await loadSessionAndUserType(session);
      } else {
        setSession(null);
        setUserType(null);
        setLoading(false);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await loadSessionAndUserType(session);
      } else {
        setSession(null);
        setUserType(null);
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]); // Adicionado supabase na dependência do useEffect

  return (
    <AuthContext.Provider value={{ session, userType, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
