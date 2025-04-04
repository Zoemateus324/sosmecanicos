import React, { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import {
  Wrench,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  X,
  UserPlus,
} from "lucide-react";

// Removendo interfaces não utilizadas

// Mantendo apenas as interfaces necessárias
interface ServiceRequest {
  id: string;
  user_id: string;
  vehicle_id: string;
  description: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "quoted";
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
  mechanic_id?: string;
  budget?: number;
  distance?: number;
}

interface ServiceStats {
  completed: number;
  rating: number;
  earnings: number;
}

interface QuoteModalProps {
  request: ServiceRequest;
  onClose: () => void;
  onSubmit: (
    requestId: string,
    quote: number,
    description: string,
  ) => Promise<void>;
}

const QuoteModal: React.FC<QuoteModalProps> = ({
  request,
  onClose,
  onSubmit,
}) => {
  const [quote, setQuote] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !description) return;

    setLoading(true);
    try {
      await onSubmit(request.id, Number(quote), description);
      onClose();
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enviar Orçamento</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium">Detalhes do Serviço</h3>
          <p className="text-sm text-gray-600 mt-1">
            Veículo: {request.vehicle.model} - {request.vehicle.plate}
          </p>
          <p className="text-sm text-gray-600">
            Problema: {request.description}
          </p>
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
            {loading ? "Enviando..." : "Enviar Orçamento"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const [nearbyRequests, setNearbyRequests] = useState<ServiceRequest[]>([]);
  const [activeServices, setActiveServices] = useState<ServiceRequest[]>([]);
  const [mechanicLocation, setMechanicLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [stats, setStats] = useState<ServiceStats>({
    completed: 0,
    rating: 0,
    earnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para obter localização
  const getLocation = () => {
    return new Promise<{ latitude: number; longitude: number } | null>(
      (resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Verificar precisão da localização
              if (position.coords.accuracy > 100) {
                console.warn('Precisão da localização baixa:', position.coords.accuracy);
              }
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error("Erro ao obter localização:", error);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000, // Aumentado para 15 segundos
              maximumAge: 0
            },
          );
        } else {
          console.log("Geolocalização não suportada");
          resolve(null);
        }
      },
    );
  };

  // Efeito para verificar autenticação e redirecionar se necessário
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado, redirecionando...");
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Efeito para obter localização
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getLocation();
        console.log("Localização obtida:", location);
        setMechanicLocation(location);
      } catch (err) {
        console.error("Erro ao inicializar localização:", err);
        setError("Erro ao obter localização");
      }
    };

    if (!authLoading && isAuthenticated && user) {
      initializeLocation();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadData = async () => {
    if (!user?.id) {
      console.log("Sem ID do usuário, não carregando dados");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar se o usuário é um mecânico
      const { data: mechanicProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao verificar perfil do mecânico:', profileError);
        throw profileError;
      }

      console.log('Perfil do usuário:', mechanicProfile);

      // Buscar todas as solicitações pendentes com localização válida
      const { data: nearbyData, error: nearbyError } = await supabase
        .from("service_requests")
        .select(
          `
          id,
          user_id,
          vehicle_id,
          description,
          status,
          created_at,
          location,
          client:profiles!service_requests_user_id_fkey(
            id,
            full_name,
            phone
          ),
          vehicle:vehicles!service_requests_vehicle_id_fkey(
            id,
            model,
            plate,
            year
          )
        `,
        )
        .eq("status", "pending")
        .not("location", "is", null)
        .order("created_at", { ascending: false });

      if (nearbyError) {
        console.error('Erro ao buscar solicitações pendentes:', nearbyError);
        throw nearbyError;
      }

      console.log('Solicitações pendentes encontradas:', nearbyData);

      // Verificar se há solicitações antes do filtro
      console.log('Total de solicitações antes do filtro:', nearbyData?.length);

      // Mapear solicitações próximas
      const mappedNearbyRequests = (nearbyData || [])
        .filter(
          (request) =>
            request.client?.[0] && request.vehicle?.[0] && request.location,
        )
        .map((request) => ({
          id: request.id,
          user_id: request.user_id,
          vehicle_id: request.vehicle_id,
          description: request.description,
          status: request.status,
          created_at: request.created_at,
          location: request.location,
          client: {
            id: request.client[0].id,
            full_name: request.client[0].full_name,
            phone: request.client[0].phone,
          },
          vehicle: {
            id: request.vehicle[0].id,
            model: request.vehicle[0].model,
            plate: request.vehicle[0].plate,
            year: request.vehicle[0].year,
          },
          distance: mechanicLocation
            ? calculateDistance(
                mechanicLocation.latitude,
                mechanicLocation.longitude,
                request.location.latitude,
                request.location.longitude,
              )
            : 0,
        }));

      setNearbyRequests(mappedNearbyRequests);

      // Buscar serviços ativos
      const { data: activeData, error: activeError } = await supabase
        .from("service_requests")
        .select(
          `
          id,
          user_id,
          vehicle_id,
          description,
          status,
          created_at,
          location,
          client:profiles!service_requests_user_id_fkey(
            id,
            full_name,
            phone
          ),
          vehicle:vehicles!service_requests_vehicle_id_fkey(
            id,
            model,
            plate,
            year
          )
        `,
        )
        .in("status", ["accepted", "in_progress"])
        .eq("mechanic_id", user.id)
        .not("location", "is", null)
        .order("created_at", { ascending: false });

      if (activeError) throw activeError;

      // Mapear serviços ativos
      const mappedActiveServices = (activeData || [])
        .filter(
          (request) =>
            request.client?.[0] && request.vehicle?.[0] && request.location,
        )
        .map((request) => ({
          id: request.id,
          user_id: request.user_id,
          vehicle_id: request.vehicle_id,
          description: request.description,
          status: request.status,
          created_at: request.created_at,
          location: request.location,
          client: {
            id: request.client[0].id,
            full_name: request.client[0].full_name,
            phone: request.client[0].phone,
          },
          vehicle: {
            id: request.vehicle[0].id,
            model: request.vehicle[0].model,
            plate: request.vehicle[0].plate,
            year: request.vehicle[0].year,
          },
          distance: mechanicLocation
            ? calculateDistance(
                mechanicLocation.latitude,
                mechanicLocation.longitude,
                request.location.latitude,
                request.location.longitude,
              )
            : 0,
        }));

      setActiveServices(mappedActiveServices);

      // Buscar estatísticas
      try {
        const { data: statsData, error: statsError } = await supabase
          .from("mechanic_stats")
          .select("*")
          .eq("mechanic_id", user.id)
          .single();

        if (statsError) {
          console.log("Erro ao buscar estatísticas:", statsError.message);

          // Se o erro for porque não encontrou resultados, criar um registro inicial
          if (statsError.code === "PGRST116") {
            console.log("Criando estatísticas iniciais para o mecânico");

            // Inserir registro inicial na tabela mechanic_stats
            const { data: newStatsData, error: insertError } = await supabase
              .from("mechanic_stats")
              .insert([
                {
                  mechanic_id: user.id,
                  completed_services: 0,
                  average_rating: 0,
                  total_earnings: 0,
                },
              ])
              .select()
              .single();

            if (insertError) {
              console.error(
                "Erro ao criar estatísticas do mecânico:",
                insertError,
              );
            } else if (newStatsData) {
              setStats({
                completed: newStatsData.completed_services || 0,
                rating: newStatsData.average_rating || 0,
                earnings: newStatsData.total_earnings || 0,
              });
            }
          }
        } else if (statsData) {
          setStats({
            completed: statsData.completed_services || 0,
            rating: statsData.average_rating || 0,
            earnings: statsData.total_earnings || 0,
          });
        }
      } catch (statsErr) {
        console.error("Erro ao processar estatísticas:", statsErr);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar dados
  useEffect(() => {
    let isMounted = true;
    if (!authLoading && isAuthenticated && user) {
      loadData().finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, user, mechanicLocation]);

  // Função para calcular distância entre dois pontos usando a fórmula de Haversine
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  };

  const handleSubmitQuote = async (
    requestId: string,
    quote: number,
    description: string,
  ) => {
    try {
      console.log("Enviando orçamento:", {
        requestId,
        quote,
        description,
        mechanicId: user?.id,
      });

      // Verificar se o perfil do mecânico existe
      const { error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil do mecânico:", profileError);
        throw profileError;
      }

      // Atualizar status da solicitação
      const { data: requestData, error: requestError } = await supabase
        .from("service_requests")
        .update({
          mechanic_id: user?.id,
          status: "quoted",
          price: quote,
          mechanic_notes: description,
        })
        .eq("id", requestId)
        .select("*, client:profiles(*), vehicle:vehicles(*)")
        .single();

      if (requestError) {
        console.error("Erro ao atualizar solicitação:", requestError);
        throw requestError;
      }

      console.log("Solicitação atualizada com sucesso:", requestData);

      // Recarregar dados
      loadData();
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
      throw error;
    }
  };

  const handleAcceptRequest = async (requestId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({
          mechanic_id: user?.id,
          status: "accepted",
        })
        .eq("id", requestId)
        .select("*, client:profiles(*), vehicle:vehicles(*)");

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error("Erro ao aceitar solicitação:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Aguardando aceitação",
      accepted: "Aceito - A caminho",
      in_progress: "Em atendimento",
      completed: "Concluído",
    };
    return texts[status as keyof typeof texts] || "Desconhecido";
  };

  // Renderização com tratamento de erros
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="ml-2">Verificando autenticação...</span>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500"
          >
            Tentar novamente
          </button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="ml-2">Carregando dados...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header com Estatísticas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {profile?.full_name || "Mecânico"}
            </h1>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                {profile?.full_name?.[0]?.toUpperCase() || "M"}
              </div>
              <span className="text-sm">Ver perfil</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Serviços Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
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
        <div className="grid grid-cols-1 gap-8">
          {/* Solicitações de Serviço */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Solicitações de Serviço
            </h2>
            {nearbyRequests.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Nenhuma solicitação disponível no momento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {request.client.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.description}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedRequest(request as ServiceRequest)
                        }
                        className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                      >
                        Enviar Orçamento
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(request.created_at).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {mechanicLocation &&
                          request.location &&
                          request.distance !== undefined
                            ? `${request.distance.toFixed(1)} km`
                            : "Distância indisponível"}
                        </span>
                      </div>
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
                {activeServices.map(
                  (service) =>
                    service.vehicle && (
                      <div
                        key={service.id}
                        className="border border-gray-100 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">
                              {service.vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Placa: {service.vehicle.plate}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}
                          >
                            {getStatusText(service.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {service.description}
                        </p>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Links para Cadastros */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate("/mechanic/employees")}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Funcionários</h3>
                <p className="text-gray-500">
                  Gerencie sua equipe de mecânicos e funcionários
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/mechanic/services")}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Serviços Prestados</h3>
                <p className="text-gray-500">
                  Cadastre e gerencie os serviços oferecidos
                </p>
              </div>
            </div>
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
                <p className="text-sm text-gray-600">
                  Quanto mais rápido aceitar, maiores as chances de realizar o
                  serviço
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Mantenha-se Próximo</h3>
                <p className="text-sm text-gray-600">
                  Fique nas áreas com maior demanda de serviços
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Comunique-se Bem</h3>
                <p className="text-sm text-gray-600">
                  Mantenha o cliente informado sobre seu progresso
                </p>
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
