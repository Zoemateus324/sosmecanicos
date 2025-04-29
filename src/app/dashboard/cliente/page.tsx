"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SupabaseProvider,{useSupabase} from "@/components/supabaseprovider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Input } from "@/components/ui/input";

type Mechanic = {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  distance: number;
};

type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
};

export default function ClienteDashboard() {
  const { user, userType, isLoading } = useAuth() as { user: any; userType: keyof typeof dashboardRoutes; isLoading: boolean };
  const supabase = useSupabase();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dashboardRoutes = {
    cliente: "/dashboard/cliente", // Adicione a rota para o cliente aqui
    mecanico: "/dashboard/mecanico",
    guincho: "/dashboard/guincho",
    seguradora: "/dashboard/seguradora",
  };
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && userType && userType !== "cliente") {
      router.push(dashboardRoutes[userType] || "/login");
    } else if (!isLoading && userType === "cliente") {
      fetchMechanics();
      fetchVehicles();
    }
  }, [user, userType, isLoading, router]);
  

  async function fetchMechanics() {
    try {
      const supabaseClient = useSupabase();
      if (!supabaseClient) {
        throw new Error("Supabase client is not initialized.");
      }

      const { data: mechanicsData, error: mechanicsError } = await supabaseClient
        .from("users")
        .select("id, nome, latitude, longitude")
        .eq("tipo_usuario", "mecanico") as { data: Omit<Mechanic, "distance">[] | null, error: any };

      if (mechanicsError) {
        throw new Error("Erro ao carregar mecânicos: " + mechanicsError.message);
      }

      if (mechanicsData) {
        const sortedMechanics = mechanicsData
          .map((mechanic: Omit<Mechanic, "distance">) => ({
            ...mechanic,
            distance: calculateDistance(
              mechanic.latitude || 0,
              mechanic.longitude || 0,
              user?.latitude || 0,
              user?.longitude || 0
            ),
          }))
          .sort((a: Mechanic, b: Mechanic) => a.distance - b.distance);

        setMechanics(sortedMechanics);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar mecânicos.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
    }
  }

  async function fetchVehicles() {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, marca, modelo, ano, placa")
        .eq("user_id", user?.id);

      if (vehiclesError) {
        throw new Error("Erro ao carregar veículos: " + vehiclesError.message);
      }

      setVehicles(vehiclesData || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar veículos.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
    }
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

  async function handleRequestService() {
    if (!selectedMechanic) {
      toast.error("Selecione um mecânico antes de solicitar o serviço.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
      return;
    }

    try {
      const supabaseClient = useSupabase();
      if (!supabaseClient) {
        toast.error("Erro ao conectar ao Supabase.", {
          style: { backgroundColor: "#6B7280", color: "#ffffff" },
        });
        return;
      }

      const { error } = await supabaseClient
        .from("requests")
        .insert({
          user_id: user?.id,
          mechanic_id: selectedMechanic.id,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error("Erro ao solicitar serviço: " + error.message);
      }

      toast.success("Serviço solicitado com sucesso!", {
        style: { backgroundColor: "#7C3AED", color: "#ffffff" },
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar serviço.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="md:w-64 md:static md:flex md:flex-col bg-white shadow-lg h-full z-50"
      >
        <div className="p-4 flex items-center space-x-2">
       {/*
          <Image
            src="/logo-sos-mecanicos.png"
            alt="SOS Mecânicos Logo"
            width={32}
            height={32}
          />
          */} 
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
            href="/perfil"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Perfil
          </a>
        </nav>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 w-full">
        {/* Header */}
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-gray-600" onClick={toggleSidebar}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-purple-700">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>{userNome ? userNome.charAt(0).toUpperCase() : "US"}</AvatarFallback>
            </Avatar>
            <span className="text-gray-600 text-sm md:text-base">{userNome || "Carregando..."}</span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-purple-600 text-purple-600 hover:bg-purple-50 text-sm md:text-base"
            >
              Sair
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
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
                    <CardTitle className="text-purple-700">Localização dos Veículos</CardTitle>
                    <CardDescription className="text-gray-600">
                      Veja a localização dos seus veículos no mapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VehicleMap
                      isDialogOpen={isVehicleDialogOpen || isMechanicDialogOpen || isTowDialogOpen || isEditVehicleDialogOpen || isSidebarOpen}
                      userPosition={userPosition}
                      mechanics={mechanics}
                    />
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
                    <p className="text-3xl font-bold text-gray-800">{veiculos.length}</p>
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
                      disabled={veiculos.length === 0}
                    >
                      Solicitar Mecânico
                    </Button>
                    <Button
                      onClick={() => setIsTowDialogOpen(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={veiculos.length === 0}
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
                  {veiculos.length > 0 ? (
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
                          {veiculos.map((veiculo) => (
                            <TableRow key={veiculo.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-800">{veiculo.marca}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.modelo}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.placa}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.ano}</TableCell>
                              <TableCell>
                                <Dialog open={isEditVehicleDialogOpen} onOpenChange={setIsEditVehicleDialogOpen}>
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
                                          ano: veiculo.ano.toString(),
                                          placa: veiculo.placa,
                                        })
                                      }
                                    >
                                      Editar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle className="text-purple-700">Editar Veículo</DialogTitle>
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
                                            setEditVehicle({ ...editVehicle, marca: e.target.value })
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
                                            setEditVehicle({ ...editVehicle, modelo: e.target.value })
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
                                            setEditVehicle({ ...editVehicle, ano: e.target.value })
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
                                            setEditVehicle({ ...editVehicle, placa: e.target.value })
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
                                      .from("veiculos")
                                      .delete()
                                      .eq("id", veiculo.id);
                                    if (!error) {
                                      setVeiculos(veiculos.filter((v) => v.id !== veiculo.id));
                                      toast.success("Veículo removido com sucesso!", {
                                        style: { backgroundColor: "#7C3AED", color: "#ffffff" },
                                      });
                                    } else {
                                      toast.error("Erro ao remover veículo: " + error.message, {
                                        style: { backgroundColor: "#6B7280", color: "#ffffff" },
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
                      <p className="text-gray-600 mb-4">Você ainda não tem nenhum veículo cadastrado.</p>
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
            Tipo de usuário: <span className="font-semibold text-purple-700">{userType}</span>
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
                  onChange={(e) => setNewVehicle({ ...newVehicle, marca: e.target.value })}
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
                  onChange={(e) => setNewVehicle({ ...newVehicle, modelo: e.target.value })}
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
                  value={newVehicle.ano}
                  onChange={(e) => setNewVehicle({ ...newVehicle, ano: e.target.value })}
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
                  onChange={(e) => setNewVehicle({ ...newVehicle, placa: e.target.value })}
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
              <Button onClick={handleAddVehicle} className="bg-purple-600 hover:bg-purple-700 text-white">
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
                  onValueChange={(value) => setMechanicRequest({ ...mechanicRequest, vehicleId: value })}
                  value={mechanicRequest.vehicleId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.modelo} - {veiculo.placa}
                      </SelectItem>
                    ))}
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
                  onChange={(e) => setMechanicRequest({ ...mechanicRequest, description: e.target.value })}
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
                  onChange={(e) => setMechanicRequest({ ...mechanicRequest, location: e.target.value })}
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
                disabled={!mechanicRequest.vehicleId || !mechanicRequest.description || !mechanicRequest.location}
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
                  onValueChange={(value) => setTowRequest({ ...towRequest, vehicleId: value })}
                  value={towRequest.vehicleId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos.map((veiculo) => (
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
                  onChange={(e) => setTowRequest({ ...towRequest, origin: e.target.value })}
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
                  onChange={(e) => setTowRequest({ ...towRequest, destination: e.target.value })}
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
                  onChange={(e) => setTowRequest({ ...towRequest, observations: e.target.value })}
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
                disabled={!towRequest.vehicleId || !towRequest.origin || !towRequest.destination}
              >
                Solicitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  
    </div>
  );
}
