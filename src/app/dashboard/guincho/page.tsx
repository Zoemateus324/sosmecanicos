"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/components/SupabaseProvider";
import { Calendar, Clock, DollarSign, Truck } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { toast } from "sonner";

interface TowRequest {
  id: string;
  status: string;
  client_name: string;
  origin: string;
  destination: string;
  created_at: string;
  estimated_price: number;
  client_id: string;
}

export default function GuinchoDashboard() {
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [towRequests, setTowRequests] = useState<TowRequest[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<TowRequest | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchTowRequests = useCallback(async () => {
    const { data } = await supabase
      .from('tow_requests')
      .select('*')
      .eq('tow_truck_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTowRequests(data);
      // Calculate stats
      const stats = {
        pending: data.filter(req => req.status === 'pending').length,
        inProgress: data.filter(req => req.status === 'in_progress').length,
        completed: data.filter(req => req.status === 'completed').length,
        totalEarnings: data
          .filter(req => req.status === 'completed')
          .reduce((sum, req) => sum + (req.estimated_price || 0), 0)
      };
      setStats(stats);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    fetchTowRequests();
  }, [fetchTowRequests, supabase, user?.id]);

  const handleAcceptRequest = (request: TowRequest) => {
    setSelectedRequest(request);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedRequest) return;

    try {
      // Update tow request status
      const { error } = await supabase
        .from('tow_requests')
        .update({ status: 'in_progress' })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('Serviço iniciado com sucesso!');
      fetchTowRequests(); // Refresh the list
    } catch (error) {
      console.error('Error updating tow request:', error);
      toast.error('Erro ao atualizar status do serviço.');
    }
  };

  const filteredRequests = towRequests.filter(request => 
    statusFilter === "all" ? true : request.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard do Guincho</h1>
          <p className="text-muted-foreground">Bem-vindo(a), {profile?.full_name}!</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
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
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.client_name}</TableCell>
                    <TableCell>{request.origin}</TableCell>
                    <TableCell>{request.destination}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>R$ {request.estimated_price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'in_progress' ? 'default' :
                        'outline'
                      }>
                        {request.status === 'pending' ? 'Pendente' :
                         request.status === 'in_progress' ? 'Em Andamento' :
                         'Concluído'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleAcceptRequest(request)}
                        >
                          Aceitar e Pagar
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implementar finalização do serviço
                          }}
                        >
                          Finalizar Serviço
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedRequest && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={selectedRequest.estimated_price}
          serviceType="tow"
          serviceId={selectedRequest.id}
          providerId={user?.id || ''}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}