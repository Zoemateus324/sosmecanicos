'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/components/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';

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

export default function MecanicaDashboard() {
  const { user, userNome, userType } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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

  // Fetch pending mechanic requests
  const fetchMechanicRequests = async () => {
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

    const { data: requestsData, error: requestsError } = await supabase
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
      .eq('status', 'pendentes');

    if (requestsError) {
      console.error('Erro ao obter solicitações:', requestsError.message);
      toast.error('Erro ao obter solicitações: ' + requestsError.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setMechanicRequests([]);
    } else {
      console.log('Solicitações recebidas:', requestsData);
      setMechanicRequests(
        requestsData.map((item) => ({
          ...item,
          veiculos: Array.isArray(item.veiculos) ? item.veiculos[0] || null : item.veiculos || null, // Ensure veiculos is a single object or null
        })) || []
      );
    }
  };

  // Check user authentication and type
  const checkUser = async () => {
    if (!isSupabaseInitialized(supabase)) {
      throw new Error('Supabase client is not initialized');
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error checking session:', sessionError.message);
      throw new Error('Erro ao verificar sessão: ' + sessionError.message);
    }
    if (!sessionData.session) {
      router.push('/login');
      return;
    }

    // Fetch user type from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', sessionData.session.user.id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar tipo de usuário:', profileError.message);
      throw new Error('Erro ao carregar dados do usuário.');
    }

    const tipo = profileData?.tipo_usuario;
    if (tipo !== 'mecanico') {
      if (tipo === 'cliente') router.push('/dashboard/cliente');
      else if (tipo === 'guincho') router.push('/dashboard/guincho');
      else if (tipo === 'seguradora') router.push('/dashboard/seguradora');
      else router.push('/login');
    }

    try {
      await fetchMechanicRequests();
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Erro ao verificar usuário');
    }
  };

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
        await checkUser();
        if (user && userType === 'mecanico') {
          await fetchMechanicRequests();
        }
      } catch (err: any) {
        console.error('Critical error:', err.message);
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
  }, [supabase, user, userType, router]);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus }
          : request
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  const handleSubmitReview = async (requestId: string, review: { rating: number; comment: string }) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            request_id: requestId,
            rating: review.rating,
            comment: review.comment
          }
        ]);

      if (error) throw error;

      toast.success('Avaliação enviada com sucesso!');
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Erro ao enviar avaliação');
    }
  };

  // Render fallback UI if critical error
  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="md:w-64 bg-white shadow-lg h-full z-50 fixed md:static md:flex md:flex-col"
      >
        <div className="p-4 flex items-center space-x-2 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-purple-600">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6 flex-1">
          <Link
            href="/dashboard/mecanico"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold text-purple-700 bg-purple-50"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/solicitacoes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Solicitações
          </Link>
          <Link
            href="/dashboard/historico"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Histórico
          </Link>
          <Link
            href="/dashboard/perfil"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Perfil
          </Link>
          <Link
            href="/ajuda"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Ajuda
          </Link>
        </nav>
        <div className="p-4 bg-white border-t md:hidden">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <p className="text-center text-sm text-gray-500 mt-2">© 2025 SOS Mecânicos</p>
        </div>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 w-full max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-gray-600" onClick={toggleSidebar}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-purple-700">Dashboard do Mecânico</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>
                {userNome ? userNome.charAt(0).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-700 hidden md:block">{userNome || 'Carregando...'}</span>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </header>

        {/* Welcome Message */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-purple-700 mb-6"
        >
          Bem-vindo(a), {userNome || 'Carregando...'}!
        </motion.h2>

        {/* Dashboard Content */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Solicitações Pendentes</CardTitle>
                    <CardDescription>Solicitações disponíveis para aceitar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">{mechanicRequests.length}</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Serviços Concluídos</CardTitle>
                    <CardDescription>Total de serviços realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">10</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Ganhos Totais</CardTitle>
                    <CardDescription>Seus ganhos na plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">R$ 2.500,00</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Mechanic Requests Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-700">Solicitações Disponíveis</CardTitle>
                  <CardDescription>Solicitações que você pode aceitar</CardDescription>
                </CardHeader>
                <CardContent>
                  {mechanicRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-purple-700">Veículo</TableHead>
                            <TableHead className="text-purple-700">Categoria</TableHead>
                            <TableHead className="text-purple-700">Descrição</TableHead>
                            <TableHead className="text-purple-700">Localização</TableHead>
                            <TableHead className="text-purple-700">Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mechanicRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-800">
                                {request.veiculos
                                  ? `${request.veiculos.marca} ${request.veiculos.modelo} (${request.veiculos.placa})`
                                  : 'Veículo não encontrado'}
                              </TableCell>
                              <TableCell className="text-gray-800">{request.category_type}</TableCell>
                              <TableCell className="text-gray-800">{request.description}</TableCell>
                              <TableCell className="text-gray-800">{request.location}</TableCell>
                              <TableCell className="text-gray-800">
                                {new Date(request.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-gray-600">Nenhuma solicitação disponível no momento.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}