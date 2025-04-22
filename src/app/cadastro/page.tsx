"use client";

import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  };

  const handleCadastro = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // Validações básicas
      if (!nome || !email || !password || !tipoUsuario || !phoneNumber) {
        setError("Por favor, preencha todos os campos.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setError("Por favor, insira um email válido.");
        setLoading(false);
        return;
      }

      // Criar usuário
      console.log("Tentando criar usuário:", { email, tipoUsuario });
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: tipoUsuario
          }
        }
      });

      if (signUpError) {
        console.error("Erro no cadastro:", signUpError);
        throw signUpError;
      }

      if (!data.user) {
        throw new Error("Erro ao criar usuário");
      }

      // Criar perfil manualmente se necessário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update([
          {
            user_type: tipoUsuario,
            full_name: nome,
            phone_number: phoneNumber
          }
        ])
        .eq('id', data.user.id)
        .select();

      if (profileError) {
        console.error("Error updating profile:", profileError);
        setError("Erro ao atualizar perfil do usuário");
        return;
      }

      setSuccess(true);
      console.log("Cadastro realizado com sucesso!");

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error("Erro detalhado:", err);
      
      if (err.message?.includes("already registered")) {
        setError("Este email já está cadastrado.");
      } else if (err.message?.includes("valid email")) {
        setError("Por favor, insira um email válido.");
      } else {
        setError(err.message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-700">SOS Mecânicos</CardTitle>
          <p className="text-gray-600 mt-2">Crie sua conta para começar</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={loading}
              className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              Telefone
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Seu telefone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
              className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="tipoUsuario" className="text-sm font-medium text-gray-700">
              Tipo de Usuário
            </label>
            <Select onValueChange={setTipoUsuario} value={tipoUsuario}>
              <SelectTrigger className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors">
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="mecanico">Mecânico</SelectItem>
                <SelectItem value="guincho">Guincho</SelectItem>
                <SelectItem value="seguradora">Seguradora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              <p>Cadastro realizado com sucesso!</p>
              <p className="mt-1">Redirecionando para a página de login...</p>
            </div>
          )}

          <Button
            onClick={handleCadastro}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}