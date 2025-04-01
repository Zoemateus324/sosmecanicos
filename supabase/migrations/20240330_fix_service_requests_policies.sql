-- Atualizar políticas de segurança para service_requests
DROP POLICY IF EXISTS "Mecânicos podem ver solicitações" ON public.service_requests;
DROP POLICY IF EXISTS "Mecânicos podem atualizar solicitações" ON public.service_requests;

-- Criar novas políticas para mecânicos
CREATE POLICY "Mecânicos podem ver solicitações"
    ON public.service_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.mechanic_stats ms ON ms.mechanic_id = p.id
            WHERE p.id = auth.uid()
            AND p.user_type = 'mechanic'
            AND ms.available = true
            AND public.calculate_distance(
                ms.latitude,
                ms.longitude,
                (service_requests.location->>'latitude')::float,
                (service_requests.location->>'longitude')::float
            ) <= 10
        )
        AND status IN ('pending', 'accepted', 'in_progress', 'completed', 'quoted')
    );

CREATE POLICY "Mecânicos podem atualizar solicitações"
    ON public.service_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.mechanic_stats ms ON ms.mechanic_id = p.id
            WHERE p.id = auth.uid()
            AND p.user_type = 'mechanic'
            AND ms.available = true
            AND public.calculate_distance(
                ms.latitude,
                ms.longitude,
                (service_requests.location->>'latitude')::float,
                (service_requests.location->>'longitude')::float
            ) <= 10
        )
        AND status IN ('pending', 'accepted', 'in_progress', 'completed', 'quoted')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.mechanic_stats ms ON ms.mechanic_id = p.id
            WHERE p.id = auth.uid()
            AND p.user_type = 'mechanic'
            AND ms.available = true
        )
        AND status IN ('pending', 'accepted', 'in_progress', 'completed', 'quoted')
    );

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.service_requests TO authenticated;