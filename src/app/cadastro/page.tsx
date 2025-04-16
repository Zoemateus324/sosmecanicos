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

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  };

  const handleCadastro = async () => {
    setError("");

    if (!nome || !email || !password || !tipoUsuario) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido (ex.: usuario@exemplo.com).");
      return;
    }

    const validTiposUsuario = ["cliente", "mecanico", "guincho", "seguradora"];
    if (!validTiposUsuario.includes(tipoUsuario)) {
      setError("Tipo de usuário inválido.");
      return;
    }

    try {
      console.log("Dados enviados para signUp:", { email, password, nome, tipoUsuario });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo_usuario: tipoUsuario,
          },
        },
      });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        if (authError.message.includes("already registered")) {
          setError("Este email já está cadastrado.");
        } else if (authError.message.includes("is invalid")) {
          setError(`O email "${email}" é inválido. Tente um email diferente (ex.: joao.teste123@gmail.com).`);
        } else {
          setError("Erro ao criar conta: " + authError.message);
        }
        return;
      }

      if (!authData.user) {
        setError("Erro ao criar usuário. Por favor, tente novamente.");
        return;
      }

      console.log("Usuário criado com sucesso:", authData.user);

      const { error: dbError } = await supabase.rpc("criar_usuario", {
        p_id: authData.user.id,
        p_nome: nome,
        p_email: email,
        p_tipo_usuario: tipoUsuario,
        p_created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Erro ao inserir usuário:", JSON.stringify(dbError));
        if (dbError.code === "23505") {
          setError("Este email já está registrado no sistema.");
        } else if (dbError.code === "42501") {
          setError("Você não tem permissão para realizar esta operação.");
        } else {
          setError("Erro ao salvar dados: " + dbError.message);
        }
        await supabase.auth.admin.deleteUser(authData.user.id); // Opcional
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
  };

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
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
          minLength={6}
        />
        <select
          value={tipoUsuario}
          onChange={(e) => setTipoUsuario(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
        >
          <option value="">Tipo de Usuário</option>
          <option value="cliente">Cliente</option>
          <option value="mecanico">Mecanico</option>
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