"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

type InsuranceQuote = {
  id: string;
  client_email: string;
  vehicle_model: string;
  quote_value: number;
  created_at: string;
};

type UserData = {
  tipo_usuario: string;
};


export default function InsurerDashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obter sessão do usuário
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();
        
        if (sessionError) throw new Error(`Erro na sessão: ${sessionError.message}`);
        
        if (!session?.user) {
          router.push("/login");
          return;
        }

        const user: User = session.user;
        setUserEmail(user.email);

        // Buscar tipo de usuário
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("tipo_usuario")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Erro ao buscar tipo de usuário:", userError);
          setError("Erro ao carregar dados do usuário.");
          return;
        }

        const userDataTyped = userData as UserData;
        const tipo = userDataTyped.tipo_usuario;
        setUserType(tipo);

        // Redirecionar se não for seguradora
        if (tipo !== "seguradora") {
          if (tipo === "cliente") router.push("/dashboard");
          else if (tipo === "mecanico") router.push("/dashboard/mecanico");
          else if (tipo === "guincho") router.push("/dashboard/guincho");
          else router.push("/login");
          return;
        }

        // Buscar cotações de seguro
        const { data: quotesData, error: quotesError } = await supabase
          .from("insurance_quotes")
          .select("id, client_email, vehicle_model, quote_value, created_at")
          .eq("insurer_id", user.id)
          .order('created_at', { ascending: false });

        if (quotesError) {
          console.error("Erro ao buscar cotações:", quotesError);
          setError("Erro ao carregar cotações.");
          return;
        }
        
        setQuotes(quotesData as InsuranceQuote[] || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.");
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        setError("Erro ao fazer logout. Por favor, tente novamente.");
        return;
      }
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      setError("Ocorreu um erro ao fazer logout. Por favor, tente novamente.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 flex items-center space-x-2">
          <img src="/logo-sos-mecanicos.png" alt="SOS Mecânicos Logo" className="h-8 w-8" />
          <h2 className="text-2xl font-bold text-orange-500">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6">
          <a href="/dashboard/seguradora" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Dashboard
          </a>
          <a href="/cotacoes" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Cotações
          </a>
          <a href="/clientes" className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded">
            Clientes
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
            <h1 className="text-xl font-semibold text-blue-900">Dashboard da Seguradora</h1>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                <AvatarFallback>SE</AvatarFallback>
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
                <CardTitle className="text-blue-900">Cotações Ativas</CardTitle>
                <CardDescription>Cotações enviadas a clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">{quotes.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Clientes Atendidos</CardTitle>
                <CardDescription>Total de clientes na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">15</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Receita Total</CardTitle>
                <CardDescription>Receita gerada com seguros</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">R$ 10.000,00</p>
              </CardContent>
            </Card>
          </div>

          {/* Quotes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Cotações de Seguro</CardTitle>
              <CardDescription>Suas cotações recentes</CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length > 0 ? (
                <ul className="space-y-2">
                  {quotes.map((quote) => (
                    <li key={quote.id} className="p-2 bg-gray-50 rounded">
                      Cliente: {quote.client_email} - Veículo: {quote.vehicle_model} - Valor: R$ {quote.quote_value} - Criada em: {new Date(quote.created_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Nenhuma cotação disponível no momento.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}