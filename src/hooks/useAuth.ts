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
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
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
      // Usar uma localização padrão caso ocorra um erro
      const useDefaultLocation = (error: GeolocationPositionError) => {
        console.error('Erro ao obter localização:', error);
        // Usar localização padrão (centro de São Paulo)
        const defaultLocation: Location = {
          latitude: -23.5505,
          longitude: -46.6333,
          timestamp: new Date().toISOString()
        };
        updateLocation(defaultLocation);
      };

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString()
          };
          updateLocation(location);
        },
        useDefaultLocation,
        {
          enableHighAccuracy: true,
          timeout: 10000, // Aumentar o timeout para 10 segundos
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
      // Aumentar o timeout para 10 segundos para dar mais tempo para obter a localização
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Erro ao obter localização:', error);
      // Retornar uma localização padrão (centro de São Paulo) como fallback
      return {
        latitude: -23.5505,
        longitude: -46.6333,
        timestamp: new Date().toISOString()
      };
    }
  };

  const fetchProfile = async (userId: string, userType?: UserType): Promise<Profile | null> => {
    if (!userId) {
      console.error('UserId não fornecido para busca de perfil');
      return null;
    }

    const cachedProfile = localStorage.getItem('auth_profile');
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      if (parsed.id === userId) {
        return parsed;
      }
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
        
        // Buscar perfil específico baseado no tipo de usuário
        if (existingProfile.user_type === 'mechanic') {
          try {
            const { data: mechanicProfile } = await supabase
              .from('mechanic_profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            
            console.log('Perfil de mecânico encontrado:', mechanicProfile);
          } catch (err) {
            console.error('Erro ao buscar perfil de mecânico:', err);
          }
        } else if (existingProfile.user_type === 'tow') {
          try {
            const { data: towProfile } = await supabase
              .from('tow_truck_profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            
            console.log('Perfil de guincho encontrado:', towProfile);
          } catch (err) {
            console.error('Erro ao buscar perfil de guincho:', err);
          }
        } else if (existingProfile.user_type === 'insurance') {
          try {
            const { data: insuranceProfile } = await supabase
              .from('insurance_profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            
            console.log('Perfil de seguradora encontrado:', insuranceProfile);
          } catch (err) {
            console.error('Erro ao buscar perfil de seguradora:', err);
          }
        }
        
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

        // Armazenar dados no localStorage
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('profile', JSON.stringify(profile));

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

      // Armazenar dados no localStorage
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('profile', JSON.stringify(profile));

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
    console.log('Iniciando hook useAuth');

    const initializeAuth = async () => {
      if (!mounted || initialized) return;

      try {
        console.log('Iniciando processo de autenticação');
        setLoading(true);
        setError(null);

        // Verificar se já temos dados em cache
        const cachedUser = localStorage.getItem('user');
        const cachedProfile = localStorage.getItem('auth_profile');
        const cachedToken = localStorage.getItem('sb-auth-token');

        if (cachedUser && cachedProfile && cachedToken && mounted) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            const parsedProfile = JSON.parse(cachedProfile);
            const parsedToken = JSON.parse(cachedToken);

            // Verificar se o token não está expirado
            if (parsedToken.expires_at && new Date(parsedToken.expires_at) > new Date()) {
              console.log('Usando dados do cache');
              setUser(parsedUser);
              setProfile(parsedProfile);
              setInitialized(true);
              return;
            } else {
              console.log('Token expirado, limpando cache');
              localStorage.clear();
            }
          } catch (e) {
            console.log('Erro ao parsear cache:', e);
            localStorage.clear();
          }
        }

        // Se não temos cache válido, verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log('Sem sessão ativa');
          if (mounted) {
            setUser(null);
            setProfile(null);
            localStorage.clear();
            // Redirecionar para login apenas se não estiver já na página de login
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
              navigate('/login');
            }
          }
          return;
        }

        console.log('Sessão ativa encontrada, buscando perfil');
        const profile = await fetchProfile(session.user.id);
        
        if (profile && mounted) {
          setUser(session.user);
          setProfile(profile);
          localStorage.setItem('user', JSON.stringify(session.user));
          localStorage.setItem('auth_profile', JSON.stringify(profile));
          startLocationTracking();

          // Redirecionar para home se estiver na página de login
          const currentPath = window.location.pathname;
          if (currentPath.includes('/login') || currentPath.includes('/register')) {
            navigate('/');
          }
        }

      } catch (error: any) {
        console.error('Erro na inicialização:', error);
        setError(error.message);
        if (mounted) {
          setUser(null);
          setProfile(null);
          localStorage.clear();
          // Redirecionar para login em caso de erro
          navigate('/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticação:', event, session?.user?.id);
      
      if (!mounted) return;

      try {
        setError(null);

        if (event === 'SIGNED_OUT' || !session) {
          console.log('Usuário deslogado ou sessão expirada');
          setUser(null);
          setProfile(null);
          localStorage.clear();
          stopLocationTracking();
          navigate('/login');
          return;
        }

        if (event === 'INITIAL_SESSION' && !session?.user) {
          console.log('Sessão inicial sem usuário');
          setUser(null);
          setProfile(null);
          return;
        }

        if (session?.user) {
          console.log('Atualizando sessão do usuário');
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          if (profile && mounted) {
            setProfile(profile);
            localStorage.setItem('user', JSON.stringify(session.user));
            localStorage.setItem('auth_profile', JSON.stringify(profile));
            startLocationTracking();
          }
        }
      } catch (error: any) {
        console.error('Erro no listener de autenticação:', error);
        setError(error.message);
        if (mounted) {
          setUser(null);
          setProfile(null);
          localStorage.clear();
          navigate('/login');
        }
      }
    });

    // Iniciar processo de autenticação
    initializeAuth();

    return () => {
      console.log('Desmontando hook useAuth');
      mounted = false;
      subscription.unsubscribe();
      stopLocationTracking();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      setLoading(true);
      stopLocationTracking();
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      localStorage.clear(); // Limpar todo o localStorage
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user?.id) return;
    
    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

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
    error,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    updateLocation,
    setProfile,
    isAuthenticated: !!user,
    userType: profile?.user_type
  };
}