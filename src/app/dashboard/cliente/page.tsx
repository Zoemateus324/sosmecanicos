'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/components/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Input } from '@/components/ui/input';
import { SupabaseClient } from '@supabase/supabase-js';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TooltipTrigger, Tooltip } from '@radix-ui/react-tooltip';
import { Sidebar } from '@/components/sidebar/Sidebar';

// Define LatLngTuple
type LatLngTuple = [number, number];

// Define interfaces
interface Mechanic {
  id: string;
  nome: string;
  latitude?: number;
  longitude?: number;
}

interface Vehicle {
  id: string;
  user_id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

interface AuthUser {
  id: string;
  latitude?: number;
  longitude?: number;
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

export default function ClienteDashboard() {
  const { user, userNome } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isTowDialogOpen, setIsTowDialogOpen] = useState(false);
  const [isMechanicDialogOpen, setIsMechanicDialogOpen] = useState(false);

  const [mechanicRequest, setMechanicRequest] = useState({
    vehicleId: '',
    description: '',
    location: '',
    category_type: '',
  });

  const [towRequest, setTowRequest] = useState({
    vehicleId: '',
    origin: '',
    destination: '',
    observations: '',
  });

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    id: '',
    user_id: '',
    marca: '',
    modelo: '',
    ano: 0,
    placa: '',
  });

  const [editVehicle, setEditVehicle] = useState<Vehicle>({
    id: '',
    user_id: '',
    marca: '',
    modelo: '',
    ano: 0,
    placa: '',
  });
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);

  // Fetch user type
  async function fetchUserData() {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setUserType(null);
      return;
    }
    if (!user?.id) {
      toast.error('Usuário não autenticado', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setUserType(null);
      return;
    }

    console.log('Fetching user type for ID:', user.id); // Debug log
    const { data, error } = await supabase
      .from('profiles')
      .select('tipo_usuario, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao obter tipo de usuário:', error.message);
      toast.error('Erro ao obter tipo de usuário: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setUserType(null);
      return;
    }

    if (data) {
      setUserType(data.tipo_usuario);
    } else {
      console.warn('Nenhum usuário encontrado com o ID:', user.id);
      toast.warning('Nenhum usuário encontrado. Por favor, contate o suporte.', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      setUserType(null);
    }
  }

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

  // Handle add vehicle
  const handleAddVehicle = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível adicionar veículo: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    if (!user?.id) {
      toast.error('Usuário não autenticado', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.placa || newVehicle.ano <= 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios do veículo', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { data, error } = await supabase
      .from('veiculos')
      .insert([
        {
          user_id: user.id,
          marca: newVehicle.marca,
          modelo: newVehicle.modelo,
          ano: newVehicle.ano,
          placa: newVehicle.placa,
        },
      ])
      .select();
    if (error) {
      toast.error('Erro ao adicionar veículo: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else if (data) {
      setVehicles([...vehicles, data[0]]);
      setNewVehicle({ id: '', user_id: '', marca: '', modelo: '', ano: 0, placa: '' });
      setIsVehicleDialogOpen(false);
      toast.success('Veículo adicionado com sucesso!', {
        style: { backgroundColor: '#4ADE80', color: '#ffffff' },
      });
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível editar veículo: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    if (!editVehicle.marca || !editVehicle.modelo || !editVehicle.placa || editVehicle.ano <= 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios do veículo', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { error } = await supabase
      .from('veiculos')
      .update({
        marca: editVehicle.marca,
        modelo: editVehicle.modelo,
        ano: editVehicle.ano,
        placa: editVehicle.placa,
      })
      .eq('id', editVehicle.id);
    if (error) {
      toast.error('Erro ao editar veículo: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      setVehicles(vehicles.map((v) => (v.id === editVehicle.id ? editVehicle : v)));
      setEditVehicle({ id: '', user_id: '', marca: '', modelo: '', ano: 0, placa: '' });
      setIsEditVehicleDialogOpen(false);
      toast.success('Veículo editado com sucesso!', {
        style: { backgroundColor: '#4ADE80', color: '#ffffff' },
      });
    }
  };

  // Handle request mechanic
  const handleRequestMechanic = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível solicitar mecânico: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    if (!user?.id) {
      toast.error('Usuário não autenticado', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { error } = await supabase.from('mechanic_requests').insert([
      {
        user_id: user.id,
        vehicle_id: mechanicRequest.vehicleId,
        description: mechanicRequest.description,
        location: mechanicRequest.location,
        category_type: mechanicRequest.category_type,
        status: 'pendentes', // Default status
      },
    ]);
    if (error) {
      toast.error('Erro ao solicitar mecânico: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      setMechanicRequest({
        vehicleId: '',
        description: '',
        location: '',
        category_type: '',
      });
      setIsMechanicDialogOpen(false);
      toast.success('Solicitação de mecânico enviada com sucesso!', {
        style: { backgroundColor: '#4ADE80', color: '#ffffff' },
      });
    }
  };

  // Handle request tow
  const handleRequestTow = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível solicitar guincho: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    if (!user?.id) {
      toast.error('Usuário não autenticado', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { error } = await supabase.from('guinchos').insert([
      {
        user_id: user.id,
        vehicle_id: towRequest.vehicleId,
        origin: towRequest.origin,
        destination: towRequest.destination,
        observations: towRequest.observations,
        status: 'pendentes', // Default status
      },
    ]);
    if (error) {
      toast.error('Erro ao solicitar guincho: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      setTowRequest({
        vehicleId: '',
        origin: '',
        destination: '',
        observations: '',
      });
      setIsTowDialogOpen(false);
      toast.success('Solicitação de guincho enviada com sucesso!', {
        style: { backgroundColor: '#4ADE80', color: '#ffffff' },
      });
    }
  };

  // Get user location
  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
        },
        (err) => {
          toast.warning('Não foi possível obter a localização: ' + err.message, {
            style: { backgroundColor: '#FBBF24', color: '#ffffff' },
          });
        }
      );
    } else {
      toast.warning('Geolocalização não suportada pelo navegador.', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
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

  // Get vehicles
  const getVehicles = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.warning('Não foi possível carregar veículos: conexão com o banco de dados não está disponível', {
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
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching vehicles:', error.message);
      toast.warning('Erro ao obter veículos: ' + error.message, {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }
  };

  // Get mechanics
  const getMechanics = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.warning('Não foi possível carregar mecânicos: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      return;
    }
    const { data, error } = await supabase.from('mecanicos').select('*');
    if (error) {
      console.error('Error fetching mechanics:', error.message);
      toast.warning('Erro ao obter mecânicos: ' + error.message, {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      setMechanics([]);
    } else {
      setMechanics(data || []);
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
          await Promise.all([
            getUserLocation().catch((err) => {
              console.warn('Failed to get user location:', err.message);
            }),
            getVehicles().catch((err) => {
              console.warn('Failed to get vehicles:', err.message);
            }),
            fetchUserData().catch((err) => {
              console.warn('Failed to fetch user data:', err.message);
            }),
            getMechanics().catch((err) => {
              console.warn('Failed to get mechanics:', err.message);
            }),
          ]);
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

  // Render fallback UI if critical error
  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden md:flex-row flex-col">
      {/* Sidebar */}
      {/* <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="md:w-64 md:static md:flex md:flex-col bg-white shadow-lg h-full z-50 overflow-y-auto md:overflow-hidden fixed md:relative"
      >
        <div className="p-4 flex items-center space-x-2 border-b border-gray-200 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-purple-600">SOS Mecânicos</h2>
        </div>
        <aside className="hidden md:block">
           <nav className="mt-6">
          <TooltipProvider
            delayDuration={100}
            skipDelayDuration={200}
          >
            <Tooltip>
              <TooltipTrigger>


          <Link
            href="/dashboard/cliente"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold text-purple-700 bg-purple-50"
            >
            Dashboard
          </Link>
              </TooltipTrigger>
            </Tooltip>
          <Link
            href="/dashboard/solicitacoes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
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
          </TooltipProvider>
        </nav>
        </aside>

       
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
      </motion.div> */}

      <Sidebar/>

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
            <h1 className="text-xl md:text-2xl font-semibold text-purple-700">Dashboard</h1>
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
          Bem-vindo(a), {userNome || 'Carregando...'}!
        </motion.h2>

        {/* Dashboard Content */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse border-none shadow-md">
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
            <div className="bg-white shadow-md rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Map and Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Map Placeholder */}
              <div className="md:col-span-2">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Localização dos Mecânicos</CardTitle>
                    <CardDescription className="text-gray-600">
                      Veja a localização dos mecânicos próximos no mapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-600">
                        Mapa indisponível no momento. Tente novamente mais tarde.
                      </p>
                    </div>
                  </CardContent>
                  {userPosition && (
                    <div className="p-4 bg-gray-50 rounded-lg shadow-md mt-4">
                      <h3 className="text-lg font-semibold text-purple-700">Sua Localização</h3>
                      <p className="text-gray-600">
                        Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
                      </p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Stats Cards */}
              <div className="space-y-6">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Veículos Cadastrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">{vehicles.length}</p>
                    <Button
                      onClick={() => setIsVehicleDialogOpen(true)}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!isSupabaseInitialized(supabase)}
                    >
                      Adicionar Veículo
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => setIsMechanicDialogOpen(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!isSupabaseInitialized(supabase)}
                    >
                      Solicitar Mecânico
                    </Button>
                    <Button
                      onClick={() => setIsTowDialogOpen(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!isSupabaseInitialized(supabase)}
                    >
                      Solicitar Guincho
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Vehicles Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-700">Veículos Cadastrados</CardTitle>
                  <CardDescription className="text-gray-600">
                    Gerencie os veículos associados à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicles.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-purple-700">Marca</TableHead>
                            <TableHead className="text-purple-700">Modelo</TableHead>
                            <TableHead className="text-purple-700">Placa</TableHead>
                            <TableHead className="text-purple-700">Ano</TableHead>
                            <TableHead className="text-purple-700">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehicles.map((veiculo) => (
                            <TableRow key={veiculo.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-800">{veiculo.marca}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.modelo}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.placa}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.ano}</TableCell>
                              <TableCell>
                                <Dialog
                                  open={isEditVehicleDialogOpen}
                                  onOpenChange={setIsEditVehicleDialogOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-purple-600 text-purple-600 hover:bg-purple-50 mr-2"
                                      onClick={() =>
                                        setEditVehicle({
                                          id: veiculo.id,
                                          user_id: veiculo.user_id,
                                          marca: veiculo.marca,
                                          modelo: veiculo.modelo,
                                          ano: veiculo.ano,
                                          placa: veiculo.placa,
                                        })
                                      }
                                      disabled={!isSupabaseInitialized(supabase)}
                                    >
                                      Editar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle className="text-purple-700">
                                        Editar Veículo
                                      </DialogTitle>
                                      <DialogDescription>
                                        Atualize os dados do veículo abaixo.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-marca" className="text-right">
                                          Marca
                                        </Label>
                                        <Input
                                          id="edit-marca"
                                          value={editVehicle.marca}
                                          onChange={(e) =>
                                            setEditVehicle({
                                              ...editVehicle,
                                              marca: e.target.value,
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-modelo" className="text-right">
                                          Modelo
                                        </Label>
                                        <Input
                                          id="edit-modelo"
                                          value={editVehicle.modelo}
                                          onChange={(e) =>
                                            setEditVehicle({
                                              ...editVehicle,
                                              modelo: e.target.value,
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-ano" className="text-right">
                                          Ano
                                        </Label>
                                        <Input
                                          id="edit-ano"
                                          type="number"
                                          value={editVehicle.ano}
                                          onChange={(e) =>
                                            setEditVehicle({
                                              ...editVehicle,
                                              ano: parseInt(e.target.value) || 0,
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-placa" className="text-right">
                                          Placa
                                        </Label>
                                        <Input
                                          id="edit-placa"
                                          value={editVehicle.placa}
                                          onChange={(e) =>
                                            setEditVehicle({
                                              ...editVehicle,
                                              placa: e.target.value,
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setIsEditVehicleDialogOpen(false)}
                                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        onClick={handleEditVehicle}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        disabled={!isSupabaseInitialized(supabase)}
                                      >
                                        Salvar
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-50"
                                  onClick={async () => {
                                    if (!isSupabaseInitialized(supabase)) {
                                      toast.error('Não é possível remover veículo: conexão com o banco de dados não está disponível', {
                                        style: { backgroundColor: '#EF4444', color: '#ffffff' },
                                      });
                                      return;
                                    }
                                    const { error } = await supabase
                                      .from('veiculos')
                                      .delete()
                                      .eq('id', veiculo.id);
                                    if (error) {
                                      toast.error('Erro ao remover veículo: ' + error.message, {
                                        style: { backgroundColor: '#EF4444', color: '#ffffff' },
                                      });
                                    } else {
                                      setVehicles(vehicles.filter((v) => v.id !== veiculo.id));
                                      toast.success('Veículo removido com sucesso!', {
                                        style: { backgroundColor: '#4ADE80', color: '#ffffff' },
                                      });
                                    }
                                  }}
                                  disabled={!isSupabaseInitialized(supabase)}
                                >
                                  Remover
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Você ainda não tem nenhum veículo cadastrado.
                      </p>
                      <Button
                        onClick={() => setIsVehicleDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!isSupabaseInitialized(supabase)}
                      >
                        Cadastrar Meu Primeiro Veículo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* User Type Display */}
        {!loading && !criticalError && userType && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-6 text-lg text-gray-600"
          >
            Tipo de usuário:{' '}
            <span className="font-semibold text-purple-700">{userType}</span>
          </motion.p>
        )}

        {/* Dialogs */}
        <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-purple-700">Cadastrar Novo Veículo</DialogTitle>
              <DialogDescription>
                Preencha os dados do veículo para adicioná-lo à sua conta.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="marca" className="text-right">
                  Marca
                </Label>
                <Input
                  id="marca"
                  value={newVehicle.marca}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, marca: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modelo" className="text-right">
                  Modelo
                </Label>
                <Input
                  id="modelo"
                  value={newVehicle.modelo}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, modelo: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ano" className="text-right">
                  Ano
                </Label>
                <Input
                  id="ano"
                  type="number"
                  value={newVehicle.ano === 0 ? '' : newVehicle.ano}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      ano: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="placa" className="text-right">
                  Placa
                </Label>
                <Input
                  id="placa"
                  value={newVehicle.placa}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, placa: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsVehicleDialogOpen(false)}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddVehicle}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!isSupabaseInitialized(supabase)}
              >
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isMechanicDialogOpen} onOpenChange={setIsMechanicDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-purple-700">Solicitar Mecânico</DialogTitle>
              <DialogDescription>
                Informe os detalhes para solicitar um mecânico.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicleId" className="text-right">
                  Veículo
                </Label>
                <Select
                  onValueChange={(value) =>
                    setMechanicRequest({ ...mechanicRequest, vehicleId: value })
                  }
                  value={mechanicRequest.vehicleId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.modelo} - {veiculo.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_type" className="text-left">
                  Tipo de Serviço
                </Label>
                <Select
                  onValueChange={(value) =>
                    setMechanicRequest({ ...mechanicRequest, category_type: value })
                  }
                  value={mechanicRequest.category_type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mecânica Geral">Mecânica Geral</SelectItem>
                    <SelectItem value="Motor e Transmissão">Motor e Transmissão</SelectItem>
                    <SelectItem value="Suspensão e Direção">Suspensão e Direção</SelectItem>
                    <SelectItem value="Elétrica e Eletrônica">Elétrica e Eletrônica</SelectItem>
                    <SelectItem value="Ar-Condicionado">Ar-Condicionado</SelectItem>
                    <SelectItem value="Funilaria e Pintura">Funilaria e Pintura</SelectItem>
                    <SelectItem value="Tuning e Personalização">Tuning e Personalização</SelectItem>
                    <SelectItem value="Engrenagens">Engrenagens</SelectItem>
                    <SelectItem value="Rodas e Pneus">Rodas e Pneus</SelectItem>
                    <SelectItem value="Freios">Freios</SelectItem>
                    <SelectItem value="Escapamento">Escapamento</SelectItem>
                    <SelectItem value="Manutenção Preventiva">Manutenção Preventiva</SelectItem>
                    <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                    <SelectItem value="Troca de Peças">Troca de Peças</SelectItem>
                    <SelectItem value="Reparos">Reparos</SelectItem>
                    <SelectItem value="Socorro Urgente">Socorro Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Problema
                </Label>
                <Textarea
                  id="description"
                  value={mechanicRequest.description}
                  onChange={(e) =>
                    setMechanicRequest({
                      ...mechanicRequest,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Descreva o problema do veículo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Localização
                </Label>
                <Input
                  id="location"
                  value={mechanicRequest.location}
                  onChange={(e) =>
                    setMechanicRequest({
                      ...mechanicRequest,
                      location: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Ex.: Av. Principal, 123"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsMechanicDialogOpen(false)}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRequestMechanic}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={
                  !isSupabaseInitialized(supabase) ||
                  !mechanicRequest.vehicleId ||
                  !mechanicRequest.description ||
                  !mechanicRequest.location ||
                  !mechanicRequest.category_type
                }
              >
                Solicitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTowDialogOpen} onOpenChange={setIsTowDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-purple-700">Solicitar Guincho</DialogTitle>
              <DialogDescription>
                Informe os detalhes para solicitar um guincho.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicleId" className="text-right">
                  Veículo
                </Label>
                <Select
                  onValueChange={(value) =>
                    setTowRequest({ ...towRequest, vehicleId: value })
                  }
                  value={towRequest.vehicleId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.modelo} - {veiculo.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="origin" className="text-right">
                  Origem
                </Label>
                <Input
                  id="origin"
                  value={towRequest.origin}
                  onChange={(e) =>
                    setTowRequest({ ...towRequest, origin: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Ex.: Av. Principal, 123"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="destination" className="text-right">
                  Destino
                </Label>
                <Input
                  id="destination"
                  value={towRequest.destination}
                  onChange={(e) =>
                    setTowRequest({ ...towRequest, destination: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Ex.: Oficina Central, 456"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observations" className="text-right">
                  Observações
                </Label>
                <Textarea
                  id="observations"
                  value={towRequest.observations}
                  onChange={(e) =>
                    setTowRequest({
                      ...towRequest,
                      observations: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Informações adicionais (opcional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTowDialogOpen(false)}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRequestTow}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={
                  !isSupabaseInitialized(supabase) ||
                  !towRequest.vehicleId ||
                  !towRequest.origin ||
                  !towRequest.destination
                }
              >
                Solicitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}