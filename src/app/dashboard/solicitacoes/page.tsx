'use client';
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/models/supabase";
import { Button } from "@/components/ui/button";
import { ServiceRequestDetailsModal} from "@/components/ServiceRequestDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentModal } from "@/components/PaymentModal";
import { toast } from "sonner";
// Update the path below to the actual location of ServiceRequest type, e.g.:
// Update the path below to the actual location of ServiceRequest type, e.g.:
import type { ServiceRequest } from "@/types/ServiceRequest"; // Adjust the path as needed

export default function Solicitacoes() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return; 
  
    const fetchRequests = async () => {
      setLoading(true);
      const clientId = user.id;
  
      try {
        const { data: mechanicData, error: mechanicError } = await supabase
          .from('mechanic_requests')
          .select(`
            id, status, description, location, estimated_price, provider_id:mechanic_id,
            vehicle:vehicle_id ( id, modelo, marca, ano )
          `)
          .eq('cliente_id', clientId);
  
        if (mechanicError) console.error("Erro ao buscar solicitações de mecânico:", mechanicError);
  
        const mechanicRequests = (mechanicData || []).map(req => ({ ...req, service_type: 'mechanic' }));
  
        const { data: towData, error: towError } = await supabase
          .from('tow_requests')
          .select(`
            id, status,
            vehicle:vehicle_id ( id, modelo, marca, ano )
          `)
          .eq('cliente_id', clientId);
  
        if (towError) console.error("Erro ao buscar solicitações de guincho:", towError);
  
        const towRequests = (towData || []).map(req => ({ ...req, service_type: 'tow' }));
  
        const { data: insuranceData, error: insuranceError } = await supabase
          .from('insurance_requests')
          .select(`*`)
          .eq('cliente_id', clientId);
  
        if (insuranceError) console.error("Erro ao buscar solicitações de seguro:", insuranceError);
  
        const insuranceRequests = (insuranceData || []).map(req => ({ ...req, service_type: 'insurance' }));
  
        const allRequests = [...mechanicRequests, ...towRequests, ...insuranceRequests];
        allRequests.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  
        setRequests(allRequests as ServiceRequest[]);
      } catch (error) {
        console.error("Erro inesperado ao buscar solicitações:", error);
        toast.error("Ocorreu um erro ao carregar suas solicitações.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRequests();
  }, [user]);
  

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleEditRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(false);
    // setIsEditModalOpen(true); // Removed unused state
  };
  const handleCancelRequest = async (requestId: number, serviceType: 'mechanic' | 'tow' | 'insurance') => {
    if (!supabase) return;

    if (window.confirm("Tem certeza que deseja cancelar esta solicitação?")) {
      try {
        let query;
        if (serviceType === 'mechanic') query = supabase.from('mechanic_requests');
        else if (serviceType === 'tow') query = supabase.from('tow_requests');
        else if (serviceType === 'insurance') query = supabase.from('insurance_requests');
        else throw new Error("Tipo de serviço desconhecido");

        const { error } = await query
          .update({ status: 'cancelled' })
          .eq('id', requestId);

        if (error) {
          console.error("Erro ao cancelar solicitação no Supabase:", error);
          toast.error("Erro ao cancelar solicitação.");
        } else {
          setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'cancelled' } : req));
          toast.success("Solicitação cancelada com sucesso!");
          setIsDetailsModalOpen(false);
        }
      } catch (error) {
        console.error("Erro inesperado ao cancelar solicitação:", error);
        toast.error("Ocorreu um erro inesperado ao cancelar a solicitação.");
      }
    }
  };

  const handleAcceptAndPayRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedRequest) return;

    try {
      let query;
      if (selectedRequest.service_type === 'mechanic') query = supabase.from('mechanic_requests');
      else if (selectedRequest.service_type === 'tow') query = supabase.from('tow_requests');
      else if (selectedRequest.service_type === 'insurance') query = supabase.from('insurance_requests');
      else throw new Error("Tipo de serviço desconhecido para atualização após pagamento");

      const { error } = await query
        .update({ status: 'in_progress' })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      setRequests(requests.map(req => req.id === selectedRequest.id ? { ...req, status: 'in_progress' } : req));

      toast.success('Pagamento efetuado com sucesso! Solicitação iniciada.');
      setIsPaymentModalOpen(false);
      setSelectedRequest(null);

    } catch (error) {
      console.error('Erro ao atualizar status após pagamento:', error);
      toast.error('Erro ao atualizar status da solicitação após pagamento.');
    }
  };

  const getServiceTypeDisplay = (type?: string | null) => {
    switch (type) {
      case 'mechanic': return 'Mecânico';
      case 'tow': return 'Guincho';
      case 'insurance': return 'Seguro';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="flex gap-[2%] flex-wrap content-start">
      <Sidebar />
      <section className='flex-1 p-4 md:p-6 w-full container mx-auto sm:px-4'>
        <Card>
          <CardContent>
            <CardTitle>
              <h1 className="text-2xl font-bold mb-4">Minhas Solicitações</h1>
              <p>Visualize e gerencie suas solicitações de serviço.</p>
              <Alert className="mt-4" variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>Revise o status das suas solicitações.</AlertDescription>
              </Alert>
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardContent>
            <Table className="sm:overflow-x-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Serviço</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : requests.length > 0 ? (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{getServiceTypeDisplay(req.service_type)}</TableCell>
                      <TableCell>{req.vehicle?.marca} {req.vehicle?.modelo} ({req.vehicle?.ano})</TableCell>
                      <TableCell className="hidden sm:table-cell">{req.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">{req.location || req.origin}</TableCell>
                      <TableCell >{req.status}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewRequest(req)}>
                            Visualizar
                          </Button>
                          {req.status === 'pending' && (
                            <Button variant="destructive" size="sm" onClick={() => handleCancelRequest(req.id, req.service_type as 'mechanic' | 'tow' | 'insurance')}>
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma solicitação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
      <ServiceRequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        onEdit={handleEditRequest}
        onCancel={(requestId) => handleCancelRequest(requestId, selectedRequest?.service_type as 'mechanic' | 'tow' | 'insurance')}
        onAcceptAndPay={handleAcceptAndPayRequest}
      />
      {selectedRequest && isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={selectedRequest.estimated_price || 0}
          serviceType={
            selectedRequest.service_type === "mecanico"
              ? "mechanic"
              : selectedRequest.service_type === "guincho"
              ? "tow"
              : selectedRequest.service_type
          }
          serviceId={selectedRequest.id.toString()}
          providerId={selectedRequest.provider_id || ''}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
