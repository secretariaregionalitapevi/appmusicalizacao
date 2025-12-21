-- ============================================
-- Migration: CORRIGIR CADASTRO COMPLETAMENTE
-- ============================================
-- Esta migration garante que o cadastro funcione SEM ERROS

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "musicalizacao_profiles_select_own" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_view_city_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_creation_on_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert_during_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_profiles_update_status_admin" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_update_instructors" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_all" ON musicalizacao_profiles;

-- 2. GARANTIR QUE A CONSTRAINT DE ROLE PERMITE 'user'
ALTER TABLE musicalizacao_profiles
  DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;

ALTER TABLE musicalizacao_profiles
  ADD CONSTRAINT musicalizacao_profiles_role_check 
  CHECK (role IN ('admin', 'instructor', 'coordinator', 'user'));

-- 3. GARANTIR QUE OS CAMPOS OPCIONAIS EXISTEM
ALTER TABLE musicalizacao_profiles
  ADD COLUMN IF NOT EXISTS polo_id UUID REFERENCES musicalizacao_polos(id),
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 4. CRIAR FUNÇÃO SIMPLES PARA ROLE (SEM RECURSÃO)
CREATE OR REPLACE FUNCTION musicalizacao_get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- SECURITY DEFINER bypassa RLS completamente
  SELECT role INTO user_role
  FROM musicalizacao_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. POLÍTICAS RLS SIMPLES E DIRETAS

-- SELECT: Usuário vê seu próprio perfil
CREATE POLICY "musicalizacao_users_can_view_own_profile"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT: Admins veem todos
CREATE POLICY "musicalizacao_admins_can_view_all"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'admin');

-- INSERT: Usuário pode criar seu próprio perfil (CRÍTICO PARA CADASTRO)
CREATE POLICY "musicalizacao_allow_insert_own_profile"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Usuário pode atualizar seu próprio perfil
CREATE POLICY "musicalizacao_users_can_update_own"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Admins podem atualizar todos
CREATE POLICY "musicalizacao_admins_can_update_all"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'admin')
  WITH CHECK (musicalizacao_get_user_role(auth.uid()) = 'admin');

-- 6. GARANTIR STATUS PADRÃO
ALTER TABLE musicalizacao_profiles
  ALTER COLUMN status SET DEFAULT 'approved';

