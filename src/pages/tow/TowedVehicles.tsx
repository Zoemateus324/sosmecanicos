import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TowedVehicle {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    plate: string;
  };
  client: {
    full_name: string;
    phone: string;
  };
  pickup_location: string;
  delivery_location: string;
  status: 'in_progress' | 'completed';
  created_at: string;
}

export default function TowedVehicles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<TowedVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchTowedVehicles();
  }, [user, navigate]);

  const fetchTowedVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('towed_vehicles')
        .select(`
          id,
          pickup_location,
          delivery_location,
          status,
          created_at,
          vehicle:vehicle_id (make, model, year, plate),
          client:client_id (full_name, phone)
        `)
        .eq('tow_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform the data to match the TowedVehicle interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        vehicle: item.vehicle[0],
        client: item.client[0],
        pickup_location: item.pickup_location,
        delivery_location: item.delivery_location,
        status: item.status,
        created_at: item.created_at
      }));
      setVehicles(transformedData);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('towed_vehicles')
        .update({ status: 'completed' })
        .eq('id', vehicleId);

      if (error) throw error;
      
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === vehicleId ? { ...vehicle, status: 'completed' } : vehicle
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Veículos Guinchados</h1>

        <div className="grid gap-6">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Nenhum veículo guinchado encontrado.
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vehicle.vehicle.make} {vehicle.vehicle.model} ({vehicle.vehicle.year})
                    </h3>
                    <p className="text-gray-600">Placa: {vehicle.vehicle.plate}</p>
                    <p className="text-gray-600">
                      Cliente: {vehicle.client.full_name} - Tel: {vehicle.client.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {vehicle.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(vehicle.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Local de Retirada:</span>{' '}
                    {vehicle.pickup_location}
                  </p>
                  <p>
                    <span className="font-medium">Local de Entrega:</span>{' '}
                    {vehicle.delivery_location}
                  </p>
                </div>

                {vehicle.status === 'in_progress' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleStatusUpdate(vehicle.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Marcar como Concluído
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}