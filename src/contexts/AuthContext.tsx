"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/services/supabase";
import { Session, User } from '@supabase/supabase-js';

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

  // Busca sessão e tipo de usuário
  const loadSessionAndUserType = async (session: Session) => {
    setSession(session);

    if (session?.user) {
      const userType = await loadUserType(session);
      setUserType(userType);
    } else {
      setUserType(null);
    }

    setLoading(false);
  };

  const loadUserType = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user type:", error);
        return null;
      }

      return data?.user_type || null;
    } catch (error) {
      console.error("Error in loadUserType:", error);
      return null;
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

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await loadSessionAndUserType(session);
        } else {
          setSession(null);
          setUserType(null);
          setLoading(false);
        }
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
