import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export type UserType = 'client' | 'mechanic' | 'insurance' | 'tow' | null;

export interface Profile {
  id: string;
  email: string;
  user_type: UserType;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setUser(session.user);
        
        const userProfile = await fetchProfile(session.user.id);
        
        if (!mounted) return;

        if (userProfile) {
          setProfile(userProfile);
          setIsAuthenticated(true);
        } else {
          setProfile(null);
          setIsAuthenticated(false);
        }

      } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        
        if (userProfile) {
          setProfile(userProfile);
          setIsAuthenticated(true);
        } else {
          setProfile(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    userType: profile?.user_type || null
  };
} 