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
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

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

  const createProfile = async (userId: string, email: string) => {
    try {
      const newProfile = {
        id: userId,
        email,
        user_type: 'client' as UserType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        // 1. Verifica a sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setUserType(null);
          setProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // 2. Atualiza o usuário
        setUser(session.user);

        // 3. Busca o perfil
        let userProfile = await fetchProfile(session.user.id);

        // 4. Se não existe perfil, cria um novo
        if (!userProfile) {
          userProfile = await createProfile(session.user.id, session.user.email!);
        }

        if (!mounted) return;

        // 5. Atualiza o estado com o perfil
        if (userProfile) {
          setProfile(userProfile);
          setUserType(userProfile.user_type);
          setIsAuthenticated(true);
        } else {
          setProfile(null);
          setUserType(null);
          setIsAuthenticated(false);
        }

      } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
        if (mounted) {
          setUser(null);
          setUserType(null);
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

    // Configura o listener de mudança de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        setupAuth();
      } else {
        setUser(null);
        setUserType(null);
        setProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    userType,
    loading,
    isAuthenticated,
    profile
  };
} 