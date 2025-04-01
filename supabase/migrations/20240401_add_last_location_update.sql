-- Adicionar coluna last_location_update na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE;

-- Criar índice para otimizar consultas de localização
CREATE INDEX IF NOT EXISTS profiles_last_location_update_idx ON public.profiles(last_location_update);

-- Atualizar função de atualização de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Garantir que a coluna seja acessível para usuários autenticados
GRANT ALL ON public.profiles TO authenticated;