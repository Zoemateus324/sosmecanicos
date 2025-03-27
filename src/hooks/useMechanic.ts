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

  const getMechanicStats = async (mechanicId: string): Promise<MechanicStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mechanic_stats')
        .select('*')
        .eq('mechanic_id', mechanicId)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do mecânico:', error);
        setError(error.message);
        return null;
      }

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