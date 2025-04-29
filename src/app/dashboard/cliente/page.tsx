"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SupabaseProvider,{useSupabase} from "@/components/SupabaseProvider_temp";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mechanic = {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  distance: number;
};

type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
};

export default function ClienteDashboard() {
  const { user, userType, isLoading } = useAuth() as { user: any; userType: keyof typeof dashboardRoutes; isLoading: boolean };
  const supabase = useSupabase();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dashboardRoutes = {
    cliente: "/dashboard/cliente", // Adicione a rota para o cliente aqui
    mecanico: "/dashboard/mecanico",
    guincho: "/dashboard/guincho",
    seguradora: "/dashboard/seguradora",
  };
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && userType && userType !== "cliente") {
      router.push(dashboardRoutes[userType] || "/login");
    } else if (!isLoading && userType === "cliente") {
      fetchMechanics();
      fetchVehicles();
    }
  }, [user, userType, isLoading, router]);
  

  async function fetchMechanics() {
    try {
      const supabaseClient = useSupabase();
      if (!supabaseClient) {
        throw new Error("Supabase client is not initialized.");
      }

      const { data: mechanicsData, error: mechanicsError } = await supabaseClient
        .from("users")
        .select("id, nome, latitude, longitude")
        .eq("tipo_usuario", "mecanico") as { data: Omit<Mechanic, "distance">[] | null, error: any };

      if (mechanicsError) {
        throw new Error("Erro ao carregar mecânicos: " + mechanicsError.message);
      }

      if (mechanicsData) {
        const sortedMechanics = mechanicsData
          .map((mechanic: Omit<Mechanic, "distance">) => ({
            ...mechanic,
            distance: calculateDistance(
              mechanic.latitude || 0,
              mechanic.longitude || 0,
              user?.latitude || 0,
              user?.longitude || 0
            ),
          }))
          .sort((a: Mechanic, b: Mechanic) => a.distance - b.distance);

        setMechanics(sortedMechanics);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar mecânicos.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
    }
  }

  async function fetchVehicles() {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, marca, modelo, ano, placa")
        .eq("user_id", user?.id);

      if (vehiclesError) {
        throw new Error("Erro ao carregar veículos: " + vehiclesError.message);
      }

      setVehicles(vehiclesData || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar veículos.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
    }
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  async function handleRequestService() {
    if (!selectedMechanic) {
      toast.error("Selecione um mecânico antes de solicitar o serviço.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
      return;
    }

    try {
      const supabaseClient = useSupabase();
      if (!supabaseClient) {
        toast.error("Erro ao conectar ao Supabase.", {
          style: { backgroundColor: "#6B7280", color: "#ffffff" },
        });
        return;
      }

      const { error } = await supabaseClient
        .from("requests")
        .insert({
          user_id: user?.id,
          mechanic_id: selectedMechanic.id,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error("Erro ao solicitar serviço: " + error.message);
      }

      toast.success("Serviço solicitado com sucesso!", {
        style: { backgroundColor: "#7C3AED", color: "#ffffff" },
      });
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar serviço.", {
        style: { backgroundColor: "#6B7280", color: "#ffffff" },
      });
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Restante do código */}
      <h1>Usuario logado</h1>
    </div>
  );
}
