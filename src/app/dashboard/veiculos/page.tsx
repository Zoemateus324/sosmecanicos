'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/models/supabase";
import { useEffect, useState } from "react";

type Veiculo = {
    id: number;
    placa: string;
    modelo: string;
    ano: number;
    cor: string;
    quilometragem: number;
    status: string;
}

 



export default function VeiculosDashboard() {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
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
   
   
   
    return (

        <div className="flex gap-[2%] flex-wrap content-start">
            <Sidebar/>
            
            <div className="flex-1 p-4 md:p-6 w-full container mx-auto sm:px-4">
            <Card>
                <CardContent>
                    <CardTitle>Veículos</CardTitle>
                </CardContent>
            </Card>


            {veiculos.map((veiculo:Veiculo)=>(
                <Card key={veiculo.id} className="mt-4">
                    <CardContent>
                        <div className="flex flex-col">
                            <span><strong>ID:</strong> {veiculo.id}</span>
                            <span><strong>Placa:</strong> {veiculo.placa}</span>
                            <span><strong>Modelo:</strong> {veiculo.modelo}</span>
                            <span><strong>Ano:</strong> {veiculo.ano}</span>
                            <span><strong>Cor:</strong> {veiculo.cor}</span>
                            <span><strong>Quilometragem:</strong> {veiculo.quilometragem}</span>
                            <span><strong>Status:</strong> {veiculo.status}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
           </div>
        </div>
    );
}