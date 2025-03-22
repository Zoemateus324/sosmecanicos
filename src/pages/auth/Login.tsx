import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    try {
      // 1. Tenta fazer login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Erro na autenticação:', signInError);
        throw new Error('Email ou senha incorretos');
      }

      if (!data?.user) {
        throw new Error('Erro ao recuperar dados do usuário');
      }

      // 2. Busca o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw new Error('Não foi possível recuperar seu perfil');
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // 3. Redireciona com base no tipo de usuário
      const dashboardPath = `/${profile.user_type}/dashboard`;
      navigate(dashboardPath);
      
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default Login;