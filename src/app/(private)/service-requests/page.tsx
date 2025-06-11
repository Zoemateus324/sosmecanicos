"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/components/SupabaseProvider";
import { ServiceRequest } from "@/types/service-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


interface ExtendedServiceRequest extends ServiceRequest {
  user: {
    name: string;
    full_name: string;
    email: string;
  };
  vehicle_info?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export default function ServiceRequests() {
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [requests, setRequests] = useState<ExtendedServiceRequest[]>([]);
  // Removed unused selectedRequest state

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user || !supabase) {
        toast.error("Usuário não autenticado ou conexão com o banco de dados não disponível.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        // setLoading(false); // Removed: no loading state defined
        return;
      }
      try {
        const { data, error } = await supabase
          .from("service_requests")
          .select("*, vehicle_info(make, model, year, license_plate)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedData: ExtendedServiceRequest[] = data?.map((request) => ({
          ...request,
          user: {
            full_name: profile?.full_name || "Usuário Desconhecido",
            email: profile?.email || "",
          },
          vehicle_info: request.vehicle_info || undefined,
        })) || [];

        setRequests(transformedData);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Erro ao carregar solicitações", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
      } finally {
        
      }
    };
    fetchRequests();
  }, [user, profile, supabase]);

  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Minhas Solicitações</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
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
                    Veículo: {request.vehicle_info.make} {request.vehicle_info.model} ({request.vehicle_info.year})
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Localização: {request.location?.address}
                </p>
                <p className="text-sm text-gray-500">Status: {request.status}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
