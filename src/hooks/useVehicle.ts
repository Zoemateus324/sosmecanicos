import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type Vehicle = {
  id: string;
  user_id: string;
  type: 'car' | 'motorcycle' | 'truck' | 'other';
  plate: string;
  model: string;
  year: number;
  created_at?: string;
  updated_at?: string;
};

export function useVehicle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createVehicle = async (data: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .insert([{
          user_id: user.id,
          ...data
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar veículo:', error);
        setError(error.message);
        return null;
      }

      return vehicle;
    } catch (err: any) {
      console.error('Erro ao criar veículo:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserVehicles = async (): Promise<Vehicle[]> => {
    if (!user?.id) return [];

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar veículos:', error);
        setError(error.message);
        return [];
      }

      return data || [];
    } catch (err: any) {
      console.error('Erro ao buscar veículos:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id) // Garantir que o veículo pertence ao usuário
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar veículo:', error);
        setError(error.message);
        return null;
      }

      return vehicle;
    } catch (err: any) {
      console.error('Erro ao atualizar veículo:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que o veículo pertence ao usuário

      if (error) {
        console.error('Erro ao excluir veículo:', error);
        setError(error.message);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Erro ao excluir veículo:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createVehicle,
    getUserVehicles,
    updateVehicle,
    deleteVehicle
  };
} 