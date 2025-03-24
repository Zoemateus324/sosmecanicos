import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';
import { Loader2, AlertCircle } from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const userType = formData.get('userType') as 'client' | 'mechanic' | 'insurance' | 'tow';

    console.log('Iniciando registro...', { email, fullName, userType }); // Debug

    try {
      // 1. Validações
      if (!email || !password || !fullName || !userType) {
        throw new Error('Por favor, preencha todos os campos');
      }

      if (!validateEmail(email)) {
        throw new Error('Por favor, insira um email válido');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // 2. Criar usuário
      console.log('Criando usuário no Supabase...'); // Debug
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      });

      if (signUpError) {
        console.error('Erro ao criar usuário:', signUpError); // Debug
        throw new Error(signUpError.message);
      }

      if (!authData?.user) {
        throw new Error('Erro ao criar usuário');
      }

      console.log('Usuário criado:', authData.user.id); // Debug

      // 3. Criar perfil
      console.log('Criando perfil...'); // Debug
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: fullName,
            user_type: userType,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError); // Debug
        throw new Error('Erro ao criar perfil');
      }

      console.log('Perfil criado com sucesso'); // Debug

      // 4. Login automático
      console.log('Fazendo login automático...'); // Debug
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Erro ao fazer login:', signInError); // Debug
        throw new Error('Erro ao fazer login automático');
      }

      // 5. Redirecionar
      console.log('Redirecionando para dashboard...'); // Debug
      navigate(`/${userType}/dashboard`, { replace: true });
      
    } catch (err) {
      console.error('Erro completo:', err); // Debug
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Criar nova conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Preencha seus dados para começar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  Tipo de Usuário
                </label>
                <select
                  id="userType"
                  name="userType"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm"
                >
                  <option value="">Selecione um tipo</option>
                  <option value="client">Cliente</option>
                  <option value="mechanic">Mecânico</option>
                  <option value="insurance">Seguradora</option>
                  <option value="tow">Guincho</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Criando conta...
                  </span>
                ) : (
                  'Criar conta'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Register;