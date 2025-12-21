# ⚠️ URGENTE: Configurar Variáveis no Vercel

## 🔴 O Problema

O aplicativo está tentando usar `placeholder.supabase.co` porque as variáveis de ambiente **NÃO ESTÃO CONFIGURADAS no Vercel**.

## ✅ Solução Rápida (5 minutos)

### Passo 1: Acesse o Vercel
1. Vá para: https://vercel.com
2. Faça login
3. Selecione o projeto: **appmusicalizacao**

### Passo 2: Configure as Variáveis
1. Clique em **Settings** (no menu superior)
2. Clique em **Environment Variables** (no menu lateral)
3. Adicione estas 3 variáveis:

#### Variável 1:
- **Key:** `SUPABASE_URL`
- **Value:** `https://seu-projeto.supabase.co` (substitua pelo seu URL real)
- **Environments:** ✅ Production ✅ Preview ✅ Development

#### Variável 2:
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** `sua-chave-anon-aqui` (substitua pela sua chave real)
- **Environments:** ✅ Production ✅ Preview ✅ Development

#### Variável 3:
- **Key:** `APP_ENV`
- **Value:** `production`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Passo 3: Onde Obter as Credenciais?

1. Acesse: https://supabase.com
2. Faça login
3. Selecione seu projeto
4. Vá em **Settings** → **API**
5. Copie:
   - **Project URL** → cole em `SUPABASE_URL`
   - **anon public** key → cole em `SUPABASE_ANON_KEY`

### Passo 4: Fazer Novo Deploy

**IMPORTANTE:** Após adicionar as variáveis, você DEVE fazer um novo deploy:

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do último deploy
3. Clique em **Redeploy**
4. Aguarde o build terminar

## 🔍 Como Verificar se Funcionou

Após o deploy, abra o console do navegador (F12) e procure por:

✅ **Sucesso:**
```
🔧 Environment variables injected: { hasSupabaseUrl: true, hasSupabaseKey: true, isConfigured: true }
```

❌ **Ainda com problema:**
```
❌ SUPABASE_URL não configurado!
❌ SUPABASE_ANON_KEY não configurado!
```

## ⚠️ IMPORTANTE

- As variáveis devem estar configuradas para **Production**, **Preview** e **Development**
- Você DEVE fazer um **Redeploy** após adicionar as variáveis
- As variáveis só estarão disponíveis em deploys NOVOS, não em deploys antigos

## 📞 Ainda Não Funciona?

1. Verifique se as variáveis estão escritas corretamente (sem espaços extras)
2. Verifique se fez o Redeploy após adicionar as variáveis
3. Verifique os logs do build no Vercel para ver se há erros
4. Abra o console do navegador e verifique os logs de debug

---

**Este é o ÚNICO passo necessário para resolver o problema!**

