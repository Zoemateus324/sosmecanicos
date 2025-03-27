-- Criar tabela de funcionários da mecânica
CREATE TABLE IF NOT EXISTS public.mechanic_employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mechanic_id UUID REFERENCES auth.users(id) NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  document_id TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  FOREIGN KEY (mechanic_id) REFERENCES public.profiles(id)
);

-- Criar tabela de serviços prestados
CREATE TABLE IF NOT EXISTS public.mechanic_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mechanic_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  estimated_time INTEGER, -- em minutos
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  FOREIGN KEY (mechanic_id) REFERENCES public.profiles(id)
);

-- Criar índices para melhor performance
CREATE INDEX mechanic_employees_mechanic_id_idx ON public.mechanic_employees(mechanic_id);
CREATE INDEX mechanic_services_mechanic_id_idx ON public.mechanic_services(mechanic_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.mechanic_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_services ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para funcionários
CREATE POLICY "Mecânicos podem ver seus próprios funcionários"
  ON public.mechanic_employees
  FOR SELECT
  USING (auth.uid() = mechanic_id);

CREATE POLICY "Mecânicos podem gerenciar seus próprios funcionários"
  ON public.mechanic_employees
  FOR ALL
  USING (auth.uid() = mechanic_id);

-- Criar políticas de segurança para serviços
CREATE POLICY "Mecânicos podem ver seus próprios serviços"
  ON public.mechanic_services
  FOR SELECT
  USING (auth.uid() = mechanic_id);

CREATE POLICY "Mecânicos podem gerenciar seus próprios serviços"
  ON public.mechanic_services
  FOR ALL
  USING (auth.uid() = mechanic_id);

-- Funções para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_mechanic_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_mechanic_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers
CREATE TRIGGER set_mechanic_employees_updated_at
  BEFORE UPDATE ON public.mechanic_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_mechanic_employees_updated_at();

CREATE TRIGGER set_mechanic_services_updated_at
  BEFORE UPDATE ON public.mechanic_services
  FOR EACH ROW
  EXECUTE FUNCTION update_mechanic_services_updated_at();