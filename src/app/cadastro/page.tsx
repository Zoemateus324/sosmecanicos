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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  };

  const handleCadastro = async () => {
    setError("");
    setLoading(true);

    if (!nome || !email || !password || !tipoUsuario) {
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
      setError("Por favor, insira um email válido (ex.: usuario@exemplo.com).");
      setLoading(false);
      return;
    }

    const validTiposUsuario = ["cliente", "mecanico", "guincho", "seguradora"];
    if (!validTiposUsuario.includes(tipoUsuario)) {
      setError("Tipo de usuário inválido.");
      setLoading(false);
      return;
    }

    try {
      console.log("Iniciando processo de cadastro...");
      console.log("Dados enviados para signUp:", { email, tipoUsuario });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
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
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Erro ao criar usuário. Por favor, tente novamente.");
        setLoading(false);
        return;
      }

      console.log("Usuário criado com sucesso:", authData.user);
      console.log("Criando perfil na tabela profiles...");

      // Primeiro, verificamos se já existe um perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (existingProfile) {
        console.log("Perfil já existe, atualizando...");
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            tipo_usuario: tipoUsuario
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError);
          setError("Erro ao atualizar perfil: " + updateError.message);
          setLoading(false);
          return;
        }
      } else {
        console.log("Criando novo perfil...");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            tipo_usuario: tipoUsuario
          });

        if (insertError) {
          console.error("Erro ao inserir perfil:", insertError);
          if (insertError.code === "23505") {
            setError("Este perfil já está registrado no sistema.");
          } else if (insertError.code === "42501") {
            setError("Você não tem permissão para realizar esta operação.");
          } else {
            setError("Erro ao salvar dados: " + insertError.message);
          }
          
          console.log("Tentando deletar o usuário após falha...");
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
            console.log("Usuário deletado com sucesso após falha.");
          } catch (deleteError) {
            console.error("Erro ao deletar usuário após falha:", deleteError);
          }
          setLoading(false);
          return;
        }
      }

      console.log("Perfil criado/atualizado com sucesso!");
      console.log("Redirecionando...");

      // Redirecionar baseado no tipo de usuário
      const dashboardPath = `/${tipoUsuario === 'mecanico' ? 'mecanico' : 
                             tipoUsuario === 'guincho' ? 'guincho' : 
                             tipoUsuario === 'seguradora' ? 'seguradora' : 
                             'cliente'}`;
      
      console.log("Redirecionando para:", `/dashboard${dashboardPath}`);
      router.push(`/dashboard${dashboardPath}`);
      
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
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
              Nome
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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