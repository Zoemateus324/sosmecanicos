-- Create mechanic_services table
CREATE TABLE IF NOT EXISTS public.mechanic_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    estimated_time INTEGER, -- em minutos
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create service_categories table for standardized categories
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    average_price DECIMAL(10,2),
    price_range JSONB, -- { min: number, max: number }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX mechanic_services_mechanic_id_idx ON public.mechanic_services(mechanic_id);
CREATE INDEX mechanic_services_category_idx ON public.mechanic_services(category);
CREATE INDEX mechanic_services_active_idx ON public.mechanic_services(active);

-- Enable RLS
ALTER TABLE public.mechanic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Mecânicos podem gerenciar seus serviços"
    ON public.mechanic_services FOR ALL
    USING (auth.uid() = mechanic_id)
    WITH CHECK (auth.uid() = mechanic_id);

CREATE POLICY "Leitura pública dos serviços"
    ON public.mechanic_services FOR SELECT
    USING (true);

CREATE POLICY "Leitura pública das categorias"
    ON public.service_categories FOR SELECT
    USING (true);

-- Create function to update average prices
CREATE OR REPLACE FUNCTION update_service_category_average_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar média de preço e faixa de preço da categoria
    WITH price_stats AS (
        SELECT 
            category,
            AVG(price) as avg_price,
            MIN(price) as min_price,
            MAX(price) as max_price
        FROM public.mechanic_services
        WHERE active = true
        GROUP BY category
    )
    UPDATE public.service_categories sc
    SET 
        average_price = ps.avg_price,
        price_range = json_build_object('min', ps.min_price, 'max', ps.max_price)::jsonb,
        updated_at = TIMEZONE('utc'::text, NOW())
    FROM price_stats ps
    WHERE sc.name = ps.category;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_service_category_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.mechanic_services
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_service_category_average_price();

-- Insert default categories
INSERT INTO public.service_categories (name, description) VALUES
    ('revisao', 'Revisão periódica do veículo'),
    ('oleo', 'Troca de óleo e filtros'),
    ('freios', 'Manutenção do sistema de freios'),
    ('suspensao', 'Serviços de suspensão'),
    ('motor', 'Reparos no motor'),
    ('eletrica', 'Sistema elétrico'),
    ('ar-condicionado', 'Manutenção do ar-condicionado'),
    ('alinhamento', 'Alinhamento e balanceamento'),
    ('embreagem', 'Serviços de embreagem'),
    ('escapamento', 'Sistema de escapamento'),
    ('injecao', 'Sistema de injeção eletrônica'),
    ('radiador', 'Sistema de arrefecimento'),
    ('outros', 'Outros serviços')
ON CONFLICT (name) DO NOTHING; 