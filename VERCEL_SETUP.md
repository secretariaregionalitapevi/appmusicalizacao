# 🔧 Configuração do Vercel - Guia Completo

Este guia explica como configurar corretamente as variáveis de ambiente no Vercel para que o aplicativo funcione online.

## ⚠️ Problema Comum: "Failed to fetch" ou "placeholder.supabase.co"

Se você está vendo o erro "Failed to fetch" ou tentando conectar em `placeholder.supabase.co`, significa que as variáveis de ambiente do Supabase não estão configuradas corretamente no Vercel.

**Como funciona:**
- As variáveis de ambiente são injetadas no HTML durante o build
- Elas ficam disponíveis via `window.__ENV__` no navegador
- Se não estiverem configuradas, o app usa valores placeholder

## 📋 Passo a Passo

### 1. Acesse o Painel do Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Selecione o projeto `appmusicalizacao`
3. Vá em **Settings** → **Environment Variables**

### 2. Configure as Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente:

#### Variáveis Obrigatórias:

| Nome da Variável | Valor | Descrição |
|-----------------|-------|-----------|
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` | URL do seu projeto Supabase |
| `SUPABASE_ANON_KEY` | `sua-chave-anon-aqui` | Chave anônima do Supabase |
| `APP_ENV` | `production` | Ambiente da aplicação |

#### Como obter as credenciais do Supabase:

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → use como `SUPABASE_URL`
   - **anon public** key → use como `SUPABASE_ANON_KEY`

### 3. Configurar para Todos os Ambientes

Certifique-se de que as variáveis estão configuradas para:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development** (opcional)

### 4. Fazer Novo Deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para a branch `main`

## 🔍 Verificar se Está Funcionando

### No Console do Navegador:

1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Procure por mensagens como:
   - ✅ `🔧 Supabase Config Debug:` - mostra se as variáveis foram carregadas
   - ❌ `⚠️ Supabase credentials not configured` - indica problema

### Teste de Login:

1. Tente fazer login com credenciais válidas
2. Se ainda der erro, verifique:
   - As variáveis estão corretas no Vercel?
   - O projeto Supabase está ativo?
   - As políticas RLS estão configuradas?

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

**Causa:** Variáveis de ambiente não configuradas ou incorretas.

**Solução:**
1. Verifique se `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão no Vercel
2. Certifique-se de que não há espaços extras nos valores
3. Faça um novo deploy após adicionar as variáveis

### Erro: "Invalid login credentials"

**Causa:** E-mail ou senha incorretos, ou usuário não existe.

**Solução:**
1. Verifique se o usuário existe no Supabase
2. Tente criar uma nova conta primeiro
3. Verifique se o e-mail foi confirmado (se necessário)

### Erro: "NetworkError"

**Causa:** Problema de CORS ou conexão com Supabase.

**Solução:**
1. Verifique se o projeto Supabase está ativo
2. Verifique as configurações de CORS no Supabase
3. Verifique se a URL do Supabase está correta

## 📝 Exemplo de Configuração

No painel do Vercel, as variáveis devem estar assim:

```
SUPABASE_URL = https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_ENV = production
```

## ✅ Checklist Final

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Variáveis configuradas para Production
- [ ] Valores copiados corretamente do Supabase
- [ ] Novo deploy realizado após adicionar variáveis
- [ ] Teste de login realizado com sucesso

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do deploy no Vercel
2. Verifique o console do navegador para erros
3. Verifique se o projeto Supabase está ativo e acessível

---

**Importante:** Nunca commite as credenciais do Supabase no código. Sempre use variáveis de ambiente!

