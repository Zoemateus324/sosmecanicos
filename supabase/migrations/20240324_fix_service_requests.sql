-- Drop existing table if exists
DROP TABLE IF EXISTS public.service_requests CASCADE;

-- Create service_requests table
CREATE TABLE public.service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
    mechanic_id UUID,
    service_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
    location JSONB,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX service_requests_user_id_idx ON public.service_requests(user_id);
CREATE INDEX service_requests_vehicle_id_idx ON public.service_requests(vehicle_id);
CREATE INDEX service_requests_mechanic_id_idx ON public.service_requests(mechanic_id);
CREATE INDEX service_requests_status_idx ON public.service_requests(status);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuários podem ver suas próprias solicitações"
    ON public.service_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Mecânicos podem ver solicitações pendentes e atribuídas"
    ON public.service_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'mechanic'
        ) AND (
            status = 'pending' OR
            mechanic_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar suas próprias solicitações"
    ON public.service_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias solicitações"
    ON public.service_requests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Mecânicos podem atualizar solicitações atribuídas a eles"
    ON public.service_requests FOR UPDATE
    USING (auth.uid() = mechanic_id OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = mechanic_id AND user_type = 'mechanic'
    ));

CREATE POLICY "Usuários podem deletar suas próprias solicitações"
    ON public.service_requests FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_service_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_service_requests_updated_at();