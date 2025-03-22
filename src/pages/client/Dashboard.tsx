import React, { useState, useEffect } from 'react';
import { Car, Wrench, History, FileCheck, ArrowRight, Search, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AddVehicleModal } from '../../components/AddVehicleModal';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';

type Vehicle = {
  id: string;
  vehicle_type: 'carro' | 'moto' | 'caminhao' | 'van';
  model: string;
  year: number;
  plate: string;
  mileage: number;
  last_service_date: string | null;
  next_service_date: string | null;
};

type VehicleInput = {
  vehicle_type: 'carro' | 'moto' | 'caminhao' | 'van';
  model: string;
  year: string;
  plate: string;
  mileage: string;
};

type SearchFilterType = 'all' | 'model' | 'plate' | 'type';

const vehicleTypeLabels: Record<Vehicle['vehicle_type'], string> = {
  carro: 'Carro',
  moto: 'Moto',
  caminhao: 'Caminhão',
  van: 'Van'
};

function ClientDashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilterType>('all');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVehicles(vehicles || []);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
      setError('Não foi possível carregar seus veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (data: VehicleInput) => {
    try {
      setError(null);
      console.log('Iniciando adição de veículo:', data);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erro ao obter usuário:', userError);
        throw new Error('Erro ao verificar usuário');
      }

      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      console.log('Usuário autenticado:', user.id);

      const vehicleData = {
        user_id: user.id,
        vehicle_type: data.vehicle_type,
        model: data.model,
        year: parseInt(data.year),
        plate: data.plate.toUpperCase(),
        mileage: parseInt(data.mileage),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Dados do veículo formatados:', vehicleData);

      const { error: insertError } = await supabase
        .from('vehicles')
        .insert([vehicleData]);

      if (insertError) {
        console.error('Erro ao inserir veículo:', insertError);
        throw insertError;
      }

      console.log('Veículo adicionado com sucesso');
      setIsAddModalOpen(false);
      await loadVehicles();
    } catch (err) {
      console.error('Erro completo ao adicionar veículo:', err);
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar o veículo');
    }
  };


  const handleViewHistory = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita a navegação para a página de detalhes
    navigate(`/client/vehicles/${vehicleId}?tab=history`);
  };

  const handleViewDocuments = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita a navegação para a página de detalhes
    navigate(`/client/vehicles/${vehicleId}?tab=documents`);
  };

  const handleScheduleService = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita a navegação para a página de detalhes
    navigate(`/client/vehicles/${vehicleId}/schedule-service`);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;

    switch (searchFilter) {
      case 'model':
        return vehicle.model.toLowerCase().includes(search);
      case 'plate':
        return vehicle.plate.toLowerCase().includes(search);
      case 'type':
        return vehicleTypeLabels[vehicle.vehicle_type].toLowerCase().includes(search);
      case 'all':
      default:
        return (
          vehicle.model.toLowerCase().includes(search) ||
          vehicle.plate.toLowerCase().includes(search) ||
          vehicleTypeLabels[vehicle.vehicle_type].toLowerCase().includes(search)
        );
    }
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Meus Veículos</h1>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value as SearchFilterType)}
              className="w-full sm:w-[150px] px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[center_right_0.5rem]"
            >
              <option value="all">Todos</option>
              <option value="model">Modelo</option>
              <option value="plate">Placa</option>
              <option value="type">Tipo</option>
            </select>
            <button
              onClick={() => navigate('/client/vehicles/add')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Adicionar Veículo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `Não encontramos nenhum veículo com "${searchTerm}"`
                : 'Comece adicionando seu primeiro veículo'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/client/vehicles/add')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Adicionar Veículo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.model}
                    </h3>
                    <p className="text-gray-600">{vehicle.plate}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    {vehicleTypeLabels[vehicle.vehicle_type]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleService(vehicle.id, e);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Wrench className="h-4 w-4" />
                    <span className="hidden sm:inline">Agendar Serviço</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewHistory(vehicle.id, e);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Histórico</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDocuments(vehicle.id, e);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Documentos</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Adicionar Veículo */}
        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddVehicle}
        />
      </div>
    </Layout>
  );
}

export default ClientDashboard;