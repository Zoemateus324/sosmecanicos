"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Plano = {
  id: string;
  nome: string;
  descricao: string;
  itensInclusos: string[];
  valorMensal: number;
  carenciaDias: number;
  tempoCobertura: string;
  aceitaConvenios: boolean;
  conveniosAceitos?: string[];
};

export default function GerenciarPlanos() {
  const { session, userType } = useAuth();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [novoPlano, setNovoPlano] = useState<Partial<Plano>>({
    itensInclusos: [],
    aceitaConvenios: false,
  });

  useEffect(() => {
    if (userType === "seguradora") {
      fetchPlanos();
    }
  }, [userType]);

  const fetchPlanos = async () => {
    const { data } = await supabase.from("planos_seguradora").select("*");
    setPlanos(data || []);
  };

  const handleSubmit = async () => {
    if (!session || userType !== "seguradora") return;

    const { error } = await supabase.from("planos_seguradora").insert({
      ...novoPlano,
      created_by: session.user.id,
    });

    if (!error) {
      fetchPlanos();
      setNovoPlano({ itensInclusos: [], aceitaConvenios: false });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Gerenciar Planos</h2>
      <div className="border p-4 mb-4">
        <input
          type="text"
          placeholder="Nome do Plano"
          value={novoPlano.nome || ""}
          onChange={(e) =>
            setNovoPlano({ ...novoPlano, nome: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <textarea
          placeholder="Descrição"
          value={novoPlano.descricao || ""}
          onChange={(e) =>
            setNovoPlano({ ...novoPlano, descricao: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Valor Mensal"
          value={novoPlano.valorMensal || ""}
          onChange={(e) =>
            setNovoPlano({
              ...novoPlano,
              valorMensal: parseFloat(e.target.value),
            })
          }
          className="border p-2 mb-2 w-full"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2"
        >
          Adicionar Plano
        </button>
      </div>
      <div>
        {planos.map((plano) => (
          <div key={plano.id} className="border p-4 mb-2">
            <h3>{plano.nome}</h3>
            <p>{plano.descricao}</p>
            <p>Valor: R${plano.valorMensal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}