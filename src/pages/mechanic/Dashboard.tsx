import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Wrench, MapPin, Clock, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

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
  mechanic: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  vehicle: {
    model: string;
    plate: string;
    year: string;
  } | null;
}

interface ServiceStats {
  completed: number;
  rating: number;
  earnings: number;
}

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [nearbyRequests, setNearbyRequests] = useState<ServiceRequest[]>([]);
  const [activeServices, setActiveServices] = useState<ServiceRequest[]>([]);
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

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchData = async () => {
    try {
      if (!user?.id) {
        console.error('Usuário não autenticado');
        return;
      }

      // Buscar solicitações próximas
      const { data: nearbyData, error: nearbyError } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:profiles!service_requests_user_id_fkey(
            id,
            full_name,
            phone
          ),
          mechanic:profiles!service_requests_mechanic_id_fkey(
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
        .eq('status', 'pending')
        .is('mechanic_id', null)
        .order('created_at', { ascending: false });

      if (nearbyError) {
        console.error('Erro ao buscar solicitações:', nearbyError);
        throw nearbyError;
      }
      
      console.log('Solicitações encontradas:', nearbyData);
      
      // Filtra solicitações com veículos válidos
      const validRequests = (nearbyData || []).filter((request): request is ServiceRequest => {
        const isValid = Boolean(
          request &&
          request.id &&
          request.vehicle &&
          request.vehicle.model &&
          request.vehicle.plate
        );
        if (!isValid) {
          console.log('Solicitação inválida:', request);
        }
        return isValid;
      });

      console.log('Solicitações válidas:', validRequests);

      setNearbyRequests(validRequests);

      // Buscar serviços ativos do mecânico
      const query = supabase
        .from('service_requests')
        .select(`
          *,
          client:profiles!service_requests_user_id_fkey(*),
          mechanic:profiles!service_requests_mechanic_id_fkey(*),
          vehicle:vehicles(*)
        `)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      // Adicionar filtro de mechanic_id apenas se o usuário estiver autenticado
      if (user?.id) {
        query.eq('mechanic_id', user.id);
      }

      const { data: activeData, error: activeError } = await query;

      if (activeError) throw activeError;

      // Filtra serviços ativos com veículos válidos
      const validActiveServices = (activeData || []).filter((service): service is ServiceRequest => {
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
      fetchData(); // Recarrega os dados
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
                {nearbyRequests.map((request) => request.vehicle && (
                  <div key={request.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{request.vehicle.model}</h3>
                        <p className="text-sm text-gray-500">Placa: {request.vehicle.plate}</p>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
                      >
                        Aceitar Serviço
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
      </div>
    </Layout>
  );
}