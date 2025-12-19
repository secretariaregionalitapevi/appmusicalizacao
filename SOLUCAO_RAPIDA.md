# 🚀 Solução Rápida para Corrigir Encoding nos Commits

## ⚡ Solução Mais Simples

**Você NÃO precisa excluir o repositório!** Basta corrigir os commits anteriores usando Git Bash.

## 📋 Passo a Passo

### 1. Abra o Git Bash
- Procure por "Git Bash" no menu Iniciar
- Navegue até o projeto:
```bash
cd "/d/BACKUP GERAL/CCB - SECRETARIA MUSICAL/REGIONAL ITAPEVI/APPMUSICALIZACAO/APPMUSICALIZACAO"
```

### 2. Execute o Rebase Interativo
```bash
git rebase -i HEAD~5
```

### 3. No Editor (Vim ou Nano)
- Se abrir o Vim, pressione `i` para entrar no modo de inserção
- Mude `pick` para `reword` (ou `r`) nos commits que quer corrigir:
```
pick f6c5853 feat: Implementação inicial...
reword b6eff22 merge: Resolvendo conflito...
reword 761a838 chore: Adiciona configuração...
reword c228dc9 docs: Adiciona .env.example...
reword c99e33a feat: Configura favicon...
```
- Salve e saia:
  - Vim: Pressione `Esc`, digite `:wq` e Enter
  - Nano: `Ctrl+X`, depois `Y`, depois Enter

### 4. Para Cada Commit
O Git abrirá o editor novamente para cada commit marcado como `reword`. Edite a mensagem com os acentos corretos:

**Commit 1:**
```
feat: Implementação inicial do Sistema de Musicalização Infantil CCB - Tela de login completa com padrão Regional Itapevi
```

**Commit 2:**
```
merge: Resolvendo conflito no README.md mantendo versão local
```

**Commit 3:**
```
chore: Adiciona configuração do Vercel para deploy
```

**Commit 4:**
```
docs: Adiciona .env.example e guia de configuração de variáveis
```

**Commit 5:**
```
feat: Configura favicon e título da página como 'CCB | Login'
```

### 5. Force Push
```bash
git push origin main --force
```

⚠️ **ATENÇÃO**: Force push reescreve o histórico. Certifique-se de que ninguém mais está trabalhando na branch.

## ✅ Alternativa: Usar Script Automatizado

Execute no Git Bash:
```bash
bash scripts/corrigir-commits.sh
```

O script guiará você através do processo.

## 🎯 Resultado

Após o rebase, todos os commits terão acentos corretos no GitHub!

