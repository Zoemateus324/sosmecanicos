"use client";

import { useState } from "react";
import { supabase } from "@/models/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError("Por favor, insira seu email.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }

    try {
      console.log("Solicitando redefinição de senha para:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        console.error("Erro ao solicitar redefinição de senha:", error);
        if (error.message.includes("Email rate limit exceeded")) {
          setError("Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.");
        } else if (error.message.includes("User not found")) {
          setError("Email não encontrado. Verifique se digitou corretamente.");
        } else {
          setError(error.message);
        }
      } else {
        console.log("Email de redefinição enviado com sucesso");
        setSuccess(true);
        // Limpar o campo de email após sucesso
        setEmail("");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }

    setLoading(false);
  };

  // Função para lidar com o envio do formulário ao pressionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleResetPassword();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-700">Recuperar Senha</CardTitle>
          <p className="text-gray-600 mt-2">
            Digite seu email para receber as instruções de recuperação de senha
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              <p>Email enviado com sucesso!</p>
              <p className="mt-1">Por favor, verifique sua caixa de entrada e a pasta de spam.</p>
              <p className="mt-1">O link de recuperação expira em 24 horas.</p>
            </div>
          )}

          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            {loading ? "Enviando..." : "Enviar Email de Recuperação"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Lembrou sua senha?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Voltar para o login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 