"use client";

import { useState } from "react";
import { supabase } from "@/models/supabase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      if (!supabase || !supabase.auth) {
        toast.error('Conexão com o banco de dados não está disponível', {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Erro ao fazer login: ${error.message}`, {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
        setError(error.message);
        console.error('Login error:', error.message);
        return;
      }

      if (!data.user || !data.session) {
        toast.error('Falha no login: Usuário ou sessão não encontrados.', {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
        setError('Falha no login. Usuário não encontrado.');
        return;
      }

      // Buscar tipo de usuário na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tipo_usuario, full_name,nome')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        toast.error(`Erro ao buscar perfil: ${profileError.message}`, {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
        setError('Erro ao carregar dados do perfil.');
        console.error('Profile error:', profileError.message);
        return;
      }

      if (!profileData) {
        toast.error('Perfil do usuário não encontrado.', {
          style: { backgroundColor: '#EF4444', color: '#ffffff' },
        });
        setError('Perfil do usuário não encontrado.');
        return;
      }

      const tipoUsuario = profileData.tipo_usuario;
      const nomeUsuario = profileData.nome || data.user.email?.split('@')[0];

      // Atualizar contexto useAuth (assumindo que existe um método setAuth)
      setAuth({
        user: data.user,
        userNome: nomeUsuario,
        userType: tipoUsuario,
      });

      // Redirecionar com base no tipo de usuário
      switch (tipoUsuario) {
        case 'cliente':
          router.push('/dashboard/cliente');
          break;
        case 'mecanico':
          router.push('/dashboard/mecanico');
          break;
        case 'guincho':
          router.push('/dashboard/guincho');
          break;
        case 'seguradora':
          router.push('/dashboard/seguradora');
          break;
        default:
          toast.error('Tipo de usuário desconhecido.', {
            style: { backgroundColor: '#EF4444', color: '#ffffff' },
          });
          setError('Tipo de usuário desconhecido.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao fazer login';
      toast.error(errorMessage, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setError(errorMessage);
      console.error('Unexpected error:', err);
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

// Implement the setAuth function or remove it if unused
function setAuth(arg0: { user: User; userNome: string; userType: string; }) {
  // Example implementation: Update global state or context
  console.log("Auth updated:", arg0);
}

