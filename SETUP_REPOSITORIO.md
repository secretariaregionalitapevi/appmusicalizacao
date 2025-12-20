# 🚀 Guia Completo: Configurar Repositório e Deploy

Este guia explica como configurar o repositório do zero e fazer deploy no Vercel.

## 📋 Passo 1: Criar Repositório no GitHub

### 1.1 Criar Novo Repositório

1. Acesse [GitHub](https://github.com)
2. Clique no **+** (canto superior direito) → **New repository**
3. Preencha:
   - **Repository name:** `appmusicalizacao`
   - **Description:** `Sistema de Musicalização Infantil CCB - Regional Itapevi`
   - **Visibility:** Público ou Privado (sua escolha)
   - **NÃO marque** "Add a README file"
   - **NÃO marque** "Add .gitignore"
   - **NÃO marque** "Choose a license"
4. Clique em **Create repository**

### 1.2 Copiar URL do Repositório

Após criar, copie a URL do repositório. Será algo como:
```
https://github.com/secretariaregionalitapevi/appmusicalizacao.git
```

## 📋 Passo 2: Configurar Git Local

### 2.1 Verificar Configuração Atual

```bash
cd "D:\BACKUP GERAL\CCB - SECRETARIA MUSICAL\REGIONAL ITAPEVI\APPMUSICALIZACAO\APPMUSICALIZACAO"
git remote -v
```

### 2.2 Adicionar Remote (se necessário)

Se o remote não existir ou estiver incorreto:

```bash
# Remover remote antigo (se existir)
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/secretariaregionalitapevi/appmusicalizacao.git
```

### 2.3 Verificar Branch

```bash
git branch
```

Se não estiver na branch `main`:

```bash
git checkout -b main
```

## 📋 Passo 3: Fazer Push para GitHub

### 3.1 Push Inicial

```bash
git push -u origin main
```

Se der erro de autenticação, você precisará:

1. **Usar Personal Access Token:**
   - Vá em GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Gere um novo token com permissões `repo`
   - Use o token como senha quando o Git pedir

2. **Ou usar SSH:**
   - Configure chave SSH no GitHub
   - Use a URL SSH: `git@github.com:secretariaregionalitapevi/appmusicalizacao.git`

### 3.2 Verificar no GitHub

Acesse o repositório no GitHub e verifique se todos os arquivos estão lá:
- ✅ `package.json`
- ✅ `README.md`
- ✅ `vercel.json`
- ✅ `src/`
- ✅ etc.

## 📋 Passo 4: Configurar Vercel

### 4.1 Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New Project** ou **New Project**
3. Selecione o repositório `appmusicalizacao` do GitHub
4. Clique em **Import**

### 4.2 Configurar Build Settings

**IMPORTANTE:** Configure exatamente assim:

- **Framework Preset:** `Other` (ou deixe vazio)
- **Root Directory:** (deixe **VAZIO** - não coloque nada)
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4.3 Adicionar Variáveis de Ambiente

Vá em **Settings** → **Environment Variables** e adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `sua-chave-anon` | Production, Preview, Development |
| `APP_ENV` | `production` | Production |
| `APP_ENV` | `development` | Preview, Development |

**Como adicionar:**
1. Clique em **Add New**
2. Preencha o nome e valor
3. Selecione os ambientes (marque todos: Production, Preview, Development)
4. Clique em **Save**

### 4.4 Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Verifique os logs do build
4. Acesse a URL fornecida pelo Vercel

## ✅ Verificação Final

### Checklist

- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub (push bem-sucedido)
- [ ] Projeto criado no Vercel
- [ ] Build settings configurados corretamente
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy bem-sucedido
- [ ] App acessível na URL do Vercel

### Verificar Logs do Build

Nos logs do Vercel, deve aparecer:

```
✅ Cloning github.com/secretariaregionalitapevi/appmusicalizacao
✅ Running "install" command: 'npm install'
✅ Running "build" command: 'npm run vercel-build'
✅ npx expo export --platform web
✅ index.html corrigido com sucesso!
✅ App exported to: dist
```

## 🐛 Troubleshooting

### Erro: "Repository not found"

- Verifique se o repositório existe no GitHub
- Verifique se você tem permissão de acesso
- Verifique se a URL do remote está correta

### Erro: "Authentication failed"

- Use Personal Access Token em vez de senha
- Ou configure SSH keys

### Erro no Vercel: "package.json not found"

- Verifique se o **Root Directory** está vazio
- Verifique se o `package.json` está na raiz do repositório

### Erro no Vercel: "404 Not Found"

- Verifique se o **Output Directory** está como `dist`
- Limpe o cache do build
- Faça um novo deploy

## 📞 Próximos Passos

Após configurar tudo:

1. Teste o app na URL do Vercel
2. Verifique se o login funciona
3. Configure o Supabase (se ainda não fez)
4. Teste todas as funcionalidades

---

**Pronto!** Seu projeto está configurado e pronto para deploy! 🎉

