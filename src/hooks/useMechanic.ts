import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type MechanicStats = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  last_location_update: string | null;
  specialties: string[];
  rating: number;
  total_services: number;
  available: boolean;
};

export function useMechanic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const createMechanicStats = async (mechanicId: string): Promise<MechanicStats | null> => {
    try {
      console.log('Criando estatísticas iniciais para o mecânico:', mechanicId);
      
      // Verificar se o perfil existe e se já tem estatísticas
      const { data: existingStats, error: statsError } = await supabase
        .from('mechanic_stats')
        .select('*')
        .eq('mechanic_id', mechanicId)
        .maybeSingle();
      
      if (statsError) {
        console.error('Erro ao verificar estatísticas existentes:', statsError);
        setError(statsError.message);
        return null;
      }
      
      if (existingStats) {
        console.log('Estatísticas já existem para o mecânico');
        return existingStats;
      }

      // Verificar se o perfil existe
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', mechanicId)
        .single();
      
      if (profileError) {
        console.error('Erro ao verificar perfil do mecânico:', profileError);
        setError(profileError.message);
        return null;
      }
      
      if (!profileData) {
        console.error('Perfil do mecânico não encontrado');
        setError('Perfil do mecânico não encontrado');
        return null;
      }
      
      // Inserir registro inicial na tabela mechanic_stats
      const { data, error } = await supabase
        .from('mechanic_stats')
        .insert([
          { 
            mechanic_id: mechanicId,
            completed_services: 0,
            average_rating: 0,
            total_earnings: 0,
            latitude: profileData.latitude || null,
            longitude: profileData.longitude || null,
            available: true,
            last_location_update: profileData.last_location_update || null
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar estatísticas do mecânico:', error);
        setError(error.message);
        return null;
      }
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar estatísticas do mecânico:', err);
      setError(err.message);
      return null;
    }
  };

  const getMechanicStats = async (mechanicId: string): Promise<MechanicStats | null> => {
    try {
      setLoading(true);
      setError(null);

      // Tentar obter dados do cache local primeiro
      const cachedData = localStorage.getItem(`mechanic_stats_${mechanicId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsedData.timestamp;
        // Usar cache se tiver menos de 5 minutos
        if (cacheAge < 300000) {
          return parsedData.data;
        }
      }

      const { data, error } = await supabase
        .from('mechanic_stats')
        .select('*, profiles!inner(*)')
        .eq('mechanic_id', mechanicId)
        .single();

      if (error) {
        console.log('Erro ao buscar estatísticas:', error.message);
        
        // Se o erro for porque não encontrou resultados, tenta criar um novo registro
        if (error.code === 'PGRST116') {
          const newStats = await createMechanicStats(mechanicId);
          if (newStats) {
            // Salvar no cache local
            localStorage.setItem(`mechanic_stats_${mechanicId}`, JSON.stringify({
              data: newStats,
              timestamp: Date.now()
            }));
          }
          return newStats;
        }
        
        setError(error.message);
        return null;
      }

      // Salvar no cache local
      localStorage.setItem(`mechanic_stats_${mechanicId}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      return data;
    } catch (err: any) {
      console.error('Erro ao buscar dados do mecânico:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMechanicProfile = async (data: Partial<MechanicStats>) => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('mechanics')
        .update({
          specialties: data.specialties,
          available: data.available
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil do mecânico:', error);
        setError(error.message);
        return null;
      }

      // Buscar dados atualizados
      return getMechanicStats(user.id);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil do mecânico:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getNearbyMechanics = async (
    latitude: number,
    longitude: number,
    radius: number = 10 // raio em km
  ): Promise<MechanicStats[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_nearby_mechanics', {
          user_latitude: latitude,
          user_longitude: longitude,
          radius_km: radius
        });

      if (error) {
        console.error('Erro ao buscar mecânicos próximos:', error);
        setError(error.message);
        return [];
      }

      return data || [];
    } catch (err: any) {
      console.error('Erro ao buscar mecânicos próximos:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMechanicStats,
    updateMechanicProfile,
    getNearbyMechanics
  };
}