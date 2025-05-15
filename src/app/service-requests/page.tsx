"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServiceRequestList from "@/components/ServiceRequestList";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import ServiceRequestDetails from "@/components/ServiceRequestDetails";
import ServiceRequestMap from "@/components/ServiceRequestMap";

interface ServiceRequest {
  id: string;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

interface Review {
  rating: number;
  comment: string;
}

interface ServiceRequestFormData {
  serviceType: string;
  vehicleType: string;
  problemDescription: string;
  location: {
    lat: number;
    lng: number;
  };
  images: File[];
}

export default function ServiceRequestPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitRequest = async (data: ServiceRequestFormData) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to create service request
      console.log("Submitting request:", data);
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to accept request
      console.log("Accepting request:", requestId);
    } catch (err) {
      console.error("Error accepting request:", err);
      setError("Erro ao aceitar solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to reject request
      console.log("Rejecting request:", requestId);
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError("Erro ao rejeitar solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to complete request
      console.log("Completing request:", requestId);
    } catch (err) {
      console.error("Error completing request:", err);
      setError("Erro ao concluir solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (requestId: string, review: Review) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to submit review
      console.log("Submitting review for request:", requestId, review);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Solicitações de Serviço</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ServiceRequestList
            requests={requests}
            onViewDetails={setSelectedRequest}
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

      {showForm && (
        <ServiceRequestForm
          vehicles={[]} // TODO: Fetch vehicles from API
          onSubmit={handleSubmitRequest}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectedRequest && (
        <ServiceRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
} 