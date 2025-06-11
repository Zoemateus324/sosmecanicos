'use client';
import { Sidebar } from "@/components/sidebar/Sidebar";
import React from "react";
import { SolicitacoesRequisicao } from "./components/TableSolitcita";


export default function Solicitacoes() {
  

  return (
    <div className="flex gap-[2%] flex-col">
      <Sidebar  />

      <SolicitacoesRequisicao/>
      </div>
  );
}
