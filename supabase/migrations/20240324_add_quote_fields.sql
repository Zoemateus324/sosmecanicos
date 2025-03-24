-- Adicionar campos para orçamento na tabela service_requests
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS mechanic_notes TEXT; 