"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import { toast } from "sonner";
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
  const supabase = useSupabase();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação de campos obrigatórios
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.userType || !formData.phoneNumber) {
      toast.error("Por favor, preencha todos os campos obrigatórios.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setError("Todos os campos são obrigatórios.");
      setLoading(false);
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um email válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setError("Email inválido.");
      setLoading(false);
      return;
    }

    // Validação de senha
    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    // Validação de confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    // Validação de telefone (exemplo: aceita formatos como +5511999999999)
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Por favor, insira um número de telefone válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setError("Número de telefone inválido.");
      setLoading(false);
      return;
    }

    try {
      if (!supabase || !supabase.auth) {
        throw new Error("Conexão com o banco de dados não está disponível.");
      }

      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signupError) {
        throw new Error(signupError.message);
      }

      const user = data?.user;
      if (!user) {
        throw new Error("Falha ao criar usuário.");
      }

      // Salvar dados do usuário na tabela 'profiles'
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          user_type: formData.userType,
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      toast.success("Cadastro realizado com sucesso! Redirecionando para o login...", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao realizar cadastro.";
      toast.error(errorMessage, {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
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
        <CardContent>
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nome Completo *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
                aria-describedby={formData.name ? undefined : "name-error"}
              />
              {!formData.name && (
                <p id="name-error" className="text-sm text-red-500 mt-1">
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
                aria-describedby={formData.email ? undefined : "email-error"}
              />
              {!formData.email && (
                <p id="email-error" className="text-sm text-red-500 mt-1">
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
                aria-describedby={formData.password ? undefined : "password-error"}
              />
              {!formData.password && (
                <p id="password-error" className="text-sm text-red-500 mt-1">
                  Este campo é obrigatório
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Senha *
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                required
                minLength={6}
                aria-describedby={formData.confirmPassword ? undefined : "confirmPassword-error"}
              />
              {!formData.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-500 mt-1">
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
                aria-describedby={formData.phoneNumber ? undefined : "phoneNumber-error"}
              />
              {!formData.phoneNumber && (
                <p id="phoneNumber-error" className="text-sm text-red-500 mt-1">
                  Este campo é obrigatório
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="userType" className="text-sm font-medium text-gray-700">
                Tipo de Usuário *
              </label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value })}
                disabled={loading}
              >
                <SelectTrigger
                  id="userType"
                  aria-describedby={formData.userType ? undefined : "userType-error"}
                >
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
                <p id="userType-error" className="text-sm text-red-500 mt-1">
                  Este campo é obrigatório
                </p>
              )}
            </div>

            {error && (
              <div id="error-message" className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div id="success-message" className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                Cadastro realizado com sucesso! Redirecionando...
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-purple-600 hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}