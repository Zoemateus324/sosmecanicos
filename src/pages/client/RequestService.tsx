import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';
import { Loader2, AlertCircle, ArrowLeft, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  vehicle_type: string;
  year: number;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_time: number;
  category?: string;
}

function RequestService() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from('mechanic_services')
        .select('id, name, description, price, estimated_time, category')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError('Não foi possível carregar a lista de serviços disponíveis');
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      fetchServices();
      fetchVehicles();
      getCurrentLocation();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchVehicles = async () => {
    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      const validVehicles = (data || []).filter((vehicle): vehicle is Vehicle => {
        return Boolean(
          vehicle &&
          vehicle.id &&
          vehicle.plate &&
          vehicle.model &&
          vehicle.brand &&
          vehicle.year
        );
      });

      setVehicles(validVehicles);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      setError('Não foi possível carregar seus veículos');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        setError('Não foi possível obter sua localização');
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const formData = new FormData(e.currentTarget);
      const vehicleId = formData.get('vehicle_id') as string;
      const description = formData.get('description') as string;
      const serviceType = formData.get('service_type') as string;

      if (!vehicleId) {
        throw new Error('Por favor, selecione um veículo');
      }

      if (!serviceType) {
        throw new Error('Por favor, selecione o tipo de serviço');
      }

      if (!description.trim()) {
        throw new Error('Por favor, descreva o problema');
      }

      if (!location) {
        throw new Error('Por favor, permita o acesso à sua localização');
      }

      const selectedService = services.find(service => service.id === serviceType);
      if (!selectedService) {
        throw new Error('Serviço selecionado não encontrado');
      }

      const serviceRequest = {
        user_id: user.id,
        vehicle_id: vehicleId,
        service_type: selectedService.name,
        service_id: selectedService.id,
        description: description.trim(),
        status: 'pending',
        quote_status: 'pending',
        scheduled_date: new Date(),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          address: 'Localização atual'
        } : null
      };

      const { error: insertError } = await supabase
        .from('service_requests')
        .insert([serviceRequest])
        .select()
        .single();

      if (insertError) {
        throw new Error('Erro ao criar solicitação de serviço');
      }

      navigate('/client/dashboard');
    } catch (err) {
      console.error('Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar solicitação de serviço');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitar Serviço
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {!vehicles || vehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Você ainda não tem veículos cadastrados
              </p>
              <button
                onClick={() => navigate('/client/vehicles/add')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                Adicionar Veículo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o Veículo *
                </label>
                <select
                  id="vehicle_id"
                  name="vehicle_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Selecione um veículo</option>
                  {vehicles.map(vehicle => vehicle && (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - Placa: {vehicle.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Serviço *
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Selecione o tipo de serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} - {service.estimated_time} min
                    </option>
                  ))}
                  {loadingServices && (
                    <option disabled>Carregando serviços...</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descreva o Problema *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  placeholder="Descreva o problema que está enfrentando com seu veículo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {loadingLocation ? (
                      'Obtendo sua localização...'
                    ) : location ? (
                      'Localização obtida com sucesso!'
                    ) : (
                      'Aguardando permissão de localização'
                    )}
                  </span>
                  {!location && !loadingLocation && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="ml-2 text-yellow-500 hover:text-yellow-600"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/client/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !location}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Enviando...
                    </span>
                  ) : (
                    'Solicitar Serviço'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default RequestService;