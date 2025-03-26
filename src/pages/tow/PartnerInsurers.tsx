import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface PartnerInsurer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  partnership_start: string;
  active: boolean;
  total_services: number;
}

export default function PartnerInsurers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insurers, setInsurers] = useState<PartnerInsurer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchPartnerInsurers();
  }, [user, navigate]);

  const fetchPartnerInsurers = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_insurers')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          partnership_start,
          active,
          services:services (count)
        `)
        .eq('tow_id', user?.id)
        .order('name');

      if (error) throw error;

      const insurersWithCount = data?.map(insurer => ({
        ...insurer,
        total_services: insurer.services?.length || 0
      })) || [];

      setInsurers(insurersWithCount);
    } catch (error) {
      console.error('Erro ao carregar seguradoras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (insurerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_insurers')
        .update({ active: !currentStatus })
        .eq('id', insurerId);

      if (error) throw error;
      
      setInsurers(insurers.map(insurer => 
        insurer.id === insurerId ? { ...insurer, active: !currentStatus } : insurer
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
        <h1 className="text-2xl font-bold mb-6">Seguradoras Parceiras</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insurers.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Nenhuma seguradora parceira encontrada.
            </div>
          ) : (
            insurers.map((insurer) => (
              <div key={insurer.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{insurer.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      insurer.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {insurer.active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Email:</span> {insurer.email}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span>{' '}
                    {insurer.phone || 'Não informado'}
                  </p>
                  <p>
                    <span className="font-medium">Endereço:</span>{' '}
                    {insurer.address || 'Não informado'}
                  </p>
                  <p>
                    <span className="font-medium">Parceria desde:</span>{' '}
                    {new Date(insurer.partnership_start).toLocaleDateString('pt-BR')}
                  </p>
                  <p>
                    <span className="font-medium">Total de serviços:</span>{' '}
                    {insurer.total_services}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleToggleStatus(insurer.id, insurer.active)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      insurer.active
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {insurer.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}