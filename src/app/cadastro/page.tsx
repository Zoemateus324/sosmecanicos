"use client";
import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCadastro = async () => {
    if (!nome || !email || !password || !tipoUsuario) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      // Primeiro, cria o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo_usuario: tipoUsuario
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Este email já está cadastrado.");
        } else {
          setError("Erro ao criar conta. Por favor, tente novamente.");
        }
        return;
      }

      if (!authData.user) {
        setError("Erro ao criar usuário. Por favor, tente novamente.");
        return;
      }

      // Em seguida, insere os dados na tabela users usando o RLS
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          nome,
          email,
          tipo_usuario: tipoUsuario,
          created_at: new Date().toISOString()
        })
        .select();

      if (dbError) {
        console.error("Erro ao inserir usuário:", dbError);
        // Se houver erro na inserção, remove o usuário da autenticação
        await supabase.auth.admin.deleteUser(authData.user.id);
        setError("Erro ao salvar dados. Por favor, tente novamente.");
        return;
      }

      // Redireciona para o dashboard após sucesso
      router.push("/dashboard");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light">
      <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-4">Cadastro</h2>
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
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        />
        <select
          value={tipoUsuario}
          onChange={(e) => setTipoUsuario(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
        >
          <option value="">Tipo de Usuário</option>
          <option value="cliente">Cliente</option>
          <option value="mecanico">Mecânico</option>
          <option value="guincho">Guincho</option>
          <option value="seguradora">Seguradora</option>
        </select>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleCadastro}
          className="bg-secondary text-neutral p-2 w-full rounded hover:bg-yellow-600"
        >
          Cadastrar
        </button>
      </div>
    </div>
  );
}