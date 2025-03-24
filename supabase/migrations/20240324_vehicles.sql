-- Criar tabela de veículos
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    vehicle_type TEXT CHECK (vehicle_type IN ('carro', 'moto', 'caminhao', 'van')) NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate TEXT NOT NULL UNIQUE,
    mileage INTEGER DEFAULT 0,
    brand TEXT,
    color TEXT,
    fuel_type TEXT,
    last_service_date TIMESTAMP WITH TIME ZONE,
    next_service_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índice para busca por placa
CREATE INDEX IF NOT EXISTS vehicles_plate_idx ON public.vehicles (plate);

-- Criar índice para busca por usuário
CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON public.vehicles (user_id);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o timestamp
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Política para visualização
DROP POLICY IF EXISTS "Usuários podem ver seus próprios veículos" ON public.vehicles;
CREATE POLICY "Usuários podem ver seus próprios veículos"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

-- Política para inserção
DROP POLICY IF EXISTS "Usuários podem adicionar veículos" ON public.vehicles;
CREATE POLICY "Usuários podem adicionar veículos"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para atualização
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios veículos" ON public.vehicles;
CREATE POLICY "Usuários podem atualizar seus próprios veículos"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id);

-- Política para deleção
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios veículos" ON public.vehicles;
CREATE POLICY "Usuários podem deletar seus próprios veículos"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.vehicles TO authenticated; 