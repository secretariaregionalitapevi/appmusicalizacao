# 🔧 Configuração UTF-8 - Guia Completo

Este guia garante que todos os commits e arquivos do projeto usem encoding UTF-8 corretamente.

## ✅ Configurações Aplicadas

### 1. Git Global

As seguintes configurações foram aplicadas globalmente:

```bash
git config --global core.quotepath false
git config --global core.autocrlf false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

### 2. .gitattributes

O arquivo `.gitattributes` foi configurado para garantir que todos os arquivos de texto usem UTF-8 e LF (Line Feed) como fim de linha.

## 📝 Como Fazer Commits com Acentos

### Opção 1: Usar Git Bash (Recomendado no Windows)

1. Abra o **Git Bash** (não o PowerShell ou CMD)
2. Faça seus commits normalmente:
   ```bash
   git commit -m "feat: Adicionar funcionalidade de configuração"
   ```

### Opção 2: Usar PowerShell com UTF-8

1. No PowerShell, configure o encoding:
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   chcp 65001
   ```
2. Faça seus commits normalmente

### Opção 3: Usar Mensagens em Inglês

Se preferir evitar problemas de encoding, use mensagens de commit em inglês:
```bash
git commit -m "feat: Add configuration functionality"
```

## 🔍 Verificar Encoding

Para verificar se um arquivo está em UTF-8:

```bash
# No Git Bash
file -i arquivo.txt

# Deve mostrar: arquivo.txt: text/plain; charset=utf-8
```

## ⚠️ Problemas Comuns

### Problema: Commits aparecem com caracteres estranhos

**Solução:**
1. Verifique se as configurações globais estão aplicadas
2. Use Git Bash para commits com acentos
3. Ou use mensagens em inglês

### Problema: Arquivos aparecem com encoding incorreto

**Solução:**
1. Verifique o `.gitattributes` está commitado
2. Reaplique as configurações:
   ```bash
   git add .gitattributes
   git commit -m "chore: Update .gitattributes for UTF-8"
   ```

## 📋 Checklist

- [x] Configurações globais do Git aplicadas
- [x] `.gitattributes` configurado
- [x] Commits recentes corrigidos
- [ ] Usar Git Bash para commits futuros com acentos

## 🚀 Próximos Passos

1. **Sempre use Git Bash** para commits com acentos
2. **Ou use mensagens em inglês** para evitar problemas
3. **Verifique o encoding** antes de fazer commit de arquivos novos

---

**Nota:** Os commits anteriores que já foram enviados ao GitHub podem ainda aparecer com encoding incorreto na interface web, mas os novos commits estarão corretos.

