-- Criar trigger para atualizar automaticamente o timestamp da última atualização de localização
CREATE OR REPLACE FUNCTION update_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.latitude IS DISTINCT FROM OLD.latitude) OR (NEW.longitude IS DISTINCT FROM OLD.longitude) THEN
        NEW.last_location_update = TIMEZONE('utc'::text, NOW());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger na tabela profiles
DROP TRIGGER IF EXISTS update_location_timestamp_trigger ON public.profiles;
CREATE TRIGGER update_location_timestamp_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_location_timestamp();

-- Garantir que o trigger seja acessível para usuários autenticados
GRANT EXECUTE ON FUNCTION update_location_timestamp() TO authenticated;