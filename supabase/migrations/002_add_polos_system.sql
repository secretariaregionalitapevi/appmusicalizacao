-- ============================================
-- Migration: Sistema de Polos e Hierarquia de Permissões
-- ============================================

-- 1. Criar tabela de POLOS
CREATE TABLE IF NOT EXISTS musicalizacao_polos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  regional TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nome, cidade, regional)
);

-- 2. Adicionar campos na tabela musicalizacao_profiles
ALTER TABLE musicalizacao_profiles
  ADD COLUMN IF NOT EXISTS polo_id UUID REFERENCES musicalizacao_polos(id),
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 3. Atualizar constraint de role para incluir 'coordinator'
ALTER TABLE musicalizacao_profiles
  DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;

ALTER TABLE musicalizacao_profiles
  ADD CONSTRAINT musicalizacao_profiles_role_check 
  CHECK (role IN ('admin', 'instructor', 'coordinator'));

-- 4. Adicionar campo polo_id na tabela de estudantes
ALTER TABLE musicalizacao_students
  ADD COLUMN IF NOT EXISTS polo_id UUID REFERENCES musicalizacao_polos(id);

-- 5. Adicionar campo polo_id na tabela de classes
ALTER TABLE musicalizacao_classes
  ADD COLUMN IF NOT EXISTS polo_id UUID REFERENCES musicalizacao_polos(id);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_polo ON musicalizacao_profiles(polo_id);
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON musicalizacao_profiles(cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON musicalizacao_profiles(status);
CREATE INDEX IF NOT EXISTS idx_students_polo ON musicalizacao_students(polo_id);
CREATE INDEX IF NOT EXISTS idx_classes_polo ON musicalizacao_classes(polo_id);
CREATE INDEX IF NOT EXISTS idx_polos_cidade ON musicalizacao_polos(cidade);
CREATE INDEX IF NOT EXISTS idx_polos_regional ON musicalizacao_polos(regional);

-- 7. Inserir polos iniciais (exemplo - ajustar conforme necessário)
INSERT INTO musicalizacao_polos (nome, cidade, regional) VALUES
  ('Cotia', 'Cotia', 'Itapevi'),
  ('Caucaia do Alto', 'Caucaia do Alto', 'Itapevi'),
  ('Fazendinha', 'Fazendinha', 'Itapevi'),
  ('Itapevi', 'Itapevi', 'Itapevi'),
  ('Jandira', 'Jandira', 'Itapevi'),
  ('Pirapora', 'Pirapora', 'Itapevi'),
  ('Vargem Grande', 'Vargem Grande', 'Itapevi')
ON CONFLICT (nome, cidade, regional) DO NOTHING;

-- 8. RLS Policies para polos
ALTER TABLE musicalizacao_polos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS musicalizacao_polos_select_all ON musicalizacao_polos;
CREATE POLICY musicalizacao_polos_select_all ON musicalizacao_polos
  FOR SELECT
  TO authenticated
  USING (true);

-- 9. Atualizar RLS para profiles - permitir que usuários vejam seus próprios dados
DROP POLICY IF EXISTS musicalizacao_profiles_select_own ON musicalizacao_profiles;
CREATE POLICY musicalizacao_profiles_select_own ON musicalizacao_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR 
         (SELECT role FROM musicalizacao_profiles WHERE id = auth.uid()) = 'admin' OR
         (SELECT role FROM musicalizacao_profiles WHERE id = auth.uid()) = 'coordinator');

-- 10. Policy para administradores atualizarem status de coordenadores
DROP POLICY IF EXISTS musicalizacao_profiles_update_status_admin ON musicalizacao_profiles;
CREATE POLICY musicalizacao_profiles_update_status_admin ON musicalizacao_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM musicalizacao_profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM musicalizacao_profiles WHERE id = auth.uid()) = 'admin'
  );

-- 11. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_musicalizacao_polos_updated_at ON musicalizacao_polos;
CREATE TRIGGER update_musicalizacao_polos_updated_at
  BEFORE UPDATE ON musicalizacao_polos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

