import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Settings, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ServiceType = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_time: number;
};

type WorkingHours = {
  start: string;
  end: string;
  days: string[];
};

type ServiceRequest = {
  id: string;
  vehicle_id: string;
  client_id: string;
  service_type: string;
  scheduled_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  client_name: string;
  vehicle_model: string;
  vehicle_plate: string;
};

interface ServiceRequestResponse {
  id: string;
  vehicle_id: string;
  client_id: string;
  service_type: string;
  scheduled_date: string;
  status: ServiceRequest['status'];
  profiles: {
    full_name: string;
  };
  vehicles: {
    model: string;
    plate: string;
  };
}

function MechanicDashboard() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: '08:00',
    end: '18:00',
    days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
  });
  const [serviceRadius, setServiceRadius] = useState(10);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadServiceTypes();
    loadServiceRequests();
  }, []);

  const loadServiceTypes = async () => {
    try {
      const { data: services, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setServiceTypes(services || []);
    } catch (err) {
      console.error('Erro ao carregar tipos de serviço:', err);
      setErrorMessage('Não foi possível carregar os tipos de serviço');
    }
  };

  const loadServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          vehicle_id,
          client_id,
          service_type,
          scheduled_date,
          status,
          profiles:client_id (full_name),
          vehicles!inner (
            model,
            plate
          )
        `)
        .order('scheduled_date');

      if (error) throw error;
      
      const requests = data as unknown as ServiceRequestResponse[];
      const formattedRequests = requests?.map(request => ({
        id: request.id,
        vehicle_id: request.vehicle_id,
        client_id: request.client_id,
        service_type: request.service_type,
        scheduled_date: request.scheduled_date,
        status: request.status,
        client_name: request.profiles.full_name,
        vehicle_model: request.vehicles.model,
        vehicle_plate: request.vehicles.plate
      })) || [];

      setServiceRequests(formattedRequests);
    } catch (err) {
      console.error('Erro ao carregar solicitações:', err);
      setErrorMessage('Não foi possível carregar as solicitações de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddServiceType = async (data: Omit<ServiceType, 'id'>) => {
    try {
      const { error } = await supabase
        .from('service_types')
        .insert([data]);

      if (error) throw error;
      await loadServiceTypes();
    } catch (err) {
      console.error('Erro ao adicionar tipo de serviço:', err);
      setErrorMessage('Não foi possível adicionar o tipo de serviço');
    }
  };

  const handleUpdateStatus = async (requestId: string, status: ServiceRequest['status']) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      await loadServiceRequests();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setErrorMessage('Não foi possível atualizar o status da solicitação');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Configurações do Mecânico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Configurações</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Funcionamento
              </label>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={workingHours.start}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-200 rounded px-2 py-1"
                />
                <span>até</span>
                <input
                  type="time"
                  value={workingHours.end}
                  onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-200 rounded px-2 py-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raio de Atendimento (km)
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(Number(e.target.value))}
                  className="border border-gray-200 rounded px-2 py-1 w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tipos de Serviço */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Tipos de Serviço</h2>
            </div>
            <button
              onClick={() => {/* Abrir modal de adicionar serviço */}}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {serviceTypes.map(service => (
              <div key={service.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <span className="text-sm font-medium">
                    R$ {service.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Próximos Serviços</h2>
          </div>
          <div className="space-y-3">
            {serviceRequests
              .filter(request => request.status === 'accepted')
              .map(request => (
                <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{request.vehicle_model}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Solicitações de Serviço */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Solicitações de Serviço</h2>
        <div className="space-y-4">
          {serviceRequests
            .filter(request => request.status === 'pending')
            .map(request => (
              <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{request.vehicle_model}</h3>
                    <p className="text-sm text-gray-500">Placa: {request.vehicle_plate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'accepted')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Cliente: {request.client_name}
                </p>
                <p className="text-sm text-gray-600">
                  Data: {new Date(request.scheduled_date).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default MechanicDashboard;