import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    model: '',
    brand: '',
    year: '',
    plate: '',
    mileage: '',
    color: '',
    vehicle_type: '',
    fuel_type: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulação de envio para o backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Limpa o formulário
      setFormData({
        model: '',
        brand: '',
        year: '',
        plate: '',
        mileage: '',
        color: '',
        vehicle_type: '',
        fuel_type: '',
        notes: ''
      });

      // Redireciona para a página de dashboard
      navigate('/client/dashboard');
    } catch (err) {
      setError('Erro ao adicionar veículo. Por favor, tente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Adicionar Veículo</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações do Veículo</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Ano
                  </label>
                  <input
                    type="number"
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-2">
                    Placa
                  </label>
                  <input
                    type="text"
                    id="plate"
                    value={formData.plate}
                    onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                    maxLength={7}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent uppercase"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                    Quilometragem
                  </label>
                  <input
                    type="number"
                    id="mileage"
                    value={formData.mileage}
                    onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
                    min={0}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <input
                    type="text"
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    id="type"
                    value={formData.vehicle_type}
                    onChange={(e) => handleChange('vehicle_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="car">Carro</option>
                    <option value="motorcycle">Moto</option>
                    <option value="truck">Caminhão</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-2">
                    Combustível
                  </label>
                  <select
                    id="fuel"
                    value={formData.fuel_type}
                    onChange={(e) => handleChange('fuel_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o combustível</option>
                    <option value="gasoline">Gasolina</option>
                    <option value="ethanol">Etanol</option>
                    <option value="flex">Flex</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Elétrico</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  placeholder="Adicione observações importantes sobre o veículo..."
                ></textarea>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/client/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Adicionar Veículo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Dicas</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Placa do Veículo</h3>
                <p className="text-sm text-gray-600">
                  Digite a placa sem traços ou espaços. Exemplo: ABC1234
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quilometragem</h3>
                <p className="text-sm text-gray-600">
                  Informe a quilometragem atual do veículo em números inteiros.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Observações</h3>
                <p className="text-sm text-gray-600">
                  Adicione informações importantes como modificações, acessórios ou histórico relevante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle; 