-- Atualizar políticas de segurança para service_requests
DROP POLICY IF EXISTS "Mecânicos podem ver solicitações" ON public.service_requests;
DROP POLICY IF EXISTS "Mecânicos podem atualizar solicitações" ON public.service_requests;

-- Criar novas políticas para mecânicos
CREATE POLICY "Mecânicos podem ver solicitações pendentes"
    ON public.service_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
        AND status = 'pending'
    );

CREATE POLICY "Mecânicos podem atualizar solicitações pendentes"
    ON public.service_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
        AND status = 'pending'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_type = 'mechanic'
        )
        AND status IN ('pending', 'accepted', 'in_progress')
    );

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.service_requests TO authenticated;