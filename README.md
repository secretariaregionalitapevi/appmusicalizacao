# Sistema de Musicalização Infantil CCB

Aplicativo mobile multiplataforma (iOS e Android) para gestão de aulas do programa Musicalização Infantil da Congregação Cristã no Brasil (CCB).

## 🚀 Tecnologias

- **React Native** 0.73+ com **Expo SDK** 50+
- **TypeScript** 5.0+
- **Supabase** (PostgreSQL + Storage + Auth)
- **Zustand** 4.5+ (State Management)
- **React Navigation** 6.x
- **React Hook Form** 7.x + **Zod** 3.x
- **React Native Paper** 5.x

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no Supabase
- iOS Simulator (Mac) ou Android Studio (para testar em emulador)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd APPMUSICALIZACAO
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
APP_ENV=development
```

4. Configure o Supabase:
   - Crie um projeto no Supabase
   - Execute as migrations SQL fornecidas no diretório `supabase/migrations/`
   - Configure as políticas RLS (Row Level Security)
   - Crie os buckets de storage necessários

5. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

## 📱 Executando o App

### iOS
```bash
npm run ios
# ou
yarn ios
```

### Android
```bash
npm run android
# ou
yarn android
```

### Expo Go
Escaneie o QR code exibido no terminal com o app Expo Go no seu dispositivo móvel.

## 🗄️ Configuração do Banco de Dados

Execute as seguintes migrations SQL no Supabase:

1. Crie as tabelas principais (profiles, students, instructors, classes, etc.)
2. Configure os índices para performance
3. Configure os triggers para `updated_at`
4. Configure as políticas RLS
5. Crie os buckets de storage:
   - `class-files`
   - `student-photos`
   - `profile-photos`
   - `reports`

Veja o arquivo `supabase/migrations/001_initial_schema.sql` para o schema completo.

## 🧪 Testes

```bash
npm test
# ou
yarn test
```

## 📁 Estrutura do Projeto

```
src/
├── api/              # Cliente Supabase e tipos
├── components/       # Componentes reutilizáveis
├── screens/          # Telas do aplicativo
├── navigation/       # Configuração de navegação
├── hooks/            # Custom hooks
├── stores/           # Zustand stores
├── services/         # Lógica de negócio
├── utils/            # Utilitários
├── types/            # Tipos TypeScript
└── theme/            # Sistema de design
```

## 🔐 Autenticação

O aplicativo suporta três níveis de acesso:
- **Admin**: Acesso completo ao sistema
- **Coordinator**: Pode gerenciar alunos e aulas
- **Instructor**: Pode registrar presença e visualizar dados

## 📝 Funcionalidades

- ✅ Autenticação de usuários
- ✅ Gerenciamento de alunos
- ✅ Gerenciamento de aulas
- ✅ Registro de presença
- ✅ Upload de arquivos
- ✅ Geração de relatórios

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS

### Erro ao fazer build
- Limpe o cache: `expo start -c`
- Reinstale as dependências: `rm -rf node_modules && npm install`

## 📄 Licença

Este projeto é propriedade da Congregação Cristã no Brasil (CCB).

## 👥 Contribuição

Para contribuir com o projeto, entre em contato com a equipe de desenvolvimento.

