import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  services_count: number;
}

export default function Clients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchClients();
  }, [user, navigate]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          address,
          created_at,
          services:services (count)
        `)
        .eq('user_type', 'client')
        .order('full_name');

      if (error) throw error;

      const clientsWithCount = data?.map(client => ({
        ...client,
        services_count: client.services?.length || 0
      })) || [];

      setClients(clientsWithCount);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6">Clientes</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Nenhum cliente encontrado.
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{client.full_name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {client.email}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span>{' '}
                    {client.phone || 'Não informado'}
                  </p>
                  <p>
                    <span className="font-medium">Endereço:</span>{' '}
                    {client.address || 'Não informado'}
                  </p>
                  <p>
                    <span className="font-medium">Cliente desde:</span>{' '}
                    {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <p>
                    <span className="font-medium">Total de serviços:</span>{' '}
                    {client.services_count}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}