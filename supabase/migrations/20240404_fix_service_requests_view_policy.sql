-- Remover políticas antigas
DROP POLICY IF EXISTS "Mecânicos podem ver solicitações" ON public.service_requests;

-- Criar nova política para permitir que mecânicos vejam solicitações
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
            AND (
                -- Permitir visualização se a localização foi atualizada nas últimas 24 horas
                (p.last_location_update >= NOW() - INTERVAL '24 hours'
                AND public.calculate_distance(
                    ms.latitude,
                    ms.longitude,
                    (service_requests.location->>'latitude')::float,
                    (service_requests.location->>'longitude')::float
                ) <= 10)
                -- Ou se a solicitação está em um status que requer atenção do mecânico
                OR service_requests.status IN ('accepted', 'in_progress')
                OR service_requests.mechanic_id = auth.uid()
            )
        )
        AND status IN ('pending', 'accepted', 'in_progress', 'completed', 'quoted')
    );

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.service_requests TO authenticated;