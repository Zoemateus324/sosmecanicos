"use client";

import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      console.log("Tentando login com:", { email, password });
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        if (authError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada ou peça um novo link no dashboard do Supabase.");
        } else {
          setError("Erro ao fazer login: " + authError.message);
        }
        return;
      }

      if (data?.user) {
        console.log("Login bem-sucedido:", data.user);
        router.push("/dashboard");
      } else {
        setError("Falha ao obter sessão. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro inesperado no login:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl mb-4">Login</h2>
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
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={handleLogin}
          className="bg-orange-500 text-white p-2 w-full rounded hover:bg-orange-600"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}