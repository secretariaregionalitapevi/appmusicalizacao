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

-- 3. Atualizar constraint de role (se o enum ainda não existir, será criado na migration 007)
-- NOTA: Se o enum musicalizacao_user_role já existir, ele já valida os valores automaticamente
-- Esta constraint só é necessária se a coluna ainda for TEXT
-- Remover constraint antiga se existir
ALTER TABLE musicalizacao_profiles
  DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;

-- A constraint CHECK não é necessária se a coluna já for do tipo ENUM
-- O enum musicalizacao_user_role já valida os valores: 'administrador', 'instrutor', 'coordenador', 'usuario'

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

-- 7. Inserir polos iniciais com IDs fixos (para compatibilidade com dados de teste)
-- NOTA: IDs fixos são usados para garantir que as foreign keys nas migrations de seed funcionem
-- Usa ON CONFLICT no ID (primary key) para atualizar se já existir
INSERT INTO musicalizacao_polos (id, nome, cidade, regional) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Polo Cotia', 'Cotia', 'Regional Itapevi'),
  ('00000000-0000-0000-0000-000000000002', 'Polo Caucaia do Alto', 'Caucaia do Alto', 'Regional Itapevi'),
  ('00000000-0000-0000-0000-000000000003', 'Polo Vargem Grande Paulista', 'Vargem Grande Paulista', 'Regional Itapevi'),
  ('00000000-0000-0000-0000-000000000004', 'Polo Itapevi', 'Itapevi', 'Regional Itapevi'),
  ('00000000-0000-0000-0000-000000000005', 'Polo Jandira', 'Jandira', 'Regional Itapevi'),
  ('00000000-0000-0000-0000-000000000006', 'Polo Santana de Parnaíba', 'Santana de Parnaíba', 'Regional Itapevi'),
  ('00000000-0000-0000-0000-000000000007', 'Polo Pirapora do Bom Jesus', 'Pirapora do Bom Jesus', 'Regional Itapevi')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  cidade = EXCLUDED.cidade,
  regional = EXCLUDED.regional;

-- 8. RLS Policies para polos
ALTER TABLE musicalizacao_polos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS musicalizacao_polos_select_all ON musicalizacao_polos;
CREATE POLICY musicalizacao_polos_select_all ON musicalizacao_polos
  FOR SELECT
  TO authenticated
  USING (true);

-- 9. Atualizar RLS para profiles - permitir que usuários vejam seus próprios dados
-- NOTA: Esta policy será recriada nas migrations posteriores com os valores corretos do enum
-- Removendo para evitar conflito
DROP POLICY IF EXISTS musicalizacao_profiles_select_own ON musicalizacao_profiles;

-- 10. Policy para administradores atualizarem status de coordenadores
-- NOTA: Esta policy será recriada nas migrations posteriores com os valores corretos do enum
-- Removendo para evitar conflito
DROP POLICY IF EXISTS musicalizacao_profiles_update_status_admin ON musicalizacao_profiles;

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

