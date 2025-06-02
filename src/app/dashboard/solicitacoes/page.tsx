'use client';
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/models/supabase";

type mechanic_requests = {
  id: number;
  description: string;
  location: string;
  status: string;
  client_id: string;
  user_id: string;
  vehicle: {
    id: number;
    modelo: string;
    marca: string;
    ano: string;
  };
};

export default function Solicitacoes() {
  const [mechanic_requests, setMechanicRequests] = useState<mechanic_requests[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMechanicRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mechanic_requests')
        .select(`
          *,
          vehicle:vehicle_id (
            id,
            modelo,
            marca,
            ano
          )
        `)
        .order('id', { ascending: true });

      if (error) {
        console.error("Erro ao buscar solicitações:", error);
      } else {
        setMechanicRequests(data || []);
      }
      setLoading(false);
    };

    fetchMechanicRequests();
  }, []);

  return (
    <div className="flex gap-[2%] flex-wrap content-start">
      <Sidebar />
      <section className='flex-1 p-4 md:p-6 w-full container mx-auto sm:px-4'>
        <Card>
          <CardContent>
            <CardTitle>
              <h1 className="text-2xl font-bold mb-4">Solicitações</h1>
              <p>Esta é a página de solicitações. Aqui você pode gerenciar todas as solicitações feitas pelos usuários.</p>
              <Alert className="mt-4" variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>Certifique-se de revisar todas as solicitações regularmente para manter a eficiência do sistema.</AlertDescription>
              </Alert>
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardContent>
            <Table className="sm:overflow-x-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Localização</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : mechanic_requests.length > 0 ? (
                  mechanic_requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.vehicle?.marca} {req.vehicle?.modelo} ({req.vehicle?.ano})</TableCell>
                      <TableCell className="hidden sm:table-cell">{req.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">{req.location}</TableCell>
                      <TableCell >{req.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhuma solicitação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
