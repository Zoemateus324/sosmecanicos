import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type Profile = {
  id: string;
  user_id: string;
  user_type: 'client' | 'mechanic' | 'insurance' | 'tow';
  full_name: string;
  phone?: string;
  address?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
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
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      if (!mounted) return;
      setLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          
          if (!mounted) return;
          
          if (profile) {
            setProfile(profile);
          } else {
            console.error('Erro: Perfil não encontrado');
            await signOut();
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

    const setupAuthSubscription = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        setLoading(true);

        try {
          if (session?.user) {
            setUser(session.user);
            const profile = await fetchProfile(session.user.id);
            
            if (!mounted) return;
            
            if (profile) {
              setProfile(profile);
            } else {
              console.error('Erro: Falha ao recuperar perfil');
              await signOut();
              return;
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          console.error('Erro durante mudança de autenticação:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      });

      authSubscription = subscription;
    };

    initialize();
    setupAuthSubscription();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
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
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!profile) {
        console.log('Perfil não encontrado, criando novo...');
        
        const userData = await supabase.auth.getUser();
        const userMetadata = userData.data.user?.user_metadata;

        // Tentar obter localização
        let latitude = null;
        let longitude = null;
        
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.warn('Não foi possível obter localização:', error);
        }

        const newProfileData = {
          user_id: userId,
          user_type: userMetadata?.user_type || 'client',
          full_name: userMetadata?.full_name || '',
          email: userData.data.user?.email || '',
          phone: '',
          address: '',
          latitude,
          longitude
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          return null;
        }

        console.log('Novo perfil criado:', newProfile);
        return newProfile;
      }

      console.log('Perfil encontrado:', profile);
      return profile;
    } catch (error) {
      console.error('Erro ao buscar/criar perfil:', error);
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
        if (!profile) {
          throw new Error('Não foi possível recuperar ou criar o perfil');
        }
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

  const deleteAccount = async () => {
    if (!user?.id) return;
    
    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError);
        throw profileError;
      }

      // Then delete the user
      const { error: userError } = await supabase.auth.admin.deleteUser(user.id);

      if (userError) {
        console.error('Erro ao deletar usuário:', userError);
        throw userError;
      }

      // Clear local state and redirect
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    deleteAccount,
    isAuthenticated: !!user,
    userType: profile?.user_type,
  };
}