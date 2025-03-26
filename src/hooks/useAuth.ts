import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type Profile = {
  id: string;
  email: string;
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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!userId) {
      console.error('UserId não fornecido para busca de perfil');
      return null;
    }

    try {
      console.log('Buscando perfil para userId:', userId);
      
      // Verificar se o perfil existe com tratamento de erro mais robusto
      let existingProfile: Profile | null = null;
      
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId);

        if (error) {
          console.error('Erro ao buscar perfis:', error);
        } else {
          existingProfile = profiles && profiles.length > 0 ? profiles[0] : null;
          
          if (existingProfile) {
            console.log('Perfil encontrado:', existingProfile);
            return existingProfile;
          }
        }
      } catch (fetchError) {
        console.error('Exceção ao buscar perfil:', fetchError);
      }

      // Se chegou aqui, o perfil não existe ou houve erro ao buscar
      console.log('Perfil não encontrado ou erro na busca, tentando criar novo...');
      
      let userData;
      try {
        userData = await supabase.auth.getUser();
      } catch (userError) {
        console.error('Erro ao obter dados do usuário:', userError);
        return null;
      }
      
      const userEmail = userData.data.user?.email || '';
      const userMetadata = userData.data.user?.user_metadata || {};

      const newProfileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'> = {
        email: userEmail,
        user_type: 'client',
        full_name: userMetadata.full_name || '',
        phone: userMetadata.phone || '',
        address: ''
      };

      try {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, ...newProfileData }])
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          if (createError.code === '23505') {
            console.log('Possível conflito de perfil, tentando buscar novamente...');
          } else {
            console.error('Erro desconhecido ao criar perfil:', createError);
          }
        } else if (newProfile) {
          console.log('Novo perfil criado com sucesso:', newProfile);
          return newProfile;
        }
      } catch (createError) {
        console.error('Exceção ao criar perfil:', createError);
      }
      
      // Última tentativa: buscar o perfil novamente
      try {
        console.log('Tentando buscar perfil novamente após tentativa de criação...');
        const { data: retryProfiles, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId);
          
        if (retryError) {
          console.error('Erro na busca final de perfil:', retryError);
          return null;
        }
        
        if (retryProfiles && retryProfiles.length > 0) {
          console.log('Perfil encontrado na busca final:', retryProfiles[0]);
          return retryProfiles[0];
        }
      } catch (finalError) {
        console.error('Erro fatal na busca final de perfil:', finalError);
      }
      
      console.error('Não foi possível recuperar ou criar um perfil após múltiplas tentativas');
      return null;
    } catch (error) {
      console.error('Erro geral ao buscar/criar perfil:', error);
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