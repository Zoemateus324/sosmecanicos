// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { createClientComponentClient } from "@/lib/supabaseClient";


// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { useAuth } from "@/contexts/AuthContext";
// import { Calendar, Clock, DollarSign, Wrench } from "lucide-react";
// import { toast } from "sonner";

// interface Solicitacoes {
//   id: string;
//   status: string;
//   client_name: string;
//   description: string;
//   location: string;
//   category_type: string;
//   estimated_price: number;
//   created_at: string;
//   client_id: string;
// }

// export default function MecanicaDashboard() {
//   const { user, profiles } = useAuth();
//   const supabase = createClientComponentClient();
//   const [Solicitacoess, setSolicitacoess] = useState<Solicitacoes[]>([]);
//   const [stats, setStats] = useState({
//     pending: 0,
//     inProgress: 0,
//     completed: 0,
//     totalEarnings: 0,
//   });
//   const [statusFilter, setStatusFilter] = useState<string>("all");

//   // const fetchSolicitacoess = useCallback(async () => {
//   //   if (!user?.id) {
//   //     toast.error("Usuário não autenticado.");
//   //     return;
//   //   }

//   //   const { data, error } = await supabase
//   //     .from('solicitacoes')
//   //     .select('id, status_orcamento, client_name, description, location, category_type, estimated_price, created_at, client_id')
//   //     .eq('mechanic_id', user.id)
//   //     .order('created_at', { ascending: false });

//   //   if (error) {
//   //     console.error("Error fetching service requests:", error.message);
//   //     toast.error("Erro ao carregar solicitações: " + error.message);
//   //     return;
//   //   }

//   //   if (data) {
//   //     setSolicitacoes(data);
//   //     const stats = {
//   //       pending: data.filter((req: Solicitacoes) => req.status_orcamento === 'pendente').length,
//   //       inProgress: data.filter((req: Solicitacoes) => req.status_orcamento === 'aceito').length,
//   //       completed: data.filter((req: Solicitacoes) => req.status_orcamento === 'concluido').length,
//   //       totalEarnings: data
//   //         .filter((req: Solicitacoes) => req.status_orcamento === 'concluido')
//   //         .reduce((sum: number, req: Solicitacoes) => sum + (req.estimated_price || 0), 0),
//   //     };
//   //     setStats(stats);
//   //   }
//   // }, [supabase, user?.id]);

//   // useEffect(() => {
//   //   fetchSolicitacoess();
//   // }, [fetchSolicitacoess]);

//   // const handleAcceptRequest = async (request: Solicitacoes) => {
//   //   if (!user?.id) {
//   //     toast.error("Usuário não autenticado.");
//   //     return;
//   //   }

//   //   try {
//   //     const { error } = await supabase
//   //       .from('solicitacoes')
//   //       .update({ status_orcamento: 'aceito' })
//   //       .eq('id', request.id);

//   //     if (error) throw error;

//   //     toast.success('Serviço aceito com sucesso!');
//   //     await fetchSolicitacoess();
//   //   } catch (error) {
//   //     console.error('Error accepting service request:', error);
//   //     toast.error('Erro ao aceitar serviço.');
//   //   }
//   // };

//   // const handleCompleteRequest = async (request: Solicitacoes) => {
//   //     if (!user?.id) {
//   //       toast.error("Usuário não autenticado.");
//   //       return;
//   //     }

//   //     try {
//   //       const { error } = await supabase
//   //         .from('solicitacoes')
//   //         .update({ status_orcamento: 'concluido' })
//   //         .eq('id', request.id);

//   //       if (error) throw error;

//   //       toast.success('Serviço finalizado com sucesso!');
//   //       await fetchSolicitacoess();
//   //     } catch (error) {
//   //       console.error('Error completing service request:', error);
//   //       toast.error('Erro ao finalizar serviço.');
//   //     }
//   // };

//   const filteredRequests = Solicitacoess.filter((request: Solicitacoes) =>
//     statusFilter === "all" ? true : request.status === statusFilter
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-800">Dashboard de Mecânica</h1>
//           <p className="text-muted-foreground">Bem-vindo(a), {profiles?.nome || "Usuário"}!</p>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
//               <Clock className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.pending}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
//               <Wrench className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.inProgress}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.completed}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">R$ {stats.totalEarnings.toFixed(2)}</div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="mb-6">
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[200px]">
//               <SelectValue placeholder="Filtrar por status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Todos</SelectItem>
//               <SelectItem value="pendente">Pendentes</SelectItem>
//               <SelectItem value="aceito">Em Andamento</SelectItem>
//               <SelectItem value="concluido">Concluídos</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Solicitações de Serviços Mecânicos</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Cliente</TableHead>
//                   <TableHead>Descrição</TableHead>
//                   <TableHead>Localização</TableHead>
//                   <TableHead>Categoria</TableHead>
//                   <TableHead>Data</TableHead>
//                   <TableHead>Valor</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Ações</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredRequests.map((request: Solicitacoes) => (
//                   <TableRow key={request.id}>
//                     <TableCell>{request.client_name}</TableCell>
//                     <TableCell>{request.description}</TableCell>
//                     <TableCell>{request.location}</TableCell>
//                     <TableCell>{request.category_type}</TableCell>
//                     <TableCell>
//                       {new Date(request.created_at).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>R$ {request.estimated_price?.toFixed(2)}</TableCell>
//                     <TableCell>
//                       <Badge variant={
//                         request.status === 'pendente' ? 'secondary' :
//                         request.status === 'aceito' ? 'default' :
//                         'outline'
//                       }>
//                         {request.status === 'pendente' ? 'Pendente' :
//                          request.status === 'aceito' ? 'Em Andamento' :
//                          'Concluído'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       {request.status === 'pendente' && (
//                         <Button 
//                           variant="default" 
//                           size="sm"
//                           onClick={() => handleAcceptRequest(request)}
//                         >
//                           Aceitar
//                         </Button>
//                       )}
//                       {request.status === 'aceito' && (
//                         <Button 
//                           variant="outline" 
//                           size="sm"
//                           // onClick={() => handleCompleteRequest(request)}
//                         >
//                           Finalizar Serviço
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }