"use client";

import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      console.log("Tentando login com:", { email });
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        if (authError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login.");
        } else {
          setError("Erro ao fazer login: " + authError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log("Login bem-sucedido:", data.user);

        try {
          // Buscar tipo de usuário
          console.log("Buscando tipo de usuário para:", data.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('tipo_usuario')
            .eq('id', data.user.id)
            .limit(1);

          console.log("Resposta do Supabase:", { profileData, profileError });

          if (profileError) {
            console.error("Erro ao buscar tipo de usuário:", profileError);
            setError("Erro ao determinar tipo de usuário: " + profileError.message);
            setLoading(false);
            return;
          }

          if (!profileData || profileData.length === 0) {
            console.error("Perfil não encontrado");
            setError("Perfil de usuário não encontrado. Entre em contato com o suporte.");
            setLoading(false);
            return;
          }

          console.log("Perfil recuperado:", profileData[0]);
          const userType = profileData[0].tipo_usuario;
          console.log("Tipo de usuário:", userType);

          if (!userType) {
            console.error("Tipo de usuário não encontrado no perfil");
            setError("Tipo de usuário não encontrado. Entre em contato com o suporte.");
            setLoading(false);
            return;
          }

          // Força a atualização da rota
          router.refresh();

          // Redirect based on user type with replace
          const dashboardPath = `/${userType === 'mecanico' ? 'mecanico' : 
                                 userType === 'guincho' ? 'guincho' : 
                                 userType === 'seguradora' ? 'seguradora' : 
                                 'cliente'}`;
          
          console.log("Redirecionando para:", `/dashboard${dashboardPath}`);
          
          // Tenta o redirecionamento de três formas diferentes
          try {
            await router.replace(`/dashboard${dashboardPath}`);
          } catch (routerError) {
            console.error("Erro no router.replace:", routerError);
            try {
              window.location.href = `/dashboard${dashboardPath}`;
            } catch (locationError) {
              console.error("Erro no window.location:", locationError);
              window.location.replace(`/dashboard${dashboardPath}`);
            }
          }
        } catch (profileError) {
          console.error("Erro ao processar perfil:", profileError);
          setError("Erro ao processar informações do usuário.");
          setLoading(false);
        }
      } else {
        setError("Falha ao obter sessão. Tente novamente.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro inesperado no login:", err);
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
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
            disabled={loading}
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