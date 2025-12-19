# 📝 Guia de Configuração de Variáveis de Ambiente - Supabase

Este guia explica onde adicionar as variáveis do Supabase em cada ambiente.

## 🔑 Variáveis Necessárias

Você precisa das seguintes variáveis do seu projeto Supabase:
- `SUPABASE_URL` - URL do seu projeto (ex: `https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY` - Chave anônima (anon key) do seu projeto

**Onde encontrar essas variáveis:**
1. Acesse https://supabase.com
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie a **URL** e a **anon public key**

---

## 🏠 Desenvolvimento Local

### Opção 1: Arquivo `.env` (Recomendado)

1. Crie um arquivo `.env` na raiz do projeto:
```bash
# Na raiz do projeto
touch .env
```

2. Adicione as variáveis:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
APP_ENV=development
```

3. **IMPORTANTE**: O arquivo `.env` já está no `.gitignore` e não será commitado.

4. Reinicie o servidor Expo:
```bash
npm start
# ou
expo start
```

### Opção 2: app.json (Alternativa)

Edite o arquivo `app.json` e adicione em `extra`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://seu-projeto.supabase.co",
      "supabaseAnonKey": "sua-chave-anon-aqui"
    }
  }
}
```

⚠️ **ATENÇÃO**: Esta opção não é recomendada para produção, pois as credenciais ficarão no código.

---

## 🌐 Vercel (Deploy Web)

### Passo a Passo:

1. **Acesse o painel do Vercel:**
   - Vá para https://vercel.com
   - Faça login na sua conta
   - Selecione o projeto `appmusicalizacao`

2. **Vá em Settings:**
   - No menu lateral, clique em **Settings**
   - Clique em **Environment Variables**

3. **Adicione as variáveis:**
   - Clique em **Add New**
   - Adicione cada variável:

   **Variável 1:**
   - **Name:** `SUPABASE_URL`
   - **Value:** `https://seu-projeto.supabase.co`
   - **Environment:** Selecione todas (Production, Preview, Development)
   - Clique em **Save**

   **Variável 2:**
   - **Name:** `SUPABASE_ANON_KEY`
   - **Value:** `sua-chave-anon-aqui`
   - **Environment:** Selecione todas (Production, Preview, Development)
   - Clique em **Save**

4. **Redeploy:**
   - Após adicionar as variáveis, vá em **Deployments**
   - Clique nos três pontos (...) do último deployment
   - Selecione **Redeploy**
   - Ou faça um novo commit para trigger automático

---

## 📱 Builds Mobile (EAS Build)

Para builds de produção (iOS/Android), use o EAS Secrets:

1. **Instale o EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Faça login:**
```bash
eas login
```

3. **Configure o projeto:**
```bash
eas build:configure
```

4. **Adicione os secrets:**
```bash
eas secret:create --scope project --name SUPABASE_URL --value "https://seu-projeto.supabase.co"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "sua-chave-anon-aqui"
```

5. **Verifique os secrets:**
```bash
eas secret:list
```

---

## ✅ Verificação

Após configurar, verifique se está funcionando:

1. **Local:** Abra o console do navegador/app e verifique se não há avisos sobre credenciais do Supabase
2. **Vercel:** Verifique os logs do deployment para confirmar que as variáveis foram carregadas
3. **Teste:** Tente fazer login no app para confirmar a conexão com o Supabase

---

## 🔒 Segurança

⚠️ **NUNCA:**
- Commit o arquivo `.env` no Git
- Compartilhe as credenciais publicamente
- Use a `service_role` key no frontend (use apenas `anon key`)

✅ **SEMPRE:**
- Use apenas a `anon key` no frontend
- Mantenha o `.env` no `.gitignore`
- Use variáveis de ambiente no Vercel/EAS
- Revise as políticas RLS no Supabase

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se as variáveis estão corretas
2. Confirme que o projeto Supabase está ativo
3. Verifique os logs do console para erros específicos

