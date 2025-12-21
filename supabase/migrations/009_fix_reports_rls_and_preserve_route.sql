-- ============================================
-- Migration: Corrigir RLS de Relatórios e Permitir Visualização
-- ============================================

-- Esta migration corrige as políticas RLS para permitir que usuários autenticados
-- visualizem todos os relatórios (não apenas os próprios), já que relatórios são
-- documentos administrativos que devem ser acessíveis a instrutores e coordenadores

BEGIN;

-- Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_reports" ON musicalizacao_reports;
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_reports" ON musicalizacao_reports;

-- Nova política: Todos os usuários autenticados podem visualizar relatórios
-- (relatórios são documentos administrativos compartilhados)
CREATE POLICY "musicalizacao_authenticated_can_view_reports"
  ON musicalizacao_reports FOR SELECT
  TO authenticated
  USING (true);

-- Manter política de criação para instrutores e acima
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

COMMIT;

