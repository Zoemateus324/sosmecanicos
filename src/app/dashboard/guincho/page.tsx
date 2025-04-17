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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TowTruckDashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [towRequests, setTowRequests] = useState<any[]>([]);
  const [servicosConcluidos, setServicosConcluidos] = useState<number>(0);
  const [ganhosTotais, setGanhosTotais] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

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

        if (userError) throw new Error("Erro ao buscar tipo de usuário.");

        const tipo = userData?.tipo_usuario;
        setUserType(tipo);

        if (tipo !== "guincho") {
          if (tipo === "cliente") router.push("/dashboard");
          else if (tipo === "mecanico") router.push("/dashboard/mecanico");
          else if (tipo === "seguradora") router.push("/dashboard/seguradora");
          else router.push("/login");
          return;
        }

        // Buscar solicitações pendentes
        const { data: towData, error: towError } = await supabase
          .from("tow_requests")
          .select("id, origin, destination, created_at, cliente_id")
          .eq("status", "pending");

        if (towError) throw new Error("Erro ao buscar solicitações de guincho.");
        setTowRequests(towData || []);

        // Buscar serviços concluídos
        const { count: servicosCount, error: servicosError } = await supabase
          .from("tow_requests")
          .select("*", { count: "exact", head: true })
          .eq("guincho_id", session.user.id)
          .eq("status", "concluido");

        if (servicosError) throw new Error("Erro ao buscar serviços concluídos.");
        setServicosConcluidos(servicosCount ?? 0);

        // Buscar ganhos totais
        const { data: ganhosData, error: ganhosError } = await supabase
          .from("tow_requests")
          .select("valor")
          .eq("guincho_id", session.user.id)
          .eq("status", "concluido");

        if (ganhosError) throw new Error("Erro ao buscar ganhos totais.");
        const total = ganhosData?.reduce((sum, request) => sum + (request.valor || 0), 0) ?? 0;
        setGanhosTotais(total);
      } catch (err: any) {
        setError(err.message || "Erro ao car cregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("tow_requests")
        .update({ status: "aceito", guincho_id: userId })
        .eq("id", requestId);

      if (error) throw error;

      setTowRequests(towRequests.filter((request) => request.id !== requestId));
    } catch (err) {
      setError("Erro ao aceitar solicitação. Tente novamente.");
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
          <p className="text-red-500 text-center mt-6">{error}</p>
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
                    <p className="text-2xl font-bold text-orange-500">{towRequests.length}</p>
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
                <CardHeader>
                  <CardTitle className="text-blue-900">Solicitações de Guincho</CardTitle>
                  <CardDescription className="text-gray-600">
                    Solicitações que você pode aceitar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {towRequests.length > 0 ? (
                    <ul className="space-y-4">
                      {towRequests.map((request) => (
                        <li
                          key={request.id}
                          className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition"
                        >
                          <div>
                            <p className="text-gray-800 font-semibold">
                              De: {request.origin} - Para: {request.destination}
                            </p>
                            <p className="text-gray-600 text-sm">
                              Criada em: {format(new Date(request.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600"
                          >
                            Aceitar
                          </Button>
                        </li>
                      ))}
                    </ul>
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