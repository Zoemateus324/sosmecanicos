"use client";
import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";


export default function Solicitacoes() {
 

  return (
    <div  className="flex flex-col w-full">
      <Sidebar />
      
      <section className="flex-1 container p-4 flex justify-center items-start w-full">

            <h2 className="text-xl font-bold p-2">Nenhuma solicitação encontrada</h2>
       
      </section>

    </div>
  );
}
