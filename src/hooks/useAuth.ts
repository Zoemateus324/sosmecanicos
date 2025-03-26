import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type Profile = {
  id?: string;
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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!userId) {
      console.error('UserId não fornecido para busca de perfil');
      return null;
    }

    try {
      console.log('Buscando perfil para userId:', userId);
      
      // Verificar se o perfil existe usando single() em vez de maybeSingle()
      // para evitar erros 400 quando não encontrar o perfil
      const { data: profiles, error: countError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      if (countError) {
        console.error('Erro ao buscar perfis:', countError);
        throw countError;
      }

      const existingProfile = profiles && profiles.length > 0 ? profiles[0] : null;

      // Se o perfil não existe, criar um novo
      if (!existingProfile) {
        console.log('Perfil não encontrado, criando novo...');
        
        const userData = await supabase.auth.getUser();
        const userEmail = userData.data.user?.email || '';
        const userMetadata = userData.data.user?.user_metadata || {};

        // Tentar obter localização
        let latitude: number | undefined;
        let longitude: number | undefined;
        
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.warn('Não foi possível obter localização:', error);
        }

        const newProfileData: Profile = {
          user_id: userId,
          user_type: 'client',
          full_name: userMetadata.full_name || '',
          email: userEmail,
          phone: userMetadata.phone || '',
          address: '',
          latitude,
          longitude
        };

        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfileData])
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            throw createError;
          }

          console.log('Novo perfil criado:', newProfile);
          return newProfile;
        } catch (createError) {
          console.error('Erro ao criar perfil:', createError);
          // Tentar buscar o perfil novamente em caso de erro de duplicação
          const { data: retryProfiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId);
            
          if (retryProfiles && retryProfiles.length > 0) {
            console.log('Perfil encontrado após erro de criação:', retryProfiles[0]);
            return retryProfiles[0];
          }
          return null;
        }
      }

      // Se o perfil existe, retorná-lo diretamente
      console.log('Perfil encontrado:', existingProfile);
      return existingProfile;
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

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log('Verificando sessão...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          console.log('Sessão encontrada:', session.user.id);
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          if (profile && mounted) {
            setProfile(profile);
          }
        } else {
          console.log('Nenhuma sessão ativa encontrada');
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticação:', event);
      
      if (session?.user && mounted) {
        setUser(session.user);
        const profile = await fetchProfile(session.user.id);
        if (profile && mounted) {
          setProfile(profile);
        }
      } else if (mounted) {
        setUser(null);
        setProfile(null);
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.data.subscription.unsubscribe();
    };
  }, []);

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