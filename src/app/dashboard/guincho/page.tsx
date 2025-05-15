"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/models/supabase";
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

export default function GuinchoDashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [servicosConcluidos, setServicosConcluidos] = useState<number>(0);
  const [ganhosTotais, setGanhosTotais] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw new Error("Erro ao obter sessão: " + sessionError.message);
        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user?.email ?? null);

        // Buscar tipo de usuário
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("tipo_usuario")
          .eq("id", session.user.id)
          .single();

        if (userError) throw new Error("Erro ao buscar tipo de usuário: " + userError.message);

        const tipo = userData?.tipo_usuario;
        setUserType(tipo);

        if (tipo !== "guincho") {
          if (tipo === "cliente") router.push("/dashboard");
          else if (tipo === "mecanico") router.push("/dashboard/mecanico");
          else if (tipo === "seguradora") router.push("/dashboard/seguradora");
          else router.push("/login");
          return;
        }

        // Buscar solicitações com base no filtro de status
        const { data: towData, error: towError } = await supabase
          .from("tow_requests")
          .select("id, origin, destination, created_at, cliente_id, status, guincho_id")
          .eq(filterStatus === "accepted" ? "guincho_id" : "status", filterStatus === "accepted" ? session.user.id : filterStatus);

        if (towError) throw new Error("Erro ao buscar solicitações de guincho: " + towError.message);

        // Buscar nome do cliente para cada solicitação
        const towRequestsWithClient = await Promise.all(
          towData.map(async (request: any) => {
            const { data: clientData, error: clientError } = await supabase
              .from("users")
              .select("email")
              .eq("id", request.cliente_id)
              .single();

            if (clientError) {
              console.error("Erro ao buscar cliente:", clientError);
              return { ...request, clientName: "Desconhecido" };
            }
            return { ...request, clientName: clientData?.email || "Desconhecido" };
          })
        );

        setRequests(towRequestsWithClient || []);

        // Buscar serviços concluídos
        const { count: servicosCount, error: servicosError } = await supabase
          .from("tow_requests")
          .select("*", { count: "exact", head: true })
          .eq("guincho_id", session.user.id)
          .eq("status", "concluido");

        if (servicosError) throw new Error("Erro ao buscar serviços concluídos: " + servicosError.message);
        setServicosConcluidos(servicosCount ?? 0);

        // Buscar ganhos totais
        const { data: ganhosData, error: ganhosError } = await supabase
          .from("tow_requests")
          .select("valor")
          .eq("guincho_id", session.user.id)
          .eq("status", "concluido");

        if (ganhosError) throw new Error("Erro ao buscar ganhos totais: " + ganhosError.message);
        const total = ganhosData?.reduce((sum, request) => sum + (request.valor || 0), 0) ?? 0;
        setGanhosTotais(total);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, filterStatus]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("tow_requests")
        .update({ status: "aceito", guincho_id: userId })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(requests.filter((request) => request.id !== requestId));
      toast.success("Solicitação aceita com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao aceitar solicitação: " + (err.message || "Tente novamente."));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("tow_requests")
        .update({ status: "pending", guincho_id: null })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(requests.filter((request) => request.id !== requestId));
      toast.success("Solicitação rejeitada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao rejeitar solicitação: " + (err.message || "Tente novamente."));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            href="/dashboard/guincho"
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
            href="/precos"
            className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded font-semibold hover:text-blue-900"
          >
            Configurar Preços
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
            <h1 className="text-xl md:text-2xl font-semibold text-blue-900">Dashboard do Guincho</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>GU</AvatarFallback>
            </Avatar>
            <span className="text-gray-600 text-sm md:text-base">{userEmail || "Carregando..."}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-full mt-2"></div>
                <div className="h-6 bg-gray-200 rounded w-full mt-2"></div>
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center mt-6">
            <p>{error}</p>
            <p className="text-sm mt-2">Verifique o console para mais detalhes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Solicitações Pendentes</CardTitle>
                    <CardDescription className="text-gray-600">
                      Solicitações de guincho disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-500">
                      {requests.filter((req) => req.status === "pending").length}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Serviços Concluídos</CardTitle>
                    <CardDescription className="text-gray-600">
                      Total de serviços realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-500">{servicosConcluidos}</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Ganhos Totais</CardTitle>
                    <CardDescription className="text-gray-600">
                      Seus ganhos na plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-500">
                      {ganhosTotais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tow Requests Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-blue-900">Solicitações de Guincho</CardTitle>
                    <CardDescription className="text-gray-600">
                      Gerencie as solicitações de guincho
                    </CardDescription>
                  </div>
                  <Select onValueChange={setFilterStatus} defaultValue={filterStatus}>
                    <SelectTrigger className="w-[180px] border-orange-500 text-orange-500">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="accepted">Aceitas</SelectItem>
                      <SelectItem value="concluido">Concluídas</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {requests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-blue-900">Cliente</TableHead>
                            <TableHead className="text-blue-900">Origem</TableHead>
                            <TableHead className="text-blue-900">Destino</TableHead>
                            <TableHead className="text-blue-900">Distância (km)</TableHead>
                            <TableHead className="text-blue-900">Data de Criação</TableHead>
                            <TableHead className="text-blue-900">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-800">{request.clientName}</TableCell>
                              <TableCell className="text-gray-800">{request.origin}</TableCell>
                              <TableCell className="text-gray-800">{request.destination}</TableCell>
                              <TableCell className="text-gray-800">
                                {(Math.random() * 50 + 5).toFixed(1)} km {/* Distância fictícia */}
                              </TableCell>
                              <TableCell className="text-gray-800">
                                {format(new Date(request.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                {request.status === "pending" ? (
                                  <>
                                    <Button
                                      onClick={() => handleAcceptRequest(request.id)}
                                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 mr-2"
                                      size="sm"
                                    >
                                      Aceitar
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectRequest(request.id)}
                                      variant="outline"
                                      className="border-red-500 text-red-500 hover:bg-red-50"
                                      size="sm"
                                    >
                                      Rejeitar
                                    </Button>
                                  </>
                                ) : request.status === "aceito" ? (
                                  <span className="text-orange-500 font-semibold">Aceita</span>
                                ) : (
                                  <span className="text-green-500 font-semibold">Concluída</span>
                                )}
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