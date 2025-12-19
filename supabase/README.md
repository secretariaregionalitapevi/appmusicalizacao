# Configuração do Supabase

Este diretório contém as migrations SQL necessárias para configurar o banco de dados do Sistema de Musicalização Infantil CCB.

## 📋 Passos para Configuração

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL do projeto e a chave anônima (anon key)

### 2. Executar Migrations

1. Acesse o SQL Editor no painel do Supabase
2. Execute o arquivo `migrations/001_initial_schema.sql` completo
3. Verifique se todas as tabelas foram criadas corretamente

### 3. Configurar Storage Buckets

No painel do Supabase, vá em **Storage** e crie os seguintes buckets:

1. **class-files**
   - Público: Não
   - Política: Apenas usuários autenticados podem fazer upload

2. **student-photos**
   - Público: Não
   - Política: Apenas usuários autenticados podem fazer upload

3. **profile-photos**
   - Público: Não
   - Política: Usuários podem fazer upload apenas de suas próprias fotos

4. **reports**
   - Público: Não
   - Política: Apenas usuários autenticados podem fazer upload

### 4. Configurar Políticas de Storage

Para cada bucket, configure as políticas RLS:

#### Exemplo para class-files:

```sql
-- Permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can view class files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'class-files');

-- Permitir upload para instrutores e acima
CREATE POLICY "Instructors can upload class files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'class-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'instructor', 'coordinator')
  )
);
```

### 5. Criar Primeiro Usuário Admin

Após criar uma conta de usuário no Supabase Auth, execute:

```sql
-- Substitua 'user-id-aqui' pelo ID do usuário criado
INSERT INTO profiles (id, full_name, role, regional)
VALUES ('user-id-aqui', 'Nome do Admin', 'admin', 'Regional Itapevi');
```

### 6. Verificar Configuração

Execute as seguintes queries para verificar:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🔒 Segurança

- **NUNCA** exponha a service_role key no frontend
- Use apenas a anon key no aplicativo mobile
- Todas as políticas RLS devem ser testadas antes de ir para produção
- Revise regularmente as políticas de acesso

## 📝 Notas

- As migrations são idempotentes (podem ser executadas múltiplas vezes)
- Os triggers são criados automaticamente
- Os índices são otimizados para as queries mais comuns
- As políticas RLS seguem o princípio de menor privilégio

