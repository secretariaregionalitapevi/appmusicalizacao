# 🔧 Correção de Encoding UTF-8 nos Commits

## ✅ Configurações Aplicadas

As seguintes configurações foram aplicadas para garantir que os commits futuros usem UTF-8 corretamente:

1. **Git Global Config:**
   - `core.quotepath = false` - Não escapa caracteres não-ASCII
   - `i18n.commitencoding = utf-8` - Encoding para commits
   - `i18n.logoutputencoding = utf-8` - Encoding para logs

2. **Arquivo .gitattributes:**
   - Configurado para tratar todos os arquivos de texto como UTF-8
   - Line endings configurados como LF

## 🔄 Como Corrigir Commits Anteriores (Opcional)

Se quiser corrigir os commits anteriores que estão com encoding incorreto, você pode usar rebase interativo:

```bash
# 1. Fazer backup da branch
git branch backup-main

# 2. Iniciar rebase interativo dos últimos 5 commits
git rebase -i HEAD~5

# 3. No editor que abrir, mude 'pick' para 'reword' nos commits que quer corrigir
# 4. Salve e feche
# 5. Para cada commit, edite a mensagem com os acentos corretos
# 6. Salve cada vez

# 7. Se já foi feito push, force push (CUIDADO!)
git push origin main --force
```

⚠️ **ATENÇÃO**: Force push reescreve o histórico. Só faça se tiver certeza e se ninguém mais estiver trabalhando na branch.

## 📝 Próximos Commits

A partir de agora, todos os commits serão feitos com encoding UTF-8 correto. Os acentos serão exibidos corretamente no GitHub.

## 🧪 Teste

Para testar se está funcionando:

```bash
git commit -m "teste: Verificação de acentuação ção á é í ó ú"
git log --oneline -1
```

Se os acentos aparecerem corretos, está funcionando!

