# Kurio — NFT Marketplace

Desafio técnico de frontend da Jungle Gaming: marketplace de NFTs em React + TypeScript com API e tempo real simulados (MSW + Socket.IO).

> Em construção. Este README cresce a cada etapa; a versão final traz contratos, credenciais e o roteiro dos fluxos de falha.

## Setup

Requisitos: Node 22+ e npm.

```bash
npm install
npm run dev        # http://localhost:5173, com a API simulada ligada
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Desenvolvimento com mocks |
| `npm run build` | Verificação de tipos + build de produção (mocks incluídos) |
| `npm run preview` | Serve o build de produção |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Fluxos E2E com Playwright (Chromium, mobile 390 e desktop 1440). Não precisa de Docker |
| `npm run test:e2e:report` | Abre o relatório HTML da última execução |
| `npm run test:visual` | Regressão visual (início, detalhe, carrinho e pagamento no mobile) comparada com as baselines. Roda no Docker oficial do Playwright |
| `npm run test:visual:update` | Regrava as baselines (`tests/e2e/__screenshots__`) quando uma mudança visual é intencional |

## Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | ligado | `false` desliga o MSW (o app passa a chamar um `/api` real). Sem backend real na entrega, o build de demonstração usa os mocks. |

## Credenciais de demonstração

| Usuário | Senha | Estado inicial |
| --- | --- | --- |
| `nova@kurio.dev` | `kurio123` | Carteira principal e secundária |
| `theo@kurio.dev` | `kurio123` | Somente carteira principal |

## API simulada e cenários

O MSW intercepta as chamadas REST (`/api/*`) e a conexão Socket.IO. O estado da API (catálogo, favoritos, carrinho, carteiras, pedidos) fica num banco em memória salvo no `localStorage`, então sobrevive ao refresh.

**Escolher um cenário:** pela URL (`?scenario=slow`) ou pelo painel de simulação (botão com ícone de frasco na borda esquerda da tela). O cenário fica salvo até ser trocado.

| Cenário | Comportamento |
| --- | --- |
| `default` | API respondendo normalmente (latência de 150 ms) |
| `slow` | Toda requisição demora 2,5 s (skeletons) |
| `flaky` | Latência variável em ciclo fixo: respostas chegam fora de ordem, sempre igual |
| `offline` | Nenhuma requisição chega e o socket cai até o cenário mudar |
| `error-5xx` | Toda requisição responde 503 |
| `empty` | O catálogo responde sem nenhum NFT |
| `session-expired` | A consulta da sessão responde como expirada e o app volta ao login preservando a rota |
| `favorite-error` | Adicionar ou remover favorito falha depois da atualização otimista, demonstrando o rollback |
| `wallet-rejected` | A carteira recusa a conexão no pagamento (mensagem de erro e a carteira segue desconectada) |

**Restaurar o estado inicial:** botão "Restaurar dados iniciais" no painel. Apaga banco, cenário e sessão salvos e recarrega com os dados de seed.

## Testes

- **Fluxos (`npm run test:e2e`):** cada teste abre um contexto novo do navegador, então parte do banco semeado e do cenário padrão. Latência e falhas vêm dos cenários, os eventos em tempo real são disparados pelo mock (`window.__kurioMock`) e chegam pelo cliente Socket.IO, e os cenários de espera usam o relógio do Playwright (`page.clock`).
- **Relatório:** `npm run test:e2e:report` abre o HTML da última execução. A execução final entregue está em `reports/playwright/` (abra o `index.html`). Os traces só são gravados quando um teste falha.
- **Regressão visual (`npm run test:visual`):** precisa do Docker, porque a imagem oficial do Playwright (mesma versão do pacote) garante a mesma renderização de fonte em qualquer máquina. As baselines ficam versionadas em `tests/e2e/__screenshots__/`. A primeira execução baixa a imagem e instala as dependências dentro do container (alguns minutos); no Windows, use o Docker Desktop.

## Deploy

Vercel, como projeto Vite. Passo a passo: importar o repositório, manter o preset **Vite** (build `npm run build`, saída `dist`) e publicar. Não precisa configurar variável de ambiente nem escolher outra versão do Node (o `package.json` pede Node 22+). O `vercel.json` faz qualquer rota abrir o app (acesso direto e refresh) e serve o worker do MSW sem cache; os mocks e o Socket.IO simulado rodam no próprio navegador, então não há backend para publicar.
