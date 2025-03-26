-- Criar tabela de mecânicos
CREATE TABLE IF NOT EXISTS public.mechanics (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  profile_id UUID REFERENCES public.profiles(id),
  specialties TEXT[],
  rating DECIMAL(3,2),
  total_services INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar view para dados completos dos mecânicos
CREATE OR REPLACE VIEW public.mechanic_stats AS
SELECT 
  m.id,
  p.full_name,
  p.email,
  p.phone,
  p.address,
  p.latitude,
  p.longitude,
  p.last_location_update,
  m.specialties,
  m.rating,
  m.total_services,
  m.available
FROM public.mechanics m
JOIN public.profiles p ON p.id = m.profile_id;

-- Criar políticas de segurança
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública dos dados dos mecânicos
CREATE POLICY "Dados dos mecânicos são públicos"
  ON public.mechanics
  FOR SELECT
  USING (true);

-- Apenas o próprio mecânico pode atualizar seus dados
CREATE POLICY "Mecânicos podem atualizar seus próprios dados"
  ON public.mechanics
  FOR UPDATE
  USING (auth.uid() = id);

-- Inserção automática de mecânicos quando o perfil é criado
CREATE OR REPLACE FUNCTION public.handle_new_mechanic()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'mechanic' THEN
    INSERT INTO public.mechanics (id, profile_id)
    VALUES (NEW.id, NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mechanic_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_mechanic(); 