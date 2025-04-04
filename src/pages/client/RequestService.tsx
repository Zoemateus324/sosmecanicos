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
  price_range?: {
    min: number;
    max: number;
  };
  average_price?: number;
  category: string;
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
  const [selectedService, setSelectedService] = useState<string>('');

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      // Buscar categorias de serviço com preços médios
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Formatar os dados
      const formattedServices = (categories || []).map(category => ({
        id: category.name,
        name: getCategoryName(category.name),
        description: category.description,
        price_range: category.price_range,
        average_price: category.average_price,
        category: category.name
      }));

      setServices(formattedServices);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError('Não foi possível carregar a lista de serviços disponíveis');
    } finally {
      setLoadingServices(false);
    }
  };

  // Função para formatar o nome da categoria
  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'revisao': 'Revisão Periódica',
      'oleo': 'Troca de Óleo',
      'freios': 'Manutenção dos Freios',
      'suspensao': 'Suspensão',
      'motor': 'Motor',
      'eletrica': 'Sistema Elétrico',
      'ar-condicionado': 'Ar Condicionado',
      'alinhamento': 'Alinhamento e Balanceamento',
      'embreagem': 'Embreagem',
      'escapamento': 'Escapamento',
      'injecao': 'Injeção Eletrônica',
      'radiador': 'Radiador',
      'outros': 'Outros Serviços'
    };
    return categories[category] || category;
  };

  // Função para formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Solicitar Serviço</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Veículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Veículo *
            </label>
            <select
              name="vehicle_id"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plate}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Serviço *
            </label>
            <select
              name="service_type"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            >
              <option value="">Selecione o tipo de serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                  {service.average_price ? ` - Média: ${formatPrice(service.average_price)}` : ''}
                </option>
              ))}
            </select>

            {/* Mostrar detalhes do serviço selecionado */}
            {selectedService && services.find(s => s.id === selectedService) && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {services.find(s => s.id === selectedService)?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {services.find(s => s.id === selectedService)?.description}
                </p>
                {services.find(s => s.id === selectedService)?.price_range && (
                  <p className="text-sm text-gray-600">
                    Faixa de preço: {formatPrice(services.find(s => s.id === selectedService)?.price_range?.min || 0)} - {formatPrice(services.find(s => s.id === selectedService)?.price_range?.max || 0)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Descrição do Problema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descreva o Problema *
            </label>
            <textarea
              name="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              rows={4}
              placeholder="Descreva o problema que está enfrentando com seu veículo..."
              required
            ></textarea>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização
            </label>
            {loadingLocation ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Obtendo sua localização...</span>
              </div>
            ) : location ? (
              <div className="text-sm text-gray-600">
                Localização obtida com sucesso!
              </div>
            ) : (
              <button
                type="button"
                onClick={getCurrentLocation}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Obter localização atual
              </button>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
              disabled={loading || loadingLocation}
            >
              {loading ? 'Enviando...' : 'Solicitar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default RequestService;