# 🚀 Guia de Deploy no Vercel

## ✅ Configuração Atual

O projeto está configurado para deploy no Vercel usando Expo Web.

### Arquivos de Configuração

1. **`vercel.json`**: Configura o build command e output directory
2. **`package.json`**: Contém os scripts `build` e `vercel-build`
3. **`metro.config.js`**: Configurado para suportar plataforma web

### Scripts de Build

```json
{
  "build": "npx expo export --platform web",
  "vercel-build": "npx expo export --platform web"
}
```

### Configuração do Vercel

O `vercel.json` está configurado para:
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `web-build`
- **Dev Command**: `npm start`

## 🔧 Variáveis de Ambiente no Vercel

Configure as seguintes variáveis no painel do Vercel:

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione:
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `APP_ENV`: `production` (ou `development` para preview)

## 📝 Processo de Deploy

1. O Vercel detecta automaticamente mudanças no repositório GitHub
2. Executa `npm install` para instalar dependências
3. Executa `npm run vercel-build` que roda `npx expo export --platform web`
4. O Expo gera os arquivos estáticos em `web-build/`
5. O Vercel serve os arquivos do diretório `web-build/`

## ⚠️ Troubleshooting

### Erro: "react-scripts: command not found"
- **Solução**: Já corrigido! Agora usa `expo export --platform web`

### Erro: "Cannot find module"
- **Solução**: Verifique se todas as dependências estão no `package.json`

### Build falha
- Verifique os logs do Vercel para mais detalhes
- Teste localmente: `npm run build` e verifique se funciona

## 🔍 Testar Build Localmente

```bash
# Instalar dependências
npm install

# Fazer build para web
npm run build

# Verificar se o diretório web-build foi criado
ls web-build
```

## 📚 Referências

- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Vercel Expo Guide](https://vercel.com/docs/frameworks/expo)

