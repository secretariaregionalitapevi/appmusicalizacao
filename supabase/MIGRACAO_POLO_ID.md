# 📋 Migration: Garantir visibilidade de polo_id em musicalizacao_profiles

## 🎯 Objetivo

Esta migration garante que o campo `polo_id` esteja visível e configurado corretamente na tabela `musicalizacao_profiles`, permitindo que:

1. Usuários registrem seu polo durante o cadastro
2. O sistema filtre dados conforme o nível de segurança baseado no polo
3. A visualização no Supabase Table Editor mostre o campo corretamente

## 📝 O que a migration faz

1. **Garante que a coluna `polo_id` existe** na tabela `musicalizacao_profiles`
2. **Adiciona comentários** nas colunas para documentação
3. **Cria índices** para melhor performance
4. **Atualiza automaticamente** o campo `cidade` baseado no `polo_id`
5. **Cria uma view** `musicalizacao_profiles_with_polo` para facilitar visualização
6. **Garante integridade referencial** com foreign key

## 🚀 Como executar

### No Supabase Dashboard:

1. Acesse o **SQL Editor** no Supabase
2. Abra o arquivo `supabase/migrations/010_ensure_polo_id_visible_in_profiles.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **Run** ou pressione `Ctrl+Enter`

### Via CLI (se configurado):

```bash
supabase migration up
```

## 📊 Visualização no Supabase

### Opção 1: Tabela Principal

Após executar a migration, o campo `polo_id` estará visível na tabela `musicalizacao_profiles`:

- Vá em **Table Editor** → **musicalizacao_profiles**
- O campo `polo_id` aparecerá como uma coluna UUID
- Você pode editar diretamente ou usar o dropdown para selecionar um polo

### Opção 2: View com Informações do Polo

Para ver o **nome do polo** junto com os dados do perfil:

1. Vá em **Table Editor**
2. Selecione a view **musicalizacao_profiles_with_polo**
3. Esta view mostra:
   - Todos os campos de `musicalizacao_profiles`
   - `polo_nome` - Nome do polo
   - `polo_cidade` - Cidade do polo
   - `polo_regional` - Regional do polo
   - `polo_is_active` - Se o polo está ativo

## 🔐 Níveis de Segurança por Polo

O campo `polo_id` permite implementar filtros de segurança:

- **Administradores**: Veem todos os dados de todos os polos
- **Coordenadores**: Veem dados apenas do seu polo
- **Instrutores**: Veem dados apenas do seu polo
- **Usuários**: Veem apenas seus próprios dados

## ✅ Verificação

Após executar a migration, verifique:

1. ✅ O campo `polo_id` aparece na tabela `musicalizacao_profiles`
2. ✅ A view `musicalizacao_profiles_with_polo` está disponível
3. ✅ Usuários podem selecionar um polo durante o cadastro
4. ✅ O campo `cidade` é atualizado automaticamente baseado no polo

## 🔄 Atualizar Profiles Existentes

Se você já tem profiles sem `polo_id`, pode atualizá-los:

```sql
-- Exemplo: Atualizar um profile específico
UPDATE musicalizacao_profiles
SET polo_id = '00000000-0000-0000-0000-000000000001' -- ID do polo
WHERE id = 'seu-user-id-aqui';

-- A cidade será atualizada automaticamente pela migration
```

## 📞 Suporte

Se o campo não aparecer após executar a migration:

1. Verifique se a migration foi executada com sucesso
2. Recarregue a página do Supabase Table Editor
3. Verifique se há erros no SQL Editor
4. Confirme que a tabela `musicalizacao_polos` existe e tem dados

---

**Importante:** Esta migration é idempotente e pode ser executada múltiplas vezes sem problemas.

