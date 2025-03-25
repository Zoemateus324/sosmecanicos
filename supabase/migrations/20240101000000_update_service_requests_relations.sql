-- Remover chaves estrangeiras existentes se houver
ALTER TABLE IF EXISTS service_requests
  DROP CONSTRAINT IF EXISTS service_requests_user_id_fkey,
  DROP CONSTRAINT IF EXISTS service_requests_mechanic_id_fkey,
  DROP CONSTRAINT IF EXISTS service_requests_vehicle_id_fkey;

-- Adicionar chaves estrangeiras com nomes específicos
ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  ADD CONSTRAINT service_requests_mechanic_id_fkey
    FOREIGN KEY (mechanic_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT service_requests_vehicle_id_fkey
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles(id)
    ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_mechanic_id ON service_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_vehicle_id ON service_requests(vehicle_id);

-- Atualizar políticas de segurança RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Política para clientes verem suas próprias solicitações
DROP POLICY IF EXISTS "Users can view own service requests" ON service_requests;
CREATE POLICY "Users can view own service requests" ON service_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para mecânicos verem solicitações atribuídas a eles
DROP POLICY IF EXISTS "Mechanics can view assigned service requests" ON service_requests;
CREATE POLICY "Mechanics can view assigned service requests" ON service_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = mechanic_id);