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
        console.error("Error fetching profile:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Se o perfil não existir, retornar null
        if (error.code === 'PGRST116') {
          console.log("Profile not found, user needs to register");
        }
        return null;
      }

      if (!data || !data.tipo_usuario) {
        console.log("Invalid profile data:", data);
        return null;
      }

      console.log("Profile data found:", data);
      return data.tipo_usuario;
    } catch (error) {
      console.error("Error in loadUserType:", error);
      return null;
    }
  };

  // Busca sessão e tipo de usuário
  const loadSessionAndUserType = async (session: Session) => {
    try {
      console.log("Loading session and user type for:", session.user.email);
      setSession(session);

      if (session?.user) {
        const userType = await loadUserType(session);
        console.log("User type loaded:", userType);
        
        // Se não encontrar o tipo de usuário, fazer logout
        if (!userType) {
          console.log("No user type found, logging out");
          await supabase.auth.signOut();
          setSession(null);
          setUserType(null);
          // Usar window.location para navegação
          window.location.href = '/cadastro';
          return;
        }

        setUserType(userType);
      } else {
        console.log("No user in session");
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
      try {
        console.log("Initializing auth...");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        console.log("Session retrieved:", session ? "Yes" : "No");
        
        if (session) {
          await loadSessionAndUserType(session);
        } else {
          setSession(null);
          setUserType(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in initAuth:", error);
        setSession(null);
        setUserType(null);
        setLoading(false);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event);
        try {
          if (session) {
            await loadSessionAndUserType(session);
          } else {
            setSession(null);
            setUserType(null);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
