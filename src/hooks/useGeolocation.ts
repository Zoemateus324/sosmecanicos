import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
};

export function useGeolocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Função para obter uma localização padrão (centro de São Paulo)
  const getDefaultLocation = useCallback((): LocationData => {
    console.log('Usando localização padrão (centro de São Paulo)');
    return {
      latitude: -23.5505,
      longitude: -46.6333,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Função para salvar localização no Supabase com cache
  const saveLocationToProfile = useCallback(async (location: LocationData, userId?: string) => {
    if (!userId) return;

    try {
      // Salvar no cache local
      localStorage.setItem('last_location', JSON.stringify(location));

      // Atualizar localização no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          last_location_update: location.timestamp
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Erro ao atualizar localização no perfil:', profileError);
        return;
      }

      // Atualizar localização nas estatísticas do mecânico
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (profileData?.user_type === 'mechanic') {
        const { error: statsError } = await supabase
        .from('mechanic_stats')
        .upsert([
          { 
            mechanic_id: userId,
            latitude: location.latitude,
            longitude: location.longitude,
            last_location_update: location.timestamp
          }
        ], {
          onConflict: 'mechanic_id',
          ignoreDuplicates: false
        });

        if (statsError) {
          console.error('Erro ao atualizar localização nas estatísticas:', statsError);
        }
      }
    } catch (err) {
      console.error('Erro ao salvar localização:', err);
    }
  }, []);

  // Função para salvar localização no histórico
  const saveLocationToHistory = useCallback(async (location: LocationData, userId?: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('location_history')
        .insert([
          {
            user_id: userId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            created_at: location.timestamp
          }
        ]);

      if (error) {
        console.error('Erro ao salvar no histórico de localizações:', error);
      }
    } catch (err) {
      console.error('Erro ao salvar no histórico:', err);
    }
  }, []);

  // Função para obter a localização atual
  const getCurrentLocation = useCallback(async (userId?: string) => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador');
      const defaultLocation = getDefaultLocation();
      if (userId) {
        await saveLocationToProfile(defaultLocation, userId);
      }
      return defaultLocation;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000, // Aumentado para 15 segundos
            maximumAge: 0
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      // Verificar precisão da localização
      if (position.coords.accuracy > 100) {
        console.warn('Precisão da localização baixa:', position.coords.accuracy);
      }

      setCurrentLocation(locationData);
      setLocationHistory(prev => [...prev, locationData]);

      // Salvar no perfil e histórico se userId for fornecido
      if (userId) {
        await saveLocationToProfile(locationData, userId);
        await saveLocationToHistory(locationData, userId);
      }

      return locationData;
    } catch (err: any) {
      console.error('Erro ao obter localização:', err);
      
      if (err.code === 1) {
        setPermissionDenied(true);
        setError('Permissão de localização negada');
      } else if (err.code === 2) {
        setError('Localização indisponível');
      } else if (err.code === 3) {
        setError('Tempo esgotado ao obter localização');
      } else {
        setError('Erro ao obter localização');
      }
      
      // Retornar localização padrão como fallback
      return getDefaultLocation();
    } finally {
      setLoading(false);
    }
  }, [getDefaultLocation, saveLocationToProfile, saveLocationToHistory]);

  // Função para parar o rastreamento
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Função para iniciar o rastreamento contínuo
  const startTracking = useCallback((userId?: string) => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador');
      // Usar localização padrão
      const defaultLocation = getDefaultLocation();
      setCurrentLocation(defaultLocation);
      if (userId) {
        saveLocationToProfile(defaultLocation, userId);
      }
      return;
    }

    if (watchId !== null) {
      // Já está rastreando
      return;
    }

    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        setCurrentLocation(locationData);
        setLocationHistory(prev => [...prev, locationData]);

        // Salvar no perfil e histórico se userId for fornecido
        if (userId) {
          saveLocationToProfile(locationData, userId);
          saveLocationToHistory(locationData, userId);
        }
      },
      (err) => {
        console.error('Erro no rastreamento:', err);
        
        if (err.code === 1) {
          setPermissionDenied(true);
          setError('Permissão de localização negada');
          // Usar localização padrão
          const defaultLocation = getDefaultLocation();
          setCurrentLocation(defaultLocation);
          if (userId) {
            saveLocationToProfile(defaultLocation, userId);
          }
          stopTracking();
        } else if (err.code === 2) {
          setError('Localização indisponível');
          // Usar localização padrão
          const defaultLocation = getDefaultLocation();
          setCurrentLocation(defaultLocation);
          if (userId) {
            saveLocationToProfile(defaultLocation, userId);
          }
        } else if (err.code === 3) {
          console.log('Tempo esgotado ao obter localização, usando localização padrão');
          setError(null); // Não mostrar erro para o usuário, apenas usar o fallback
          // Usar localização padrão
          const defaultLocation = getDefaultLocation();
          setCurrentLocation(defaultLocation);
          if (userId) {
            saveLocationToProfile(defaultLocation, userId);
          }
        } else {
          setError('Erro ao rastrear localização');
          // Usar localização padrão
          const defaultLocation = getDefaultLocation();
          setCurrentLocation(defaultLocation);
          if (userId) {
            saveLocationToProfile(defaultLocation, userId);
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  }, [watchId, saveLocationToProfile, saveLocationToHistory, setError, setCurrentLocation, setLocationHistory, setPermissionDenied, getDefaultLocation, setWatchId]);

  // Limpar o rastreamento ao desmontar o componente
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Função para obter o histórico de localizações do Supabase
  const fetchLocationHistory = useCallback(async (userId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico de localizações:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  }, []);

  return {
    currentLocation,
    locationHistory,
    loading,
    error,
    permissionDenied,
    isTracking: watchId !== null,
    getCurrentLocation,
    startTracking,
    stopTracking,
    fetchLocationHistory
  };
}