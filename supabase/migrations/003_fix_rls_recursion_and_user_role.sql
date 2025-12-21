-- ============================================
-- Migration: Corrigir Recursão RLS - VERSÃO SIMPLIFICADA
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "musicalizacao_profiles_select_own" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_view_city_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_creation_on_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_profiles_update_status_admin" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_update_instructors" ON musicalizacao_profiles;

-- 2. Atualizar constraint de role
ALTER TABLE musicalizacao_profiles
  DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;

ALTER TABLE musicalizacao_profiles
  ADD CONSTRAINT musicalizacao_profiles_role_check 
  CHECK (role IN ('admin', 'instructor', 'coordinator', 'user'));

-- 3. Criar função SIMPLES sem recursão
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

-- 4. Políticas SIMPLES sem recursão
CREATE POLICY "musicalizacao_users_can_view_own_profile"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "musicalizacao_admins_can_view_all"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'admin');

CREATE POLICY "musicalizacao_allow_insert"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "musicalizacao_users_can_update_own"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "musicalizacao_admins_can_update_all"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'admin')
  WITH CHECK (musicalizacao_get_user_role(auth.uid()) = 'admin');

-- 5. Status padrão
ALTER TABLE musicalizacao_profiles
  ALTER COLUMN status SET DEFAULT 'approved';
