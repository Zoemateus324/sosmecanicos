import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Car, FileText, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface InsuranceCase {
  id: string;
  client_id: string;
  vehicle_id: string;
  description: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  created_at: string;
  policy_number: string;
  client: {
    full_name: string;
    phone: string;
  };
  vehicle: {
    model: string;
    plate: string;
    year: string;
  };
}

interface InsuranceStats {
  total_cases: number;
  approved_cases: number;
  pending_review: number;
  total_clients: number;
}

export default function InsuranceDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<InsuranceCase[]>([]);
  const [stats, setStats] = useState<InsuranceStats>({
    total_cases: 0,
    approved_cases: 0,
    pending_review: 0,
    total_clients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar casos de seguro
      const { data: casesData, error: casesError } = await supabase
        .from('insurance_cases')
        .select(`
          *,
          client:profiles(*),
          vehicle:vehicles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (casesError) throw casesError;
      setCases(casesData || []);

      // Buscar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .from('insurance_stats')
        .select('*')
        .single();

      if (statsError) throw statsError;
      if (statsData) {
        setStats({
          total_cases: statsData.total_cases || 0,
          approved_cases: statsData.approved_cases || 0,
          pending_review: statsData.pending_review || 0,
          total_clients: statsData.total_clients || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendente',
      in_review: 'Em Análise',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return texts[status as keyof typeof texts] || 'Desconhecido';
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
        {/* Header com Estatísticas */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Painel da Seguradora
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total de Casos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_cases}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Casos Aprovados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved_cases}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Em Análise</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_review}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Casos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Casos Recentes</h2>
            <button
              onClick={() => navigate('/insurance/cases')}
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Ver Todos
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum caso registrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((case_) => (
                <div
                  key={case_.id}
                  className="border border-gray-100 rounded-lg p-4 hover:border-yellow-400 transition-colors cursor-pointer"
                  onClick={() => navigate(`/insurance/cases/${case_.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(case_.status)}`}>
                        {getStatusText(case_.status)}
                      </span>
                      <p className="mt-2 font-medium">Apólice: {case_.policy_number}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(case_.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-medium">{case_.client.full_name}</p>
                      <p className="text-sm text-gray-500">{case_.client.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Veículo</p>
                      <p className="font-medium">{case_.vehicle.model}</p>
                      <p className="text-sm text-gray-500">Placa: {case_.vehicle.plate}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{case_.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dicas e Informações */}
        <div className="mt-8 bg-yellow-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Importantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Tempo de Resposta</h3>
                <p className="text-sm text-gray-600">Mantenha o prazo máximo de 24h para primeira análise</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Documentação</h3>
                <p className="text-sm text-gray-600">Verifique se todos os documentos necessários foram anexados</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Priorização</h3>
                <p className="text-sm text-gray-600">Priorize casos com risco de perda total ou emergências</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}