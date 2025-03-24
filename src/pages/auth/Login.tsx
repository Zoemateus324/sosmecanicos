import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const { userType, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (userType && !authLoading) {
      console.log('Redirecionando usuário autenticado para:', `/${userType}/dashboard`);
      navigate(`/${userType}/dashboard`);
    }
  }, [userType, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      console.log('Iniciando processo de login para:', email);

      // 1. Tentar fazer login
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Erro no login:', signInError);
        throw new Error('Email ou senha incorretos');
      }

      if (!authData.user) {
        throw new Error('Erro ao autenticar usuário');
      }

      console.log('Login bem-sucedido:', authData.user.email);

      // 2. Aguardar para garantir que o perfil seja processado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Verificar se temos o tipo de usuário
      if (!userType) {
        console.log('Aguardando tipo de usuário ser definido...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 4. Se ainda não tivermos o tipo de usuário, tentar mais uma vez
      if (!userType) {
        console.log('Tipo de usuário ainda não definido, recarregando página...');
        window.location.reload();
        return;
      }

    } catch (err) {
      console.error('Erro durante o login:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre com sua conta para continuar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password');
                }}
                className="font-medium text-yellow-600 hover:text-yellow-500"
              >
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
              className="font-medium text-yellow-600 hover:text-yellow-500"
            >
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;