import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Wrench } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';

type Vehicle = {
  id: string;
  vehicle_type: 'carro' | 'moto' | 'caminhao' | 'van';
  model: string;
  year: number;
  plate: string;
  mileage: number;
};

interface ServiceType {
  id: string;
  name: string;
  description: string;
  estimated_duration: number;
  price_range: {
    min: number;
    max: number;
  };
}

const defaultServiceTypes: ServiceType[] = [
  {
    id: 'revisao',
    name: 'Revisão Periódica',
    description: 'Checagem completa do veículo incluindo óleo, filtros, freios e suspensão',
    estimated_duration: 120,
    price_range: {
      min: 200,
      max: 500
    }
  },
  {
    id: 'oleo',
    name: 'Troca de Óleo',
    description: 'Troca de óleo do motor e filtro de óleo',
    estimated_duration: 60,
    price_range: {
      min: 100,
      max: 200
    }
  },
  {
    id: 'freios',
    name: 'Manutenção dos Freios',
    description: 'Verificação e/ou troca de pastilhas, discos e fluido de freio',
    estimated_duration: 90,
    price_range: {
      min: 150,
      max: 400
    }
  },
  {
    id: 'alinhamento',
    name: 'Alinhamento e Balanceamento',
    description: 'Alinhamento das rodas e balanceamento dos pneus',
    estimated_duration: 60,
    price_range: {
      min: 80,
      max: 150
    }
  }
];

const availableTimeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00'
];

function ScheduleService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      if (!id) return;

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setVehicle(vehicle);
    } catch (err) {
      console.error('Erro ao carregar veículo:', err);
      setError('Não foi possível carregar os detalhes do veículo');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceTypeChange = (serviceId: string) => {
    const service = defaultServiceTypes.find(type => type.id === serviceId);
    setSelectedService(service || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle || !selectedDate || !selectedTime || !selectedService) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Erro ao verificar usuário');
      }

      const serviceRequest = {
        vehicle_id: vehicle.id,
        user_id: user.id,
        service_type: selectedService.id,
        scheduled_date: `${selectedDate}T${selectedTime}:00`,
        description: description.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('service_requests')
        .insert([serviceRequest]);

      if (error) throw error;

      navigate(`/client/vehicles/${vehicle.id}?tab=history`);
    } catch (err) {
      console.error('Erro ao agendar serviço:', err);
      setError('Não foi possível agendar o serviço. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !vehicle) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(`/client/vehicles/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Agendar Serviço</h1>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || 'Veículo não encontrado'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(`/client/vehicles/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Agendar Serviço</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Detalhes do Serviço</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Serviço
                  </label>
                  <select
                    id="serviceType"
                    value={selectedService?.id || ''}
                    onChange={(e) => handleServiceTypeChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um tipo de serviço</option>
                    {defaultServiceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Horário
                    </label>
                    <select
                      id="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Problema
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                    placeholder="Descreva o problema ou serviço necessário..."
                    required
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    <Calendar className="h-5 w-5" />
                    Agendar Serviço
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumo do Agendamento</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Veículo</p>
                  <p className="font-medium">{vehicle?.model} {vehicle?.year} • Placa: {vehicle?.plate}</p>
                </div>
                {selectedService && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Serviço</p>
                      <p className="font-medium">{selectedService.name}</p>
                      <p className="text-sm text-gray-600">{selectedService.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duração Estimada</p>
                      <p className="font-medium">{selectedService.estimated_duration} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Preço Estimado</p>
                      <p className="font-medium">
                        {selectedService.price_range.min}
                        {' - '}
                        {selectedService.price_range.max}
                      </p>
                    </div>
                  </>
                )}
                {selectedDate && selectedTime && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Data e Horário</p>
                    <p className="font-medium">
                      {new Date(selectedDate).toLocaleDateString()}, {selectedTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ScheduleService; 