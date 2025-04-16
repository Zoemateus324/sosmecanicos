"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

      setUserEmail(session.user.email);

      const { data, error } = await supabase
        .from("users")
        .select("tipo_usuario")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar tipo de usuário:", error);
        setError("Erro ao carregar dados do usuário.");
      } else {
        setUserType(data.tipo_usuario);
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
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6">
          <a href="#" className="block py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded">
            Dashboard
          </a>
          <a href="/solicitacoes" className="block py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded">
            Solicitações
          </a>
          <a href="#" className="block py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded">
            Perfil
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Dashboard do Usuário</h1>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <span>{userEmail || "Carregando..."}</span>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Ativas</CardTitle>
              <CardDescription>Quantidade de solicitações pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Veículos Cadastrados</CardTitle>
              <CardDescription>Seus veículos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mecânicos Próximos</CardTitle>
              <CardDescription>Mecânicos disponíveis na sua área</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">5</p>
            </CardContent>
          </Card>
        </div>

        {/* User Type Display */}
        {error ? (
          <p className="text-red-500 mt-6">{error}</p>
        ) : userType ? (
          <p className="mt-6 text-lg">Tipo de usuário: {userType}</p>
        ) : (
          <p className="mt-6">Carregando...</p>
        )}
      </div>
    </div>
  );
}