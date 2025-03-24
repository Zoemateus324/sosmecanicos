import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Truck, MapPin, Clock, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface TowRequest {
  id: string;
  client_id: string;
  vehicle_id: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  created_at: string;
  pickup_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  delivery_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  client: {
    full_name: string;
    phone: string;
  };
  vehicle: {
    model: string;
    plate: string;
    year: string;
  };
}

interface TowStats {
  completed_services: number;
  active_services: number;
  total_earnings: number;
  average_rating: number;
}

export default function TowDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<TowRequest[]>([]);
  const [activeServices, setActiveServices] = useState<TowRequest[]>([]);
  const [stats, setStats] = useState<TowStats>({
    completed_services: 0,
    active_services: 0,
    total_earnings: 0,
    average_rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar solicitações próximas
      const { data: requestsData, error: requestsError } = await supabase
        .from('tow_requests')
        .select(`
          *,
          client:profiles(*),
          vehicle:vehicles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);

      // Buscar serviços ativos
      const { data: activeData, error: activeError } = await supabase
        .from('tow_requests')
        .select(`
          *,
          client:profiles(*),
          vehicle:vehicles(*)
        `)
        .eq('tow_company_id', user?.id)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;
      setActiveServices(activeData || []);

      // Buscar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .from('tow_company_stats')
        .select('*')
        .eq('company_id', user?.id)
        .single();

      if (statsError) throw statsError;
      if (statsData) {
        setStats({
          completed_services: statsData.completed_services || 0,
          active_services: statsData.active_services || 0,
          total_earnings: statsData.total_earnings || 0,
          average_rating: statsData.average_rating || 0
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
        .from('tow_requests')
        .update({
          tow_company_id: user?.id,
          status: 'accepted'
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchData();
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
      in_progress: 'Em andamento',
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
            Painel do Guincho
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Serviços Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed_services}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Serviços Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_services}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Faturamento Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {stats.total_earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Avaliação Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.average_rating.toFixed(1)}
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
            <h2 className="text-xl font-semibold mb-4">Solicitações Disponíveis</h2>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma solicitação disponível no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
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
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Coleta:</p>
                          <p className="text-sm text-gray-600">{request.pickup_location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Entrega:</p>
                          <p className="text-sm text-gray-600">{request.delivery_location.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Serviços Ativos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Serviços em Andamento</h2>
            {activeServices.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum serviço em andamento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeServices.map((service) => (
                  <div key={service.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(service.status)}`}>
                          {getStatusText(service.status)}
                        </span>
                        <h3 className="font-medium mt-2">{service.vehicle.model}</h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(service.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Coleta:</p>
                          <p className="text-sm text-gray-600">{service.pickup_location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Entrega:</p>
                          <p className="text-sm text-gray-600">{service.delivery_location.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Cliente: {service.client.full_name}</p>
                      <p className="text-sm text-gray-500">Telefone: {service.client.phone}</p>
                    </div>
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
                <h3 className="font-medium mb-1">Tempo de Resposta</h3>
                <p className="text-sm text-gray-600">Responda às solicitações em até 15 minutos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Localização Precisa</h3>
                <p className="text-sm text-gray-600">Confirme os endereços de coleta e entrega</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Comunicação</h3>
                <p className="text-sm text-gray-600">Mantenha o cliente informado sobre o status do serviço</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 