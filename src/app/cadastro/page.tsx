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

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
  phoneNumber: string;
}

export default function Cadastro() {
  const router = useRouter();
 
  // const supabase = createComponentClient();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(""); // Update type definition here
  const [success, setSuccess] = useState(false);

  const handleCadastro = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
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
            nome: formData.name,
            email: formData.email,
            telefone: formData.phoneNumber,
            tipo_usuario: formData.userType,
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
    } catch (err: string) {
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
              className={`w-full ${!formData.name && 'border-red-300 focus:border-red-500'}`}
            />
            {!formData.name && (
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              required
              className={`w-full ${!formData.email && 'border-red-300 focus:border-red-500'}`}
            />
            {!formData.email && (
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              required
              minLength={6}
              className={`w-full ${!formData.password && 'border-red-300 focus:border-red-500'}`}
            />
            {!formData.password && (
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
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={loading}
              required
              className={`w-full ${!formData.phoneNumber && 'border-red-300 focus:border-red-500'}`}
            />
            {!formData.phoneNumber && (
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
              value={formData.userType} 
              onValueChange={(value) => setFormData({ ...formData, userType: value })}
              disabled={loading}
            >
              <SelectTrigger className={`w-full ${!formData.userType && 'border-red-300 focus:border-red-500'}`}>
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="mecanico">Mecânico</SelectItem>
                <SelectItem value="guincho">Guincho</SelectItem>
                <SelectItem value="seguradora">Seguradora</SelectItem>
              </SelectContent>
            </Select>
            {!formData.userType && (
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
            disabled={loading || !formData.name || !formData.email || !formData.password || !formData.userType || !formData.phoneNumber}
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
