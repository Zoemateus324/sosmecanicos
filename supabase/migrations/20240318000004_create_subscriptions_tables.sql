-- Criar enum para tipos de plano
CREATE TYPE public.plan_type AS ENUM ('urban', 'travel', 'premium');

-- Criar enum para periodicidade
CREATE TYPE public.billing_period AS ENUM ('monthly', 'yearly');

-- Criar tabela de planos
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type plan_type NOT NULL,
    description TEXT NOT NULL,
    features JSONB NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    yearly_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de assinaturas
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    billing_period billing_period NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Criar tabela de histórico de pagamentos
CREATE TABLE public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir planos padrão
INSERT INTO public.plans (name, type, description, features, monthly_price, yearly_price) VALUES
(
    'Plano Urbano',
    'urban',
    'Ideal para quem precisa de assistência mecânica na cidade',
    '{"features": ["Assistência mecânica 24h", "Chat com mecânicos", "Histórico de serviços", "Avaliações de mecânicos"]}',
    49.90,
    538.92 -- 10% de desconto no plano anual
),
(
    'Plano Viagem',
    'travel',
    'Perfeito para quem viaja frequentemente e precisa de assistência em qualquer lugar',
    '{"features": ["Assistência em rodovias", "Guincho até 300km", "Hospedagem em caso de pane", "Motorista substituto"]}',
    89.90,
    971.52 -- 10% de desconto no plano anual
),
(
    'Plano Premium',
    'premium',
    'Cobertura completa para cidade e viagem com benefícios exclusivos',
    '{"features": ["Todas as features do Plano Urbano", "Todas as features do Plano Viagem", "Prioridade no atendimento", "Descontos exclusivos"]}',
    139.90,
    1510.92 -- 10% de desconto no plano anual
);

-- Criar políticas de segurança
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para planos (apenas leitura para todos os usuários autenticados)
CREATE POLICY "Permitir leitura de planos para usuários autenticados"
ON public.plans FOR SELECT
TO authenticated
USING (true);

-- Políticas para assinaturas
CREATE POLICY "Usuários podem ver apenas suas próprias assinaturas"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias assinaturas"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias assinaturas"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para pagamentos
CREATE POLICY "Usuários podem ver apenas seus próprios pagamentos"
ON public.subscription_payments FOR SELECT
TO authenticated
USING (
    subscription_id IN (
        SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
    )
);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 