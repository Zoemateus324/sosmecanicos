"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/components/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SupabaseClient } from "@supabase/supabase-js";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Plus, Circle, CircleCheck } from "lucide-react";
import Link from "next/link";

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
  type: "mechanic" | "tow";
  created_at: string;
  location?: string; // Adicionado para suportar requests de mecânico
  category_type?: string; // Adicionado para suportar requests de mecânico
}

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
          className="mt-4 bg-black-600 hover:bg-black-700 text-white"
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
    case "pendente":
    case "pendentes":
      return {
        icon: Circle,
        text: "Pendente",
        color: "text-yellow-600",
      };
    case "aceito":
      return {
        icon: CircleCheck,
        text: "Aceito",
        color: "text-green-600",
      };
   
    default:
      return {
        icon: Circle,
        text: "Desconhecido",
        color: "text-gray-600",
      };
  }
};

export default function ClienteDashboard() {
  const { user, userNome } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isMechanicDialogOpen, setIsMechanicDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [mechanicRequest, setMechanicRequest] = useState({
    vehicleId: "",
    description: "",
    location: "",
    category_type: "",
  });

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    id: "",
    user_id: "",
    marca: "",
    modelo: "",
    ano: 0,
    placa: "",
  });

  const [editVehicle, setEditVehicle] = useState<Vehicle>({
    id: "",
    user_id: "",
    marca: "",
    modelo: "",
    ano: 0,
    placa: "",
  });
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error(
        "Não é possível fazer logout: conexão com o banco de dados não está disponível",
        { style: { backgroundColor: "#EF4444", color: "#ffffff" } }
      );
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair: " + error.message, {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    } else {
      router.push("/login");
    }
  };

  // Handle add vehicle
  const handleAddVehicle = async () => {
    if (!isSupabaseInitialized(supabase) || !user?.id) return;

    if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.placa || newVehicle.ano <= 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios do veículo", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      return;
    }

    const { data, error } = await supabase
      .from("veiculos")
      .insert([{ ...newVehicle, user_id: user.id }])
      .select();
    if (error) {
      toast.error("Erro ao adicionar veículo: " + error.message, {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    } else if (data) {
      setVehicles([...vehicles, data[0]]);
      setNewVehicle({ id: "", user_id: "", marca: "", modelo: "", ano: 0, placa: "" });
      setIsVehicleDialogOpen(false);
      toast.success("Veículo adicionado com sucesso!", {
        style: { backgroundColor: "#4ADE80", color: "#ffffff" },
      });
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = async () => {
    if (!isSupabaseInitialized(supabase) || !editVehicle.id) return;

    if (!editVehicle.marca || !editVehicle.modelo || !editVehicle.placa || editVehicle.ano <= 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios do veículo", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      return;
    }

    const { error } = await supabase
      .from("veiculos")
      .update({ marca: editVehicle.marca, modelo: editVehicle.modelo, ano: editVehicle.ano, placa: editVehicle.placa })
      .eq("id", editVehicle.id);
    if (error) {
      toast.error("Erro ao editar veículo: " + error.message, {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    } else {
      setVehicles(vehicles.map((v) => (v.id === editVehicle.id ? editVehicle : v)));
      setEditVehicle({ id: "", user_id: "", marca: "", modelo: "", ano: 0, placa: "" });
      setIsEditVehicleDialogOpen(false);
      toast.success("Veículo editado com sucesso!", {
        style: { backgroundColor: "#4ADE80", color: "#ffffff" },
      });
    }
  };

  // Handle request mechanic
  const handleRequestMechanic = async () => {
    if (!isSupabaseInitialized(supabase) || !user?.id) return;

    if (!mechanicRequest.vehicleId || !mechanicRequest.description || !mechanicRequest.location || !mechanicRequest.category_type) {
      toast.error("Preencha todos os campos obrigatórios", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      return;
    }

    const { error } = await supabase
      .from("mechanic_requests")
      .insert({
        user_id: user.id,
        cliente_id: user.id,
        vehicle_id: mechanicRequest.vehicleId,
        description: mechanicRequest.description,
        location: mechanicRequest.location,
        category_type: mechanicRequest.category_type,
        status: "pendente",
      });
    if (error) {
      
      toast.error("Erro ao solicitar mecânico: " + error.message, {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    } else {
      setMechanicRequest({ vehicleId: "", description: "", location: "", category_type: "" });
      setIsMechanicDialogOpen(false);
      toast.success("Solicitação de mecânico enviada com sucesso!", {
        style: { backgroundColor: "#4ADE80", color: "#ffffff" },
      });
      await fetchPendingRequests();
    }
  };

  // // Check user logged in
  const checkUserLoggedIn = useCallback(async () => {
    if (!isSupabaseInitialized(supabase)) throw new Error("Cliente não está logado");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Erro ao verificar sessão: " + error.message);
    if (!data.session) router.push("/login");
  }, [supabase, router]);

  // Get vehicles
  const getVehicles = useCallback(async () => {
    if (!isSupabaseInitialized(supabase) || !user?.id) return;
    const { data, error } = await supabase.from("veiculos").select("*").eq("user_id", user.id);
    if (error) {
      console.error("Error fetching vehicles:", error.message);
      toast.warning("Erro ao obter veículos: " + error.message, {
        style: { backgroundColor: "#FBBF24", color: "#ffffff" },
      });
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }
  }, [supabase, user?.id]);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    if (!isSupabaseInitialized(supabase) || !user?.id) return;
    const [mechanicData, towData] = await Promise.all([
      supabase
        .from("mechanic_requests")
        .select("id, user_id, vehicle_id, description, location, category_type, status, created_at")
        .eq("user_id", user.id)
        .in("status", ["pendente", "aceito", "recusado"]),
      supabase
        .from("guinchos")
        .select("id, user_id, vehicle_id, observations, status, created_at")
        .eq("user_id", user.id)
        .in("status", ["Pendente", "Aceita"]),
    ]);

    if (mechanicData.error) {
      console.error("Error fetching mechanic requests:", mechanicData.error.message);
      toast.warning("Erro ao obter solicitações de mecânico: " + mechanicData.error.message, {
        style: { backgroundColor: "#FBBF24", color: "#ffffff" },
      });
    }
    if (towData.error) {
        toast.warning("Erro ao obter solicitações de guincho: " + towData.error.message, {
        style: { backgroundColor: "#FBBF24", color: "#ffffff" },
      });
    }

    const mechanicRequests: ServiceRequest[] = mechanicData.data?.map((req) => ({
      id: req.id,
      user_id: req.user_id,
      vehicle_id: req.vehicle_id,
      problem_description: req.description,
      status: req.status,
      type: "mechanic",
      created_at: req.created_at || new Date().toISOString(),
      location: req.location,
      category_type: req.category_type,
    })) || [];

    const towRequests: ServiceRequest[] = towData.data?.map((req) => ({
      id: req.id,
      user_id: req.user_id,
      vehicle_id: req.vehicle_id,
      problem_description: req.observations || "Solicitação de guincho",
      status: req.status,
      type: "tow",
      created_at: req.created_at || new Date().toISOString(),
    })) || [];

    setPendingRequests([...mechanicRequests, ...towRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, [supabase, user?.id]);

  // Combined useEffect for data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
  try {
    await checkUserLoggedIn();
    if (!isMounted) return;

    // Add a timeout of 10 seconds for the Promise.all
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Tempo limite excedido ao buscar dados")), 10000);
    });

    await Promise.race([
      Promise.all([getVehicles(), fetchPendingRequests()]),
      timeoutPromise,
    ]);
    if (!isMounted) return;
  } catch (error) {
    if (!isMounted) return;
    console.error("Critical error:", error);
    setCriticalError(error instanceof Error ? error.message : "An error occurred");
  } finally {
    if (isMounted) setLoading(false);
  }
};

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [checkUserLoggedIn, getVehicles, fetchPendingRequests]);

  if (criticalError) return <ErrorFallback message={criticalError} />;

  return (
    <div className="flex gap-[2%] flex-wrap content-start">
     <Sidebar />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 p-4 md:p-6 w-full container mx-auto">
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl md:text-2xl font-semibold text-black-700">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>{userNome?.charAt(0).toUpperCase() || "US"}</AvatarFallback>
            </Avatar>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
              Logout
            </Button>
          </div>
        </header>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-black-700 mb-4"
        >
          Bem-vindo(a), {userNome || "Carregando..."}!
        </motion.h2>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                  <span className={`text-sm ${color}`}>{request.status}</span>
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
                          className="mt-2 bg-black-600 hover:bg-black-700 text-white"
                          disabled={!isSupabaseInitialized(supabase)}
                        >
                          <Plus className="mr-1 h-4 w-4" /> Criar Solicitação
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-black-700">Veículos Cadastrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">{vehicles.length}</p>
                    <Button
                      onClick={() => setIsVehicleDialogOpen(true)}
                      className="w-full bg-blue-950 hover:bg-blue-950 text-white"
                      disabled={!isSupabaseInitialized(supabase)}
                    >
                      Adicionar Veículo
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-black-700">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => setIsMechanicDialogOpen(true)}
                      className="w-full bg-blue-950 hover:bg-blue-950 text-white"
                      disabled={!isSupabaseInitialized(supabase)}
                    >
                      Solicitar Mecânico
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-black-700">Veículos Cadastrados</CardTitle>
                  <CardDescription className="text-gray-600">
                    Gerencie os veículos associados à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicles.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="sm:overflow-x-auto">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="hidden sm:table-cell text-black-700">Marca</TableHead>
                            <TableHead className="text-black-700">Modelo</TableHead>
                            <TableHead className="hidden sm:table-cell text-black-700">Placa</TableHead>
                            <TableHead className="hidden sm:table-cell text-black-700">Ano</TableHead>
                            <TableHead className="text-black-700">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehicles.map((veiculo) => (
                            <TableRow key={veiculo.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-800 hidden sm:table-cell">{veiculo.marca}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.modelo}</TableCell>
                              <TableCell className="text-gray-800 hidden sm:table-cell">{veiculo.placa}</TableCell>
                              <TableCell className="text-gray-800 hidden sm:table-cell">{veiculo.ano}</TableCell>
                              <TableCell>
                                <Dialog
                                  open={isEditVehicleDialogOpen}
                                  onOpenChange={setIsEditVehicleDialogOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-black-600 text-black-600 hover:bg-black-50 mr-2"
                                      onClick={() =>
                                        setEditVehicle({
                                          ...veiculo,
                                        })
                                      }
                                      disabled={!isSupabaseInitialized(supabase)}
                                    >
                                      Editar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle className="text-black-700">
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
                                        className="border-black-600 text-black-600 hover:bg-black-50"
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        onClick={handleEditVehicle}
                                        className="bg-blue-950 hover:bg-blue-950 text-white"
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
                                      toast.error(
                                        "Não é possível remover veículo: conexão com o banco de dados não está disponível",
                                        { style: { backgroundColor: "#EF4444", color: "#ffffff" } }
                                      );
                                      return;
                                    }
                                    const { error } = await supabase
                                      .from("veiculos")
                                      .delete()
                                      .eq("id", veiculo.id);
                                    if (error) {
                                      toast.error("Erro ao remover veículo: " + error.message, {
                                        style: { backgroundColor: "#EF4444", color: "#ffffff" },
                                      });
                                    } else {
                                      setVehicles(vehicles.filter((v) => v.id !== veiculo.id));
                                      toast.success("Veículo removido com sucesso!", {
                                        style: { backgroundColor: "#4ADE80", color: "#ffffff" },
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
                        className="bg-black-600 hover:bg-black-700 text-white"
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

        <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-black-700">Cadastrar Novo Veículo</DialogTitle>
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
                  value={newVehicle.ano === 0 ? "" : newVehicle.ano}
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
                className="border-black-600 text-black-600 hover:bg-black-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddVehicle}
                className="bg-blue-950 hover:bg-blue-950 text-white"
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
              <DialogTitle className="text-black-700">Solicitar Mecânico</DialogTitle>
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
                <Label htmlFor="category_type" className="text-right">
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
                className="border-black-600 text-black-600 hover:bg-black-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRequestMechanic}
                className="bg-blue-950 hover:bg-blue-950 text-white"
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