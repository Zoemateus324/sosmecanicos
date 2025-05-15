"use client";
import { useState } from "react";
import { supabase } from "@/models/supabase";
import { useRouter } from "next/navigation";

export default function Solicitar() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = Number(e.target.value);
    setLocation(prev => prev ? { ...prev, lat } : { lat, lng: 0 });
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = Number(e.target.value);
    setLocation(prev => prev ? { ...prev, lng } : { lat: 0, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !vehicleType || !location) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { error: requestError } = await supabase
        .from('service_requests')
        .insert([
          {
            user_id: user.id,
            service_type: serviceType,
            vehicle_type: vehicleType,
            location: location,
            status: 'pending'
          }
        ]);

      if (requestError) throw requestError;

      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating request:', err);
      setError('Erro ao criar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Solicitar Serviço</h2>
      <select
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">Selecione o tipo de serviço</option>
        <option value="guincho">Guincho</option>
        <option value="mecanica">Mecânica</option>
        <option value="pneu">Troca de Pneu</option>
      </select>
      <input
        type="text"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        placeholder="Tipo do Veículo"
        className="border p-2 mb-4 w-full"
      />
      <input
        type="number"
        value={location?.lat || ''}
        onChange={handleLatChange}
        placeholder="Latitude"
        className="border p-2 mb-4 w-full"
      />
      <input
        type="number"
        value={location?.lng || ''}
        onChange={handleLngChange}
        placeholder="Longitude"
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Enviar Solicitação
      </button>
      {loading && <p>Enviando...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}