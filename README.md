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
| `npm run test:e2e` | Testes Playwright (Chromium, mobile 390 e desktop 1440) |
| `npm run test:e2e:report` | Abre o relatório HTML da última execução |

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

**Restaurar o estado inicial:** botão "Restaurar dados iniciais" no painel. Apaga banco, cenário e sessão salvos e recarrega com os dados de seed.

## Deploy

Vercel, como projeto Vite (build `npm run build`, saída `dist`). O `vercel.json` faz qualquer rota abrir o app (acesso direto e refresh) e serve o worker do MSW sem cache. Não precisa configurar variável de ambiente.
