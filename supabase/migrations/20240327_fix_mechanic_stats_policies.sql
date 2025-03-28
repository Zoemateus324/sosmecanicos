-- Atualizar políticas de segurança para mechanic_stats
DROP POLICY IF EXISTS "Mecânicos podem ver e atualizar suas próprias estatísticas" ON public.mechanic_stats;
DROP POLICY IF EXISTS "Leitura pública das estatísticas" ON public.mechanic_stats;

-- Criar novas políticas mais permissivas
CREATE POLICY "Mecânicos podem ver e atualizar suas próprias estatísticas"
    ON public.mechanic_stats
    FOR ALL
    USING (auth.uid() = mechanic_id)
    WITH CHECK (auth.uid() = mechanic_id);

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.mechanic_stats TO authenticated;

-- Criar trigger para criar perfil de mecânico automaticamente
DROP TRIGGER IF EXISTS on_mechanic_created ON public.profiles;
CREATE TRIGGER on_mechanic_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    WHEN (NEW.user_type = 'mechanic')
    EXECUTE FUNCTION public.create_mechanic_stats();

-- Criar perfis de mecânico para usuários existentes
INSERT INTO public.mechanic_stats (mechanic_id)
SELECT id FROM public.profiles
WHERE user_type = 'mechanic'
ON CONFLICT (mechanic_id) DO NOTHING;