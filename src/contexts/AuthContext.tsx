'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'sonner';

// Define interfaces
interface AuthContextProps {
  user: User | null;
  userNome: string | null;
  userType: string | null;
  setAuth: (authData: AuthState) => void;
}

interface AuthState {
  user: User | null;
  userNome: string | null;
  userType: string | null;
}

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Type guard for Supabase client
function isSupabaseInitialized(
  supabase: SupabaseClient | null
): supabase is SupabaseClient {
  return supabase !== null;
}

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    userNome: null,
    userType: null,
  });

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, tipo_usuario')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error.message);
        toast.error('Erro ao carregar perfil: ' + error.message, {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
        return;
      }

      if (data) {
        setAuth((prev) => ({
          ...prev,
          userNome: data.full_name || null,
          userType: data.tipo_usuario || null,
        }));
      }
    } catch (err: any) {
      console.error('Erro inesperado ao buscar perfil:', err.message);
      toast.error('Erro inesperado: ' + err.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    }
  };

  // Initialize auth state and listen for auth changes
  useEffect(() => {
    if (!isSupabaseInitialized(supabase)) {
      console.error('Supabase client is not initialized');
      return;
    }

    // Check initial session
    const initializeAuth = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao verificar sessão:', error.message);
          toast.error('Erro ao verificar sessão: ' + error.message, {
            style: { backgroundColor: '#EF4444', color: '#ffffff' },
          });
          return;
        }

        if (sessionData.session?.user) {
          setAuth((prev) => ({
            ...prev,
            user: sessionData.session.user,
          }));
          await fetchProfile(sessionData.session.user.id);
        }
      } catch (err: any) {
        console.error('Erro inesperado ao inicializar autenticação:', err.message);
        toast.error('Erro inesperado: ' + err.message, {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAuth((prev) => ({
        ...prev,
        user: session?.user || null,
        userNome: session?.user ? prev.userNome : null,
        userType: session?.user ? prev.userType : null,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}