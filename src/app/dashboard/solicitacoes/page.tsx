'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/components/SupabaseProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import ServiceRequestDetails from '@/components/ServiceRequestDetails';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sidebar } from '@/components/sidebar/Sidebar';

// Define interfaces
interface MechanicRequest {
  id: string;
  user_id: string;
  vehicle_id: string;
  description: string;
  location: string;
  category_type: string;
  status: string;
  created_at: string;
  veiculos?: Vehicle;
}

interface Guincho {
  id: string;
  user_id: string;
  vehicle_id: string;
  origin: string;
  observations: string;
  status: string;
  created_at: string;
  veiculos?: Vehicle;
}

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
}

interface ServiceRequest {
  id: string;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

// Fallback UI component for critical errors
const ErrorFallback = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <Card className="border-none shadow-md max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-red-600">Erro</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{message}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Type guard for Supabase client
function isSupabaseInitialized(
  supabase: SupabaseClient | null
): supabase is SupabaseClient {
  return supabase !== null;
}

export default function SolicitacoesDashboard() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>([]);
  const [guinchos, setGuinchos] = useState<Guincho[]>([]);
  // Removed unused state variable 'isSidebarOpen'
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todas");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<(MechanicRequest | Guincho) | null>(null);

  // Removed unused toggleSidebar function

  // Transform request to ServiceRequest format
  const transformToServiceRequest = (request: MechanicRequest | Guincho): ServiceRequest => {
    const vehicle = request.veiculos;
    return {
      id: request.id,
      status: request.status,
      created_at: request.created_at,
      user: {
        name: user?.user_metadata?.name || 'Usuário',
        email: user?.email || '',
      },
      vehicle: {
        model: vehicle?.modelo || '',
        plate: vehicle?.placa || '',
      },
      location: {
        lat: 0, // These values are not available in the current data structure
        lng: 0, // These values are not available in the current data structure
      },
    };
  };

  // Handle logout
  const handleLogout = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível fazer logout: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao sair: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      router.push('/login');
    }
  };

  // Fetch mechanic requests and tow requests
  const fetchRequests = useCallback(async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.warning('Não foi possível carregar solicitações: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      return;
    }
    if (!user?.id) {
      toast.warning('Usuário não autenticado', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      return;
    }

    // Fetch mechanic_requests
    const { data: mechanicRequestsData, error: mechanicRequestsError } = await supabase
      .from('mechanic_requests')
      .select(`
        id,
        user_id,
        vehicle_id,
        description,
        location,
        category_type,
        status,
        created_at,
        veiculos (
          id,
          marca,
          modelo,
          placa,
          ano
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (mechanicRequestsError) {
      console.error('Erro ao obter solicitações de mecânico:', mechanicRequestsError.message);
      toast.error('Erro ao obter solicitações de mecânico: ' + mechanicRequestsError.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setMechanicRequests([]);
    } else {
      console.log('Solicitações de mecânico recebidas:', mechanicRequestsData);
      setMechanicRequests(
        mechanicRequestsData.map((item) => ({
          ...item,
          veiculos: Array.isArray(item.veiculos) ? item.veiculos[0] || null : item.veiculos || null, // Ensure veiculos is a single object or null
        })) || []
      );
    }

    // Fetch guinchos
    const { data: guinchosData, error: guinchosError } = await supabase
      .from('guinchos')
      .select(`
        id,
        user_id,
        vehicle_id,
        origin,
        observations,
        status,
        created_at,
        veiculos (
          id,
          marca,
          modelo,
          placa,
          ano
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (guinchosError) {
      console.error('Erro ao obter guinchos:', guinchosError.message);
      toast.error('Erro ao obter guinchos: ' + guinchosError.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setGuinchos([]);
    } else {
      console.log('Guinchos recebidos:', guinchosData);
      setGuinchos(
        guinchosData.map((item) => ({
          ...item,
          veiculos: Array.isArray(item.veiculos) ? item.veiculos[0] || null : item.veiculos || null, // Ensure veiculos is a single object or null
        })) || []
      );
    }
  }, [supabase, user]);

  // Check user logged in
  const checkUserLoggedIn = useCallback(async () => {
    if (!isSupabaseInitialized(supabase)) {
      throw new Error('Supabase client is not initialized');
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error.message);
      throw new Error('Erro ao verificar sessão: ' + error.message);
    }
    if (!data.session) {
      router.push('/login');
    }
  }, [supabase, router]);

  // Combined useEffect for data fetching
  useEffect(() => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setCriticalError('Não foi possível conectar ao banco de dados. Por favor, tente novamente mais tarde.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        await checkUserLoggedIn();
        if (user) {
          await fetchRequests();
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Critical error:', err.message);
        } else {
          console.error('Critical error:', err);
        }
        setCriticalError('Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, user, router, checkUserLoggedIn, fetchRequests]);

  // Agrupa todas as solicitações em um array único
  const allRequests = [
    ...mechanicRequests.map((item) => ({
      ...item,
      type: "mecanico",
      title: item.veiculos ? `${item.veiculos.marca} ${item.veiculos.modelo}` : "Veículo",
      plate: item.veiculos?.placa || "",
      description: item.description,
      date: item.created_at,
      status: item.status,
    })),
    ...guinchos.map((item) => ({
      ...item,
      type: "guincho",
      title: item.veiculos ? `${item.veiculos.marca} ${item.veiculos.modelo}` : "Veículo",
      plate: item.veiculos?.placa || "",
      description: item.observations || item.origin,
      date: item.created_at,
      status: item.status,
    })),
  ];

  // Filtros de tabs
  const statusMap: { [key: string]: (r: { status?: string }) => boolean } = {
    todas: () => true,
    pendentes: (r: { status?: string }) => r.status?.toLowerCase() === "pendente" || r.status?.toLowerCase() === "pendentes",
    aceitas: (r: { status?: string }) => r.status?.toLowerCase() === "aceita" || r.status?.toLowerCase() === "aceito",
    orcamentos: (r: { status?: string }) => r.status?.toLowerCase() === "orcamento" || r.status?.toLowerCase() === "orçamento",
    "em andamento": (r: { status?: string }) => r.status?.toLowerCase() === "em andamento",
    concluidas: (r: { status?: string }) => r.status?.toLowerCase() === "concluida" || r.status?.toLowerCase() === "concluído" || r.status?.toLowerCase() === "concluídas",
  };

  const filteredRequests = allRequests
    .filter((r: { status?: string }) => statusMap[tab] ? statusMap[tab](r) : true)
    .filter((r: { description?: string; title?: string; plate?: string }) =>
      search.length === 0 ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.plate?.toLowerCase().includes(search.toLowerCase())
    );

  // Função para exibir badge de status
  function StatusBadge({ status }: { status: string }) {
    let color = "bg-gray-200 text-gray-700";
    const text = status;
    if (["pendente", "pendentes"].includes(status?.toLowerCase())) color = "bg-yellow-100 text-yellow-700";
    if (["aceito", "aceita"].includes(status?.toLowerCase())) color = "bg-green-100 text-green-700";
    if (["concluida", "concluído", "concluídas"].includes(status?.toLowerCase())) color = "bg-green-200 text-green-800";
    if (["em andamento"].includes(status?.toLowerCase())) color = "bg-blue-100 text-blue-700";
    if (["orcamento", "orçamento"].includes(status?.toLowerCase())) color = "bg-purple-100 text-purple-700";
    if (["cancelada", "cancelado"].includes(status?.toLowerCase())) color = "bg-red-100 text-red-700";
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{text?.charAt(0).toUpperCase() + text?.slice(1)}</span>;
  }

  // Função para cancelar solicitação (exemplo, ajuste conforme sua lógica real)
  async function handleCancel(requestId: string, requestType: string) {
        // ... lógica de cancelamento ...
        console.log(`Canceling request with ID: ${requestId} and type: ${requestType}`);
      }

  // Render fallback UI if critical error
  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar/>
      <div className="max-w-5xl mx-auto pt-10 pb-8 px-2 md:px-0">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">Solicitações de Serviço</h1>
            <p className="text-gray-500 text-base md:text-lg">Acompanhe seus pedidos de assistência mecânica</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-base flex items-center gap-2">
            <span className="text-xl font-bold">+</span> Nova Solicitação
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg text-base flex items-center gap-2"
          >
            Logout
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por descrição do problema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
          />
        </div>
        <div className="flex gap-2 mb-6">
          {['todas', 'pendentes', 'aceitas', 'orcamentos', 'em andamento', 'concluidas'].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-4 py-2 rounded font-medium text-sm md:text-base transition-all ${tab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
            >
              {tabName.charAt(0).toUpperCase() + tabName.slice(1).replace('em andamento', 'Em Andamento').replace('orcamentos', 'Orçamentos').replace('concluidas', 'Concluídas')}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse h-32" />
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">Nenhuma solicitação encontrada.</div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:ring-2 hover:ring-blue-200"
                onClick={() => { setSelectedRequest(req); setDetailsDialogOpen(true); }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    {/* Ícone do tipo de serviço */}
                    {req.type === 'mecanico' ? (
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-600"><path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/><rect width="20" height="8" x="2" y="9" rx="2"/><path d="M6 13v-2a4 4 0 0 1 8 0v2"/></svg>
                    ) : (
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-orange-500"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      {req.title}
                      <span className="text-xs text-gray-400 font-normal">Placa: {req.plate}</span>
                    </div>
                    <div className="text-gray-700 mt-1">{req.description}</div>
                    <div className="text-gray-400 text-sm mt-1">{new Date(req.date).toISOString().slice(0, 10)}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <StatusBadge status={req.status} />
                  {(req.status?.toLowerCase() === 'pendente' || req.status?.toLowerCase() === 'pendentes') && (
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-1 px-4 py-2"
                      onClick={e => { e.stopPropagation(); handleCancel(req.id, req.type); }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-red-500"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Dialog de detalhes da solicitação */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <ServiceRequestDetails
              request={transformToServiceRequest(selectedRequest)}
              onClose={() => setDetailsDialogOpen(false)}
              onSubmitReview={async (requestId, review) => {
                // Implement review submission logic here
                console.log('Submitting review:', { requestId, review });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}