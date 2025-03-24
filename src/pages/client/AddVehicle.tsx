import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function AddVehicle() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !user?.id) {
        throw new Error('Você precisa estar logado para cadastrar um veículo');
      }

      const formData = new FormData(e.currentTarget);
      const vehicleData = {
        user_id: user.id,
        vehicle_type: formData.get('type'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        plate: (formData.get('plate') as string).toUpperCase(),
        brand: formData.get('brand'),
        color: formData.get('color'),
        mileage: parseInt(formData.get('mileage') as string) || 0,
        fuel_type: formData.get('fuel_type'),
        notes: formData.get('notes'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

      console.log('Cadastrando veículo...', vehicleData);

      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao cadastrar veículo:', insertError);
        if (insertError.code === '23505') {
          throw new Error('Já existe um veículo cadastrado com esta placa');
        }
        throw new Error(insertError.message || 'Erro ao cadastrar veículo');
      }

      console.log('Veículo cadastrado com sucesso:', data);
      navigate('/client/dashboard');
      
    } catch (err) {
      console.error('Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar veículo');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Adicionar Veículo
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Veículo *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Selecione um tipo</option>
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
                  placeholder="ABC1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
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
                  placeholder="Ex: Volkswagen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                  placeholder="Ex: Gol"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder={new Date().getFullYear().toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                  placeholder="Ex: Prata"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                  min="0"
                  placeholder="Ex: 50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Combustível
                </label>
                <select
                  id="fuel_type"
                  name="fuel_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="etanol">Etanol</option>
                  <option value="flex">Flex</option>
                  <option value="diesel">Diesel</option>
                  <option value="gnv">GNV</option>
                  <option value="eletrico">Elétrico</option>
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
                rows={3}
                placeholder="Informações adicionais sobre o veículo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/client/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar Veículo'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AddVehicle; 