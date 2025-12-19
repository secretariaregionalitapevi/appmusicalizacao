# 📋 Convenções de Commits - Sistema de Musicalização Infantil CCB

## 🎯 Padrão Adotado: Conventional Commits em Inglês

Para evitar problemas de encoding e seguir as melhores práticas da indústria, **usaremos mensagens de commit em inglês**.

## 📝 Formato

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

## 🏷️ Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance
- `ci`: Configuração de CI/CD

## ✅ Exemplos Corretos

```bash
git commit -m "feat: Add login screen with Regional Itapevi pattern"
git commit -m "feat: Implement initial Musicalization Infantil CCB system"
git commit -m "docs: Add environment variables configuration guide"
git commit -m "chore: Configure Vercel deployment settings"
git commit -m "fix: Correct footer layout in login screen"
git commit -m "refactor: Improve authentication service structure"
```

## ❌ Evitar

- Mensagens muito longas na primeira linha
- Acentos e caracteres especiais (para evitar problemas de encoding)
- Mensagens genéricas como "update" ou "fix"

## 📚 Referência

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/)

