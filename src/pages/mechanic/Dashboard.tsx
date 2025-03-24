import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Wrench, MapPin, Clock, AlertCircle, CheckCircle2, DollarSign, X } from 'lucide-react';

interface ServiceRequest {
  id: string;
  user_id: string;
  vehicle_id: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  created_at: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  client: {
    id: string;
    full_name: string;
    phone: string;
  };
  vehicle: {
    id: string;
    model: string;
    plate: string;
    year: string;
  };
}

interface ServiceStats {
  completed: number;
  rating: number;
  earnings: number;
}

interface QuoteModalProps {
  request: ServiceRequest;
  onClose: () => void;
  onSubmit: (requestId: string, quote: number, description: string) => Promise<void>;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ request, onClose, onSubmit }) => {
  const [quote, setQuote] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !description) return;

    setLoading(true);
    try {
      await onSubmit(request.id, Number(quote), description);
      onClose();
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enviar Orçamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium">Detalhes do Serviço</h3>
          <p className="text-sm text-gray-600 mt-1">Veículo: {request.vehicle.model} - {request.vehicle.plate}</p>
          <p className="text-sm text-gray-600">Problema: {request.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Orçamento (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Serviço
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-gray-900 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Orçamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [nearbyRequests, setNearbyRequests] = useState<ServiceRequest[]>([]);
  const [activeServices, setActiveServices] = useState<ServiceRequest[]>([]);
  const [mechanicLocation, setMechanicLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [stats, setStats] = useState<ServiceStats>({
    completed: 0,
    rating: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }

    const requestLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Localização obtida:', position.coords);
            setMechanicLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            fetchData(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            // Mesmo sem localização, ainda busca as solicitações
            fetchData(null, null);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        console.error('Geolocalização não suportada');
        fetchData(null, null);
      }
    };

    if (isAuthenticated) {
      requestLocation();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Função para calcular distância entre dois pontos usando a fórmula de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em km
  };

  const fetchData = async (mechanicLat: number | null, mechanicLng: number | null) => {
    try {
      if (!user?.id) {
        console.error('Usuário não autenticado');
        return;
      }

      // Buscar solicitações próximas
      const { data: nearbyData, error: nearbyError } = await supabase
        .from('service_requests')
        .select(`
          id,
          user_id,
          vehicle_id,
          description,
          status,
          created_at,
          location,
          client:user_id(
            id,
            full_name,
            phone
          ),
          vehicle:vehicles!inner(
            id,
            model,
            plate,
            year
          )
        `)
        .eq('status', 'pending')
        .is('mechanic_id', null)
        .order('created_at', { ascending: false })
        .returns<{
          id: string;
          user_id: string;
          vehicle_id: string;
          description: string;
          status: string;
          created_at: string;
          location: { latitude: number; longitude: number; address: string };
          client: { 
            id: string; 
            full_name: string;
            phone: string;
          };
          vehicle: { 
            id: string; 
            model: string; 
            plate: string; 
            year: string;
          };
        }[]>();

      if (nearbyError) {
        console.error('Erro ao buscar solicitações:', nearbyError);
        throw nearbyError;
      }
      
      console.log('Solicitações encontradas:', nearbyData);
      
      // Filtra solicitações válidas
      const validRequests = (nearbyData || []).filter((request) => {
        console.log('Validando solicitação:', request);
        
        const isValid = Boolean(
          request &&
          request.id &&
          request.description &&
          request.location &&
          request.client &&
          request.vehicle
        );

        if (!isValid) {
          console.log('Solicitação inválida. Campos:', {
            hasRequest: Boolean(request),
            hasId: Boolean(request?.id),
            hasDescription: Boolean(request?.description),
            hasLocation: Boolean(request?.location),
            hasClient: Boolean(request?.client),
            hasVehicle: Boolean(request?.vehicle)
          });
          return false;
        }

        // Se não temos a localização do mecânico, não podemos filtrar por distância
        if (!mechanicLat || !mechanicLng) {
          return true;
        }

        // Calcular distância entre mecânico e solicitação
        const distance = calculateDistance(
          mechanicLat,
          mechanicLng,
          request.location.latitude,
          request.location.longitude
        );

        const isNearby = distance <= 30; // 30km de raio
        if (!isNearby) {
          console.log(`Solicitação fora do raio de 30km (${distance.toFixed(2)}km):`, request.id);
        }

        return isNearby;
      });

      // Mapear os dados para o formato correto
      const formattedRequests = validRequests.map(request => {
        const clientData = {
          id: request.user_id,
          full_name: request.client?.full_name || 'Cliente',
          phone: request.client?.phone || 'Não informado'
        };

        const vehicleData = {
          id: request.vehicle_id,
          model: request.vehicle?.model || 'Veículo não informado',
          plate: request.vehicle?.plate || 'Placa não informada',
          year: request.vehicle?.year || 'Ano não informado'
        };

        const formattedRequest: ServiceRequest = {
          id: request.id,
          user_id: request.user_id,
          vehicle_id: request.vehicle_id,
          description: request.description,
          status: request.status as ServiceRequest['status'],
          created_at: request.created_at,
          location: request.location,
          client: clientData,
          vehicle: vehicleData
        };

        console.log('Solicitação formatada:', formattedRequest);
        return formattedRequest;
      });

      console.log('Solicitações formatadas:', formattedRequests);
      setNearbyRequests(formattedRequests);

      // Buscar serviços ativos do mecânico
      const { data: activeData, error: activeError } = await supabase
        .from('service_requests')
        .select(`
          id,
          user_id,
          vehicle_id,
          description,
          status,
          created_at,
          location,
          client:user_id(
            id,
            full_name,
            phone
          ),
          vehicle:vehicles(
            id,
            model,
            plate,
            year
          )
        `)
        .in('status', ['accepted', 'in_progress'])
        .eq('mechanic_id', user?.id)
        .order('created_at', { ascending: false })
        .returns<ServiceRequest[]>();

      if (activeError) throw activeError;

      // Filtra serviços ativos com veículos válidos
      const validActiveServices = (activeData || []).filter((service) => {
        return Boolean(
          service &&
          service.id &&
          service.vehicle &&
          service.vehicle.model &&
          service.vehicle.plate
        );
      });

      setActiveServices(validActiveServices);

      // Buscar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .from('mechanic_stats')
        .select('*')
        .eq('mechanic_id', user.id)
        .single();

      if (statsError) throw statsError;
      if (statsData) {
        setStats({
          completed: statsData.completed_services || 0,
          rating: statsData.average_rating || 0,
          earnings: statsData.total_earnings || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (requestId: string, quote: number, description: string) => {
    try {
      // Atualizar a solicitação com o orçamento
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({
          mechanic_id: user?.id,
          budget: quote,
          description: description,
          status: 'quoted'
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Erro ao atualizar solicitação:', updateError);
        throw updateError;
      }

      // Recarregar dados
      fetchData(mechanicLocation?.latitude ?? null, mechanicLocation?.longitude ?? null);
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
      throw error;
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          mechanic_id: user?.id,
          status: 'accepted'
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchData(mechanicLocation?.latitude ?? null, mechanicLocation?.longitude ?? null); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Aguardando aceitação',
      accepted: 'Aceito - A caminho',
      in_progress: 'Em atendimento',
      completed: 'Concluído'
    };
    return texts[status as keyof typeof texts] || 'Desconhecido';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header com Estatísticas */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Olá, {user?.user_metadata?.full_name || 'Mecânico'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Serviços Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Ganhos Totais</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {stats.earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Avaliação Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solicitações Próximas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Solicitações Próximas</h2>
            {nearbyRequests.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma solicitação próxima no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyRequests.map((request) => (
                  <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{request.vehicle.model}</h3>
                        <p className="text-sm text-gray-500">Placa: {request.vehicle.plate}</p>
                      </div>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
                      >
                        Enviar Orçamento
                      </button>
                    </div>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(request.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Serviços Ativos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Serviços Ativos</h2>
            {activeServices.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum serviço ativo no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeServices.map((service) => service.vehicle && (
                  <div key={service.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{service.vehicle.model}</h3>
                        <p className="text-sm text-gray-500">Placa: {service.vehicle.plate}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{service.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dicas e Informações */}
        <div className="mt-8 bg-yellow-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Dicas para Atendimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Responda Rapidamente</h3>
                <p className="text-sm text-gray-600">Quanto mais rápido aceitar, maiores as chances de realizar o serviço</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Mantenha-se Próximo</h3>
                <p className="text-sm text-gray-600">Fique nas áreas com maior demanda de serviços</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Comunique-se Bem</h3>
                <p className="text-sm text-gray-600">Mantenha o cliente informado sobre seu progresso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Orçamento */}
        {selectedRequest && (
          <QuoteModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onSubmit={handleSubmitQuote}
          />
        )}
      </div>
    </Layout>
  );
}