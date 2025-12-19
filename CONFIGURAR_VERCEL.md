# 🔧 Como Configurar o Vercel Corretamente

## ⚠️ Problema Atual

O Vercel está tentando executar `react-scripts build` em vez de `npm run vercel-build`. Isso acontece porque o Vercel pode ter detectado automaticamente o projeto como Create React App ou há uma configuração antiga no painel.

## ✅ Solução: Reconfigurar no Painel do Vercel

### Passo 1: Acessar Configurações do Projeto

1. Acesse: https://vercel.com/seu-projeto/settings
2. Vá em **General** → **Build & Development Settings**

### Passo 2: Configurar Build Settings Manualmente

No painel do Vercel, configure:

- **Framework Preset**: `Other` ou deixe em branco
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `web-build`
- **Install Command**: `npm install`
- **Development Command**: `npm start` (opcional)

### Passo 3: Limpar Cache

1. Vá em **Settings** → **General**
2. Role até **Build Cache**
3. Clique em **Clear Build Cache**
4. Ou simplesmente faça um novo deploy

### Passo 4: Fazer Novo Deploy

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) no último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit para trigger automático

## 🔍 Verificar Configuração

Após reconfigurar, verifique nos logs do build que aparece:

```
Running "vercel build"
npm run vercel-build
npx expo export --platform web
```

**NÃO** deve aparecer:
```
react-scripts build  ❌
```

## 📝 Configuração Atual dos Arquivos

### `vercel.json`
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "web-build",
  "installCommand": "npm install",
  "framework": null
}
```

### `package.json`
```json
{
  "scripts": {
    "vercel-build": "npx expo export --platform web"
  }
}
```

## 🚨 Se Ainda Não Funcionar

1. **Desconecte e reconecte o repositório**:
   - Settings → Git → Disconnect
   - Conecte novamente

2. **Crie um novo projeto no Vercel**:
   - Importe o repositório novamente
   - Configure manualmente durante a importação

3. **Verifique se há `.vercel` folder**:
   - Se existir, delete e faça deploy novamente

## ✅ Checklist

- [ ] Build Command configurado como `npm run vercel-build`
- [ ] Output Directory configurado como `web-build`
- [ ] Framework Preset como `Other` ou vazio
- [ ] Cache limpo
- [ ] Novo deploy feito
- [ ] Logs mostram `expo export --platform web`

