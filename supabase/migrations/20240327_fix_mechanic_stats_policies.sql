-- Atualizar políticas de segurança para mechanic_stats
DROP POLICY IF EXISTS "Mecânicos podem ver e atualizar suas próprias estatísticas" ON public.mechanic_stats;
DROP POLICY IF EXISTS "Leitura pública das estatísticas" ON public.mechanic_stats;

-- Criar novas políticas
CREATE POLICY "Mecânicos podem ver e atualizar suas próprias estatísticas"
    ON public.mechanic_stats
    FOR ALL
    TO authenticated
    USING (mechanic_id = auth.uid())
    WITH CHECK (mechanic_id = auth.uid());

CREATE POLICY "Leitura pública das estatísticas"
    ON public.mechanic_stats
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = mechanic_stats.mechanic_id
            AND p.last_location_update >= NOW() - INTERVAL '24 hours'
            AND p.user_type = 'mechanic'
            AND mechanic_stats.available = true
        )
    );

-- Criar índice para otimizar consultas de localização
CREATE INDEX IF NOT EXISTS idx_mechanic_stats_location_update
ON public.mechanic_stats (mechanic_id, available)
WHERE available = true;

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.mechanic_stats TO authenticated;

-- Criar trigger para atualizar estatísticas quando um novo mecânico é registrado
CREATE OR REPLACE FUNCTION public.create_mechanic_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.mechanic_stats (mechanic_id, available)
    VALUES (NEW.id, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_mechanic_stats_trigger ON public.profiles;
CREATE TRIGGER create_mechanic_stats_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    WHEN (NEW.user_type = 'mechanic')
    EXECUTE FUNCTION public.create_mechanic_stats();

-- Inserir registros para mecânicos existentes
INSERT INTO public.mechanic_stats (mechanic_id, available)
SELECT id, true FROM public.profiles
WHERE user_type = 'mechanic'
AND NOT EXISTS (
    SELECT 1 FROM public.mechanic_stats
    WHERE mechanic_id = profiles.id
);