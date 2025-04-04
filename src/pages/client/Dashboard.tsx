import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Plus, Car, AlertCircle, Clock, Wrench, CheckCircle, XCircle, Info } from 'lucide-react';
import { ServiceDetailsPopup } from '../../components/ServiceDetailsPopup';

interface Vehicle {
  id: string;
  user_id: string;
  vehicle_type: 'carro' | 'moto' | 'caminhao' | 'van';
  model: string;
  year: number;
  plate: string;
  brand: string;
  color?: string;
  mileage: number;
  fuel_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ServiceRequest {
  id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price?: number;
  quote_description?: string;
  quote_status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  scheduled_date: string;
  service_type: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicle: {
    id: string;
    model: string;
    plate: string;
    year: number;
    brand: string;
    vehicle_type: string;
  };
  mechanic?: {
    id: string;
    full_name: string;
    phone: string;
  };
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      if (!isAuthenticated || !user?.id) {
        return;
      }

      // Verificar cache antes de carregar dados
      const cachedData = localStorage.getItem(`dashboard_data_${user.id}`);
      if (cachedData) {
        const { vehicles: cachedVehicles, serviceRequests: cachedRequests, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Usar cache se tiver menos de 5 minutos
        if (cacheAge < 300000) {
          setVehicles(cachedVehicles);
          setServiceRequests(cachedRequests);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const [vehiclesResponse, serviceRequestsResponse] = await Promise.all([
          supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('service_requests')
            .select(`
              *,
              vehicle:vehicles!service_requests_vehicle_id_fkey(
                id,
                model,
                plate,
                year,
                brand,
                vehicle_type
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(async (result) => {
              if (result.error) throw result.error;
              
              // Para cada solicitação que tem um mechanic_id, buscar os dados do mecânico separadamente
              const requestsWithMechanics = await Promise.all(
                result.data.map(async (request) => {
                  if (request.mechanic_id) {
                    const { data: mechanicData, error: mechanicError } = await supabase
                      .from('profiles')
                      .select('id, full_name, phone')
                      .eq('id', request.mechanic_id)
                      .single();
                    
                    if (!mechanicError && mechanicData) {
                      return {
                        ...request,
                        mechanic: mechanicData
                      };
                    }
                  }
                  return request;
                })
              );
              
              return { data: requestsWithMechanics, error: null };
            })
        ]);

        if (vehiclesResponse.error) throw vehiclesResponse.error;
        if (serviceRequestsResponse.error) throw serviceRequestsResponse.error;

        const newVehicles = vehiclesResponse.data || [];
        const newServiceRequests = serviceRequestsResponse.data as ServiceRequest[] || [];
        
        setVehicles(newVehicles);
        setServiceRequests(newServiceRequests);

        // Atualizar cache
        localStorage.setItem(`dashboard_data_${user.id}`, JSON.stringify({
          vehicles: newVehicles,
          serviceRequests: newServiceRequests,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar seus dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [vehiclesResponse, serviceRequestsResponse] = await Promise.all([
        supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('service_requests')
          .select(`
            *,
            vehicle:vehicles!service_requests_vehicle_id_fkey(
              id,
              model,
              plate,
              year,
              brand,
              vehicle_type
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .then(async (result) => {
            if (result.error) throw result.error;
            
            // Para cada solicitação que tem um mechanic_id, buscar os dados do mecânico separadamente
            const requestsWithMechanics = await Promise.all(
              result.data.map(async (request) => {
                if (request.mechanic_id) {
                  const { data: mechanicData, error: mechanicError } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone')
                    .eq('id', request.mechanic_id)
                    .single();
                  
                  if (!mechanicError && mechanicData) {
                    return {
                      ...request,
                      mechanic: mechanicData
                    };
                  }
                }
                return request;
              })
            );
            
            return { data: requestsWithMechanics, error: null };
          })
      ]);

      if (vehiclesResponse.error) throw vehiclesResponse.error;
      if (serviceRequestsResponse.error) throw serviceRequestsResponse.error;

      const newVehicles = vehiclesResponse.data || [];
      const newServiceRequests = serviceRequestsResponse.data as ServiceRequest[] || [];
      
      setVehicles(newVehicles);
      setServiceRequests(newServiceRequests);

      // Atualizar cache
      localStorage.setItem(`dashboard_data_${user.id}`, JSON.stringify({
        vehicles: newVehicles,
        serviceRequests: newServiceRequests,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar seus dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteResponse = async (requestId: string, accepted: boolean) => {
    try {
      const { error: fetchError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      const updates = {
        quote_status: accepted ? 'accepted' : 'rejected',
        status: accepted ? 'accepted' : 'pending'
      };

      const { error: updateError } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Refresh service requests
      loadData();
    } catch (err) {
      console.error('Error updating quote response:', err);
      setError('Não foi possível atualizar o status do orçamento.');
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'quoted':
        return 'text-blue-500';
      case 'accepted':
        return 'text-green-500';
      case 'in_progress':
        return 'text-purple-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Aguardando';
      case 'quoted':
        return 'Orçamento Recebido';
      case 'accepted':
        return 'Aceito';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
      case 'quoted':
        return <Clock className="h-5 w-5" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5" />;
      case 'in_progress':
        return <Wrench className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {profile?.full_name || user.email?.split('@')[0] || 'Cliente'}
          </h1>
          <button
            onClick={() => navigate('/client/vehicles/add')}
            className="flex items-center space-x-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Veículo</span>
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid Principal */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Seção de Veículos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Meus Veículos
              </h2>
              <button
                onClick={() => navigate('/client/vehicles/add')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Veículo
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum veículo cadastrado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece adicionando seu primeiro veículo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Car className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {vehicle.plate} • {vehicle.year}
                          {vehicle.color && ` • ${vehicle.color}`}
                          {vehicle.mileage > 0 && ` • ${vehicle.mileage.toLocaleString()} km`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/client/vehicles/${vehicle.id}`)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Detalhes
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção de Solicitações de Serviço */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Solicitações de Serviço
              </h2>
              <button
                onClick={() => navigate('/client/request-service')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nova Solicitação
              </button>
            </div>

            {serviceRequests.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhuma solicitação de serviço
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Solicite um serviço quando precisar de assistência
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`flex items-center ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 text-sm font-medium">
                            {getStatusText(request.status)}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {request.vehicle.brand} {request.vehicle.model} • {request.vehicle.plate}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dicas Úteis */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Dicas Úteis
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Manutenção Preventiva
                  </h3>
                  <p className="text-sm text-gray-600">
                    Realize manutenções regulares para evitar problemas maiores e manter seu veículo em bom estado.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Documentação em Dia
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mantenha os documentos do veículo atualizados para evitar problemas legais e facilitar serviços.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Emergências
                  </h3>
                  <p className="text-sm text-gray-600">
                    Em caso de problemas, solicite um serviço imediatamente para evitar danos maiores ao veículo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popup de Detalhes da Solicitação */}
      {selectedRequest && (
        <ServiceDetailsPopup
          serviceRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onQuoteResponse={handleQuoteResponse}
        />
      )}
    </Layout>
  );
}