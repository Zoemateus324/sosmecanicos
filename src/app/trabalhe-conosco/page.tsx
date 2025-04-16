"use client";
import { useState } from "react";
import { supabase } from "@/services/supabase";
//import { sendNotification } from "@/services/onesignal-notifications";

export default function TrabalheConosco() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [curriculo, setCurriculo] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (curriculo) {
      const { data, error } = await supabase.storage
        .from("curriculos")
        .upload(`curriculo-${Date.now()}.pdf`, curriculo);

      if (error) {
        console.error(error);
        return;
      }

      const curriculoUrl = supabase.storage.from("curriculos").getPublicUrl(data.path).data.publicUrl;

      await supabase.from("candidaturas").insert({
        nome,
        email,
        mensagem,
        curriculo_url: curriculoUrl,
      });

     /* await sendNotification({
        userIds: ["admin-id"], // Substituir por ID real
        title: "Nova Candidatura",
        message: `Nova candidatura recebida de ${nome}`,
      });*/
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold text-primary mb-4">Trabalhe Conosco</h2>
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
        <textarea
          placeholder="Mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setCurriculo(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleSubmit}
          className="bg-secondary text-neutral p-2 w-full rounded hover:bg-yellow-600"
        >
          Enviar Candidatura
        </button>
      </div>
    </div>
  );
}