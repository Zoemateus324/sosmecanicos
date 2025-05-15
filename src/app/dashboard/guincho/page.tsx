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
import { useAuth } from '@/contexts/AuthContext';

interface TowRequest {
  id: string;
  cliente_id: string;
  guincho_id: string | null;
  status: 'pending' | 'accepted' | 'completed';
  created_at: string;
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  clientName: string;
}

export default function GuinchoDashboard() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<TowRequest[]>([]);
  const [servicosConcluidos, setServicosConcluidos] = useState<number>(0);
  const [ganhosTotais, setGanhosTotais] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
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
          (towData || []).map(async (request) => {
            const { data: clientData, error: clientError } = await supabase
              .from("users")
              .select("email")
              .eq("id", request.cliente_id)
              .single();

            if (clientError) {
              console.error("Erro ao buscar cliente:", clientError);
              return { ...request, clientName: "Desconhecido" } as TowRequest;
            }
            return { ...request, clientName: clientData?.email || "Desconhecido" } as TowRequest;
          })
        );

        setRequests(towRequestsWithClient);

        // Buscar serviços concluídos
        const { count: servicosCount, error: servicosError } = await supabase
          .from("tow_requests")
          .select("*", { count: "exact", head: true })
          .eq("guincho_id", session.user.id)
          .eq("status", "completed");

        if (servicosError) throw new Error("Erro ao buscar serviços concluídos: " + servicosError.message);
        setServicosConcluidos(servicosCount ?? 0);

        // Buscar ganhos totais
        const { data: ganhosData, error: ganhosError } = await supabase
          .from("tow_requests")
          .select("valor")
          .eq("guincho_id", session.user.id)
          .eq("status", "completed");

        if (ganhosError) throw new Error("Erro ao buscar ganhos totais: " + ganhosError.message);
        const total = ganhosData?.reduce((sum, request) => sum + (request.valor || 0), 0) ?? 0;
        setGanhosTotais(total);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, router, filterStatus]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("tow_requests")
        .update({ status: "accepted", guincho_id: userId })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(requests.filter((request) => request.id !== requestId));
      toast.success("Solicitação aceita com sucesso!");
    } catch (err) {
      toast.error("Erro ao aceitar solicitação: " + (err instanceof Error ? err.message : "Tente novamente."));
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
    } catch (err) {
      toast.error("Erro ao rejeitar solicitação: " + (err instanceof Error ? err.message : "Tente novamente."));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard do Guincho</h1>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{servicosConcluidos}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganhos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ {ganhosTotais.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="accepted">Aceitos</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Guincho</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.clientName}</TableCell>
                    <TableCell>{request.origin.address}</TableCell>
                    <TableCell>{request.destination.address}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.status === "pending"
                          ? "Pendente"
                          : request.status === "accepted"
                          ? "Aceito"
                          : "Concluído"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            variant="outline"
                            size="sm"
                          >
                            Aceitar
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            variant="outline"
                            size="sm"
                          >
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}