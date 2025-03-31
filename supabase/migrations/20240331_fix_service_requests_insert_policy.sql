-- Atualizar políticas de segurança para service_requests
DROP POLICY IF EXISTS "Usuários podem criar solicitações" ON public.service_requests;

-- Criar nova política para permitir que usuários criem solicitações
CREATE POLICY "Usuários podem criar solicitações"
    ON public.service_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'client'
        )
        AND auth.uid() = user_id
    );

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.service_requests TO authenticated;