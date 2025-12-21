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

-- NOTA: A coluna role é um ENUM (musicalizacao_user_role) que já valida os valores
-- Não é necessário criar constraint CHECK - o ENUM já faz isso
-- Valores válidos do ENUM: 'administrador', 'instrutor', 'coordenador', 'usuario'

