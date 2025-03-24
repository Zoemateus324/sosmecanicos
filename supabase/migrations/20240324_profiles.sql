-- Criação da tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'mechanic', 'insurance', 'tow')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para visualizar perfis
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Política para inserir perfis
CREATE POLICY "Usuários podem inserir seus próprios perfis"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para atualizar perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Função RPC para obter perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  user_type TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Função RPC para criar perfil do usuário
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_email TEXT,
  user_type TEXT,
  full_name TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL
)
RETURNS public.profiles
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_profile public.profiles;
BEGIN
  INSERT INTO public.profiles (id, email, user_type, full_name, phone)
  VALUES (auth.uid(), user_email, user_type, full_name, phone)
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$;

-- Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated; 