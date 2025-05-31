'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VehicleForm from "@/components/VehicleForm";
import ServicesList from "@/components/ServicesList";

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: vehicles, error } = await supabase
          .from('veiculos')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          toast.error('Erro ao carregar veículos');
          return;
        }

        setHasVehicle(vehicles && vehicles.length > 0);
        setLoading(false);
      } catch (error) {
        toast.error('Erro ao carregar dados do usuário');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao seu Dashboard</h1>
        
        {!hasVehicle ? (
          <div>
            <p className="mb-4">Você ainda não tem veículos cadastrados.</p>
            <Button onClick={() => setShowVehicleForm(true)}>
              Cadastrar Veículo
            </Button>
            {showVehicleForm && <VehicleForm onSuccess={() => setHasVehicle(true)} />}
          </div>
        ) : (
          <ServicesList />
        )}
      </Card>
    </div>
  );
}