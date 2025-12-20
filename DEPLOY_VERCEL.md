# 🚀 Guia de Deploy no Vercel

Este guia explica como fazer o deploy do aplicativo no Vercel de forma correta.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Repositório no GitHub já configurado
- Variáveis de ambiente do Supabase prontas

## 🔧 Passo a Passo

### 1. Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New Project** ou **New Project**
3. Selecione o repositório `appmusicalizacao` do GitHub
4. Clique em **Import**

### 2. Configurar o Projeto

Durante a importação ou depois em **Settings**, configure:

#### Build & Development Settings

- **Framework Preset:** `Other` (ou deixe vazio)
- **Root Directory:** (deixe **VAZIO** - não coloque nada)
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Environment Variables

Adicione as seguintes variáveis de ambiente:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `sua-chave-anon` | Production, Preview, Development |
| `APP_ENV` | `production` | Production |
| `APP_ENV` | `development` | Preview, Development |

**Como adicionar:**
1. Vá em **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Preencha o nome e valor
4. Selecione os ambientes (Production, Preview, Development)
5. Clique em **Save**

### 3. Fazer Deploy

#### Deploy Automático

O Vercel fará deploy automaticamente quando você:
- Fizer push para a branch `main`
- Criar um Pull Request

#### Deploy Manual

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) no último deployment
3. Selecione **Redeploy**

### 4. Verificar o Deploy

Após o deploy, verifique:

1. **Logs do Build:**
   - Deve aparecer: `npm run vercel-build`
   - Deve aparecer: `npx expo export --platform web`
   - Deve aparecer: `✅ index.html corrigido com sucesso!`
   - Deve aparecer: `App exported to: dist`

2. **URL do Deploy:**
   - O Vercel fornecerá uma URL como: `https://appmusicalizacao.vercel.app`
   - Acesse a URL e verifique se o app carrega

3. **Console do Navegador:**
   - Abra o DevTools (F12)
   - Verifique se há erros no console
   - Verifique se os arquivos estão sendo carregados corretamente

## 🔍 Troubleshooting

### Erro: "package.json not found"

- Verifique se o **Root Directory** está vazio (não coloque nada)
- Verifique se o `package.json` está na raiz do repositório

### Erro: "404 Not Found"

1. Verifique se o **Output Directory** está como `dist`
2. Verifique se o build foi bem-sucedido (veja os logs)
3. Limpe o cache: **Settings** → **General** → **Build Cache** → **Clear Build Cache**
4. Faça um novo deploy

### Erro: "Command failed"

1. Verifique se o **Build Command** está como `npm run vercel-build`
2. Verifique os logs completos do build
3. Teste localmente: `npm run build` (deve funcionar)

### Variáveis de Ambiente não funcionam

1. Verifique se as variáveis foram adicionadas corretamente
2. Verifique se foram selecionados os ambientes corretos
3. Faça um novo deploy após adicionar variáveis
4. No código, use `process.env.SUPABASE_URL` (não `import.meta.env`)

## ✅ Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Repositório está no GitHub
- [ ] Branch `main` está atualizada
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Build Command = `npm run vercel-build`
- [ ] Output Directory = `dist`
- [ ] Root Directory = (vazio)
- [ ] Framework Preset = `Other` ou vazio
- [ ] Build local funciona: `npm run build`

## 📝 Notas Importantes

1. **Cache:** O Vercel pode usar cache. Se algo não atualizar, limpe o cache e faça redeploy.

2. **Variáveis de Ambiente:** Sempre adicione as variáveis no painel do Vercel. Não use arquivos `.env` no repositório.

3. **Build Local:** Sempre teste o build localmente antes de fazer deploy:
   ```bash
   npm run build
   ```

4. **Logs:** Sempre verifique os logs do build no Vercel para identificar problemas.

---

**Pronto!** Seu aplicativo deve estar funcionando no Vercel. 🎉

