import { useState, useEffect } from 'react';
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

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
  });

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Buscando perfil para userId:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, user_type, full_name, phone, address, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!data) {
        console.log('Nenhum perfil encontrado para o usuário');
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data as Profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              isAuthenticated: false,
            });
          }
          return;
        }

        if (session?.user) {
          console.log('Sessão encontrada para userId:', session.user.id);
          const profile = await fetchProfile(session.user.id);
          
          if (mounted) {
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              isAuthenticated: true,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              loading: false,
              isAuthenticated: false,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        console.log('Mudança de estado de autenticação para userId:', session.user.id);
        const profile = await fetchProfile(session.user.id);
        setAuthState({
          user: session.user,
          profile,
          loading: false,
          isAuthenticated: true,
        });
      } else if (mounted) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    userType: authState.profile?.user_type || null
  };
} 