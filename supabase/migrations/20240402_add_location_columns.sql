-- Adicionar colunas de latitude e longitude na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Criar índice para otimizar consultas de localização
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles(latitude, longitude);

-- Garantir que as colunas sejam acessíveis para usuários autenticados
GRANT ALL ON public.profiles TO authenticated;