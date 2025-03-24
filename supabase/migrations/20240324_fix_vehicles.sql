-- Drop existing table if exists
DROP TABLE IF EXISTS public.vehicles CASCADE;

-- Create vehicles table with all necessary fields
CREATE TABLE public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    vehicle_type TEXT CHECK (vehicle_type IN ('carro', 'moto', 'caminhao', 'van')) NOT NULL,
    brand TEXT,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate TEXT NOT NULL UNIQUE,
    color TEXT,
    mileage INTEGER DEFAULT 0,
    fuel_type TEXT CHECK (fuel_type IN ('gasolina', 'etanol', 'flex', 'diesel', 'gnv', 'eletrico')),
    notes TEXT,
    last_service_date TIMESTAMP WITH TIME ZONE,
    next_service_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX vehicles_user_id_idx ON public.vehicles(user_id);
CREATE INDEX vehicles_plate_idx ON public.vehicles(plate);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuários podem ver seus próprios veículos"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios veículos"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios veículos"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios veículos"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicles_updated_at(); 