import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type Profile = {
  id: string;
  user_type: 'client' | 'mechanic' | 'insurance' | 'tow';
  full_name: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthUser = {
  user: any;
  profile: Profile | null;
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profile);
            if (!profile) {
              console.error('Erro: Perfil não pôde ser criado ou recuperado');
              await signOut();
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    // Inscrever-se para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticação:', event);
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const profile = await fetchProfile(session.user.id);
        
        if (mounted) {
          if (profile) {
            setProfile(profile);
          } else {
            console.error('Erro: Falha ao recuperar ou criar perfil');
            await signOut();
            return;
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);



  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!userId) {
      console.error('UserId não fornecido para busca de perfil');
      return null;
    }

    try {
      console.log('Buscando perfil para userId:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, user_type, full_name, phone, address, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!profile) {
        console.log('Perfil não encontrado, criando novo...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              user_type: 'client',
              full_name: '',
              email: user?.email || ''
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          setLoading(false);
          return null;
        }

        return newProfile;
      }

      console.log('Perfil encontrado:', profile);
      return profile;
    } catch (error) {
      console.error('Erro ao buscar/criar perfil:', error);
      setLoading(false);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        return { user: data.user, profile };
      }

      return null;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    userType: profile?.user_type,
  };
}