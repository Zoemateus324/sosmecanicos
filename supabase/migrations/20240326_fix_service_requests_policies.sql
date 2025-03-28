-- Atualizar políticas de segurança para service_requests
DROP POLICY IF EXISTS "Mecânicos podem ver solicitações atribuídas a eles" ON public.service_requests;
DROP POLICY IF EXISTS "Mecânicos podem ver solicitações pendentes" ON public.service_requests;

CREATE POLICY "Mecânicos podem ver solicitações pendentes"
    ON public.service_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
        AND status = 'pending'
    );
DROP POLICY IF EXISTS "Mecânicos podem atualizar solicitações atribuídas a eles" ON public.service_requests;

-- Criar novas políticas mais permissivas para mecânicos
CREATE POLICY "Mecânicos podem ver todas as solicitações"
    ON public.service_requests
    FOR SELECT
    TO authenticated
    USING (true);

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