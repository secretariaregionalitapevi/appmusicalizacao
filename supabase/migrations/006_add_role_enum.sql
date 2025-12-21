-- ============================================
-- Migration: ADICIONAR ENUM PARA ROLE
-- ============================================
-- Esta migration cria um ENUM para o campo role, facilitando a seleção no Supabase UI

-- 1. CRIAR TIPO ENUM PARA ROLE (se não existir)
DO $$ BEGIN
  CREATE TYPE musicalizacao_user_role AS ENUM ('admin', 'instructor', 'coordinator', 'user');
EXCEPTION
  WHEN duplicate_object THEN 
    -- Se já existe, adicionar valores que possam estar faltando
    BEGIN
      -- Tentar adicionar 'user' se não existir (pode falhar se já existir, mas não é problema)
      ALTER TYPE musicalizacao_user_role ADD VALUE IF NOT EXISTS 'user';
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
END $$;

-- 2. REMOVER CONSTRAINT ANTIGA (se existir)
ALTER TABLE musicalizacao_profiles
  DROP CONSTRAINT IF EXISTS musicalizacao_profiles_role_check;

-- 3. ALTERAR COLUNA ROLE PARA USAR ENUM
-- Converter os valores existentes (text) para ENUM
ALTER TABLE musicalizacao_profiles
  ALTER COLUMN role TYPE musicalizacao_user_role 
  USING CASE 
    WHEN role = 'admin' THEN 'admin'::musicalizacao_user_role
    WHEN role = 'instructor' THEN 'instructor'::musicalizacao_user_role
    WHEN role = 'coordinator' THEN 'coordinator'::musicalizacao_user_role
    WHEN role = 'user' THEN 'user'::musicalizacao_user_role
    ELSE 'user'::musicalizacao_user_role -- Default para valores inválidos
  END;

-- 4. GARANTIR QUE A COLUNA NÃO PODE SER NULL
ALTER TABLE musicalizacao_profiles
  ALTER COLUMN role SET NOT NULL;

-- 5. ADICIONAR COMENTÁRIO PARA DOCUMENTAÇÃO
COMMENT ON TYPE musicalizacao_user_role IS 'Papel do usuário no sistema: admin (administrador), instructor (instrutor), coordinator (coordenador), user (usuário comum)';
COMMENT ON COLUMN musicalizacao_profiles.role IS 'Papel do usuário no sistema. Use o dropdown para selecionar: admin, instructor, coordinator ou user';

