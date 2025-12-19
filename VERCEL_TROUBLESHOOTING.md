# 🔍 Troubleshooting - Erro 404 no Vercel

## ⚠️ Problema: Erro 404 após build bem-sucedido

O build está funcionando, mas o Vercel retorna 404 ao acessar a aplicação.

## ✅ Soluções a Verificar

### 1. Verificar Output Directory no Painel do Vercel

**IMPORTANTE**: O painel do Vercel pode estar sobrescrevendo o `vercel.json`.

1. Acesse: https://vercel.com/seu-projeto/settings
2. Vá em **General** → **Build & Development Settings**
3. **Verifique se o Output Directory está como `dist`** (não `web-build` ou outro)
4. Se estiver diferente, altere para `dist` e salve

### 2. Limpar Cache e Fazer Novo Deploy

1. **Settings** → **General** → **Build Cache** → **Clear Build Cache**
2. Vá em **Deployments**
3. Clique nos três pontos (⋯) no último deployment
4. Selecione **Redeploy**

### 3. Verificar se os Arquivos Estão no Diretório Correto

Após o build, verifique se existe:
- `dist/index.html`
- `dist/_expo/static/js/web/AppEntry-*.js`
- `dist/assets/`

### 4. Verificar Logs do Build

Nos logs do Vercel, verifique:
- ✅ Deve aparecer: `npm run vercel-build`
- ✅ Deve aparecer: `npx expo export --platform web`
- ✅ Deve aparecer: `App exported to: dist`
- ❌ NÃO deve aparecer: `react-scripts build`

### 5. Testar Build Localmente

```bash
# Limpar build anterior
rm -rf dist

# Fazer novo build
npm run build

# Verificar se dist/index.html existe
ls dist/index.html

# Verificar estrutura
ls -la dist/
```

### 6. Verificar Configuração do vercel.json

O arquivo deve ter:
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist",
  ...
}
```

### 7. Se Nada Funcionar: Recriar Projeto no Vercel

1. **Settings** → **General** → **Delete Project**
2. Importe o repositório novamente
3. Durante a importação, configure:
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔍 Verificação Rápida

Execute localmente e verifique se funciona:

```bash
npm run build
npx serve dist
```

Se funcionar localmente, o problema é na configuração do Vercel.

## 📝 Checklist

- [ ] Output Directory no painel = `dist`
- [ ] Build Command no painel = `npm run vercel-build`
- [ ] Cache limpo
- [ ] Novo deploy feito
- [ ] Logs mostram `expo export --platform web`
- [ ] `dist/index.html` existe após build
- [ ] `dist/_expo/static/` existe após build

