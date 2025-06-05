"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "./components/sidebarmecanicos/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/components/SupabaseProvider";
import { Info } from "./components/informativo/Info";
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, Wrench } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { toast } from "sonner";

interface ServiceRequest {
  id: string;
  status: string;
  client_name: string;
  vehicle: string;
  description: string;
  created_at: string;
  estimated_price: number;
  client_id: string;
}

export default function MechanicDashboard() {
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0
  });
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchServiceRequests = useCallback(async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('id, status, client_name, vehicle, description, created_at, estimated_price, client_id')
      .eq('mechanic_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setServiceRequests(data);
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
    fetchServiceRequests();
  }, [fetchServiceRequests, supabase, user?.id]);

  const handleAcceptRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedRequest) return;

    try {
      // Update service request status
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'in_progress' })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('Serviço iniciado com sucesso!');
      fetchServiceRequests(); // Refresh the list
    } catch (error) {
      console.error('Error updating service request:', error);
      toast.error('Erro ao atualizar status do serviço.');
    }
  };

  return (
    <div className="flex gap-[2%] flex-wrap content-start">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 w-full container mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-2xl">Dashboard do Mecânico</CardTitle>
            <p className="text-muted-foreground">Bem-vindo(a), {profile?.full_name}!</p>
          </CardHeader>
          <CardContent>
            <span>Gerencie suas tarefas e solicitações de serviço aqui.</span>
          </CardContent>
        </Card>

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
              <Wrench className="h-4 w-4 text-muted-foreground" />
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

        <Info />

        {/* Service Requests */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Solicitações de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{request.client_name}</h3>
                        <p className="text-sm text-muted-foreground">{request.vehicle}</p>
                        <p className="mt-2">{request.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'in_progress' ? 'default' :
                          'outline'
                        }>
                          {request.status === 'pending' ? 'Pendente' :
                           request.status === 'in_progress' ? 'Em Andamento' :
                           'Concluído'}
                        </Badge>
                        <p className="text-sm font-medium">R$ {request.estimated_price?.toFixed(2)}</p>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedRequest && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={selectedRequest.estimated_price}
          serviceType="mechanic"
          serviceId={selectedRequest.id}
          providerId={user?.id || ''}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

