'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Plus, Circle, CircleCheck, CircleX } from 'lucide-react';
import Link from 'next/link';


// Define interfaces
interface Vehicle {
  id: string;
  user_id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

interface ServiceRequest {
  id: string;
  user_id: string;
  vehicle_id: string;
  problem_description: string;
  status: string;
  type: 'mechanic' | 'tow';
  created_at: string;
}

// Status info type
interface StatusInfo {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  color: string;
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

// Function to get status info
const getStatusInfo = (status: string): StatusInfo => {
  switch (status.toLowerCase()) {
    case 'Pendente':
      return {
        icon: Circle,
        text: 'Pendente',
        color: 'text-yellow-600',
      };
    case 'aceito':
      return {
        icon: CircleCheck,
        text: 'Aceito',
        color: 'text-green-600',
      };
    case 'recusado':
      return {
        icon: CircleX,
        text: 'Recusado',
        color: 'text-red-600',
      };
    default:
      return {
        icon: Circle,
        text: 'Desconhecido',
        color: 'text-gray-600',
      };
  }
};

export default function ClienteDashboard() {
  const { user, userNome } = useAuth(); // userType obtido do AuthContext
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  
  const [isMechanicDialogOpen, setIsMechanicDialogOpen] = useState(false);
  // Removed unused isTowDialogOpen state
  // Removed unused editingRequest state

  const [mechanicRequest, setMechanicRequest] = useState({
    vehicleId: '',
    description: '',
    location: '',
    category_type: '',
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
  // Removed unused editingRequest state

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
    const { error } = await supabase
    .from('mechanic_requests')
    .insert([
      {
        user_id: user.id,
        cliente_id: user.id,
        vehicle_id: mechanicRequest.vehicleId,
        description: mechanicRequest.description,
        location: mechanicRequest.location,
        category_type: mechanicRequest.category_type,
        status: 'pendentes',
      },
    ]);
    if(error){
      console.error('Error creating mechanic request:', error);
      toast.error('Erro ao solicitar mecânico: ' + (error as Error).message, {
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
      // Refresh pending requests
      await fetchPendingRequests();
    }
  };

  // Handle request tow


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

  // Get vehicles
  const getVehicles = useCallback(async () => {
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
  }, [supabase, user?.id]);

  // Fetch pending requests (mechanic and tow)
  const fetchPendingRequests = useCallback(async () => {
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

    // Fetch mechanic requests
    const { data: mechanicData, error: mechanicError } = await supabase
      .from('mechanic_requests')
      .select('id, user_id, vehicle_id, description, location, category_type, status, created_at, veiculos(id, marca, modelo, placa, ano)')
      .eq('user_id', user.id)
      .in('status', ['pendentes', 'aceito', 'recusado']);

    if (mechanicError) {
      console.error('Error fetching mechanic requests:', mechanicError.message);
      toast.warning('Erro ao obter solicitações de mecânico: ' + mechanicError.message, {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
    }

    // Fetch tow requests
    const { data: towData, error: towError } = await supabase
      .from('guinchos')
      .select('id, user_id, vehicle_id, origin, observations, status, created_at')
      .eq('user_id', user.id)
      .in('status', ['Pendente', 'Aceita', 'Em andamento', 'Concluído', 'Rejeitado']);

    if (towError) {
      console.error('Error fetching tow requests:', towError.message);
      toast.warning('Erro ao obter solicitações de guincho: ' + towError.message, {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
    }

    // Combine and format requests
    const mechanicRequests: ServiceRequest[] = mechanicData?.map((req) => ({
      id: req.id || '',
      user_id: req.user_id,
      vehicle_id: req.vehicle_id,
      problem_description: req.description,
      type: 'mechanic' as const,
      status: req.status,
      created_at: req.created_at || new Date().toISOString()
    })) || [];

    const towRequests: ServiceRequest[] = towData?.map((req) => ({
      id: req.id,
      user_id: req.user_id,
      vehicle_id: req.vehicle_id,
      problem_description: req.observations || 'Solicitação de guincho',
      type: 'tow' as const,
      status: req.status,
      created_at: req.created_at
    })) || [];

    const combinedRequests = [...mechanicRequests, ...towRequests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setPendingRequests(combinedRequests);
  }, [supabase, user?.id]);

  // Combined useEffect for data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await checkUserLoggedIn();
        if (!isMounted) return;

        // Use Promise.allSettled to handle partial failures
        const [vehiclesResult, requestsResult] = await Promise.allSettled([
          getVehicles(),
          fetchPendingRequests()
        ]);

        if (!isMounted) return;

        if (vehiclesResult.status === 'rejected') {
          console.error('Error fetching vehicles:', vehiclesResult.reason);
          toast.error('Erro ao carregar veículos. Por favor, tente novamente.', {
            style: { backgroundColor: '#EF4444', color: '#ffffff' },
          });
        }

        if (requestsResult.status === 'rejected') {
          console.error('Error fetching requests:', requestsResult.reason);
          toast.error('Erro ao carregar solicitações. Por favor, tente novamente.', {
            style: { backgroundColor: '#EF4444', color: '#ffffff' },
          });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Critical error:', error);
        setCriticalError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [checkUserLoggedIn, getVehicles, fetchPendingRequests]);

  // Render fallback UI if critical error
  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden md:flex-row flex-col">
      <Sidebar />

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
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
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
              {/* Pending Requests */}
              <div className="md:col-span-2">
                <Card className="overflow-hidden">
                  <CardHeader className="p-6 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Solicitações Pendentes</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/solicitacoes">Ver Todas</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pendingRequests.length > 0 ? (
                      <div className="divide-y">
                        {pendingRequests.map((request) => {
                          const { icon: StatusIcon, color } = getStatusInfo(request.status);
                          return (
                            <div key={request.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {request.problem_description.substring(0, 50)}...
                                  </p>
                                  <p className="text-sm text-gray-500">ID: {request.id.substring(0, 8)}</p>
                                </div>
                                <div className={`flex items-center ${color}`}>
                                <StatusIcon className="h-4 w-4 mr-1" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">Nenhuma solicitação pendente.</p>
                        <Button
                          onClick={() => setIsMechanicDialogOpen(true)}
                          className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={!isSupabaseInitialized(supabase)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Criar Solicitação
                        </Button>
                      </div>
                    )}
                  </CardContent>
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
                    {/* Removed button for opening isTowDialogOpen */}
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

   

       
      </div>
    </div>
  );
}