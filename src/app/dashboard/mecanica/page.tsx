"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MechanicDashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [solicitations, setSolicitations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email ?? null);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("tipo_usuario")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("Erro ao buscar tipo de usuário:", userError);
        setError("Erro ao carregar dados do usuário.");
        return;
      }

      const tipo = userData?.tipo_usuario;
      setUserType(tipo ?? null);

      if (tipo !== "mecanico") {
        if (tipo === "cliente") router.push("/dashboard");
        else if (tipo === "guincho") router.push("/dashboard/guincho");
        else if (tipo === "seguradora") router.push("/dashboard/seguradora");
        else router.push("/login");
        return;
      }

      // Fetch available solicitations
      const { data: solicitationsData, error: solicitationsError } = await supabase
        .from("solicitations")
        .select("id, description, created_at, user_id")
        .eq("status", "pending");

      if (solicitationsError) {
        console.error("Erro ao buscar solicitações:", solicitationsError);
        setError("Erro ao carregar solicitações.");
      } else {
        setSolicitations(solicitationsData || []);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 flex items-center space-x-2">
          {/*<img src="/logo-sos-mecanicos.png" alt="SOS Mecânicos Logo" className="h-8 w-8" />*/}
          <h2 className="text-2xl font-bold text-orange-500">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6">
          <a href="/dashboard/mecanico" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Dashboard
          </a>
          <a href="/solicitacoes" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Solicitações
          </a>
          <a href="/historico" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Histórico
          </a>
          <a href="/perfil" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Perfil
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-blue-900">Dashboard do Mecânico</h1>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                <AvatarFallback>{userType}</AvatarFallback>
              </Avatar>
              <span className="text-gray-700">{userEmail || "Carregando..."}</span>
              <Button
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-100"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Solicitações Pendentes</CardTitle>
                <CardDescription>Solicitações disponíveis para aceitar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">{solicitations.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Serviços Concluídos</CardTitle>
                <CardDescription>Total de serviços realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">10</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Ganhos Totais</CardTitle>
                <CardDescription>Seus ganhos na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">R$ 2.500,00</p>
              </CardContent>
            </Card>
          </div>

          {/* Solicitations Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Solicitações Disponíveis</CardTitle>
              <CardDescription>Solicitações que você pode aceitar</CardDescription>
            </CardHeader>
            <CardContent>
              {solicitations.length > 0 ? (
                <ul className="space-y-2">
                  {solicitations.map((solicitation) => (
                    <li key={solicitation.id} className="p-2 bg-gray-50 rounded">
                      {solicitation.description} - Criada em: {new Date(solicitation.created_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Nenhuma solicitação disponível no momento.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}