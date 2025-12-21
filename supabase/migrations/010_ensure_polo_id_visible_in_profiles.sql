-- ============================================
-- Migration: Garantir que polo_id está visível e configurado em musicalizacao_profiles
-- ============================================

-- 1. Garantir que a coluna polo_id existe
ALTER TABLE musicalizacao_profiles
  ADD COLUMN IF NOT EXISTS polo_id UUID REFERENCES musicalizacao_polos(id);

-- 2. Adicionar comentário na coluna para documentação
COMMENT ON COLUMN musicalizacao_profiles.polo_id IS 'Polo ao qual o usuário pertence. Usado para filtrar dados conforme nível de segurança.';

-- 3. Criar índice se não existir (para melhor performance em queries)
CREATE INDEX IF NOT EXISTS idx_musicalizacao_profiles_polo_id ON musicalizacao_profiles(polo_id);

-- 4. Garantir que a coluna cidade também existe (pode ser derivada do polo)
ALTER TABLE musicalizacao_profiles
  ADD COLUMN IF NOT EXISTS cidade TEXT;

-- 5. Atualizar cidade baseado no polo_id se cidade estiver NULL
-- Isso garante que usuários com polo_id tenham cidade preenchida
UPDATE musicalizacao_profiles p
SET cidade = pol.cidade
FROM musicalizacao_polos pol
WHERE p.polo_id = pol.id
  AND p.cidade IS NULL;

-- 6. Adicionar comentário na coluna cidade
COMMENT ON COLUMN musicalizacao_profiles.cidade IS 'Cidade do usuário (pode ser derivada do polo).';

-- 7. Garantir que a coluna está visível e tem valores padrão quando necessário
-- Atualizar profiles existentes sem polo_id para ter um valor padrão (opcional)
-- Isso ajuda na visualização no Supabase

-- 8. Criar view para facilitar visualização de profiles com informações do polo
-- Esta view facilita a visualização no Supabase Table Editor
CREATE OR REPLACE VIEW musicalizacao_profiles_with_polo AS
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.phone,
  p.photo_url,
  p.regional,
  p.polo_id,
  p.cidade,
  p.status,
  p.created_at,
  p.updated_at,
  pol.nome AS polo_nome,
  pol.cidade AS polo_cidade,
  pol.regional AS polo_regional,
  pol.is_active AS polo_is_active
FROM musicalizacao_profiles p
LEFT JOIN musicalizacao_polos pol ON p.polo_id = pol.id;

-- 9. Comentário na view
COMMENT ON VIEW musicalizacao_profiles_with_polo IS 'View que une profiles com informações do polo para facilitar visualização no Supabase. Use esta view para ver o nome do polo junto com os dados do perfil.';

-- 10. Garantir permissões na view
GRANT SELECT ON musicalizacao_profiles_with_polo TO authenticated;

-- 9. Garantir que RLS permite visualização do polo_id
-- (As policies existentes já devem permitir, mas vamos garantir)

-- A política existente já permite que usuários vejam seu próprio perfil
-- e admins veem todos, então polo_id já está acessível

-- 10. Adicionar constraint para garantir integridade referencial
-- (Já existe na criação da coluna, mas vamos garantir)
DO $$
BEGIN
  -- Verificar se a constraint já existe
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'musicalizacao_profiles_polo_id_fkey'
  ) THEN
    ALTER TABLE musicalizacao_profiles
      ADD CONSTRAINT musicalizacao_profiles_polo_id_fkey 
      FOREIGN KEY (polo_id) 
      REFERENCES musicalizacao_polos(id);
  END IF;
END $$;

