"use client";
import { useState } from "react";
import { supabase } from "@/models/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User } from '@supabase/supabase-js';

export default function SolicitarServico() {
  const { session } = useAuth();
  const user = session?.user as User | undefined;
  const router = useRouter();
  const [tipoServico, setTipoServico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [veiculoId, setVeiculoId] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("requests").insert({
      cliente_id: user.id,
      tipo_servico: tipoServico,
      descricao,
      veiculo_id: veiculoId,
    });

    if (error) {
      console.error(error);
    } else {
      router.push("/pedidos");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Solicitar Serviço</h2>
      <select
        value={tipoServico}
        onChange={(e) => setTipoServico(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">Selecione o serviço</option>
        <option value="troca_oleo">Troca de Óleo</option>
        <option value="pneu">Troca de Pneu</option>
      </select>
      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descreva o problema"
        className="border p-2 mb-4 w-full"
      />
      <input
        type="text"
        value={veiculoId}
        onChange={(e) => setVeiculoId(e.target.value)}
        placeholder="ID do Veículo"
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2"
      >
        Enviar Solicitação
      </button>
    </div>
  );
}