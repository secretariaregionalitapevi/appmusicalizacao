# 📝 Guia de Uso do Git com UTF-8

## ⚠️ Problema de Encoding

O PowerShell do Windows pode ter problemas com encoding UTF-8 nos commits do Git, causando caracteres como "Ã§Ã£o" em vez de "ção".

## ✅ Solução: Script de Commit

Use o script `scripts/commit-utf8.ps1` para fazer commits com encoding correto:

```powershell
.\scripts\commit-utf8.ps1 "feat: Adiciona funcionalidade de login"
```

## 🔧 Configuração Manual

Se preferir fazer commits manualmente, configure antes:

```powershell
# No PowerShell, antes de fazer commit:
chcp 65001
$env:LANG = "pt_BR.UTF-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Depois faça o commit normalmente:
git commit -m "sua mensagem com acentos"
```

## 📋 Configurações Aplicadas

As seguintes configurações já foram aplicadas no Git:

- `core.quotepath = false`
- `i18n.commitencoding = utf-8`
- `i18n.logoutputencoding = utf-8`

## 🔄 Corrigir Commits Anteriores

Para corrigir commits anteriores com encoding incorreto, veja o arquivo `CORRECAO_ENCODING.md`.

