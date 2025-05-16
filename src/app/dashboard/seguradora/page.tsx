"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

export default function SeguradoraDashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useSupabase();

  // Função para buscar dados do usuário e cotações
  const fetchUserData = useCallback(async () => {
    if (!supabase) {
      setError("Conexão com o banco de dados não está disponível.");
      setLoading(false);
      return;
    }

    try {
      // Obter sessão do usuário
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Erro na sessão: ${sessionError.message}`);
      }

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email ?? null);

      // Buscar tipo de usuário
      const { data: userData, error: userError } = await supabase
        .from("profiles") // Usando 'profiles' para consistência
        .select("tipo_usuario")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("Erro ao buscar tipo de usuário:", userError);
        setError("Erro ao carregar dados do usuário.");
        return;
      }

      const userDataTyped = userData as UserData;
      const tipo = userDataTyped.tipo_usuario;

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
        .eq("insurer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (quotesError) {
        console.error("Erro ao buscar cotações:", quotesError);
        setError("Erro ao carregar cotações.");
        return;
      }

      setQuotes(quotesData as InsuranceQuote[] || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  // Função para logout
  const handleLogout = useCallback(async () => {
    if (!supabase) {
      toast.error("Conexão com o banco de dados não está disponível.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        toast.error("Erro ao fazer logout. Por favor, tente novamente.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        return;
      }
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      toast.error("Ocorreu um erro ao fazer logout. Por favor, tente novamente.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  }, [supabase, router]);

  // Executar fetchUserData na montagem do componente
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="p-6">
          <CardTitle className="text-red-600">Erro</CardTitle>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <nav className="mt-6">
          <a
            href="/dashboard/seguradora"
            className="block py-2.5 px-4 hover:bg-orange-100 rounded font-semibold text-orange-500 bg-orange-50"
          >
            Dashboard
          </a>
          <a
            href="/clientes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-orange-100 rounded font-semibold hover:text-orange-500"
          >
            Clientes
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-blue-900">Dashboard da Seguradora</h1>
            <div className="flex items-center space-x-4">
              
              <Button
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-100 hover:text-orange-500"
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
                <p className="text-2xl font-bold text-orange-500">15</p> {/* TODO: Substituir por dado real */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Receita Total</CardTitle>
                <CardDescription>Receita gerada com seguros</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">R$ 10.000,00</p> {/* TODO: Substituir por dado real */}
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
                      Cliente: {quote.client_email} - Veículo: {quote.vehicle_model} - Valor: R${" "}
                      {quote.quote_value.toFixed(2)} - Criada em:{" "}
                      {new Date(quote.created_at).toLocaleDateString("pt-BR")}
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