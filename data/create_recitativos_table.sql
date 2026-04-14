-- Script SQL TOTAL para criar a tabela rjm_recitativos (Versão EBI Completa)
-- Execute este script no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS public.rjm_recitativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    data_reuniao TEXT NOT NULL,
    meninas INTEGER DEFAULT 0,
    meninos INTEGER DEFAULT 0,
    colaboradoras INTEGER DEFAULT 0,
    suspenso TEXT DEFAULT 'Não',
    justificativa TEXT DEFAULT '-',
    livro TEXT DEFAULT '-',
    capitulo TEXT DEFAULT '-',
    versiculo TEXT DEFAULT '-',
    titulo_historia TEXT DEFAULT '-',
    instrutora TEXT,
    localidade TEXT,
    cidade TEXT,
    -- Campos legados para compatibilidade
    municipio TEXT,
    comum TEXT,
    auxiliar_id TEXT,
    auxiliar_email TEXT,
    auxiliar_nome TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_recitativos_data ON public.rjm_recitativos(data_reuniao);
CREATE INDEX IF NOT EXISTS idx_recitativos_localidade ON public.rjm_recitativos(localidade);
