-- Atualizar políticas de segurança para profiles
DROP POLICY IF EXISTS "Usuários podem ver e atualizar seus próprios perfis" ON public.profiles;

-- Criar nova política mais permissiva para perfis
CREATE POLICY "Usuários podem ver e atualizar seus próprios perfis"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Garantir que a tabela seja acessível para usuários autenticados
GRANT ALL ON public.profiles TO authenticated;

-- Garantir que novos usuários possam criar seus perfis
CREATE POLICY "Usuários podem criar seus perfis"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);