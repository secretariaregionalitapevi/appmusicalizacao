# 📤 Instruções para Fazer Push

O repositório foi configurado localmente, mas o push falhou por falta de autenticação. Siga estas instruções:

## 🔐 Opção 1: Usar Personal Access Token (Recomendado)

### 1. Criar Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Preencha:
   - **Note:** `Vercel Deploy`
   - **Expiration:** Escolha um prazo (ex: 90 dias)
   - **Scopes:** Marque `repo` (todas as permissões de repositório)
4. Clique em **Generate token**
5. **COPIE O TOKEN** (você só verá ele uma vez!)

### 2. Fazer Push

Execute o comando:

```bash
cd "D:\BACKUP GERAL\CCB - SECRETARIA MUSICAL\REGIONAL ITAPEVI\APPMUSICALIZACAO\APPMUSICALIZACAO"
git push -u origin main
```

Quando pedir:
- **Username:** `secretariaregionalitapevi` (ou seu usuário)
- **Password:** Cole o **token** (não use sua senha do GitHub)

## 🔐 Opção 2: Usar SSH

### 1. Gerar Chave SSH

```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
```

Pressione Enter para aceitar o local padrão e crie uma senha.

### 2. Adicionar Chave ao GitHub

1. Copie a chave pública:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   (No Windows, o arquivo está em `C:\Users\SeuUsuario\.ssh\id_ed25519.pub`)

2. Acesse: https://github.com/settings/keys
3. Clique em **New SSH key**
4. Cole a chave e salve

### 3. Alterar Remote para SSH

```bash
cd "D:\BACKUP GERAL\CCB - SECRETARIA MUSICAL\REGIONAL ITAPEVI\APPMUSICALIZACAO\APPMUSICALIZACAO"
git remote set-url origin git@github.com:secretariaregionalitapevi/appmusicalizacao.git
git push -u origin main
```

## ✅ Verificar Push Bem-Sucedido

Após o push, acesse:
https://github.com/secretariaregionalitapevi/appmusicalizacao

Você deve ver todos os arquivos do projeto, incluindo:
- ✅ `package.json`
- ✅ `README.md`
- ✅ `vercel.json`
- ✅ `src/`
- ✅ `scripts/`
- ✅ etc.

## 🚀 Próximo Passo: Configurar Vercel

Após o push bem-sucedido:

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New Project**
3. Importe o repositório `appmusicalizacao`
4. Configure:
   - **Framework Preset:** `Other`
   - **Root Directory:** (vazio)
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist`
5. Adicione variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `APP_ENV=production`
6. Clique em **Deploy**

---

**Nota:** Se você não tem permissão no repositório `secretariaregionalitapevi/appmusicalizacao`, você precisará:
- Ser adicionado como colaborador, OU
- Criar o repositório na sua própria conta do GitHub

