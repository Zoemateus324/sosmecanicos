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

interface Guincho {
  id: string;
  user_id: string;
  vehicle_id: string;
  origin: string;
  destination: string;
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

interface AuthUser {
  id: string;
  email?: string;
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
  const { user, userNome } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>([]);
  const [guinchos, setGuinchos] = useState<Guincho[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Fetch mechanic requests and tow requests
  const fetchRequests = async () => {
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
        destination,
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
  };

  // Check user logged in
  const checkUserLoggedIn = async () => {
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
        await checkUserLoggedIn();
        if (user) {
          await fetchRequests();
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
  }, [supabase, user, router]);

  // Group requests by status
  const statusGroups = {
    em_andamento: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'em_andamento'),
    aceitas: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'aceitas'),
    em_analise: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'em_analise'),
    em_espera: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'em_espera'),
    concluidas: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'concluidas'),
    canceladas: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'canceladas'),
    pendentes: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'pendentes'),
    rejeitadas: [...mechanicRequests, ...guinchos].filter((item) => item.status === 'rejeitadas'),
  };

  // Render fallback UI if critical error
  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden md:flex-row flex-col">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="md:w-64 md:static md:flex md:flex-col bg-white shadow-lg h-full z-50 overflow-y-auto md:overflow-hidden fixed md:relative"
      >
        <div className="p-4 flex items-center space-x-2 border-b border-gray-200 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-purple-600">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard/cliente"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/solicitacoes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold text-purple-700 bg-purple-50"
          >
            Solicitações
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
        <div className="absolute bottom-0 left-0 w-full p-2 bg-white border-t md:hidden z-50">
          <Button
            variant="outline"
            className="w-full mt-4 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <p className="text-center text-sm text-gray-500">© 2024 SOS Mecânicos</p>
        </div>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-5 z-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 w-full container mx-auto">
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
            <h1 className="text-xl md:text-2xl font-semibold text-purple-700">Solicitações</h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>
                {userNome ? userNome.charAt(0).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Welcome Message */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-purple-700 mb-4"
        >
          Suas Solicitações, {userNome || 'Carregando...'}!
        </motion.h2>

        {/* Requests Content */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white shadow-md rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(statusGroups).map(([status, items]) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">
                      {status
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {items.length} {items.length === 1 ? 'solicitação' : 'solicitações'} {status.replace(/_/g, ' ')}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-purple-700">Tipo</TableHead>
                              <TableHead className="text-purple-700">Veículo</TableHead>
                              <TableHead className="text-purple-700">Detalhes</TableHead>
                              <TableHead className="text-purple-700">Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow key={item.id} className="hover:bg-gray-50">
                                <TableCell className="text-gray-800">
                                  {'category_type' in item ? 'Mecânico' : 'Guincho'}
                                </TableCell>
                                <TableCell className="text-gray-800">
                                  {item.veiculos
                                    ? `${item.veiculos.marca} ${item.veiculos.modelo} (${item.veiculos.placa})`
                                    : 'Veículo não encontrado'}
                                </TableCell>
                                <TableCell className="text-gray-800">
                                  {'category_type' in item
                                    ? `${item.category_type}: ${item.description}`
                                    : `De ${item.origin} para ${item.destination}`}
                                </TableCell>
                                <TableCell className="text-gray-800">
                                  {new Date(item.created_at).toLocaleDateString('pt-BR', {
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
                      <p className="text-gray-600">
                        Nenhuma solicitação {status.replace(/_/g, ' ')} encontrada.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}