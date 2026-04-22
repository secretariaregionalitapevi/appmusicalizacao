# App Cadastro MI

Aplicação web em Node.js para cadastro de **Criança** e **Colaborador** da EBI.

## Funcionalidades
- Tela inicial com seleção de tipo de cadastro.
- Rotas dedicadas:
`/cadastro/crianca` abre diretamente o formulário de criança.
`/cadastro/monitor` abre diretamente o formulário de monitor.
- Formulários completos com envio para API local.
- Seleção de **Comum congregação** com modal de busca.
- Filtro por qualquer trecho (ex.: `car` encontra `Vila Doutor Cardoso`).
- Dados salvos localmente em arquivo NDJSON.
- Encaminhamento opcional para webhooks.

## Requisitos
- Node.js 18+ (recomendado 20+)

## Estrutura
```txt
src/
  server.js                # servidor HTTP e rotas
public/
  index.html               # página inicial
  cadastro.html            # página de formulários
  styles/main.css          # estilos
  scripts/cadastro.js      # lógica da página de cadastro
  scripts/comuns.js        # modal e busca de comuns
  assets/                  # logos e favicon
data/
  cadastros.ndjson         # base local de envios
```

## Executar localmente
```bash
npm start
```

Ou em modo desenvolvimento:
```bash
npm run dev
```

Acesse:
- `http://localhost:3000`

## Variáveis de ambiente (opcional)
Arquivo de exemplo: `.env.example`

- `PORT` (padrão: `3000`)
- `WEBHOOK_CRIANCA`
- `WEBHOOK_MONITOR`
- `WEBHOOK_CADASTRO` (fallback único para ambos)

Se os webhooks não forem informados, os cadastros continuam sendo salvos localmente em `data/cadastros.ndjson`.

## Rotas da aplicação
- `GET /` -> tela inicial
- `GET /cadastro/crianca` -> formulário criança
- `GET /cadastro/monitor` -> formulário monitor
- `POST /api/cadastros/crianca`
- `POST /api/cadastros/monitor`

## Publicação no GitHub
Repositório alvo:
`git@github.com:secretariaregionalitapevi/ebi.git`

Comandos (quando o repositório local estiver no escopo correto):
```bash
git add .
git commit -m "feat: estrutura completa do app cadastro MI com seleção de comuns por modal"
git branch -M main
git remote add origin git@github.com:secretariaregionalitapevi/ebi.git
git push -u origin main
```
