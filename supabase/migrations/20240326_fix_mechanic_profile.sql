-- Criar função para criar perfil de mecânico automaticamente
CREATE OR REPLACE FUNCTION public.create_mechanic_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.mechanic_stats (mechanic_id)
  VALUES (NEW.id)
  ON CONFLICT (mechanic_id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para criar perfil de mecânico automaticamente
DROP TRIGGER IF EXISTS on_mechanic_created ON public.profiles;
CREATE TRIGGER on_mechanic_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'mechanic')
  EXECUTE FUNCTION public.create_mechanic_stats();

-- Atualizar políticas de segurança para mechanic_stats
DROP POLICY IF EXISTS "Mecânicos podem ver e atualizar suas próprias estatísticas" ON public.mechanic_stats;
DROP POLICY IF EXISTS "Leitura pública das estatísticas" ON public.mechanic_stats;

-- Criar novas políticas mais permissivas
CREATE POLICY "Mecânicos podem ver e atualizar suas próprias estatísticas"
    ON public.mechanic_stats
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.mechanic_stats TO authenticated;

-- Criar perfis de mecânico para usuários existentes
INSERT INTO public.mechanic_stats (mechanic_id)
SELECT id FROM public.profiles
WHERE user_type = 'mechanic'
ON CONFLICT (mechanic_id) DO NOTHING;