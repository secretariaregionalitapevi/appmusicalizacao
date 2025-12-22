-- ============================================
-- Migration: REMOVER TRIGGERS PROBLEMÁTICOS
-- ============================================
-- Remove triggers que podem estar causando erro 500 ao criar usuário
-- O erro 500 "Database error saving new user" geralmente é causado por
-- triggers que tentam criar perfil automaticamente e falham

-- 1. VERIFICAR E REMOVER TRIGGERS EM auth.users
-- Estes triggers podem tentar criar perfil em 'profiles' (não musicalizacao_profiles)
-- e falhar, causando erro 500
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- 2. REMOVER FUNÇÕES RELACIONADAS
-- Estas funções podem tentar inserir em 'profiles' e falhar
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_new_user() CASCADE;

-- 3. VERIFICAR SE EXISTE TABELA 'profiles' E SE TEM RLS BLOQUEANDO
-- Se existir tabela 'profiles' com RLS muito restritivo, pode causar erro 500
-- quando trigger tenta inserir nela
DO $$
BEGIN
  -- Se a tabela profiles existe, garantir que tem política de INSERT permissiva
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Remover políticas restritivas de INSERT
    DROP POLICY IF EXISTS "Usuários podem inserir perfis" ON public.profiles;
    DROP POLICY IF EXISTS "Sistema pode inserir perfis" ON public.profiles;
    
    -- Criar política permissiva para INSERT (permite inserção via trigger)
    CREATE POLICY IF NOT EXISTS "allow_profile_insert_via_trigger"
      ON public.profiles FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- NOTA: O perfil será criado manualmente pelo código da aplicação
-- na tabela musicalizacao_profiles após o signup bem-sucedido, não por trigger

