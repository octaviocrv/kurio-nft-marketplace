# Fase 2 — Funcionalidade

**Objetivo:** tudo que a fase 1 mostra passa a funcionar de verdade contra a API simulada (MSW + Socket.IO), com testes E2E e deploy. Ao final, **nenhuma rota importa de `src/mocks`**.

**Regra da fase:** a UI não sabe que o mock existe. Dados só chegam por `rota → hook (Query) → função da api → Axios → MSW` e eventos só pelo cliente Socket.IO. Mudar dado "por fora" (cenário, teste) acontece **no mock**, que responde no REST e emite o evento.

Eliminatórios do enunciado que esta fase resolve: fluxo só visual, compra confirmada sem resposta da simulação, dados vazando entre usuários, evento simulado direto na UI, sem testes E2E.

## Tarefas

Cada tarefa = um ciclo de homologação + um commit. Testes Playwright de cada fluxo entram junto com a tarefa do fluxo.

### 2.1 Infra de dados
- [x] Dependências: `msw` (v2, por causa do socket.io-binding), `axios`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers` (v5), `@playwright/test` (versão exata)
- [x] MSW no navegador, ligado por `VITE_ENABLE_MOCKS` (ativo também no build de demonstração); app só renderiza depois do worker pronto
- [x] `src/api/client.ts`: Axios + interceptor que normaliza tudo em `ApiError { status, code, message, fieldErrors? }`; 401 dispara sessão expirada
- [x] `QueryClient` com política de cache/retry documentada (sem retry em 4xx, retry curto em rede/5xx)
- [x] Playwright configurado (Chromium, mobile 390 e desktop 1440, trace nas falhas) + teste de infra

### 2.2 Banco do mock e cenários
- [x] Banco em memória semeado pelas fixtures, persistido em localStorage, com reset que restaura o seed
- [x] Cenários de rede por `?scenario=` (persistidos): `slow`, `flaky` (latência variável/fora de ordem), `offline`, `error-5xx`. Os de recurso entram com o handler: `empty` (2.3), `session-expired` (2.4), `price-change` (2.6/2.9), `payment-rejected` e `order-timeout` (2.7)
- [x] Painel de cenários discreto (só com mocks ligados) para trocar cenário e resetar — documentado no README; controles para testes em `window.__kurioMock`
- [x] Socket.IO desde já: `socket.io-client` + `@mswjs/socket.io-binding`; mudança de NFT no mock emite `nft.updated` (o `order.updated` passa a ser emitido no 2.7, quando existirem pedidos)
- [x] `vercel.json` pronto (refresh em qualquer rota, worker do MSW sem cache) e build de produção conferido localmente com mocks e socket; o deploy em si fica no 2.10

### 2.3 Catálogo e detalhe

> **OBS:** Feito pelo Codex daqui pra frente.

- [x] `GET /nfts` (busca, filtros combinados, ordenação, paginação) e `GET /nfts/:id`
- [x] Busca/filtros/ordem/página na URL (zod), mudança de filtro volta para página 1, histórico restaura
- [x] Respostas fora de ordem descartadas (AbortSignal do Query + query key por parâmetros)
- [x] Skeleton com shimmer nas mesmas dimensões, vazio, erro com "tentar de novo"; detalhe com 404 real
- [x] Testes: busca/filtros/paginação/histórico; acesso direto e NFT inexistente; skeleton com `slow`

### 2.4 Sessão e conta
- [x] `POST /auth/register` (conflito de e-mail/usuário), `POST /auth/login`, `GET /session`, `POST /auth/logout`, expiração
- [x] Formulários com react-hook-form + os **mesmos schemas zod** do handler; erros da API nos campos
- [x] Rotas privadas (`beforeLoad`) com `?redirect=`; expiração no meio da navegação/checkout preserva o contexto
- [x] Logout/troca de usuário: `queryClient.clear()` + desconectar socket
- [x] Testes: cadastro, login, expiração, logout, troca de usuário, teclado/foco/validação

### 2.5 Favoritos
- [ ] `GET/POST/DELETE /favorites` (exige login), atualização **otimista com rollback** e aviso acessível
- [ ] Teste: favoritar com falha de mutation e recuperação

### 2.6 Carrinho, cotação e cupom
- [ ] Carrinho do visitante por `guestId`; merge no login; persistência após refresh
- [ ] `GET/POST/PATCH/DELETE /cart/items` respeitando estoque por edição
- [ ] `POST /quote` (cupom válido/inválido/expirado, desconto, taxa, total) — a cotação é a fonte dos valores
- [ ] Testes: quantidades, remoção, cupom, persistência após refresh e login

### 2.7 Checkout e pedido
- [ ] Revalidação antes de confirmar: mudança de preço/estoque/cupom/taxa exige nova confirmação
- [ ] `POST /orders` com `Idempotency-Key` (mesma chave + mesmo payload = mesmo pedido; payload diferente = 409); chave guardada até estado terminal
- [ ] Pendente → confirmado/recusado; recuperação após refresh; confirmação só para pedido confirmado; remove do carrinho só o que foi comprado
- [ ] Testes: compra completa; pagamento recusado; clique repetido; timeout com recuperação do mesmo pedido

### 2.8 Perfil e carteiras
- [ ] `GET/PATCH /profile`, avatar (imagem → data URL, com limite de tamanho), `POST /profile/password`
- [ ] `GET/POST/PATCH /wallets` (principal e secundária), validação de endereço 0x e ENS
- [ ] Teste: edição de perfil, avatar, senha e carteiras com erros de validação

### 2.9 Tempo real (Socket.IO)
- [ ] Eventos `nft.updated` e `order.updated` no formato `{ eventId, resource, id, version, data }` (conexão já existe desde o 2.2)
- [ ] Ignorar duplicados (`eventId`) e antigos (`version`); aviso acessível de mudança; listeners liberados no unmount/logout
- [ ] Reconexão: invalida queries ativas (REST é a verdade); evento de sessão anterior nunca atinge outro usuário
- [ ] Cenário do enunciado: NFT no carrinho muda de preço → aviso + resumo atualizado → checkout bloqueia cotação velha
- [ ] Testes: mudança via socket no checkout; duplicados/antigos; desconexão com pedido pendente

### 2.10 Testes, regressão visual e deploy
- [ ] Playwright em Chromium, viewports mobile e desktop, estado isolado por teste, relógio controlado nos cenários de tempo
- [ ] Regressão visual de início, detalhe, carrinho e pagamento **no mobile** (baselines versionadas, dados estáveis), geradas e comparadas no Docker oficial do Playwright. As do desktop entram na fase 3, quando as telas desktop existirem
- [ ] Relatório HTML + traces de falha
- [ ] Deploy na Vercel: mocks ativos, acesso direto e refresh em qualquer rota

## Critério de pronto

- Todos os fluxos do enunciado funcionam contra o mock; nenhuma rota importa de `src/mocks`.
- Cenários selecionáveis e reset funcionando, inclusive no deploy.
- Os 12 grupos de teste do enunciado existem e passam (`npm run test:e2e`).
- `typecheck`, `lint` e `build` passam; deploy público funcionando.

## Homologação

Problemas reportados pelo Octavio (ver `docs/projeto/homologacao.md`).

| Tarefa | Problema reportado | Status |
| --- | --- | --- |

## Registro

| Data | O que foi feito | Commit |
| --- | --- | --- |
| 2026-10-23 | 2.1 Infra: MSW no navegador (ligado por padrão, chunk separado, render só após o worker), Axios com `ApiError` tipado e handler de 401, QueryClient com retry só em falha transitória, router com `queryClient` no contexto, Playwright mobile/desktop + teste de infra; plano ajustado (socket no 2.2, baselines desktop na fase 3) | Configuração da infra de dados e dos mocks |
| 2026-10-23 | 2.2 Mock: banco em memória semeado pelas fixtures e salvo no localStorage (reset restaura o seed), cenários de rede `slow`/`flaky`/`offline`/`error-5xx` por URL ou painel, painel em raiz React separada, `window.__kurioMock` para testes, Socket.IO via `@mswjs/socket.io-binding` (ping do Engine.IO e HMR do Vite tratados no mock), app carregado só depois do MSW, contrato dos eventos com `eventId` por versão, `vercel.json`, README inicial | Implementação do banco simulado, cenários e Socket.IO |
| 2026-10-23 | 2.3 Catálogo e detalhe: API simulada com busca, filtros combinados, ordenação e paginação na URL; cache no detalhe, cancelamento de consultas obsoletas, skeletons, estados de erro/vazio e testes E2E mobile/desktop | Implementação do catálogo e detalhe de NFTs |
| 2026-10-23 | 2.4 Sessão e conta: cadastro/login/logout pela API, sessão persistida, formulários com schemas compartilhados, rotas privadas com retorno ao fluxo, expiração, limpeza de cache/socket e testes E2E mobile/desktop | Implementação da sessão e autenticação |
