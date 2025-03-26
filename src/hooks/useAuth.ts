import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type UserType = 'client' | 'mechanic' | 'insurance' | 'tow';

export type Profile = {
  id: string;
  email: string;
  user_type: UserType;
  full_name: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  last_location_update?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthUser = {
  user: any;
  profile: Profile | null;
};

export type Location = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type RegisterData = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  user_type: UserType;
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationWatcher, setLocationWatcher] = useState<number | null>(null);
  const navigate = useNavigate();

  const updateLocation = async (location: Location) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          last_location_update: location.timestamp
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar localização:', error);
        return;
      }

      // Atualizar o perfil local
      setProfile(prev => prev ? {
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        last_location_update: location.timestamp
      } : null);

    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocalização não suportada neste navegador');
      return;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString()
          };
          updateLocation(location);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setLocationWatcher(watchId);
    } catch (error) {
      console.error('Erro ao iniciar rastreamento de localização:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationWatcher !== null) {
      navigator.geolocation.clearWatch(locationWatcher);
      setLocationWatcher(null);
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      console.log('Geolocalização não suportada neste navegador');
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Usuário não permitiu acesso à localização');
      return null;
    }
  };

  const fetchProfile = async (userId: string, userType?: UserType): Promise<Profile | null> => {
    if (!userId) {
      console.error('UserId não fornecido para busca de perfil');
      return null;
    }

    try {
      console.log('Iniciando busca de perfil para userId:', userId);
      
      // Buscar perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        console.log('Perfil existente encontrado:', existingProfile);
        return existingProfile;
      }

      // Se não encontrou perfil e não foi fornecido um tipo de usuário
      if (!userType) {
        console.error('Tipo de usuário não fornecido para criar novo perfil');
        throw new Error('Tipo de usuário necessário para criar perfil');
      }

      console.log('Criando novo perfil com tipo:', userType);

      // Tentar obter localização (opcional)
      const location = await getCurrentLocation();

      // Buscar dados do usuário
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erro ao obter dados do usuário:', userError);
        throw userError;
      }

      if (!authUser) {
        console.error('Usuário não encontrado no Auth');
        throw new Error('Usuário não encontrado');
      }

      // Preparar dados do novo perfil
      const newProfileData = {
        id: userId,
        email: authUser.email || '',
        user_type: userType,
        full_name: authUser.user_metadata?.full_name || '',
        phone: authUser.user_metadata?.phone || '',
        address: '',
        // Incluir localização apenas se disponível
        ...(location && {
          latitude: location.latitude,
          longitude: location.longitude,
          last_location_update: location.timestamp
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Tentando criar novo perfil:', newProfileData);

      // Criar novo perfil
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        throw createError;
      }

      console.log('Novo perfil criado com sucesso:', newProfile);
      return newProfile;

    } catch (error: any) {
      console.error('Erro detalhado ao buscar/criar perfil:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  };

  const signUp = async (data: RegisterData): Promise<AuthUser | null> => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const profile = await fetchProfile(authData.user.id, data.user_type);
        if (!profile) {
          throw new Error('Não foi possível criar o perfil');
        }

        // Iniciar rastreamento de localização após registro bem-sucedido
        startLocationTracking();

        return { user: authData.user, profile };
      }

      return null;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      console.log('Iniciando login para:', email);
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Erro no login:', signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.error('Login bem-sucedido mas usuário não encontrado');
        return null;
      }

      console.log('Login bem-sucedido, buscando perfil');

      const profile = await fetchProfile(authData.user.id);
      
      if (!profile) {
        console.error('Perfil não encontrado após login');
        throw new Error('Não foi possível recuperar o perfil');
      }

      console.log('Perfil recuperado com sucesso:', profile);

      // Tentar iniciar rastreamento de localização (opcional)
      try {
        startLocationTracking();
      } catch (error) {
        console.log('Não foi possível iniciar rastreamento de localização');
      }

      return { user: authData.user, profile };
    } catch (error: any) {
      console.error('Erro completo no login:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Adicionar evento para quando o usuário sair da página
    const handleBeforeUnload = () => {
      supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Verificar se há uma sessão válida ao iniciar
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
            // Iniciar rastreamento de localização se houver sessão ativa
            startLocationTracking();
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
          // Iniciar rastreamento de localização quando o estado de autenticação mudar
          startLocationTracking();
        }
      } else if (mounted) {
        setUser(null);
        setProfile(null);
        // Parar rastreamento de localização quando o usuário deslogar
        stopLocationTracking();
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.data.subscription.unsubscribe();
      // Limpar o rastreamento de localização quando o componente for desmontado
      stopLocationTracking();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const signOut = async () => {
    try {
      // Parar rastreamento de localização antes de fazer logout
      stopLocationTracking();
      
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
    signUp,
    signOut,
    deleteAccount,
    isAuthenticated: !!user,
    userType: profile?.user_type,
    getCurrentLocation,
    updateLocation
  };
}