"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

export default function Dashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userNome, setUserNome] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isMechanicDialogOpen, setIsMechanicDialogOpen] = useState(false);
  const [isTowDialogOpen, setIsTowDialogOpen] = useState(false);
  const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ marca: "", modelo: "", ano: "", placa: "" });
  const [editVehicle, setEditVehicle] = useState({ id: "", marca: "", modelo: "", ano: "", placa: "" });
  const [mechanicRequest, setMechanicRequest] = useState({ vehicleId: "", description: "", location: "" });
  const [towRequest, setTowRequest] = useState({ vehicleId: "", origin: "", destination: "", observations: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw new Error("Erro ao obter sessão do usuário: " + sessionError.message);
        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user?.email ?? null);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("nome, email, tipo_usuario")
          .eq("id", session.user.id)
          .single();

        if (userError) throw new Error("Erro ao buscar tipo de usuário: " + userError.message);
        if (!userData) throw new Error("Usuário não encontrado na tabela 'users'.");

        setUserType(userData?.tipo_usuario ?? null);
        setUserNome(userData?.nome ?? null);

        const { data: veiculosData, error: veiculosError } = await supabase
          .from("veiculos")
          .select("id, modelo, placa, ano, marca")
          .eq("user_id", session.user.id);

        if (veiculosError) throw new Error("Erro ao buscar veículos: " + veiculosError.message);
        setVeiculos(veiculosData ?? []);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleAddVehicle = async () => {
    try {
      const { error } = await supabase.from("veiculos").insert({
        marca: newVehicle.marca,
        modelo: newVehicle.modelo,
        ano: parseInt(newVehicle.ano),
        placa: newVehicle.placa,
        user_id: userId,
      });

      if (error) throw new Error("Erro ao cadastrar veículo: " + error.message);

      const { data: updatedVeiculos } = await supabase
        .from("veiculos")
        .select("id, modelo, placa, ano, marca")
        .eq("user_id", userId);

      setVeiculos(updatedVeiculos ?? []);
      setNewVehicle({ marca: "", modelo: "", ano: "", placa: "" });
      setIsVehicleDialogOpen(false);
      toast.success("Veículo cadastrado com sucesso!", {
        style: { backgroundColor: "#f97316", color: "#ffffff" },
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar veículo.", {
        style: { backgroundColor: "#1e3a8a", color: "#ffffff" },
      });
    }
  };

  const handleEditVehicle = async () => {
    try {
      const { error } = await supabase
        .from("veiculos")
        .update({
          marca: editVehicle.marca,
          modelo: editVehicle.modelo,
          ano: parseInt(editVehicle.ano),
          placa: editVehicle.placa,
        })
        .eq("id", editVehicle.id);

      if (error) throw new Error("Erro ao atualizar veículo: " + error.message);

      const { data: updatedVeiculos } = await supabase
        .from("veiculos")
        .select("id, modelo, placa, ano, marca")
        .eq("user_id", userId);

      setVeiculos(updatedVeiculos ?? []);
      setEditVehicle({ id: "", marca: "", modelo: "", ano: "", placa: "" });
      setIsEditVehicleDialogOpen(false);
      toast.success("Veículo atualizado com sucesso!", {
        style: { backgroundColor: "#f97316", color: "#ffffff" },
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar veículo.", {
        style: { backgroundColor: "#1e3a8a", color: "#ffffff" },
      });
    }
  };

  const handleRequestMechanic = async () => {
    try {
      const { error } = await supabase.from("mechanic_requests").insert({
        vehicle_id: mechanicRequest.vehicleId,
        description: mechanicRequest.description,
        location: mechanicRequest.location,
        cliente_id: userId,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw new Error("Erro ao solicitar mecânico: " + error.message);

      setMechanicRequest({ vehicleId: "", description: "", location: "" });
      setIsMechanicDialogOpen(false);
      toast.success("Solicitação de mecânico enviada com sucesso!", {
        style: { backgroundColor: "#f97316", color: "#ffffff" },
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar mecânico.", {
        style: { backgroundColor: "#1e3a8a", color: "#ffffff" },
      });
    }
  };

  const handleRequestTow = async () => {
    try {
      const { error } = await supabase.from("tow_requests").insert({
        vehicle_id: towRequest.vehicleId,
        origin: towRequest.origin,
        destination: towRequest.destination,
        observations: towRequest.observations,
        cliente_id: userId,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw new Error("Erro ao solicitar guincho: " + error.message);

      setTowRequest({ vehicleId: "", origin: "", destination: "", observations: "" });
      setIsTowDialogOpen(false);
      toast.success("Solicitação de guincho enviada com sucesso!", {
        style: { backgroundColor: "#f97316", color: "#ffffff" },
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar guincho.", {
        style: { backgroundColor: "#1e3a8a", color: "#ffffff" },
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 w-64 bg-white shadow-lg h-full z-50 md:static md:w-64 ${isSidebarOpen ? "block" : "hidden md:block"}`}
      >
        <div className="p-4 flex items-center space-x-2">
          <Image
            src="/logo-sos-mecanicos.png"
            alt="SOS Mecânicos Logo"
            width={32}
            height={32}
          />
          <h2 className="text-xl md:text-2xl font-bold text-orange-500">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6">
          <a
            href="/dashboard"
            className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded font-semibold text-blue-900 bg-orange-50"
          >
            Dashboard
          </a>
          <a
            href="/solicitacoes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded font-semibold hover:text-blue-900"
          >
            Solicitações
          </a>
          <a
            href="/perfil"
            className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded font-semibold hover:text-blue-900"
          >
            Perfil
          </a>
        </nav>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
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
            <h1 className="text-xl md:text-2xl font-semibold text-blue-900">Dashboard do Cliente</h1>
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
              className="border-orange-500 text-orange-500 hover:bg-orange-50 text-sm md:text-base"
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
            {/* Grid with 3 Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Cadastrar Veículo</CardTitle>
                    <CardDescription className="text-gray-600">
                      Adicione um novo veículo à sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                          Cadastrar Veículo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-blue-900">Cadastrar Novo Veículo</DialogTitle>
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
                            className="border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleAddVehicle} className="bg-orange-500 hover:bg-orange-600 text-white">
                            Cadastrar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Solicitar Mecânico</CardTitle>
                    <CardDescription className="text-gray-600">
                      Peça ajuda de um mecânico próximo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isMechanicDialogOpen} onOpenChange={setIsMechanicDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                          Solicitar Mecânico
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-blue-900">Solicitar Mecânico</DialogTitle>
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
                            className="border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleRequestMechanic}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={!mechanicRequest.vehicleId || !mechanicRequest.description || !mechanicRequest.location}
                          >
                            Solicitar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Solicitar Guincho</CardTitle>
                    <CardDescription className="text-gray-600">
                      Solicite um guincho para seu veículo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isTowDialogOpen} onOpenChange={setIsTowDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                          Solicitar Guincho
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-blue-900">Solicitar Guincho</DialogTitle>
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
                            className="border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleRequestTow}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={!towRequest.vehicleId || !towRequest.origin || !towRequest.destination}
                          >
                            Solicitar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Vehicles Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-900">Veículos Cadastrados</CardTitle>
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
                            <TableHead className="text-blue-900">Marca</TableHead>
                            <TableHead className="text-blue-900">Modelo</TableHead>
                            <TableHead className="text-blue-900">Placa</TableHead>
                            <TableHead className="text-blue-900">Ano</TableHead>
                            <TableHead className="text-blue-900">Ações</TableHead>
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
                                      className="border-orange-500 text-orange-500 hover:bg-orange-50 mr-2"
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
                                      <DialogTitle className="text-blue-900">Editar Veículo</DialogTitle>
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
                                        className="border-orange-500 text-orange-500 hover:bg-orange-50"
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        onClick={handleEditVehicle}
                                        className="bg-orange-500 hover:bg-orange-600 text-white"
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
                                        style: { backgroundColor: "#f97316", color: "#ffffff" },
                                      });
                                    } else {
                                      toast.error("Erro ao remover veículo: " + error.message, {
                                        style: { backgroundColor: "#1e3a8a", color: "#ffffff" },
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
                        className="bg-orange-500 hover:bg-orange-600 text-white"
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
            Tipo de usuário: <span className="font-semibold text-blue-900">{userType}</span>
          </motion.p>
        )}
      </div>
    </div>
  );
}