-- ============================================
-- Migration: CORRIGIR RLS PARA INSERT NO SIGNUP
-- ============================================
-- Esta migration garante que o INSERT funcione durante o signup

-- 0. GARANTIR QUE A FUNÇÃO EXISTE (para evitar recursão)
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

-- 1. REMOVER POLÍTICA DE INSERT EXISTENTE
DROP POLICY IF EXISTS "musicalizacao_allow_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_creation_on_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert_during_signup" ON musicalizacao_profiles;

-- 2. CRIAR POLÍTICA DE INSERT QUE PERMITE CRIAÇÃO DO PRÓPRIO PERFIL
-- IMPORTANTE: auth.uid() retorna o ID do usuário autenticado
-- Durante o signup, o usuário JÁ está autenticado, então auth.uid() funciona
CREATE POLICY "musicalizacao_allow_insert_own_profile"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir inserção se o id da linha for igual ao id do usuário autenticado
    auth.uid() = id
  );

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
ALTER TABLE musicalizacao_profiles ENABLE ROW LEVEL SECURITY;

-- 4. GARANTIR QUE AS OUTRAS POLÍTICAS ESTÃO CORRETAS
-- SELECT: Usuário vê seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_profile" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_users_can_view_own_profile"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT: Admins veem todos (SEM recursão - usar função SECURITY DEFINER)
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_admins_can_view_all"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (
    musicalizacao_get_user_role(auth.uid()) = 'admin'
  );

-- UPDATE: Usuário pode atualizar seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_users_can_update_own"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Admins podem atualizar todos (SEM recursão - usar função SECURITY DEFINER)
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_all" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_admins_can_update_all"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'admin')
  WITH CHECK (musicalizacao_get_user_role(auth.uid()) = 'admin');

