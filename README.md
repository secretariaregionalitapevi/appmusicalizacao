# 🎵 Sistema de Musicalização Infantil CCB

Aplicativo multiplataforma (iOS, Android e Web) para gestão completa do programa Musicalização Infantil da **Congregação Cristã no Brasil (CCB) - Regional Itapevi**.

## 📋 Sobre o Projeto

Sistema desenvolvido para facilitar a administração musical da Regional Itapevi, permitindo o gerenciamento de alunos, instrutores, aulas, presenças, calendário e relatórios de forma centralizada e eficiente.

## 🚀 Tecnologias

- **React Native** 0.73 com **Expo SDK** 50
- **TypeScript** 5.3+ para tipagem estática
- **Supabase** (PostgreSQL + Storage + Auth)
- **Zustand** 4.5+ para gerenciamento de estado
- **React Navigation** 6.x para navegação
- **React Hook Form** 7.x + **Zod** 3.x para formulários e validação
- **React Native Paper** 5.x para componentes UI
- **SweetAlert2** para notificações elegantes (Web)
- **React Native Toast Message** para notificações (Mobile)

## 📋 Pré-requisitos

- **Node.js** 18+ e npm
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
2. Execute as migrations SQL na ordem numérica:
   - `001_initial_schema.sql` - Schema inicial
   - `002_add_polos_system.sql` - Sistema de polos
   - `003_fix_rls_recursion_and_user_role.sql` - Correções de RLS
   - `004_fix_signup_completely.sql` - Correções de cadastro
   - `005_fix_rls_insert_signup.sql` - Correções de inserção
   - `006_add_role_enum.sql` - Enum de roles
   - `007_convert_role_to_portuguese_enum.sql` - Roles em português
   - `008_seed_test_data.sql` - Dados de teste (opcional)
   - `009_fix_reports_rls_and_preserve_route.sql` - Correções de relatórios
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
4. **⚠️ IMPORTANTE:** Configure as seguintes variáveis de ambiente no Vercel:
   - `SUPABASE_URL` - URL do seu projeto Supabase (ex: `https://seu-projeto.supabase.co`)
   - `SUPABASE_ANON_KEY` - Chave anônima do Supabase (encontre em Settings → API)
   - `APP_ENV=production`

   **Como obter as credenciais:**
   - Acesse [supabase.com](https://supabase.com) → Seu Projeto → Settings → API
   - Copie o **Project URL** para `SUPABASE_URL`
   - Copie a chave **anon public** para `SUPABASE_ANON_KEY`

   **⚠️ Sem essas variáveis, o aplicativo não funcionará online!**

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

- `musicalizacao_profiles` - Perfis de usuários
- `musicalizacao_polos` - Polos da regional
- `musicalizacao_students` - Alunos cadastrados
- `musicalizacao_instructors` - Instrutores
- `musicalizacao_classes` - Aulas
- `musicalizacao_attendance` - Registros de presença
- `musicalizacao_reports` - Relatórios gerados

Veja os arquivos em `supabase/migrations/` para o schema completo.

## 📁 Estrutura do Projeto

```
src/
├── api/                    # Cliente Supabase e tipos
│   ├── supabase.ts
│   └── types/
├── components/             # Componentes reutilizáveis
│   └── common/            # Componentes comuns
│       ├── AdminLayout.tsx
│       ├── DashboardCard.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── ...
├── contexts/               # Contextos React
│   └── ThemeContext.tsx   # Gerenciamento de tema (dark/light)
├── screens/                # Telas do aplicativo
│   ├── auth/              # Telas de autenticação
│   ├── home/              # Dashboard principal
│   ├── students/          # Gerenciamento de alunos
│   ├── classes/           # Gerenciamento de aulas
│   ├── calendar/         # Calendário de eventos
│   ├── attendance/        # Registro de presença
│   ├── reports/           # Relatórios
│   └── profile/           # Perfil do usuário
├── navigation/             # Configuração de navegação
├── hooks/                  # Custom hooks
│   └── useAuth.ts         # Hook de autenticação
├── services/               # Serviços e lógica de negócio
├── utils/                  # Utilitários e helpers
│   ├── toast.ts           # Sistema de notificações
│   ├── pdfExport.ts       # Exportação de PDF
│   └── ...
├── types/                  # Tipos TypeScript
└── theme/                  # Sistema de design
    ├── colors.ts
    ├── spacing.ts
    └── typography.ts
```

## 🔐 Autenticação e Roles

O aplicativo suporta quatro níveis de acesso (em português):

- **Administrador**: Acesso completo ao sistema
- **Coordenador**: Pode gerenciar alunos, aulas e relatórios
- **Instrutor**: Pode registrar presença e visualizar dados
- **Usuário**: Acesso básico de visualização

## 📝 Funcionalidades

### ✅ Implementadas

- ✅ Autenticação de usuários com Supabase
- ✅ Sistema de cadastro com seleção de polo
- ✅ Dashboard administrativo com métricas e gráficos
- ✅ Gerenciamento de alunos (listagem, busca, filtros)
- ✅ Gerenciamento de aulas (listagem, busca, filtros)
- ✅ Calendário mensal e semanal com eventos coloridos
- ✅ Registro de presença
- ✅ Geração e visualização de relatórios (PDF e impressão)
- ✅ Perfil do usuário com edição de dados
- ✅ Sistema de temas (dark/light mode)
- ✅ Layout responsivo (mobile e desktop)
- ✅ Navegação preservada ao recarregar página (F5)
- ✅ Sidebar responsiva com animações
- ✅ Gráficos de frequência por gênero
- ✅ Gráficos de aulas por status
- ✅ Alertas de alunos com faltas consecutivas

### 🚧 Em Desenvolvimento

- Upload de arquivos para aulas
- Notificações push
- Exportação de dados em Excel
- Filtros avançados no calendário

## 🧪 Testes

```bash
npm test
```

## 🐛 Troubleshooting

### Erro de conexão com Supabase

- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase
- Execute as migrations na ordem correta

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
