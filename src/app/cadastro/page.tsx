"use client";

import { useState } from "react";
import { supabase } from "@/models/supabase";
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
  const router = useRouter();
 
  // const supabase = createComponentClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(""); // Update type definition here
  const [success, setSuccess] = useState(false);

  const handleCadastro = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      const user = data?.user;
      
      // Salvar outros dados do usuário como nome, telefone e tipo de usuário no banco de dados
      const { error: insertError } = await supabase
        .from("users") // Make sure the table name is correct
        .insert([
          {
            id: user?.id,
            nome,
            email,
            telefone: phoneNumber,
            tipo_usuario: tipoUsuario,
          }
        ]);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar cadastro");
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
              Cadastro realizado com sucesso! Redirecionando...
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
