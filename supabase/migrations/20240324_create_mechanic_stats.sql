-- Create mechanic_stats table
CREATE TABLE IF NOT EXISTS public.mechanic_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mechanic_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    completed_services INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    available BOOLEAN DEFAULT true,
    last_location_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    FOREIGN KEY (mechanic_id) REFERENCES public.profiles(id)
);

-- Create indexes
CREATE INDEX mechanic_stats_mechanic_id_idx ON public.mechanic_stats(mechanic_id);

-- Enable RLS
ALTER TABLE public.mechanic_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Mecânicos podem ver suas próprias estatísticas"
    ON public.mechanic_stats FOR SELECT
    USING (auth.uid() = mechanic_id);

CREATE POLICY "Sistema pode atualizar estatísticas"
    ON public.mechanic_stats FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_mechanic_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER set_mechanic_stats_updated_at
    BEFORE UPDATE ON public.mechanic_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_mechanic_stats_updated_at();

-- Insert default stats for existing mechanics
INSERT INTO public.mechanic_stats (mechanic_id)
SELECT id FROM public.profiles
WHERE user_type = 'mechanic'
ON CONFLICT (mechanic_id) DO NOTHING;