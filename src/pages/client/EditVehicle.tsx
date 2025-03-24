import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const vehicleTypes = [
  { id: 'carro', label: 'Carro' },
  { id: 'moto', label: 'Moto' },
  { id: 'caminhao', label: 'Caminhão' },
  { id: 'van', label: 'Van' }
];

const fuelTypes = [
  { id: 'gasolina', label: 'Gasolina' },
  { id: 'etanol', label: 'Etanol' },
  { id: 'flex', label: 'Flex' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'gnv', label: 'GNV' },
  { id: 'eletrico', label: 'Elétrico' }
];

interface Vehicle {
  id: string;
  user_id: string;
  vehicle_type: 'carro' | 'moto' | 'caminhao' | 'van';
  model: string;
  year: number;
  plate: string;
  brand: string;
  color: string;
  mileage: number;
  fuel_type: string;
  notes: string | null;
}

function EditVehicle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }

    if (isAuthenticated && id) {
      loadVehicle();
    }
  }, [isAuthenticated, authLoading, id, navigate]);

  const loadVehicle = async () => {
    try {
      if (!id || !user?.id) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Veículo não encontrado');

      setVehicle(data);
    } catch (err) {
      console.error('Erro ao carregar veículo:', err);
      setError('Não foi possível carregar os dados do veículo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!id || !user?.id) {
        throw new Error('Dados inválidos');
      }

      const formData = new FormData(e.currentTarget);
      const vehicleData = {
        vehicle_type: formData.get('type'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        plate: (formData.get('plate') as string).toUpperCase(),
        brand: formData.get('brand')?.toString() || '',
        color: formData.get('color')?.toString() || '',
        mileage: parseInt(formData.get('mileage') as string) || 0,
        fuel_type: formData.get('fuel_type')?.toString() || null,
        notes: formData.get('notes')?.toString() || null
      };

      // Validações
      if (!vehicleData.vehicle_type || !vehicleData.plate || !vehicleData.model || !vehicleData.year) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      // Validação da placa (formatos: Antigo ABC1234/ABC-1234 e Mercosul ABC1D23/ABC0D23)
      const plateRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[-]?[0-9]{4}$/;
      if (!plateRegex.test(vehicleData.plate)) {
        throw new Error('Placa inválida. Use o formato antigo (ABC1234/ABC-1234) ou Mercosul (ABC1D23)');
      }

      // Validação do ano
      const currentYear = new Date().getFullYear();
      if (vehicleData.year < 1900 || vehicleData.year > currentYear + 1) {
        throw new Error('Ano inválido');
      }

      const { error: updateError } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      navigate(`/client/vehicles/${id}`);
    } catch (err) {
      console.error('Erro ao atualizar veículo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar veículo');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      </Layout>
    );
  }

  if (!vehicle) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || 'Veículo não encontrado'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(`/client/vehicles/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Veículo
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Veículo *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue={vehicle.vehicle_type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="" disabled>Selecione um tipo</option>
                  {vehicleTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  id="plate"
                  name="plate"
                  required
                  defaultValue={vehicle.plate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
                  placeholder="ABC1234 ou ABC1D23"
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  defaultValue={vehicle.brand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Ex: Fiat"
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  required
                  defaultValue={vehicle.model}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Ex: Prêmio"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Ano *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  required
                  defaultValue={vehicle.year}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Ex: 1990"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  defaultValue={vehicle.color}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Ex: Vermelho"
                />
              </div>

              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                  Quilometragem
                </label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  defaultValue={vehicle.mileage}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Ex: 50000"
                />
              </div>

              <div>
                <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Combustível
                </label>
                <select
                  id="fuel_type"
                  name="fuel_type"
                  defaultValue={vehicle.fuel_type || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Selecione o combustível</option>
                  {fuelTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={vehicle.notes || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Observações sobre o veículo..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/client/vehicles/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default EditVehicle; 