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

  const handleCadastro = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
  
    console.log("Valores do formulário:", {
      nome,
      email,
      password: password ? "preenchido" : "vazio",
      tipoUsuario,
      phoneNumber,
    });
  
    try {
      // Validações básicas
      if (!email?.trim() || !password || !nome?.trim() || !tipoUsuario || !phoneNumber?.trim()) {
        throw new Error("Todos os campos são obrigatórios");
      }
  
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
  
      console.log("Iniciando criação do usuário...");
  
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: nome.trim(),
            phone_number: phoneNumber.trim(),
            user_type: tipoUsuario
          }
        }
      });
  
      if (signUpError) {
        console.error("Erro no signup:", signUpError);
        if (signUpError.message.includes("unique constraint") || signUpError.message.toLowerCase().includes("already registered")) {
          throw new Error("Este email já está cadastrado");
        }
        throw signUpError;
      }
  
      if (!data?.user?.id) {
        throw new Error("Erro ao criar usuário: resposta inválida do servidor");
      }
  
      console.log("Usuário criado com sucesso, ID:", data.user.id);
  
      // O perfil será criado automaticamente pelo gatilho no banco de dados
  
      setSuccess(true);
      setError("Conta criada! Por favor, verifique seu email para confirmar o cadastro.");
  
      setTimeout(() => {
        router.push('/login');
      }, 2000);
  
    } catch (err) {
      console.error("Erro detalhado:", err);
      setSuccess(false);
  
      let errorMessage = "Erro ao criar conta. Por favor, tente novamente.";
  
      if (err.message) {
        errorMessage = err.message;
      }
  
      if (err.error_description) {
        errorMessage = err.error_description;
      }
  
      if (errorMessage.includes("duplicate") || errorMessage.includes("unique constraint") || errorMessage.toLowerCase().includes("already registered")) {
        errorMessage = "Este email já está cadastrado.";
      }
  
      if (errorMessage.includes("valid email")) {
        errorMessage = "Por favor, insira um email válido.";
      }
  
      if (errorMessage.includes("Database error")) {
        errorMessage = "Erro no servidor. Por favor, tente novamente mais tarde.";
      }
  
      setError(errorMessage);
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
              Nome Completo *
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
              required
              className={`w-full ${!nome && 'border-red-300 focus:border-red-500'}`}
            />
            {!nome && (
              <p className="text-sm text-red-500 mt-1">
                Este campo é obrigatório
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className={`w-full ${!email && 'border-red-300 focus:border-red-500'}`}
            />
            {!email && (
              <p className="text-sm text-red-500 mt-1">
                Este campo é obrigatório
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha *
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              className={`w-full ${!password && 'border-red-300 focus:border-red-500'}`}
            />
            {!password && (
              <p className="text-sm text-red-500 mt-1">
                Este campo é obrigatório
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              Telefone *
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Seu telefone (ex: +5511999999999)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              required
              className={`w-full ${!phoneNumber && 'border-red-300 focus:border-red-500'}`}
            />
            {!phoneNumber && (
              <p className="text-sm text-red-500 mt-1">
                Este campo é obrigatório
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="tipoUsuario" className="text-sm font-medium text-gray-700">
              Tipo de Usuário *
            </label>
            <Select 
              value={tipoUsuario} 
              onValueChange={setTipoUsuario}
              disabled={loading}
            >
              <SelectTrigger className={`w-full ${!tipoUsuario && 'border-red-300 focus:border-red-500'}`}>
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="mecanico">Mecânico</SelectItem>
                <SelectItem value="guincho">Guincho</SelectItem>
                <SelectItem value="seguradora">Seguradora</SelectItem>
              </SelectContent>
            </Select>
            {!tipoUsuario && (
              <p className="text-sm text-red-500 mt-1">
                Este campo é obrigatório
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              Cadastro realizado com sucesso!
            </div>
          )}

          <Button
            onClick={handleCadastro}
            disabled={loading || !nome || !email || !password || !tipoUsuario || !phoneNumber}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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