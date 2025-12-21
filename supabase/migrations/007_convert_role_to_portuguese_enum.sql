-- ============================================
-- Migration: CONVERTER ROLE PARA ENUM EM PORTUGUÊS
-- ============================================
-- Esta migration converte a coluna role para ENUM com valores em português
-- e remove/recria todas as policies que dependem dessa coluna

-- 1. REMOVER TODAS AS POLICIES QUE DEPENDEM DE ROLE
-- Policies em musicalizacao_profiles
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_all" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_view_city_profiles" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_update_instructors" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_profiles_select_own" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_profiles_update_status_admin" ON musicalizacao_profiles;

-- Policies em musicalizacao_students
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_students" ON musicalizacao_students;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_students" ON musicalizacao_students;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_students" ON musicalizacao_students;

-- Policies em musicalizacao_classes
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_classes" ON musicalizacao_classes;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_classes" ON musicalizacao_classes;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_classes" ON musicalizacao_classes;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_view_city_classes" ON musicalizacao_classes;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_classes" ON musicalizacao_classes;

-- Policies em musicalizacao_attendance
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_attendance" ON musicalizacao_attendance;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_attendance" ON musicalizacao_attendance;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_attendance" ON musicalizacao_attendance;

-- Policies em musicalizacao_instructor_attendance
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_instructor_attendance" ON musicalizacao_instructor_attendance;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_instructor_attendance" ON musicalizacao_instructor_attendance;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_instructor_attendance" ON musicalizacao_instructor_attendance;

-- Policies em musicalizacao_class_files
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_class_files" ON musicalizacao_class_files;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_class_files" ON musicalizacao_class_files;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_class_files" ON musicalizacao_class_files;

-- Policies em musicalizacao_reports
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_reports" ON musicalizacao_reports;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_reports" ON musicalizacao_reports;

-- Policies em musicalizacao_instructors
DROP POLICY IF EXISTS "musicalizacao_admins_can_manage_instructors" ON musicalizacao_instructors;
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_instructors" ON musicalizacao_instructors;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_manage_attendance" ON musicalizacao_attendance;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_manage_instructor_attendance" ON musicalizacao_instructor_attendance;
DROP POLICY IF EXISTS "musicalizacao_instructors_can_upload_class_files" ON musicalizacao_class_files;
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_students" ON musicalizacao_students;
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_classes" ON musicalizacao_classes;
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_attendance" ON musicalizacao_attendance;
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_instructor_attendance" ON musicalizacao_instructor_attendance;
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_class_files" ON musicalizacao_class_files;
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_reports" ON musicalizacao_reports;
DROP POLICY IF EXISTS "musicalizacao_coordinators_can_view_city_classes" ON musicalizacao_classes;

-- 2. REMOVER CONSTRAINT ANTIGA PRIMEIRO (se existir)
-- IMPORTANTE: Remover ANTES de converter os valores, senão a constraint bloqueia
ALTER TABLE musicalizacao_profiles
  DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;

-- 3. VERIFICAR SE A COLUNA JÁ É ENUM E CONVERTER PARA TEXT TEMPORARIAMENTE
-- Se a migration 006 já foi executada, a coluna já é ENUM e precisamos converter para TEXT primeiro
DO $$ 
DECLARE
  current_type TEXT;
BEGIN
  -- Verificar o tipo atual da coluna
  SELECT data_type INTO current_type
  FROM information_schema.columns
  WHERE table_name = 'musicalizacao_profiles' 
    AND column_name = 'role';
  
  -- Se já for ENUM, converter para TEXT temporariamente
  IF current_type = 'USER-DEFINED' THEN
    -- Verificar se é realmente o nosso ENUM
    SELECT udt_name INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'musicalizacao_profiles' 
      AND column_name = 'role';
    
    IF current_type = 'musicalizacao_user_role' THEN
      -- Converter ENUM para TEXT temporariamente
      ALTER TABLE musicalizacao_profiles
        ALTER COLUMN role TYPE TEXT 
        USING role::text;
    END IF;
  END IF;
END $$;

-- 4. CONVERTER VALORES EXISTENTES DE INGLÊS PARA PORTUGUÊS
-- Agora a coluna é TEXT (sem constraint), então podemos atualizar livremente
UPDATE musicalizacao_profiles
SET role = CASE
  WHEN role = 'admin' THEN 'administrador'
  WHEN role = 'instructor' THEN 'instrutor'
  WHEN role = 'coordinator' THEN 'coordenador'
  WHEN role = 'user' THEN 'usuario'
  ELSE 'usuario' -- Default para valores inválidos
END
WHERE role IN ('admin', 'instructor', 'coordinator', 'user');

-- 5. CRIAR TIPO ENUM PARA ROLE EM PORTUGUÊS (ou recriar se já existir)
-- Primeiro, tentar dropar o tipo antigo se existir (pode falhar se ainda estiver em uso, mas não é problema)
DO $$ BEGIN
  DROP TYPE IF EXISTS musicalizacao_user_role CASCADE;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Criar o novo ENUM com valores em português
CREATE TYPE musicalizacao_user_role AS ENUM ('administrador', 'instrutor', 'coordenador', 'usuario');

-- 6. ALTERAR COLUNA ROLE PARA USAR ENUM
-- Agora os valores já estão em português, então converter para ENUM
ALTER TABLE musicalizacao_profiles
  ALTER COLUMN role TYPE musicalizacao_user_role 
  USING role::text::musicalizacao_user_role;

-- 6. GARANTIR QUE A COLUNA NÃO PODE SER NULL
ALTER TABLE musicalizacao_profiles
  ALTER COLUMN role SET NOT NULL;

-- 7. ATUALIZAR FUNÇÃO PARA RETORNAR VALORES EM PORTUGUÊS
CREATE OR REPLACE FUNCTION musicalizacao_get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- SECURITY DEFINER bypassa RLS completamente
  SELECT role::text INTO user_role
  FROM musicalizacao_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'usuario');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RECRIAR POLICIES COM VALORES EM PORTUGUÊS

-- ============================================
-- POLICIES PARA MUSICALIZACAO_PROFILES
-- ============================================

-- SELECT: Usuário vê seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_profile" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_users_can_view_own_profile"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT: Admins veem todos
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_admins_can_view_all"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'administrador');

-- INSERT: Usuário pode criar seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_allow_insert_own_profile" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_allow_insert_own_profile"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Usuário pode atualizar seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_users_can_update_own"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Admins podem atualizar todos
DROP POLICY IF EXISTS "musicalizacao_admins_can_update_all" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_admins_can_update_all"
  ON musicalizacao_profiles FOR UPDATE
  TO authenticated
  USING (musicalizacao_get_user_role(auth.uid()) = 'administrador')
  WITH CHECK (musicalizacao_get_user_role(auth.uid()) = 'administrador');

-- ============================================
-- POLICIES PARA MUSICALIZACAO_INSTRUCTORS
-- ============================================

-- Usuários autenticados podem visualizar instrutores
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_instructors" ON musicalizacao_instructors;
CREATE POLICY "musicalizacao_authenticated_can_view_instructors"
  ON musicalizacao_instructors FOR SELECT
  TO authenticated
  USING (true);

-- Admins e coordenadores podem gerenciar instrutores
DROP POLICY IF EXISTS "musicalizacao_admins_can_manage_instructors" ON musicalizacao_instructors;
CREATE POLICY "musicalizacao_admins_can_manage_instructors"
  ON musicalizacao_instructors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'coordenador')
    )
  );

-- ============================================
-- POLICIES PARA MUSICALIZACAO_STUDENTS
-- ============================================

-- Usuários autenticados podem visualizar alunos
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_authenticated_can_view_students"
  ON musicalizacao_students FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar alunos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_instructors_can_create_students"
  ON musicalizacao_students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem atualizar alunos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_instructors_can_update_students"
  ON musicalizacao_students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem deletar alunos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_instructors_can_delete_students"
  ON musicalizacao_students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- ============================================
-- POLICIES PARA MUSICALIZACAO_CLASSES
-- ============================================

-- Usuários autenticados podem visualizar aulas
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_authenticated_can_view_classes"
  ON musicalizacao_classes FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar aulas
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_instructors_can_create_classes"
  ON musicalizacao_classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem atualizar aulas
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_instructors_can_update_classes"
  ON musicalizacao_classes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem deletar aulas
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_instructors_can_delete_classes"
  ON musicalizacao_classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- ============================================
-- POLICIES PARA MUSICALIZACAO_ATTENDANCE
-- ============================================

-- Usuários autenticados podem visualizar presenças
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_attendance" ON musicalizacao_attendance;
CREATE POLICY "musicalizacao_authenticated_can_view_attendance"
  ON musicalizacao_attendance FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar presenças
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_attendance" ON musicalizacao_attendance;
CREATE POLICY "musicalizacao_instructors_can_create_attendance"
  ON musicalizacao_attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem atualizar presenças
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_attendance" ON musicalizacao_attendance;
CREATE POLICY "musicalizacao_instructors_can_update_attendance"
  ON musicalizacao_attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem deletar presenças
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_attendance" ON musicalizacao_attendance;
CREATE POLICY "musicalizacao_instructors_can_delete_attendance"
  ON musicalizacao_attendance FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- ============================================
-- POLICIES PARA MUSICALIZACAO_INSTRUCTOR_ATTENDANCE
-- ============================================

-- Usuários autenticados podem visualizar presenças de instrutores
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_instructor_attendance" ON musicalizacao_instructor_attendance;
CREATE POLICY "musicalizacao_authenticated_can_view_instructor_attendance"
  ON musicalizacao_instructor_attendance FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar presenças de instrutores
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_instructor_attendance" ON musicalizacao_instructor_attendance;
CREATE POLICY "musicalizacao_instructors_can_create_instructor_attendance"
  ON musicalizacao_instructor_attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem atualizar presenças de instrutores
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_instructor_attendance" ON musicalizacao_instructor_attendance;
CREATE POLICY "musicalizacao_instructors_can_update_instructor_attendance"
  ON musicalizacao_instructor_attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem deletar presenças de instrutores
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_instructor_attendance" ON musicalizacao_instructor_attendance;
CREATE POLICY "musicalizacao_instructors_can_delete_instructor_attendance"
  ON musicalizacao_instructor_attendance FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- ============================================
-- POLICIES PARA MUSICALIZACAO_CLASS_FILES
-- ============================================

-- Usuários autenticados podem visualizar arquivos
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_authenticated_can_view_class_files"
  ON musicalizacao_class_files FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar arquivos de aula
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_instructors_can_create_class_files"
  ON musicalizacao_class_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem atualizar arquivos de aula
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_instructors_can_update_class_files"
  ON musicalizacao_class_files FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- Instrutores e acima podem deletar arquivos de aula
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_instructors_can_delete_class_files"
  ON musicalizacao_class_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- ============================================
-- POLICIES PARA MUSICALIZACAO_REPORTS
-- ============================================

-- Usuários podem visualizar seus próprios relatórios
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_reports" ON musicalizacao_reports;
CREATE POLICY "musicalizacao_users_can_view_own_reports"
  ON musicalizacao_reports FOR SELECT
  TO authenticated
  USING (generated_by = auth.uid());

-- Admins podem ver todos os relatórios
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_reports" ON musicalizacao_reports;
CREATE POLICY "musicalizacao_admins_can_view_all_reports"
  ON musicalizacao_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role = 'administrador'
    )
  );

-- Instrutores e acima podem criar relatórios
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_reports" ON musicalizacao_reports;
CREATE POLICY "musicalizacao_instructors_can_create_reports"
  ON musicalizacao_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('administrador', 'instrutor', 'coordenador')
    )
  );

-- 9. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TYPE musicalizacao_user_role IS 'Papel do usuário no sistema: administrador, instrutor, coordenador, usuario';
COMMENT ON COLUMN musicalizacao_profiles.role IS 'Papel do usuário no sistema. Use o dropdown para selecionar: administrador, instrutor, coordenador ou usuario';

