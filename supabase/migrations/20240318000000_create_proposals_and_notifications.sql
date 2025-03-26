-- Criar tabela de propostas
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL,
  mechanic_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  original_value DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'paid')),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar políticas de segurança para propostas
CREATE POLICY "Propostas visíveis para mecânicos e clientes envolvidos"
  ON public.proposals
  FOR SELECT
  USING (
    auth.uid() = mechanic_id OR 
    auth.uid() = client_id
  );

CREATE POLICY "Mecânicos podem criar propostas"
  ON public.proposals
  FOR INSERT
  WITH CHECK (
    auth.uid() = mechanic_id
  );

CREATE POLICY "Clientes podem atualizar status de propostas"
  ON public.proposals
  FOR UPDATE
  USING (
    auth.uid() = client_id
  );

-- Criar políticas de segurança para notificações
CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Sistema pode criar notificações"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem marcar suas notificações como lidas"
  ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Habilitar RLS nas tabelas
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY; 