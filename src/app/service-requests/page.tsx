"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceRequest, ServiceRequestFormData } from '@/types/service-request';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ServiceRequestList from "@/components/ServiceRequestList";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import ServiceRequestDetails from "@/components/ServiceRequestDetails";
import ServiceRequestMap from "@/components/ServiceRequestMap";

interface Review {
  rating: number;
  comment: string;
}

interface ExtendedServiceRequest extends ServiceRequest {
  user: {
    name: string;
    email: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
}

export default function ServiceRequests() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<ExtendedServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ExtendedServiceRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match the ExtendedServiceRequest type
        const transformedData = data?.map(request => ({
          ...request,
          user: {
            name: profile?.name || '',
            email: profile?.email || '',
          },
          vehicle: {
            model: request.vehicle_info?.model || '',
            plate: request.vehicle_info?.license_plate || '',
          },
        })) || [];

        setRequests(transformedData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Erro ao carregar solicitações');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, profile]);

  const handleSubmitRequest = async (data: ServiceRequestFormData) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert([
          {
            user_id: user.id,
            service_type: data.service_type,
            description: data.description,
            location: data.location,
            vehicle_info: data.vehicle_info,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      toast.success('Solicitação criada com sucesso!');
      setShowForm(false);
      // Refresh requests list
      const { data: newData } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Transform the data to match the ExtendedServiceRequest type
      const transformedData = newData?.map(request => ({
        ...request,
        user: {
          name: profile.name,
          email: profile.email,
        },
        vehicle: {
          model: request.vehicle_info?.model || '',
          plate: request.vehicle_info?.license_plate || '',
        },
      })) || [];

      setRequests(transformedData);
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Erro ao criar solicitação');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to accept request
      console.log("Accepting request:", requestId);
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error("Erro ao aceitar solicitação");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to reject request
      console.log("Rejecting request:", requestId);
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("Erro ao rejeitar solicitação");
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      // TODO: Implement API call to complete request
      console.log("Completing request:", requestId);
    } catch (err) {
      console.error("Error completing request:", err);
      toast.error("Erro ao concluir solicitação");
    }
  };

  const handleSubmitReview = async (requestId: string, review: Review) => {
    try {
      // TODO: Implement API call to submit review
      console.log("Submitting review for request:", requestId, review);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Erro ao enviar avaliação");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Solicitações</h1>
        <Button onClick={() => setShowForm(true)}>
          Nova Solicitação
        </Button>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Solicitação #{request.id}</h3>
                <p className="text-gray-600">{request.description}</p>
                {request.vehicle_info && (
                  <p className="text-sm text-gray-500 mt-2">
                    Veículo: {request.vehicle_info.make} {request.vehicle_info.model} ({request.vehicle_info.year})
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Localização: {request.location.address}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {request.status}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(request)}
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nova Solicitação</h2>
            <ServiceRequestForm
              onSubmit={handleSubmitRequest}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {selectedRequest && (
        <ServiceRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ServiceRequestList
            requests={requests}
            onViewDetails={(request) => setSelectedRequest(request as ExtendedServiceRequest)}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onComplete={handleCompleteRequest}
          />
        </div>
        <div>
          <ServiceRequestMap
            center={{ lat: -23.5505, lng: -46.6333 }} // São Paulo coordinates
            markers={requests.map((request) => ({
              position: request.location,
              title: request.user.name,
            }))}
            onMarkerClick={(marker) => {
              const request = requests.find(
                (r) => r.location.lat === marker.position.lat && r.location.lng === marker.position.lng
              );
              if (request) {
                setSelectedRequest(request);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 