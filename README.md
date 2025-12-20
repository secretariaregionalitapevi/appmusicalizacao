# 🎵 Sistema de Musicalização Infantil CCB

Aplicativo multiplataforma (iOS, Android e Web) para gestão completa do programa Musicalização Infantil da **Congregação Cristã no Brasil (CCB) - Regional Itapevi**.

## 📋 Sobre o Projeto

Sistema desenvolvido para facilitar a administração musical da Regional Itapevi, permitindo o gerenciamento de alunos, instrutores, aulas, presenças e relatórios de forma centralizada e eficiente.

## 🚀 Tecnologias

- **React Native** 0.73+ com **Expo SDK** 50+
- **TypeScript** 5.0+ para tipagem estática
- **Supabase** (PostgreSQL + Storage + Auth)
- **Zustand** 4.5+ para gerenciamento de estado
- **React Navigation** 6.x para navegação
- **React Hook Form** 7.x + **Zod** 3.x para formulários e validação
- **React Native Paper** 5.x para componentes UI

## 📋 Pré-requisitos

- **Node.js** 18+ e npm/yarn
- **Expo CLI** (`npm install -g expo-cli`)
- Conta no **Supabase** (gratuita)
- **iOS Simulator** (Mac) ou **Android Studio** (para testar em emulador)
- **Git** configurado

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/secretariaregionalitapevi/appmusicalizacao.git
cd appmusicalizacao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
APP_ENV=development
```

> **⚠️ Importante:** Nunca commite o arquivo `.env` no repositório. Ele já está no `.gitignore`.

### 4. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrations SQL fornecidas em `supabase/migrations/001_initial_schema.sql`
3. Configure as políticas RLS (Row Level Security) conforme necessário
4. Crie os buckets de storage:
   - `class-files` (arquivos de aulas)
   - `student-photos` (fotos de alunos)
   - `profile-photos` (fotos de perfil)
   - `reports` (relatórios gerados)

### 5. Inicie o servidor de desenvolvimento

```bash
npm start
```

## 📱 Executando o Aplicativo

### Web (Local)

Após iniciar com `npm start`, pressione `w` no terminal para abrir no navegador.

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Expo Go

Escaneie o QR code exibido no terminal com o app **Expo Go** no seu dispositivo móvel.

## 🌐 Deploy no Vercel

### Configuração Inicial

1. Acesse [Vercel](https://vercel.com) e faça login
2. Clique em **Add New Project**
3. Importe o repositório do GitHub
4. Configure as seguintes variáveis de ambiente no Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `APP_ENV=production`

### Configurações de Build

No painel do Vercel, configure:

- **Framework Preset:** `Other`
- **Root Directory:** (deixe vazio)
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Deploy Automático

O Vercel fará deploy automático sempre que você fizer push para a branch `main`.

## 🗄️ Estrutura do Banco de Dados

O banco de dados utiliza PostgreSQL através do Supabase. As principais tabelas são:

- `profiles` - Perfis de usuários
- `students` - Alunos cadastrados
- `instructors` - Instrutores
- `classes` - Aulas
- `attendances` - Registros de presença
- `class_files` - Arquivos relacionados às aulas

Veja o arquivo `supabase/migrations/001_initial_schema.sql` para o schema completo.

## 📁 Estrutura do Projeto

```
src/
├── api/              # Cliente Supabase e tipos
│   ├── supabase.ts
│   └── types/
├── components/       # Componentes reutilizáveis
│   └── common/      # Componentes comuns (Button, Input, etc.)
├── screens/         # Telas do aplicativo
│   ├── auth/        # Telas de autenticação
│   ├── home/        # Tela inicial
│   ├── students/    # Gerenciamento de alunos
│   ├── classes/     # Gerenciamento de aulas
│   └── reports/     # Relatórios
├── navigation/      # Configuração de navegação
├── hooks/           # Custom hooks
├── stores/          # Zustand stores (quando implementado)
├── services/        # Lógica de negócio
├── utils/           # Utilitários e helpers
├── types/           # Tipos TypeScript
└── theme/           # Sistema de design (cores, espaçamento, tipografia)
```

## 🔐 Autenticação

O aplicativo suporta três níveis de acesso:

- **Admin**: Acesso completo ao sistema
- **Coordinator**: Pode gerenciar alunos e aulas
- **Instructor**: Pode registrar presença e visualizar dados

## 📝 Funcionalidades

### ✅ Implementadas

- Autenticação de usuários com Supabase
- Tela de login responsiva (mobile e web)
- Navegação entre telas
- Sistema de design consistente

### 🚧 Em Desenvolvimento

- Gerenciamento de alunos
- Gerenciamento de aulas
- Registro de presença
- Upload de arquivos
- Geração de relatórios
- Dashboard administrativo

## 🧪 Testes

```bash
npm test
```

## 🐛 Troubleshooting

### Erro de conexão com Supabase

- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase

### Erro ao fazer build

- Limpe o cache: `expo start -c`
- Reinstale as dependências: `rm -rf node_modules && npm install`
- Verifique se todas as dependências estão instaladas: `npm install`

### Problemas com encoding (caracteres especiais)

O projeto está configurado para usar UTF-8. Se encontrar problemas:

1. Verifique se o Git está configurado: `git config --global core.quotepath false`
2. Use Git Bash para commits com acentos (recomendado no Windows)
3. Ou use mensagens de commit em inglês

### Erro 404 no Vercel

1. Verifique se o **Output Directory** está configurado como `dist`
2. Verifique se o **Build Command** está como `npm run vercel-build`
3. Limpe o cache do build no Vercel
4. Verifique os logs do build no painel do Vercel

## 📄 Licença

Este projeto é propriedade da **Congregação Cristã no Brasil (CCB)**.

## 👥 Contribuição

Para contribuir com o projeto, entre em contato com a equipe de desenvolvimento da Regional Itapevi.

## 📞 Suporte

Em caso de dúvidas ou problemas, abra uma issue no repositório ou entre em contato com a equipe responsável.

---

**Desenvolvido com ❤️ para a Regional Itapevi - CCB**
