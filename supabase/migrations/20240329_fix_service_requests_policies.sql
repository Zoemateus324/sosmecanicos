-- Atualizar políticas de segurança para service_requests
DROP POLICY IF EXISTS "Mecânicos podem ver solicitações" ON public.service_requests;
DROP POLICY IF EXISTS "Mecânicos podem atualizar solicitações" ON public.service_requests;

-- Criar novas políticas mais permissivas para mecânicos
CREATE POLICY "Mecânicos podem ver solicitações"
    ON public.service_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
    );

CREATE POLICY "Mecânicos podem atualizar solicitações"
    ON public.service_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
    );

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.service_requests TO authenticated;