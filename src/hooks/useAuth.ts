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
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data as Profile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        setAuthState({
          user: data.user,
          profile,
          loading: false,
          isAuthenticated: true,
        });
        return { user: data.user, profile };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log('Verificando sessão...');
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
          console.log('Nenhuma sessão ativa encontrada.');
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
      console.log('Evento de autenticação:', event);
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
        console.log('Usuário deslogado ou sessão não encontrada.');
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
    userType: authState.profile?.user_type || null,
    signIn,
    signOut
  };
} 