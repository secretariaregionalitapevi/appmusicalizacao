# 📝 Guia de Uso do Git com UTF-8

## ⚠️ Problema de Encoding

O PowerShell do Windows pode ter problemas com encoding UTF-8 nos commits do Git, causando caracteres como "Ã§Ã£o" em vez de "ção".

## ✅ Solução Recomendada: Usar Git Bash

**A melhor solução é usar Git Bash** (que vem com o Git for Windows) em vez do PowerShell:

1. Abra o **Git Bash**
2. Navegue até o projeto: `cd /d/BACKUP\ GERAL/CCB\ -\ SECRETARIA\ MUSICAL/REGIONAL\ ITAPEVI/APPMUSICALIZACAO/APPMUSICALIZACAO`
3. Faça commits normalmente:
```bash
git commit -m "feat: Adiciona funcionalidade de login"
```

## 🔧 Solução Alternativa: Script PowerShell

Se precisar usar PowerShell, use o script `scripts/commit-utf8-safe.ps1`:

```powershell
.\scripts\commit-utf8-safe.ps1 "feat: Adiciona funcionalidade de login"
```

Este script cria um arquivo temporário com encoding UTF-8 correto.

## 📋 Configurações Aplicadas

As seguintes configurações já foram aplicadas no Git:

- `core.quotepath = false`
- `i18n.commitencoding = utf-8`
- `i18n.logoutputencoding = utf-8`

## 🔄 Corrigir Commits Anteriores

Para corrigir commits anteriores com encoding incorreto, use rebase interativo no **Git Bash**:

```bash
# No Git Bash:
git rebase -i HEAD~5
# Mude 'pick' para 'reword' nos commits que quer corrigir
# Edite as mensagens com acentos corretos
```

## 💡 Dica

Para commits futuros, prefira usar **Git Bash** ou mensagens em inglês para evitar problemas de encoding.

