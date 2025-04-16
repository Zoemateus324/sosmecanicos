"use client";
import { useState } from "react";
import { supabase } from "@/services/supabase";

export default function Suporte() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async () => {
    await supabase.from("suporte").insert({
      nome,
      email,
      mensagem,
    });
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold text-primary mb-4">Suporte</h2>
      <section className="bg-neutral-light p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-neutral mb-4">Perguntas Frequentes</h3>
        <div className="mb-6">
          <h4 className="font-semibold">Como solicito um serviço?</h4>
          <p>Basta se cadastrar, escolher o serviço e descrever o problema.</p>
        </div>
        <h3 className="text-xl font-semibold text-neutral mb-4">Entre em Contato</h3>
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
          Enviar Mensagem
        </button>
      </section>
    </div>
  );
}