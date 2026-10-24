# Kurio — NFT Marketplace

Desafio técnico de frontend da Jungle Gaming: marketplace de NFTs em React + TypeScript com descoberta, compra e conta do colecionador, nas versões mobile, tablet e desktop. API REST, autenticação, carteiras, pagamento e tempo real são simulados no navegador (MSW + Socket.IO), sem backend.

Stack: Vite · React · TypeScript · TanStack Router · TanStack Query · Axios · Tailwind CSS · shadcn/ui · MSW (`@mswjs/socket.io-binding`) · socket.io-client · Playwright · Lighthouse. Complementares: zod, react-hook-form, lucide-react, `@fontsource/roboto-mono`.

Arquitetura, contratos, política de sessão, cache, tempo real, limitações e desvios do Figma: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Setup

Requisitos: Node 22+ e npm.

```bash
npm ci
npm run dev        # http://localhost:5173, com a API simulada ligada
```

Para os testes E2E e o Lighthouse, instale uma vez o Chromium do Playwright:

```bash
npx playwright install chromium
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Desenvolvimento com mocks |
| `npm run build` | Verificação de tipos + build de produção (mocks incluídos) |
| `npm run preview` | Serve o build de produção (`http://localhost:4173`) |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Fluxos E2E com Playwright (Chromium, mobile 390 e desktop 1440). Não precisa de Docker |
| `npm run test:e2e:report` | Abre o relatório HTML da última execução |
| `npm run test:visual` | Regressão visual (início, detalhe, carrinho e pagamento, mobile e desktop) comparada com as baselines. Roda no Docker oficial do Playwright |
| `npm run test:visual:update` | Regrava as baselines (`tests/e2e/__screenshots__`) quando uma mudança visual é intencional |
| `npm run lighthouse` | Build + auditoria Lighthouse (início e detalhe, mobile e desktop, 3 medições cada) com relatórios em `lighthouse/reports/` |

## Variáveis de ambiente

Nenhuma é obrigatória. Referência em `.env.example`.

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | ligado | `false` desliga o MSW (o app passa a chamar um `/api` real). Sem backend na entrega, o build de demonstração usa os mocks. |
| `CHROME_PATH` | Chromium do Playwright | Só para `npm run lighthouse`: outro Chrome/Chromium para a auditoria. |

## Credenciais de demonstração

| Usuário | Senha | Estado inicial |
| --- | --- | --- |
| `nova@kurio.dev` | `kurio123` | Carteira principal (conectada) e secundária |
| `theo@kurio.dev` | `kurio123` | Somente carteira principal |

Cupons: `KURIO10` e `LANCAMENTO` são válidos; `VERAO25` está expirado; qualquer outro código é inválido.

Senhas não ficam em texto puro: o banco simulado guarda só `SHA-256(salt + senha)`.

## API simulada, cenários e reset

O MSW intercepta as chamadas REST (`/api/*`) e a conexão Socket.IO. O estado (catálogo, favoritos, carrinho, perfil, carteiras, pedidos, sessões) fica num banco em memória salvo no `localStorage`, então sobrevive ao refresh.

**Escolher um cenário:** pela URL (`?scenario=slow`, em qualquer rota) ou pelo painel de simulação (botão com ícone de frasco na borda esquerda). O cenário fica salvo até ser trocado; o parâmetro sai da URL depois de lido.

| Cenário | Comportamento |
| --- | --- |
| `default` | API respondendo normalmente (latência de 150 ms) |
| `slow` | Toda requisição demora 2,5 s (skeletons com shimmer) |
| `flaky` | Latência variável em ciclo fixo (1,2 s, 150 ms, 700 ms, 300 ms): respostas chegam fora de ordem, sempre do mesmo jeito |
| `offline` | Nenhuma requisição chega e o socket cai até o cenário mudar |
| `error-5xx` | Toda requisição responde 503 |
| `empty` | O catálogo responde sem nenhum NFT |
| `session-expired` | A sessão responde como expirada: o app limpa os dados privados e volta ao login preservando a rota |
| `favorite-error` | Favoritar ou desfavoritar falha depois da atualização otimista (rollback visível) |
| `payment-rejected` | O pedido é criado e termina recusado; o carrinho é preservado |
| `order-timeout` | O pedido é criado, mas a resposta passa do limite de 8 s do cliente; "Recuperar pedido" reenvia a mesma chave e recupera o mesmo pedido |
| `wallet-rejected` | A carteira recusa a conexão no pagamento e continua desconectada |

**Restaurar o estado inicial:** botão "Restaurar dados iniciais" no painel. Apaga banco, cenário, sessão e cadastros criados e recarrega com os dados de seed.

**Eventos em tempo real sob demanda:** com o app aberto, o console do navegador expõe os mesmos controles usados nos testes (`window.__kurioMock`). Eles mudam o dado no mock, que responde diferente no REST e emite o evento pelo Socket.IO:

```js
// preço muda (nft.updated em todas as abas conectadas)
window.__kurioMock.updateNft('amber-ape-117', { price: '0.99' })
// derruba as conexões Socket.IO (o cliente reconecta e reconcilia pelo REST)
window.__kurioMock.disconnectAll()
```

## Como reproduzir os fluxos de falha

| Fluxo | Como |
| --- | --- |
| Skeletons e nova tentativa | `?scenario=slow` (carregamento) ou `?scenario=error-5xx` e depois voltar ao padrão no painel e clicar em "Tentar novamente" |
| Respostas fora de ordem | `?scenario=flaky` e trocar de página/filtro rápido: só a última consulta aparece |
| Sem conexão | `?scenario=offline` em qualquer tela; voltar ao padrão recupera sozinho |
| Catálogo vazio | `?scenario=empty` |
| Recurso inexistente | `/nft/nao-existe` (NFT não encontrado) e `/rota-qualquer` (página não encontrada) |
| Sessão expirada no checkout | Entrar, ir ao pagamento e aplicar "Sessão expirada" no painel: o app limpa a sessão e abre o login com `?redirect=` do checkout. Aplicar "Padrão" no painel e entrar de novo retoma o checkout |
| Troca de usuário | Sair da conta da Nova e entrar como Theo: nenhum dado privado da Nova aparece |
| Conflito de cadastro | Criar conta com o e-mail `nova@kurio.dev` ou o usuário `novasato` |
| Cupom inválido e expirado | No carrinho, aplicar `XYZ` (inválido) e `VERAO25` (expirado) |
| Falha de favorito com rollback | `?scenario=favorite-error`, entrar e tocar no coração de um NFT |
| Preço alterado durante a compra | Com um NFT no carrinho, abrir o carrinho ou a revisão e rodar `window.__kurioMock.updateNft('<id>', { price: '0.99' })` no console: aviso, resumo atualizado e confirmação bloqueada até a nova cotação |
| Carteira recusa a conexão | `?scenario=wallet-rejected`, no pagamento desconectar e tentar conectar a carteira |
| Pagamento recusado | `?scenario=payment-rejected` e confirmar a compra |
| Timeout com recuperação do mesmo pedido | `?scenario=order-timeout` e confirmar a compra; depois do aviso, "Recuperar pedido" |
| Clique repetido | Clicar várias vezes em "Confirmar compra": um pedido só (mesma chave de idempotência) |
| Pedido pendente com queda de conexão | Confirmar a compra e, enquanto estiver pendente, rodar `window.__kurioMock.disconnectAll()` ou recarregar: a tela recupera o mesmo pedido |

## Testes

- **Fluxos (`npm run test:e2e`):** 116 testes nos projetos `mobile` (390) e `desktop` (1440), cobrindo os 12 grupos do enunciado. Cada teste abre um contexto novo do navegador, então parte do banco semeado e do cenário padrão. Latência e falhas vêm dos cenários do MSW, os eventos são disparados pelo mock e chegam pelo `socket.io-client`, e os casos de espera usam o relógio do Playwright (`page.clock`). Alguns testes só existem num viewport (ex.: gaveta de filtros no mobile, modal de login no desktop) e aparecem como pulados no outro.
- **Relatório:** `npm run test:e2e:report` abre o HTML da última execução. A execução final entregue está em `reports/playwright/index.html` (111 passando, 5 pulados de propósito). Traces são gravados só quando um teste falha (`trace: 'retain-on-failure'`).
- **Regressão visual (`npm run test:visual`):** projetos `visual-mobile` e `visual-desktop`, baselines versionadas em `tests/e2e/__screenshots__/`. Precisa do Docker: a imagem oficial do Playwright (mesma versão do pacote) garante a mesma renderização de fonte em qualquer máquina. A primeira execução baixa a imagem e instala as dependências no container (alguns minutos).

## Lighthouse

`npm run lighthouse` faz o build, sobe o `vite preview` com os mocks no cenário padrão e roda o Lighthouse três vezes por página (início e detalhe) e perfil (mobile e desktop), cada vez com um Chrome de perfil novo. A configuração fica em `lighthouse/lighthouse.config.mjs`. Os relatórios HTML/JSON de cada medição e o resumo com a mediana por categoria, LCP, CLS, TBT, versões das ferramentas, ambiente e condições ficam em `lighthouse/reports/` (veja `summary.md`). A análise dos resultados abaixo da meta está no `docs/ARCHITECTURE.md`.

## Deploy

Vercel, como projeto Vite: importar o repositório, manter o preset **Vite** (build `npm run build`, saída `dist`) e publicar. Não precisa configurar variável de ambiente nem outra versão do Node (o `package.json` pede Node 22+). O `vercel.json` faz qualquer rota abrir o app (acesso direto e refresh) e serve o worker do MSW sem cache; os mocks e o Socket.IO simulado rodam no próprio navegador.
