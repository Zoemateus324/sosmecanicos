'use client';

import { useState, useEffect } from 'react';
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
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Mechanic, Vehicle } from '@/types';

// Define LatLngTuple locally
type LatLngTuple = [number, number];

// Dynamic import for VehicleMap
const VehicleMap = dynamic(() => import('@/components/VehicleMap'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-200 animate-pulse" />,
});

interface AuthUser {
  id: string;
  latitude?: number;
  longitude?: number;
}

const metadata: Metadata = {
  title: 'Dashboard - Cliente',
  description: 'Dashboard do cliente para gerenciar veículos e solicitar serviços.',
};

export default function ClienteDashboard() {
  const { user, userType, isLoading, userNome } = useAuth() as {
    user: AuthUser | null;
    userType: keyof typeof dashboardRoutes;
    isLoading: boolean;
    userNome: string;
  };
  const { user: authUser } = useAuth() as { user: AuthUser | null };
  const userId = authUser?.id || null;
  const userLatitude = authUser?.latitude || null;
  const userLongitude = authUser?.longitude || null;
 
  const supabase = useSupabase();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isMechanicDialogOpen, setIsMechanicDialogOpen] = useState(false);
  const [isTowDialogOpen, setIsTowDialogOpen] = useState(false);
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    id: '',
    marca: '',
    modelo: '',
    ano: 0,
    placa: '',
  });
  const [editVehicle, setEditVehicle] = useState<Vehicle>({
    id: '',
    marca: '',
    modelo: '',
    ano: 0,
    placa: '',
  });
  const [mechanicRequest, setMechanicRequest] = useState({
    vehicleId: '',
    description: '',
    location: '',
    service_type:'',
    category_type:'',
  });
  const [towRequest, setTowRequest] = useState({
    vehicleId: '',
    origin: '',
    destination: '',
    observations: '',
  });

  const dashboardRoutes = {
    cliente: '/dashboard/cliente',
    mecanico: '/dashboard/mecanico',
    guincho: '/dashboard/guincho',
    seguradora: '/dashboard/seguradora',
    admin: '/dashboard/admin',
    perfil: '/dashboard/perfil',
    solicitacoes: '/dashboard/solicitacoes',
    ajuda: '/dashboard/ajuda',
  };

 




  // Handle authentication and redirection
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && userType && userType !== 'cliente') {
      router.push(dashboardRoutes[userType] || '/login');
    } else if (!isLoading && userType === 'cliente') {
      fetchMechanics();
      fetchVehicles();
    }
  }, [user, userType, isLoading, router]);

  async function fetchMechanics() {
    try {
      setLoading(true);
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado ou ID do cliente não encontrado.');
      }
      const { data: mechanicsData, error: mechanicsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          locations (
            latitude,
            longitude
          )
        `)
        .eq('user_type', 'mecanico');
      if (mechanicsError) {
        throw new Error('Erro ao carregar mecânicos: ' + mechanicsError.message);
      }
      if (mechanicsData && userPosition) {
        const sortedMechanics = mechanicsData
          .filter(
            (mechanic: any) =>
              mechanic.locations?.latitude && mechanic.locations?.longitude
          )
          .map((mechanic: any) => ({
            id: mechanic.id,
            nome: mechanic.full_name,
            latitude: mechanic.locations.latitude,
            longitude: mechanic.locations.longitude,
            position: [mechanic.locations.latitude, mechanic.locations.longitude] as LatLngTuple,
            distance: calculateDistance(
              userPosition[0],
              userPosition[1],
              mechanic.locations.latitude,
              mechanic.locations.longitude
            ),
          }))
          .sort((a: Mechanic, b: Mechanic) => a.distance - b.distance);
        setMechanics(sortedMechanics);
      }
    } catch (err: any) {
      console.error('Erro ao buscar mecânicos:', err);
      toast.error(err.message || 'Erro ao carregar mecânicos.', {
        style: { backgroundColor: '#6B7280', color: '#ffffff' },
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchVehicles() {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Usuário autenticado em fetchVehicles:', userData); // Debug user
  
      if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado para buscar veículos.');
      }
  
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('veiculos')
        .select('id, marca, modelo, ano, placa')
        .eq('user_id', userData.user.id);
  
      console.log('Dados dos veículos retornados:', vehiclesData); // Debug vehicles
      console.log('Erro ao buscar veículos:', vehiclesError); // Debug error
  
      if (vehiclesError) {
        throw new Error('Erro ao carregar veículos: ' + vehiclesError.message);
      }
  
      setVehicles(vehiclesData || []);
    } catch (err: any) {
      console.error('Erro ao buscar veículos:', err);
      toast.error(err.message || 'Erro ao carregar veículos.');
      setVehicles([]); // Reset on error
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVehicle() {
    try {
      if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.placa) {
        toast.error('Por favor, preencha todos os campos obrigatórios (marca, modelo, placa).', {
          style: { backgroundColor: '#6B7280', color: '#ffffff' },
        });
        return;
      }
      if (
        !newVehicle.ano ||
        newVehicle.ano <= 1900 ||
        newVehicle.ano > new Date().getFullYear()
      ) {
        toast.error('Por favor, insira um ano válido (entre 1900 e o ano atual).', {
          style: { backgroundColor: '#6B7280', color: '#ffffff' },
        });
        return;
      }
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('Erro ao obter usuário:', userError?.message);
        throw new Error('Usuário não autenticado ou ID do cliente não encontrado.');
      }
      const clientId = userData.user.id;
      console.log('Tentando cadastrar veículo:', { ...newVehicle, client_id: clientId });
      const { error: insertError } = await supabase.from('veiculos').insert([
        {
          marca: newVehicle.marca,
          modelo: newVehicle.modelo,
          ano: parseInt(newVehicle.ano.toString()),
          placa: newVehicle.placa,
          user_id: userData.user.id,
        },
      ]);
      if (insertError) {
        console.error('Erro ao cadastrar veículo:', insertError.message);
        throw new Error('Erro ao cadastrar veículo: ' + insertError.message);
      }
      const { data: updatedVehicles, error: fetchError } = await supabase
        .from('veiculos')
        .select('id, marca, modelo, ano, placa')
        .eq('user_id', clientId);
      if (fetchError) {
        throw new Error('Erro ao atualizar lista de veículos: ' + fetchError.message);
      }
      setVehicles(updatedVehicles || []);
      setNewVehicle({ id: '', marca: '', modelo: '', ano: 0, placa: '' });
      setIsVehicleDialogOpen(false);
      toast.success('Veículo adicionado com sucesso!', {
        style: { backgroundColor: '#7C3AED', color: '#ffffff' },
      });
    } catch (err: any) {
      console.error('Erro no handleAddVehicle:', err);
      toast.error(err.message || 'Erro ao adicionar veículo.', {
        style: { backgroundColor: '#6B7280', color: '#ffffff' },
      });
    }
  }

  async function handleEditVehicle() {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado ou ID do cliente não encontrado.');
      }
      const { error } = await supabase
        .from('veiculos')
        .update({
          marca: editVehicle.marca,
          modelo: editVehicle.modelo,
          ano: parseInt(editVehicle.ano.toString()),
          placa: editVehicle.placa,
        })
        .eq('id', editVehicle.id);
      if (error) {
        throw new Error('Erro ao atualizar veículo: ' + error.message);
      }
      const { data: updatedVehicles, error: fetchError } = await supabase
        .from('veiculos')
        .select('id, marca, modelo, ano, placa')
        .eq('user_id', userData.user.id);
      if (fetchError) {
        throw new Error('Erro ao atualizar lista de veículos: ' + fetchError.message);
      }
      setVehicles(updatedVehicles || []);
      setEditVehicle({ id: '', marca: '', modelo: '', ano: 0, placa: '' });
      setIsEditVehicleDialogOpen(false);
      toast.success('Veículo atualizado com sucesso!', {
        style: { backgroundColor: '#7C3AED', color: '#ffffff' },
      });
    } catch (err: any) {
      console.error('Erro ao editar veículo:', err);
      toast.error(err.message || 'Erro ao atualizar veículo.', {
        style: { backgroundColor: '#6B7280', color: '#ffffff' },
      });
    }
  }

  async function handleRequestMechanic() {
    try {
      if (!supabase) {
        throw new Error('Supabase client não inicializado.');
      }
  
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Dados do usuário:', userData); // Verifique os dados do usuário
  
      if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado.');
      }
  
      if (!mechanicRequest.vehicleId) {
        throw new Error('Nenhum veículo selecionado.');
      }
  
      if (!mechanicRequest.description || !mechanicRequest.location) {
        throw new Error('Descrição e localização são obrigatórios.');
      }
  
      // Verificando os dados do pedido
      console.log('Dados do pedido:', {
        cliente_id: userData.user.id,
        vehicle_id: mechanicRequest.vehicleId,
        description: mechanicRequest.description,
        location: mechanicRequest.location,
        service_type:mechanicRequest.service_type,
        category_type: mechanicRequest.category_type,
        status: 'pending',
      });
  
      const { error } = await supabase.from('mechanic_requests').insert({
        cliente_id: userData.user.id, // Changed from cliente_id to user_id
        vehicle_id: mechanicRequest.vehicleId, // UUID string, not an object
        description: mechanicRequest.description,
        location: mechanicRequest.location,
        category_type: mechanicRequest.category_type, //'mecanico',
        service_type: mechanicRequest.service_type, //'mecanico',
        status: 'pending',
      });
  
      if (error) {
        console.error('Erro ao solicitar mecânico:', error);
        throw new Error(`Erro ao solicitar mecânico: ${error.message}`);
      }if (!mechanicRequest.vehicleId || !mechanicRequest.description || !mechanicRequest.location || !mechanicRequest.category_type) {
        throw new Error('Veículo, descrição, localização e tipo de serviço são obrigatórios.');
      }
  
      setMechanicRequest({ vehicleId: '', description: '', location: '', service_type:'', category_type:'' });
      setIsMechanicDialogOpen(false);
      toast.success('Mecânico solicitado com sucesso!', {
        style: { backgroundColor: '#7C3AED', color: '#ffffff' },
      });
    } catch (err: any) {
      console.error('Erro ao solicitar mecânico:', err);
      toast.error(err.message || 'Erro ao solicitar mecânico.', {
        style: { backgroundColor: '#6B7280', color: '#ffffff' },
      });
    }
  }
  

  async function handleRequestTow() {
    try {
      // Verifica se o cliente do Supabase está inicializado
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }
  
      // Obtém os dados do usuário autenticado
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Dados do usuário:', userData); // Verifique os dados do usuário
  
      if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado ou ID do cliente não encontrado.');
      }
  
      // Verifica os dados da solicitação de guincho
      console.log('Solicitação de guincho:', towRequest); // Verifique se os dados do pedido estão corretos
  
      const { error } = await supabase.from('service_requests').insert({
        user_id: userData.user.id,
        service_type: 'guincho',
        description: `Origem: ${towRequest.origin}, Destino: ${towRequest.destination}, Observações: ${towRequest.observations || 'Nenhuma'}`,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
  
      if (error) {
        throw new Error('Erro ao solicitar guincho: ' + error.message);
      }
  
      // Reseta os campos após a solicitação
      setTowRequest({
        vehicleId: '',
        origin: '',
        destination: '',
        observations: '',
      });
      setIsTowDialogOpen(false);
  
      // Exibe mensagem de sucesso
      toast.success('Guincho solicitado com sucesso!', {
        style: { backgroundColor: '#7C3AED', color: '#ffffff' },
      });
    } catch (err: any) {
      console.error('Erro ao solicitar guincho:', err);
      toast.error(err.message || 'Erro ao solicitar guincho.', {
        style: { backgroundColor: '#6B7280', color: '#ffffff' },
      });
    }
  }
  

  async function handleLogout() {
    try {
      if (!supabase) {
        throw new Error('Cliente não inicializado.');
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      toast.error('Erro ao fazer logout. Por favor, tente novamente.', {
        style: { backgroundColor: '#6B7280', color: '#ffffff' },
      });
    }
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden md:flex-row flex-col ">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="md:w-64 md:static md:flex md:flex-col bg-white shadow-lg h-full z-50 overflow-y-auto md:overflow-hidden fixed md:relative"
      >
        <div className="p-4 flex items-center space-x-2 border-b border-gray-200 md:mb-4 ">
          <h2 className="text-xl md:text-2xl font-bold text-purple-600">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6">
          <a
            href="/dashboard"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold text-purple-700 bg-purple-50"
          >
            Dashboard
          </a>
          <a
            href="/solicitacoes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Solicitações
          </a>
          <a
            href="/dashboard/perfil"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Perfil
          </a>
          <a
            href="/ajuda"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
        
          >
            Ajuda
          </a>
          
        
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-2 bg-white border-t  md:hidden z-50  ">
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
                  d={
                    isSidebarOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16m-7 6h7'
                  }
                />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-purple-700">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar"/>
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
          Bem-vindo(a), {userNome || 'Carregando....'}!
        </motion.h2>

        {/* Dashboard Content */}
        {loading ? (
          <div className="space-y-6  animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6  ">
              {[...Array(3)]
              .map((_, index) => (
                <Card key={index} className="animate-pulse  border-none shadow-md">
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
        ) : error ? (
          <div className="text-red-500 text-center mt-6">
            <p>{error}</p>
            <p className="text-sm mt-2">Verifique o console para mais detalhes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Map and Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Map */}
              <div className="md:col-span-2">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Localização dos Mecânicos</CardTitle>
                    <CardDescription className="text-gray-600">
                      Veja a localização dos mecânicos próximos no mapa
                    </CardDescription>
                  </CardHeader>
{userPosition&&(
                    <CardContent className="h-96">
                      {/* <VehicleMap
                        userPosition={userPosition}
                        mechanics={mechanics}
                        vehicles={vehicles}
                      /> */}
                    </CardContent>
                  )}

                  {userPosition && (
                    <div className="p-4 bg-gray-50 rounded-lg shadow-md mt-4">
                      <h3 className="text-lg font-semibold text-purple-700">Sua Localização</h3>
                      <p className="text-gray-600">
                        Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
                      </p>
                    </div>
)}

                  <CardContent>
                  

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
                      
                    >
                      Solicitar Mecânico
                    </Button>
                    <Dialog
                      open={isMechanicDialogOpen}
                      onOpenChange={setIsMechanicDialogOpen}/>
                    <Button
                      onClick={() => setIsTowDialogOpen(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      
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
                                          marca: veiculo.marca,
                                          modelo: veiculo.modelo,
                                          ano: veiculo.ano,
                                          placa: veiculo.placa,
                                        })
                                      }
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
                                    const { error } = await supabase
                                      .from('veiculos')
                                      .delete()
                                      .eq('id', veiculo.id);
                                    if (!error) {
                                      setVehicles(vehicles.filter((v) => v.id !== veiculo.id));
                                      toast.success('Veículo removido com sucesso!', {
                                        style: {
                                          backgroundColor: '#7C3AED',
                                          color: '#ffffff',
                                        },
                                      });
                                    } else {
                                      toast.error('Erro ao remover veículo: ' + error.message, {
                                        style: {
                                          backgroundColor: '#6B7280',
                                          color: '#ffffff',
                                        },
                                      });
                                    }
                                  }}
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
        {!loading && !error && userType && (
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
                  onChange={(e) => {
                    setNewVehicle({ ...newVehicle, marca: e.target.value });
                    
                  }}
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
                  onChange={(e) => {
                    setNewVehicle({ ...newVehicle, modelo: e.target.value });
                    
                  }}
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
                  onChange={(e) => {
                    const ano = parseInt(e.target.value) || 0;
                    setNewVehicle({ ...newVehicle, ano });
                    
                  }}
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
                  onChange={(e) => {
                    setNewVehicle({ ...newVehicle, placa: e.target.value });
                    
                  }}
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
                  !towRequest.vehicleId || !towRequest.origin || !towRequest.destination
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