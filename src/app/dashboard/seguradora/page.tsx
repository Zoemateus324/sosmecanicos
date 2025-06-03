"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InsuranceQuote = {
  id: string;
  client_email: string;
  vehicle_model: string;
  quote_value: number;
  status: string;
  created_at: string;
};

type UserData = {
  tipo_usuario: string;
  nome: string;
};

export default function SeguradoraDashboard() {
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userNome, setUserNome] = useState<string>("");
  const router = useRouter();
  const supabase = useSupabase();

  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    completed: 0,
    totalRevenue: 0
  });

  const fetchUserData = useCallback(async () => {
    if (!supabase) {
      setError("Conexão com o banco de dados não está disponível.");
      setLoading(false);
      return;
    }

    try {
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

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("tipo_usuario, nome")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("Erro ao buscar dados do usuário:", userError);
        setError("Erro ao carregar dados do usuário.");
        return;
      }

      const userDataTyped = userData as UserData;
      setUserNome(userDataTyped.nome);

      if (userDataTyped.tipo_usuario !== "seguradora") {
        if (userDataTyped.tipo_usuario === "cliente") router.push("/dashboard");
        else if (userDataTyped.tipo_usuario === "mecanico") router.push("/dashboard/mecanico");
        else if (userDataTyped.tipo_usuario === "guincho") router.push("/dashboard/guincho");
        else router.push("/login");
        return;
      }

      const { data: quotesData, error: quotesError } = await supabase
        .from("insurance_quotes")
        .select("*")
        .eq("insurer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (quotesError) {
        console.error("Erro ao buscar cotações:", quotesError);
        setError("Erro ao carregar cotações.");
        return;
      }

      const quotesTyped = quotesData as InsuranceQuote[];
      setQuotes(quotesTyped);

      // Calculate stats
      const stats = {
        active: quotesTyped.filter(q => q.status === 'active').length,
        pending: quotesTyped.filter(q => q.status === 'pending').length,
        completed: quotesTyped.filter(q => q.status === 'completed').length,
        totalRevenue: quotesTyped
          .filter(q => q.status === 'completed')
          .reduce((sum, q) => sum + q.quote_value, 0)
      };
      setStats(stats);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  const handleLogout = useCallback(async () => {
    if (!supabase) {
      toast.error("Conexão com o banco de dados não está disponível.");
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      toast.error("Ocorreu um erro ao fazer logout. Por favor, tente novamente.");
    }
  }, [supabase, router]);

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
            <div>
              <h1 className="text-xl font-semibold text-blue-900">Dashboard da Seguradora</h1>
              <p className="text-muted-foreground">Bem-vindo(a), {userNome}!</p>
            </div>
            <Button
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-100 hover:text-orange-500"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cotações Ativas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quotes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Cotações de Seguro</CardTitle>
              <CardDescription>Suas cotações recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>{quote.client_email}</TableCell>
                      <TableCell>{quote.vehicle_model}</TableCell>
                      <TableCell>R$ {quote.quote_value.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          quote.status === 'pending' ? 'secondary' :
                          quote.status === 'active' ? 'default' :
                          'outline'
                        }>
                          {quote.status === 'pending' ? 'Pendente' :
                           quote.status === 'active' ? 'Ativo' :
                           'Concluído'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}