"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/components/SupabaseProvider";
import { ServiceRequest, ServiceRequestFormData } from "@/types/service-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    full_name: string;
    email: string;
    name:string;

  };
}

export default function ServiceRequests() {
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [requests, setRequests] = useState<ExtendedServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ExtendedServiceRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user || !supabase) {
        toast.error("Usuário não autenticado ou conexão com o banco de dados não disponível.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("service_requests")
          .select("*, vehicle_info(make, model, year, license_plate)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedData = data?.map((request) => ({
          ...request,
          user: {
            full_name: profile?.full_name || "Usuário Desconhecido",
            email: profile?.email || "",
          },
          vehicle: {
            make: request.vehicle_info?.make || "",
            model: request.vehicle_info?.model || "",
            year: request.vehicle_info?.year || 0,
            license_plate: request.vehicle_info?.license_plate || "",
          },
        })) || [];

        setRequests(transformedData);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Erro ao carregar solicitações", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, profile, supabase]);

  const handleSubmitRequest = async (data: ServiceRequestFormData) => {
    if (!user || !profile || !supabase) {
      toast.error("Usuário não autenticado ou conexão com o banco de dados não disponível.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      return;
    }

    try {
      const { data: newRequest, error } = await supabase
        .from("service_requests")
        .insert([
          {
            user_id: user.id,
            service_type: data.service_type,
            description: data.description,
            location: data.location,
            
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("*, vehicle_info(make, model, year, license_plate)")
        .single();

      if (error) throw error;

      const transformedRequest: ExtendedServiceRequest = {
        ...newRequest,
        user: {
          full_name: profile.full_name,
          email: profile.email,
        },
        vehicle: {
          make: newRequest.vehicle_info?.make || "",
          model: newRequest.vehicle_info?.model || "",
          year: newRequest.vehicle_info?.year || 0,
          license_plate: newRequest.vehicle_info?.license_plate || "",
        },
      };

      setRequests((prev) => [transformedRequest, ...prev]);
      toast.success("Solicitação criada com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Erro ao criar solicitação", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req))
      );
      toast.success("Solicitação aceita com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Erro ao aceitar solicitação", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

    
      toast.success("Solicitação rejeitada com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Erro ao rejeitar solicitação", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "completed" } : req))
      );
      toast.success("Solicitação concluída com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (error) {
      console.error("Error completing request:", error);
      toast.error("Erro ao concluir solicitação", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

  const handleSubmitReview = async (requestId: string, review: Review) => {
    if (!supabase || !user) return;

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          request_id: requestId,
          user_id: user.id,
          rating: review.rating,
          comment: review.comment,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success("Avaliação enviada com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Erro ao enviar avaliação", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Minhas Solicitações</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          aria-label="Criar nova solicitação"
        >
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
                    Veículo: {request.vehicle_info.make} {request.vehicle_info.model} (
                    {request.vehicle_info.year})
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Localização: {request.location.address}
                </p>
                <p className="text-sm text-gray-500">Status: {request.status}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(request)}
                  aria-label={`Ver detalhes da solicitação ${request.id}`}
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-request-title"
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 id="new-request-title" className="text-xl font-bold mb-4">
              Nova Solicitação
            </h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
            center={
              requests.length > 0
                ? { lat: requests[0].location.lat, lng: requests[0].location.lng }
                : { lat: -23.5505, lng: -46.6333 }
            }
            markers={requests.map((request) => ({
              position: request.location,
              title: request.user.full_name,
            }))}
            onMarkerClick={(marker) => {
              const request = requests.find(
                (r) =>
                  r.location.lat === marker.position.lat &&
                  r.location.lng === marker.position.lng
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