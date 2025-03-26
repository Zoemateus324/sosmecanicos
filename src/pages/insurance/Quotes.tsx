import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Quote {
  id: string;
  service_id: string;
  insurance_id: string;
  value: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  service: {
    description: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
    };
    client: {
      full_name: string;
    };
  };
}

export default function Quotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchQuotes();
  }, [user, navigate]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          service:service_id (description,
            vehicle:vehicle_id (make, model, year),
            client:client_id (full_name)
          )
        `)
        .eq('insurance_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (quoteId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;
      
      // Atualiza a lista de cotações
      setQuotes(quotes.map(quote => 
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
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
        <h1 className="text-2xl font-bold mb-6">Minhas Cotações</h1>

        <div className="grid gap-6">
          {quotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Nenhuma cotação encontrada.
            </div>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {quote.service.vehicle.make} {quote.service.vehicle.model} ({quote.service.vehicle.year})
                    </h3>
                    <p className="text-gray-600">{quote.service.client.full_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      R$ {quote.value.toFixed(2)}
                    </span>
                    <p className="text-sm text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{quote.service.description}</p>

                <div className="flex justify-between items-center">
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quote.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : quote.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {quote.status === 'pending'
                        ? 'Pendente'
                        : quote.status === 'accepted'
                        ? 'Aceita'
                        : 'Rejeitada'}
                    </span>
                  </div>

                  {quote.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(quote.id, 'accepted')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}