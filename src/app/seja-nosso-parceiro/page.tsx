"use client";
import { useState } from "react";
import { supabase } from "@/services/supabase";
/*import { sendNotification } from "@/services/onesignal-notifications";*/

export default function SejaParceiro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoParceiro, setTipoParceiro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async () => {
    await supabase.from("parceiros").insert({
      nome,
      email,
      tipo_parceiro: tipoParceiro,
      mensagem,
    });

    /*await sendNotification({
      userIds: [email],
      title: "Bem-vindo ao SOS Mecânicos",
      message: "Sua solicitação de parceria está em análise!",
    });
  };*/

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold text-primary mb-4">Seja Nosso Parceiro</h2>
      <div className="bg-neutral-light p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <select
          value={tipoParceiro}
          onChange={(e) => setTipoParceiro(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        >
          <option value="">Selecione o tipo de parceiro</option>
          <option value="mecanico">Mecânico</option>
          <option value="guincho">Guincho</option>
          <option value="seguradora">Seguradora</option>
        </select>
        <textarea
          placeholder="Mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <button
          onClick={handleSubmit}
          className="bg-secondary text-neutral p-2 w-full rounded hover:bg-yellow-600"
        >
          Enviar Solicitação
        </button>
      </div>
    </div>
  );
}