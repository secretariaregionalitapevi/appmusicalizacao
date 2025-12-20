# 🇧🇷 Configuração UTF-8 para Projetos no Brasil

Este projeto está configurado para usar **UTF-8** corretamente, garantindo que acentuação e caracteres especiais do português sejam exibidos corretamente.

## ✅ Configurações Aplicadas

### Git Global
```bash
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

### Git Local (Projeto)
As mesmas configurações foram aplicadas localmente no projeto.

### .gitattributes
O arquivo `.gitattributes` foi configurado para garantir que todos os arquivos de texto usem UTF-8:
```
* text=auto eol=lf working-tree-encoding=UTF-8
```

## 📝 Como Fazer Commits em Português

### Opção 1: Usar Script PowerShell (Recomendado no Windows)

```powershell
.\scripts\commit-utf8.ps1 "feat: Adicionar nova funcionalidade de relatórios"
```

Este script garante que a mensagem seja salva corretamente em UTF-8.

### Opção 2: Usar Git Bash (Recomendado)

Se você tem Git Bash instalado, use-o para fazer commits:

```bash
git commit -m "feat: Adicionar nova funcionalidade de relatórios"
```

O Git Bash lida melhor com UTF-8 no Windows.

### Opção 3: Usar Arquivo de Mensagem

```bash
# Criar arquivo com a mensagem em UTF-8
echo "feat: Adicionar nova funcionalidade" > mensagem.txt
git commit -F mensagem.txt
```

## 🔍 Verificar Encoding

Para verificar se um commit foi feito corretamente:

```bash
git log --oneline -1
```

Se os acentos aparecerem corretamente (á, é, í, ó, ú, ç, ã, etc.), está funcionando!

## ⚠️ Sobre Commits Antigos

Os commits antigos que mostram caracteres incorretos (como `repositÃ³rio`) já foram feitos com encoding errado. Isso **não afeta o código-fonte**, apenas as mensagens de commit.

**Recomendação:** Deixe os commits antigos como estão. Os novos commits serão feitos corretamente.

## 🚀 Próximos Passos

1. Use o script `commit-utf8.ps1` para novos commits em português
2. Ou use Git Bash para commits
3. Todos os arquivos do código já estão em UTF-8 corretamente

## 📚 Referências

- [Git UTF-8 Configuration](https://git-scm.com/docs/git-config#Documentation/git-config.txt-i18ncommitEncoding)
- [Working Tree Encoding](https://git-scm.com/docs/gitattributes#Documentation/gitattributes.txt-working-tree-encoding)

---

**Importante:** O código-fonte sempre esteve em UTF-8. O problema era apenas nas mensagens de commit do PowerShell, que agora está resolvido.

