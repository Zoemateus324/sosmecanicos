'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'sonner';

// Define interfaces
interface AuthUser {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userNome: string | null;
  userType: string | null;
  loading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  userNome: null,
  userType: null,
  loading: true,
});

// Type guard for Supabase client
function isSupabaseInitialized(
  supabase: SupabaseClient | null
): supabase is SupabaseClient {
  return supabase !== null;
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userNome, setUserNome] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const getUser = async (userId: string) => {
    if (!isSupabaseInitialized(supabase)) {
      console.error('Supabase client is not initialized');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile query error:', error);
        throw error;
      }

      if (data) {
        setUserNome(data.full_name || 'Usuário');
        setUserType(data.user_type || null);
      } else {
        console.warn('No user found with ID:', userId);
        setUserNome('Usuário');
        setUserType(null);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      toast.error('Erro ao carregar perfil do usuário: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    }
  };

  // Handle auth state changes
  useEffect(() => {
    if (!isSupabaseInitialized(supabase)) {
      console.error('Supabase client is not initialized');
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error checking session:', sessionError.message);
          throw sessionError;
        }

        if (sessionData.session) {
          const authUser = sessionData.session.user;
          setUser({
            id: authUser.id,
            email: authUser.email,
          });
          await getUser(authUser.id);
        } else {
          setUser(null);
          setUserNome(null);
          setUserType(null);
          router.push('/login');
        }
      } catch (error: any) {
        console.error('Error in auth check:', error.message);
        setUser(null);
        setUserNome(null);
        setUserType(null);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      try {
        if (session) {
          const authUser = session.user;
          setUser({
            id: authUser.id,
            email: authUser.email,
          });
          await getUser(authUser.id);
        } else {
          setUser(null);
          setUserNome(null);
          setUserType(null);
          router.push('/login');
        }
      } catch (error: any) {
        console.error('Profile query error on auth change:', error);
        toast.error('Erro ao atualizar perfil: ' + error.message, {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ user, userNome, userType, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}