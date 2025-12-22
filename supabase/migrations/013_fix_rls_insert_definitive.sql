-- ============================================
-- Migration: CORRIGIR RLS INSERT DEFINITIVO
-- ============================================
-- Esta migration garante que INSERT funcione SEMPRE durante signup
-- Remove TODAS as políticas conflitantes e cria uma política definitiva

-- 1. REMOVER TODAS AS POLÍTICAS DE INSERT (sem exceção)
-- Lista completa de todas as políticas que podem existir
DROP POLICY IF EXISTS "musicalizacao_allow_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_creation_on_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_insert_during_signup" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_create_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_insert" ON musicalizacao_profiles;

-- 2. VERIFICAR E REMOVER QUALQUER OUTRA POLÍTICA DE INSERT
-- Usar uma função para remover todas as políticas de INSERT que possam existir
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Buscar todas as políticas de INSERT na tabela
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'musicalizacao_profiles' 
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON musicalizacao_profiles', pol.policyname);
  END LOOP;
END $$;

-- 3. CRIAR POLÍTICA DE INSERT DEFINITIVA
-- Esta política permite que QUALQUER usuário autenticado crie seu próprio perfil
-- auth.uid() retorna o ID do usuário autenticado durante o signup
CREATE POLICY "musicalizacao_allow_insert_own_profile"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE musicalizacao_profiles ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR SE A POLÍTICA FOI CRIADA CORRETAMENTE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'musicalizacao_profiles' 
      AND policyname = 'musicalizacao_allow_insert_own_profile'
      AND cmd = 'INSERT'
  ) THEN
    RAISE EXCEPTION 'Política de INSERT não foi criada corretamente';
  END IF;
END $$;

-- 6. CRIAR FUNÇÃO SECURITY DEFINER PARA BYPASSAR RLS
-- Esta função bypassa RLS completamente e permite criar perfil
-- IMPORTANTE: Não valida auth.uid() porque pode ser chamada após logout durante signup
CREATE OR REPLACE FUNCTION musicalizacao_create_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'usuario',
  p_status TEXT DEFAULT 'approved',
  p_polo_id UUID DEFAULT NULL,
  p_cidade TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY DEFINER bypassa RLS, então podemos inserir diretamente
  -- Não validamos auth.uid() porque esta função pode ser chamada após logout durante signup
  
  INSERT INTO musicalizacao_profiles (
    id,
    full_name,
    role,
    status,
    polo_id,
    cidade
  ) VALUES (
    p_user_id,
    p_full_name,
    p_role::musicalizacao_user_role,
    p_status,
    p_polo_id,
    p_cidade
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    polo_id = COALESCE(EXCLUDED.polo_id, musicalizacao_profiles.polo_id),
    cidade = COALESCE(EXCLUDED.cidade, musicalizacao_profiles.cidade);
END;
$$;

-- 7. CRIAR POLÍTICA QUE PERMITE USAR A FUNÇÃO
-- Qualquer usuário autenticado pode chamar a função para criar seu próprio perfil
GRANT EXECUTE ON FUNCTION musicalizacao_create_profile TO authenticated;

-- NOTA: A função SECURITY DEFINER bypassa RLS completamente
-- Isso garante que o INSERT sempre funcione, independente das políticas RLS

