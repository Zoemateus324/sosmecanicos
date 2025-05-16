import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho conforme seu projeto
import Sidebar from '@/components/sidebar/Sidebar';
import StatusBadge from './StatusBadge';
import ErrorFallback from './ErrorFallback';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import Button from './Button';
import ServiceRequestDetails from './ServiceRequestDetails';

type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
};

type Request = {
  id: string;
  user_id: string;
  vehicle_id: string;
  description: string;
  location: string;
  category_type: string;
  status: string;
  created_at: string;
  veiculos: Vehicle | null;
};

type User = {
  id: string;
  email: string;
  // outros campos do usuário se necessário
};

const statusMap: Record<string, string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  finalizado: 'Finalizado',
};

export default function Dashboard({ user }: { user: User | null }) {
  const [mechanicRequests, setMechanicRequests] = useState<Request[]>([]);
  const [guinchos, setGuinchos] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<string>('pendente');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Função para logout - ajuste conforme seu método de logout
  function handleLogout() {
    supabase.auth.signOut().then(() => {
      window.location.reload();
    });
  }

  // Função para buscar dados da tabela no Supabase
  const fetchData = useCallback(
    async (table: string, setData: React.Dispatch<React.SetStateAction<Request[]>>) => {
      if (!user) return;

      const { data, error } = await supabase
        .from<Request>(table)
        .select(`
          id,
          user_id,
          vehicle_id,
          description,
          location,
          category_type,
          status,
          created_at,
          veiculos (
            id,
            marca,
            modelo,
            placa,
            ano
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setCriticalError(`Erro ao buscar dados de ${table}: ${error.message}`);
        setData([]);
      } else {
        setData(data ?? []);
      }
    },
    [user]
  );

  // Função para buscar todas as solicitações
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setCriticalError(null);
    try {
      await Promise.all([
        fetchData('solicitacoes_mecanico', setMechanicRequests),
        fetchData('guincho', setGuinchos),
      ]);
    } catch (err) {
      setCriticalError('Erro inesperado ao buscar solicitações.');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filtrar solicitações conforme aba e pesquisa
  const allRequests = useMemo(() => [...mechanicRequests, ...guinchos], [mechanicRequests, guinchos]);

  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const matchesStatus = req.status === tab;
      const matchesSearch =
        req.description.toLowerCase().includes(search.toLowerCase()) ||
        req.category_type.toLowerCase().includes(search.toLowerCase()) ||
        (req.veiculos?.modelo.toLowerCase().includes(search.toLowerCase()) ?? false);

      return matchesStatus && matchesSearch;
    });
  }, [allRequests, tab, search]);

  if (!user) {
    return <ErrorFallback message="Você precisa estar logado para acessar esta página." />;
  }

  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Solicitações</h1>
          <Button onClick={handleLogout} variant="destructive" aria-label="Sair da conta">
            Sair
          </Button>
        </header>

        <section className="mb-4">
          <input
            type="search"
            placeholder="Pesquisar solicitações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Pesquisar solicitações"
          />
        </section>

        <nav className="mb-6 flex flex-wrap gap-3" aria-label="Filtros de status">
          {Object.keys(statusMap).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === key ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
              }`}
              aria-pressed={tab === key}
            >
              {statusMap[key]}
            </button>
          ))}
        </nav>

        {loading ? (
          <p className="text-center text-gray-500">Carregando solicitações...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-600">Nenhuma solicitação encontrada.</p>
        ) : (
          <ul role="list" className="space-y-4">
            {filteredRequests.map((req) => (
              <li
                key={req.id}
                tabIndex={0}
                role="button"
                onClick={() => {
                  setSelectedRequest(req);
                  setDetailsDialogOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRequest(req);
                    setDetailsDialogOpen(true);
                  }
                }}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={`Abrir detalhes da solicitação: ${req.category_type}`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">{req.category_type}</h2>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {req.description.length > 80 ? req.description.slice(0, 80) + '...' : req.description}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Criado em: {new Date(req.created_at).toLocaleDateString('pt-BR')}
                </p>
                {req.veiculos && (
                  <p className="mt-1 text-xs text-gray-500">
                    Veículo: {req.veiculos.marca} {req.veiculos.modelo} ({req.veiculos.ano})
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl w-full p-6">
            {selectedRequest ? (
              <ServiceRequestDetails request={selectedRequest} onClose={() => setDetailsDialogOpen(false)} />
            ) : (
              <p>Nenhuma solicitação selecionada.</p>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
