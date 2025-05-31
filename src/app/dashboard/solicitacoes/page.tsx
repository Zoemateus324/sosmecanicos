'use client';
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/models/supabase";

type MechanicRequest = {
  id: number;
  vehicle: string;
  description: string;
  location: string;
  status: string;
};

export default function Solicitacoes() {
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('mechanic_requests')
        .select('id, vehicle, description, location, status')
        .order('created_at', { ascending: false });
      setMechanicRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  return (
    <div className="flex gap-[2%] flex-wrap content-start">
      <Sidebar />

      <section className='flex-1 p-4 md:p-6 w-full container mx-auto sm:px-4'>
        <Card >
          <CardContent>
            <CardTitle>
              <h1 className="text-2xl font-bold mb-4">Solicitações</h1>
              <p>Esta é a página de solicitações. Aqui você pode gerenciar todas as solicitações feitas pelos usuários.</p>
              <Alert className="mt-4" variant="destructive" >
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
                  <TableHead>ID</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead> Descrição</TableHead>
                  <TableHead>Localização</TableHead>
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
                ) : mechanicRequests && mechanicRequests.length > 0 ? (
                  mechanicRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.vehicle}</TableCell>
                      <TableCell>{request.description}</TableCell>
                      <TableCell>{request.location}</TableCell>
                      <TableCell>{request.status}</TableCell>
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
