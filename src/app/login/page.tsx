"use client";

import { useState } from "react";
import { supabase } from "@/models/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        console.error("Login error:", error.message);
        return;
      }

      if (!data.user) {
        setError("Falha no login. Usuário não encontrado.");
        return;
      }

      router.push("/dashboard/cliente");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-gray-200 p-4">
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-700">SOS Mecânicos</CardTitle>
            <p className="text-gray-600 mt-2">Faça login para acessar sua conta</p>
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="flex flex-col space-y-2 text-center text-sm">
              <Link href="/esqueci-senha" className="text-purple-600 hover:underline">
                Esqueceu sua senha?
              </Link>
              <p className="text-gray-600">
                Ainda não tem uma conta?{" "}
                <Link href="/cadastro" className="text-purple-600 hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
}