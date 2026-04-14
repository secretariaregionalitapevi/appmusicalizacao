-- SQL script to update rjm_recitativos table with all EBI fields
-- Execute this in the Supabase SQL Editor

ALTER TABLE public.rjm_recitativos 
ADD COLUMN IF NOT EXISTS colaboradoras INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspenso TEXT DEFAULT 'Não',
ADD COLUMN IF NOT EXISTS justificativa TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS livro TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS capitulo TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS versiculo TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS titulo_historia TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS instrutora TEXT,
ADD COLUMN IF NOT EXISTS localidade TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT;

-- Verificar e adicionar colunas legadas se não existirem
ALTER TABLE public.rjm_recitativos 
ADD COLUMN IF NOT EXISTS municipio TEXT,
ADD COLUMN IF NOT EXISTS comum TEXT;
