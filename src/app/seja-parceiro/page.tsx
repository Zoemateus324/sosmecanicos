"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/components/SupabaseProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MechanicRequest {
  id: string;
  user_id: string;
  description: string;
  status: string;
  created_at: string;
  vehicle: string;
}

export default function MechanicDashboard() {
  const { user, userNome, signOut } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setCriticalError("Usuário não autenticado ou conexão com o banco de dados não disponível.");
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from("service_requests")
          .select("id, user_id, description, status, created_at, vehicle")
          .eq("assigned_mechanic_id", user.id)
          .eq("status", "pending");

        if (error) {
          throw new Error(`Erro ao buscar solicitações: ${error.message}`);
        }

        setMechanicRequests(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao carregar solicitações.";
        toast.error(errorMessage, {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        setCriticalError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, supabase]);

  const handleAcceptRequest = async (requestId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) {
        throw new Error(`Erro ao aceitar solicitação: ${error.message}`);
      }

      setMechanicRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req))
      );
      toast.success("Solicitação aceita com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao aceitar solicitação.";
      toast.error(errorMessage, {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (criticalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{criticalError}</p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        aria-live="polite"
        role="status"
      >
        <p className="text-lg font-medium text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
        aria-hidden={!isSidebarOpen}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-purple-700">SOS Mecânicos</h2>
          <p className="mt-2 text-gray-600">Bem-vindo, {userNome || "Mecânico"}!</p>
          <nav className="mt-4 space-y-2">
            <Button
              onClick={() => router.push("/dashboard/mecanica")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Minhas Solicitações
            </Button>
            <Button
              onClick={() => router.push("/perfil")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Perfil
            </Button>
            <Button
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Sair
            </Button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Button
          onClick={toggleSidebar}
          className="md:hidden mb-4 bg-purple-600 hover:bg-purple-700 text-white"
          aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isSidebarOpen ? "Fechar Menu" : "Abrir Menu"}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-700">
              Solicitações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mechanicRequests.length === 0 ? (
              <p className="text-gray-600">Nenhuma solicitação pendente no momento.</p>
            ) : (
              <ul className="space-y-4">
                {mechanicRequests.map((request) => (
                  <li key={request.id} className="p-4 bg-white rounded-lg shadow">
                    <p>
                      <strong>Veículo:</strong> {request.vehicle}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {request.description}
                    </p>
                    <p>
                      <strong>Criado em:</strong>{" "}
                      {new Date(request.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <Button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                      disabled={request.status !== "pending"}
                    >
                      {request.status === "pending" ? "Aceitar Solicitação" : "Aceita"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}