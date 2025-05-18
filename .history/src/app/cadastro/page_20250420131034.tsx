"use client";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          tipo_usuario: tipoUsuario,
          created_at: new Date().toISOString()
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
        await supabase.auth.admin.deleteUser(authData.user.id);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-gray-200 p-4">
      <Navbar/>
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            
          </div>
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
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Cadastrar
          </Button>
          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
      <Footer/>
    </div>
  );
}