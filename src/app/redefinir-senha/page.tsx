"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/models/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RedefinirSenha() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está autenticado via link de redefinição
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  const handlePasswordReset = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Erro ao redefinir senha:", error);
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-700">Redefinir Senha</CardTitle>
          <p className="text-gray-600 mt-2">
            Digite sua nova senha
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              Nova Senha
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirmar Nova Senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
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
              Senha alterada com sucesso! Você será redirecionado para a página de login.
            </div>
          )}

          <Button
            onClick={handlePasswordReset}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 