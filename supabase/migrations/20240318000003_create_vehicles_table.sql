-- Criar tabela de veículos
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('car', 'motorcycle', 'truck', 'other')),
  plate TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, plate)
);

-- Criar políticas de segurança
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios veículos
CREATE POLICY "Usuários podem ver seus próprios veículos"
  ON public.vehicles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios veículos
CREATE POLICY "Usuários podem criar seus próprios veículos"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios veículos
CREATE POLICY "Usuários podem atualizar seus próprios veículos"
  ON public.vehicles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios veículos
CREATE POLICY "Usuários podem deletar seus próprios veículos"
  ON public.vehicles
  FOR DELETE
  USING (auth.uid() = user_id); 