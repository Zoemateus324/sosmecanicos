'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { VehicleDetailsModal } from "@/components/VehicleDetailsModal";
import { supabase } from "@/models/supabase";
import { Card } from "@radix-ui/themes";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type Veiculo={
    id:number;
    placa:string;
    modelo:string;
    ano:string;
    cor:string;
    quilometragem:string;
    status:string;
}
const CardVeiculos = () => {
       const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
       const [selectedVehicle, setSelectedVehicle] = useState<Veiculo | null>(null);
       const [isModalOpen, setIsModalOpen] = useState(false);

          useEffect(() => {
               const fetchVeiculos = async () => {
                   const { data, error } = await supabase
                       .from('veiculos')
                       .select('*')
                       .order('id', { ascending: true });
       
                   if (error) {
                       console.error("Erro ao buscar veículos:", error);
                   } else {
                       setVeiculos(data || []);
                   }
               };
       
               fetchVeiculos();
           }, []);
          
           const handleViewVehicle = (veiculo: Veiculo) => {
               setSelectedVehicle(veiculo);
               setIsModalOpen(true);
           };
       
           const handleDeleteVehicle = async (id: number) => {
               if (!supabase) return;
       
               if (window.confirm("Tem certeza que deseja deletar este veículo?")) {
                   try {
                       const { error } = await supabase
                           .from('veiculos')
                           .delete()
                           .eq('id', id);
       
                       if (error) {
                           console.error("Erro ao deletar veículo:", error);
                       } else {
                           setVeiculos(veiculos.filter(v => v.id !== id));
                           console.log("Veículo deletado com sucesso!");
                       }
                   } catch (error) {
                       console.error("Erro ao deletar veículo:", error);
                   }
               }
           };
    return ( 
        
             <div className="flex-1 p-4 md:p-6 w-full container mx-auto sm:px-4 sm:gap-4 sm:py-4 sm:pl-14">
                <Card className="mb-6 bg-white rounded-2xl">
                    <CardContent className="p-6">
                        <CardTitle className="text-2xl font-bold text-gray-900">Veículos</CardTitle>
                    </CardContent>
                </Card>

                 {/* Vehicles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
                    {veiculos.map((veiculo:Veiculo)=>(
                        <Card key={veiculo.id} className="mt-0 h-full flex flex-col bg-white shadow-2xl  rounded-2xl">
                            <CardContent className="p-6 flex-1">
                                <div className="flex flex-col space-y-2 h-full">
                                    <h3 className="text-lg font-semibold">{veiculo.modelo} ({veiculo.ano})</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Placa: <strong>{veiculo.placa}</strong></span>
                                        <Badge variant={
                                            veiculo.status === 'ativo' ? 'default' :
                                            veiculo.status === 'inativo' ? 'destructive' :
                                            'secondary'
                                        }>
                                            {veiculo.status}
                                        </Badge>
                                    </div>
                                    <span className="text-sm text-gray-600">Cor: {veiculo.cor}</span>
                                    <span className="text-sm text-gray-600">Quilometragem: {veiculo.quilometragem} km</span>
                                    {/* Add more details or actions here if needed */}
                                </div>
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2 p-4 bg-gray-50 border-t rounded-b-2xl">
                                 <Button variant="outline" size="sm" onClick={() => handleViewVehicle(veiculo)}>
                                     Visualizar
                                 </Button>
                                 <Button variant="destructive" size="sm" onClick={() => handleDeleteVehicle(veiculo.id)}>
                                     Deletar
                                 </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

           
 
            <VehicleDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vehicle={selectedVehicle ? { ...selectedVehicle, ano: Number(selectedVehicle.ano), quilometragem: Number(selectedVehicle.quilometragem) } : null}
                />
                </div>
            
     );
}
 
export default CardVeiculos;