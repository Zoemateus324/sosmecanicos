import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, History, FileCheck, Wrench, Car, Edit, Download, FileText, Upload, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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
  brand: string;
  color: string;
  fuel_type: string;
  notes: string | null;
  service_history: {
    type: string;
    description: string;
    date: string;
    cost: number;
  }[];
  documents: {
    id: string;
    name: string;
    date: string;
    type: string;
  }[];
};

const vehicleTypeLabels: Record<Vehicle['vehicle_type'], string> = {
  carro: 'Carro',
  moto: 'Moto',
  caminhao: 'Caminhão',
  van: 'Van'
};

type TabType = 'info' | 'history' | 'documents';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'info',
    label: 'Informações',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: <History className="h-5 w-5" />,
  },
  {
    id: 'documents',
    label: 'Documentos',
    icon: <FileText className="h-5 w-5" />,
  },
];

function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

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

  const handleScheduleService = () => {
    if (vehicle) {
      navigate(`/client/vehicles/${vehicle.id}/schedule-service`);
    }
  };

  const handleEditVehicle = () => {
    if (vehicle) {
      navigate(`/client/vehicles/${vehicle.id}/edit`);
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    // Implement the logic to download a document
  };

  const handleUploadDocument = () => {
    // Implement the logic to upload a document
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/client/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{vehicle?.model}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleScheduleService}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <Wrench className="h-5 w-5" />
                Agendar Serviço
              </button>
              <button
                onClick={handleEditVehicle}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit className="h-5 w-5" />
                Editar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : vehicle ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Placa</p>
                  <p className="text-lg font-semibold">{vehicle.plate}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Tipo</p>
                  <p className="text-lg font-semibold">{vehicleTypeLabels[vehicle.vehicle_type]}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Quilometragem</p>
                  <p className="text-lg font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Ano</p>
                  <p className="text-lg font-semibold">{vehicle.year}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row border-b border-gray-100">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${
                        activeTab === tab.id
                          ? 'text-yellow-600 bg-yellow-50 border-b-2 border-yellow-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'info' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Informações Básicas</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Marca</p>
                            <p className="font-medium">{vehicle.brand}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Cor</p>
                            <p className="font-medium">{vehicle.color}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Combustível</p>
                            <p className="font-medium">{vehicle.fuel_type}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Manutenção</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Último serviço</p>
                            <p className="font-medium">
                              {vehicle.last_service_date
                                ? new Date(vehicle.last_service_date).toLocaleDateString()
                                : 'Não registrado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Próxima revisão</p>
                            <p className="font-medium">
                              {vehicle.next_service_date
                                ? new Date(vehicle.next_service_date).toLocaleDateString()
                                : 'Não agendada'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Observações</h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.notes || 'Nenhuma observação registrada'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      {vehicle.service_history?.length > 0 ? (
                        vehicle.service_history.map((service, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {service.type}
                              </h4>
                              <p className="text-sm text-gray-600">{service.description}</p>
                            </div>
                            <div className="flex flex-col sm:items-end text-sm">
                              <p className="text-gray-500">
                                {new Date(service.date).toLocaleDateString()}
                              </p>
                              <p className="font-medium text-gray-900">
                                {service.cost.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <History className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum histórico de serviço
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Este veículo ainda não possui serviços registrados
                          </p>
                          <button
                            onClick={handleScheduleService}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                          >
                            <Wrench className="h-5 w-5" />
                            Agendar Serviço
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-6">
                      {vehicle.documents?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {vehicle.documents.map((doc, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {doc.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(doc.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDownloadDocument(doc.id)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Download className="h-5 w-5 text-gray-600" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FileText className="h-4 w-4" />
                                <span>{doc.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum documento
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Este veículo ainda não possui documentos registrados
                          </p>
                          <button
                            onClick={handleUploadDocument}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                          >
                            <Upload className="h-5 w-5" />
                            Enviar Documento
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/client/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle?.model}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleScheduleService}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Wrench className="h-5 w-5" />
              Agendar Serviço
            </button>
            <button
              onClick={handleEditVehicle}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="h-5 w-5" />
              Editar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : vehicle ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Placa</p>
                <p className="text-lg font-semibold">{vehicle.plate}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Tipo</p>
                <p className="text-lg font-semibold">{vehicleTypeLabels[vehicle.vehicle_type]}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Quilometragem</p>
                <p className="text-lg font-semibold">{vehicle.mileage.toLocaleString()} km</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Ano</p>
                <p className="text-lg font-semibold">{vehicle.year}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col sm:flex-row border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-yellow-600 bg-yellow-50 border-b-2 border-yellow-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">Informações Básicas</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Marca</p>
                          <p className="font-medium">{vehicle.brand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cor</p>
                          <p className="font-medium">{vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Combustível</p>
                          <p className="font-medium">{vehicle.fuel_type}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">Manutenção</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Último serviço</p>
                          <p className="font-medium">
                            {vehicle.last_service_date
                              ? new Date(vehicle.last_service_date).toLocaleDateString()
                              : 'Não registrado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Próxima revisão</p>
                          <p className="font-medium">
                            {vehicle.next_service_date
                              ? new Date(vehicle.next_service_date).toLocaleDateString()
                              : 'Não agendada'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">Observações</h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.notes || 'Nenhuma observação registrada'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    {vehicle.service_history?.length > 0 ? (
                      vehicle.service_history.map((service, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {service.type}
                            </h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                          <div className="flex flex-col sm:items-end text-sm">
                            <p className="text-gray-500">
                              {new Date(service.date).toLocaleDateString()}
                            </p>
                            <p className="font-medium text-gray-900">
                              {service.cost.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <History className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum histórico de serviço
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Este veículo ainda não possui serviços registrados
                        </p>
                        <button
                          onClick={handleScheduleService}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          <Wrench className="h-5 w-5" />
                          Agendar Serviço
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    {vehicle.documents?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicle.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {doc.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(doc.date).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownloadDocument(doc.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Download className="h-5 w-5 text-gray-600" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FileText className="h-4 w-4" />
                              <span>{doc.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum documento
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Este veículo ainda não possui documentos registrados
                        </p>
                        <button
                          onClick={handleUploadDocument}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          <Upload className="h-5 w-5" />
                          Enviar Documento
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}

export default VehicleDetails; 