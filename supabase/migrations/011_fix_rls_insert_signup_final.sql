-- ============================================
-- Migration: CORRIGIR RLS INSERT PARA SIGNUP - FINAL
-- ============================================
-- Garante que INSERT funcione durante signup SEM ERROS

-- 1. REMOVER TODAS AS POLÍTICAS DE INSERT EXISTENTES
DROP POLICY IF EXISTS "musicalizacao_allow_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_creation_on_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert_during_signup" ON musicalizacao_profiles;

-- 2. CRIAR POLÍTICA DE INSERT SIMPLES E DIRETA
-- Esta política permite que QUALQUER usuário autenticado crie seu próprio perfil
-- auth.uid() retorna o ID do usuário autenticado durante o signup
CREATE POLICY "musicalizacao_allow_insert_own_profile"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE musicalizacao_profiles ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR SE A CONSTRAINT DE ROLE PERMITE 'usuario'
-- Se não permitir, adicionar
DO $$
BEGIN
  -- Verificar se a constraint existe e permite 'usuario'
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'musicalizacao_profiles_role_check'
    AND check_clause LIKE '%usuario%'
  ) THEN
    -- Remover constraint antiga
    ALTER TABLE musicalizacao_profiles
      DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;
    
    -- Criar nova constraint que permite 'usuario'
    ALTER TABLE musicalizacao_profiles
      ADD CONSTRAINT musicalizacao_profiles_role_check 
      CHECK (role IN ('admin', 'instructor', 'coordinator', 'usuario', 'administrador', 'instrutor', 'coordenador'));
  END IF;
END $$;

