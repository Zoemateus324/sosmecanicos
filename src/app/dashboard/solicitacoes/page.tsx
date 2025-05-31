"use client";
import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";


export default function Solicitacoes() {
 

  return (
    <div  className="flex gap-[2%] flex-wrap content-start">
      <Sidebar />
      
     <section className='flex-1 p-4 md:p-6 w-full container mx-auto'>

           <Card >
            <CardContent>
              <CardTitle>

              <h1 className="text-2xl font-bold mb-4">Solicitações</h1>
              <p>Esta é a página de solicitações. Aqui você pode gerenciar todas as solicitações feitas pelos usuários.</p>
              {/* Adicione mais conteúdo ou componentes conforme necessário */}
              </CardTitle>
            </CardContent>
           </Card>
     </section>

       
      

    </div>
  );
}
