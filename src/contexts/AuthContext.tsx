'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider'; // Import useSupabase
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userType: string | null;
  userNome: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  userNome: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userNome, setUserNome] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase(); // Use provided client

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session?.user) {
          setUser(session.user);
          const { data: userData, error: profileError } = await supabase
            .from('profiles')
            .select('user_type, full_name')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile query error:', profileError);
            throw profileError;
          }

          setUserType(userData?.user_type || null);
          setUserNome(userData?.full_name || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('user_type, full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Profile query error on auth change:', error);
            } else {
              setUserType(data?.user_type || null);
              setUserNome(data?.full_name || null);
            }
          });
      } else {
        setUserType(null);
        setUserNome(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, userType, userNome, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};