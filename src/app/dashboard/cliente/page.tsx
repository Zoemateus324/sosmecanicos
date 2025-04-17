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
import Link from "next/link";

export default function Dashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [userNome, setUserNome] = useState(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Verificar sessão do usuário
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw new Error("Erro ao obter sessão do usuário.");
        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user?.email ?? null);

        // Buscar tipo de usuário
        const { data: userData, error: userError } = await supabase
        .from("users")
        .select("nome, email, tipo_usuario")
        .eq("id", session.user.id)
        .single();
      
      if (userError) throw new Error("Erro ao buscar tipo de usuário: " + userError.message);
      
      setUserType(userData?.tipo_usuario ?? null);
      setUserNome(userData?.nome ?? null); // <- Aqui você salva o nome
      

        // Buscar veículos cadastrados
        const { data: veiculosData, error: veiculosError } = await supabase
          .from("veiculos")
          .select("id, modelo, placa, ano")
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
              <AvatarFallback>US</AvatarFallback>
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
          <p className="text-red-500 text-center mt-6">{error}</p>
        ) : (
          <div className="space-y-6">
            {/* Grid with 3 Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/cadastrar-veiculo">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Cadastrar Veículo</CardTitle>
                      <CardDescription className="text-gray-600">
                        Adicione um novo veículo à sua conta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/solicitar-mecanico">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Solicitar Mecânico</CardTitle>
                      <CardDescription className="text-gray-600">
                        Peça ajuda de um mecânico próximo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link href="/solicitar-guincho">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Solicitar Guincho</CardTitle>
                      <CardDescription className="text-gray-600">
                        Solicite um guincho para seu veículo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M3 8h18M5 8l2-4h10l2 4M7 8v9h10V8H7z"
                          />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
                            <TableHead className="text-blue-900">Modelo</TableHead>
                            <TableHead className="text-blue-900">Placa</TableHead>
                            <TableHead className="text-blue-900">Ano</TableHead>
                            <TableHead className="text-blue-900">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {veiculos.map((veiculo) => (
                            <TableRow key={veiculo.id} className="hover:bg-gray-50">
                              <TableCell className="text-gray-800">{veiculo.modelo}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.placa}</TableCell>
                              <TableCell className="text-gray-800">{veiculo.ano}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500 text-orange-500 hover:bg-orange-50 mr-2"
                                  onClick={() => router.push(`/editar-veiculo/${veiculo.id}`)}
                                >
                                  Editar
                                </Button>
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
                                    } else {
                                      setError("Erro ao remover veículo.");
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
                    <p className="text-gray-600">Nenhum veículo cadastrado.</p>
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