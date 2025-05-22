'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { supabase } from "@/models/supabase";

// Service Request Interface
interface ServiceRequest {
  id: string;
  nome: string;
  data: string;
  user_id: string;
  veiculo_id: string;
  problem_description: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function SolicitacoesDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID from Supabase

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    fetchUserId();
  }, []);
  // Fetch service requests from Supabase
  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) {
        setRequests([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar solicitações:', error.message);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    fetchRequests();
  }, [userId]);

  // Handle request approval
  const handleApproveRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'Aprovado' })
      .eq('id', requestId);

    if (error) {
      console.error('Erro ao aprovar solicitação:', error.message);
    } else {
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, status: 'Aprovado' } : request
        )
      );
    }
  }
  return (
    <div className="flex flex-col">
      <Sidebar />
      <div className="sm:ml-14 p-6 bg-gray-100 min-h-screen w-full">
        <div className="flex gap-[2%] flex-wrap content-start item-center justify-center">
          <Card className="w-[90%]">
            <CardContent>
              <CardTitle>Solicitações</CardTitle>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Nome</th>
                      <th className="px-4 py-2">Data</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <TableCell colSpan={5}>Carregando...</TableCell>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <TableCell colSpan={5}>Nenhuma solicitação encontrada.</TableCell>
                      </tr>
                    ) : (
                      requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.nome}</TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{request.status}</TableCell>
                          <TableCell>
                            {request.status === "Pendente" ? (
                              <Button onClick={() => handleApproveRequest(request.id)}>
                                Aprovar
                              </Button>
                            ) : (
                              <Button disabled>
                                Ver
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
