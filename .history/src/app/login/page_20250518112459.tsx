"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      console.log("Tentando login com:", { email, password });
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        if (authError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada ou peça um novo link no dashboard do Supabase.");
        } else {
          setError("Erro ao fazer login: " + authError.message);
        }
        return;
      }

      if (data?.user) {
        console.log("Login bem-sucedido:", data.user);
        router.push("/dashboard/cliente"); // Redireciona para o dashboard após login 
      }


    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao tentar fazer login. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 to-gray-200">

      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"></div>
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Button
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Entrar
            </Button>
            <p className="text-center text-sm text-gray-600">
              Ainda não tem uma conta?{" "}
              <Link href="/cadastro" className="text-purple-600 hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
     
    </div>
  );
}
