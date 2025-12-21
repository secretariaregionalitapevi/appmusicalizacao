# Migrations - Sistema de Musicalização Infantil

## 📋 Visão Geral

As migrations deste projeto foram configuradas para **não conflitar** com outras aplicações que possam estar usando o mesmo projeto Supabase. Todas as tabelas utilizam o prefixo `musicalizacao_` para garantir isolamento.

## 🗂️ Estrutura das Tabelas

### Tabelas Criadas

1. **`musicalizacao_profiles`** - Perfis de usuários específicos desta aplicação
   - Não conflita com a tabela `profiles` existente de outras aplicações
   - Estende `auth.users` do Supabase

2. **`musicalizacao_students`** - Alunos do sistema de musicalização

3. **`musicalizacao_instructors`** - Instrutores do sistema

4. **`musicalizacao_classes`** - Aulas/ensaios

5. **`musicalizacao_attendance`** - Presença de alunos

6. **`musicalizacao_instructor_attendance`** - Presença de instrutores

7. **`musicalizacao_class_files`** - Arquivos das aulas

8. **`musicalizacao_reports`** - Relatórios gerados

## 🔒 Segurança (RLS)

Todas as tabelas têm **Row Level Security (RLS)** habilitado com políticas específicas:

- **Usuários autenticados** podem visualizar dados básicos
- **Instrutores, Coordenadores e Admins** podem criar/editar/deletar
- **Admins** têm acesso total
- Cada usuário pode visualizar/editar apenas seu próprio perfil

## 🚀 Como Aplicar as Migrations

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo do arquivo `001_initial_schema.sql`
5. Clique em **Run** para executar

### Opção 2: Via CLI do Supabase

```bash
# Se você tem o Supabase CLI instalado
supabase db push
```

### Opção 3: Via Script SQL Direto

Execute o SQL diretamente no banco de dados PostgreSQL do seu projeto Supabase.

## ⚠️ Importante

- **Não há conflito** com outras aplicações que usam tabelas como `profiles`, `students`, etc.
- Todas as tabelas são isoladas com o prefixo `musicalizacao_`
- As políticas RLS são específicas para esta aplicação
- A função `update_updated_at()` pode já existir de outras aplicações (usa `CREATE OR REPLACE`)

## 🔄 Atualização do Código

O código TypeScript foi atualizado para usar as novas tabelas:

- `src/hooks/useAuth.ts` - Atualizado para usar `musicalizacao_profiles`
- `src/api/types/database.types.ts` - Tipos atualizados com os novos nomes

## 📝 Próximos Passos

Após aplicar as migrations:

1. Verifique se todas as tabelas foram criadas corretamente
2. Teste a autenticação para garantir que os perfis estão sendo criados
3. Configure os primeiros usuários admin manualmente se necessário

## 🐛 Troubleshooting

### Erro: "relation already exists"
- Isso pode acontecer se você já executou a migration antes
- Use `DROP TABLE IF EXISTS` antes de criar, ou simplesmente ignore o erro

### Erro: "permission denied"
- Verifique se você está usando as credenciais corretas do Supabase
- Certifique-se de ter permissões de administrador no projeto

### Erro: "function already exists"
- A função `update_updated_at()` pode já existir de outra aplicação
- Isso é normal e não causa problemas (usa `CREATE OR REPLACE`)

