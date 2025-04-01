import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ServiceRequest {
  id: string;
  description: string;
  status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price?: number;
  quote_description?: string;
  quote_status?: 'pending' | 'accepted' | 'rejected';
  location?: {
    latitude: number;
    longitude: number;
  };
  vehicle: {
    brand: string;
    model: string;
    plate: string;
  };
  created_at: string;
  scheduled_date: string;
  service_type: string;
  mechanic?: {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
  };
}

type ServiceDetailsPopupProps = {
  serviceRequest: ServiceRequest;
  onClose: () => void;
  onQuoteResponse?: (requestId: string, accepted: boolean) => Promise<void>;
};

type Proposal = {
  id: string;
  service_request_id: string;
  mechanic_id: string;
  client_id: string;
  original_value: number;
  platform_fee: number;
  total_value: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'paid';
  created_at: string;
  updated_at: string;
  payment_id?: string;
  mechanic?: {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
  };
};

export function ServiceDetailsPopup({ serviceRequest, onClose, onQuoteResponse }: ServiceDetailsPopupProps) {
  const handleQuoteResponse = async (requestId: string, accepted: boolean) => {
    if (onQuoteResponse) {
      await onQuoteResponse(requestId, accepted);
    }
  };
  const openLocationInMaps = () => {
    if (serviceRequest.location?.latitude && serviceRequest.location?.longitude) {
      const url = `https://www.google.com/maps?q=${serviceRequest.location.latitude},${serviceRequest.location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const renderQuoteDetails = () => {
    if (serviceRequest.status === 'quoted' && serviceRequest.price) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Detalhes do Orçamento</h3>
          <p className="mt-2 text-gray-600">Valor: R$ {serviceRequest.price.toFixed(2)}</p>
          {serviceRequest.quote_description && (
            <p className="mt-2 text-gray-600">{serviceRequest.quote_description}</p>
          )}
          {serviceRequest.quote_status === 'pending' && onQuoteResponse && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleQuoteResponse(serviceRequest.id, true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Aceitar Orçamento
              </button>
              <button
                onClick={() => handleQuoteResponse(serviceRequest.id, false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Rejeitar Orçamento
              </button>
            </div>
          )}
          {serviceRequest.quote_status === 'accepted' && (
            <p className="mt-2 text-green-600 font-medium">Orçamento aceito</p>
          )}
          {serviceRequest.quote_status === 'rejected' && (
            <p className="mt-2 text-red-600 font-medium">Orçamento rejeitado</p>
          )}
        </div>
      );
    }
    return null;
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (serviceRequest?.id) {
      loadProposals();
    }
  }, [serviceRequest]);

  const loadProposals = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar propostas para esta solicitação de serviço
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          mechanic:mechanic_id(id, full_name, phone, email)
        `)
        .eq('service_request_id', serviceRequest.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProposals(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar propostas:', err);
      setError('Não foi possível carregar as propostas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando';
      case 'accepted':
        return 'Aceito';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'accepted':
        return 'text-blue-500';
      case 'in_progress':
        return 'text-purple-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Detalhes da Solicitação</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Informações da Solicitação</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(serviceRequest.status)} bg-opacity-10 bg-current`}>
              {getStatusText(serviceRequest.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Veículo</p>
              <p className="font-medium">
                {serviceRequest.vehicle.brand} {serviceRequest.vehicle.model} • {serviceRequest.vehicle.plate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data da Solicitação</p>
              <p className="font-medium">{formatDate(serviceRequest.created_at)}</p>
            </div>
            {serviceRequest.scheduled_date && (
              <div>
                <p className="text-sm text-gray-500">Data Agendada</p>
                <p className="font-medium">{formatDate(serviceRequest.scheduled_date)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Tipo de Serviço</p>
              <p className="font-medium">{serviceRequest.service_type}</p>
            </div>
            {serviceRequest.location && (
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <button
                  onClick={openLocationInMaps}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Abrir no Maps
                </button>
              </div>
            )}
          </div>
          {renderQuoteDetails()}

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Descrição</p>
            <p className="text-gray-700">{serviceRequest.description}</p>
          </div>

          {serviceRequest.mechanic && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Mecânico Responsável</h4>
              <p className="text-gray-700">{serviceRequest.mechanic.full_name}</p>
              <p className="text-gray-600">{serviceRequest.mechanic.phone}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-3">Orçamentos Recebidos</h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {proposal.mechanic?.full_name || 'Mecânico'}
                      </h4>
                      <p className="text-sm text-gray-500">{formatDate(proposal.created_at)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)} bg-opacity-10 bg-current`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{proposal.description}</p>
                  
                  <div className="space-y-1">
                    <p className="text-sm">Valor do serviço: {formatCurrency(proposal.original_value)}</p>
                    <p className="text-sm">Taxa da plataforma: {formatCurrency(proposal.platform_fee)}</p>
                    <p className="font-medium">Total: {formatCurrency(proposal.total_value)}</p>
                  </div>

                  {proposal.status === 'pending' && (
                    <div className="mt-4 flex justify-end">
                      <button 
                        className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                        onClick={() => {
                          // Aqui seria implementada a lógica para aceitar a proposta
                          // Redirecionamento para tela de pagamento ou outro fluxo
                          window.location.href = `/client/payment/${proposal.id}`;
                        }}
                      >
                        Aceitar Orçamento
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum orçamento recebido ainda.</p>
              {serviceRequest.status === 'pending' && (
                <p className="text-sm text-gray-400 mt-1">Aguardando mecânicos enviarem propostas.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}