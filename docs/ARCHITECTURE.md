# Arquitetura — Kurio

Este documento cobre o que o enunciado pede no §12: contratos REST e eventos, política de sessão, estado do carrinho, estratégia de cache, reconciliação entre REST e Socket.IO, limitações, decisões de UX e desvios do Figma. Setup, comandos, credenciais e cenários estão no [README](../README.md).

## 1. Camadas

```
rota  →  hook da feature  →  função em src/api  →  Axios  →  (MSW intercepta)
         (TanStack Query)     (HTTP + zod)
```

- **Rotas** (`src/routes`, TanStack Router file-based) buscam os dados pelos hooks e passam por props. **Componentes** só recebem props e desenham.
- **Hooks** (`src/features/*/queries.ts`) concentram consultas, mutations, query keys e invalidação. Não sabem que o MSW existe.
- **API** (`src/api/*.ts`) tem os tipos e schemas zod do contrato (fonte única da verdade) e as funções HTTP. Toda resposta é validada com o schema; resposta fora do contrato vira `ApiError`.
- **Mocks** (`src/mocks`) são a "rede": handlers REST, servidor Socket.IO simulado, banco, cenários e painel. Nenhum arquivo fora de `src/mocks` importa de lá; os handlers validam a entrada com os mesmos schemas dos formulários.
- **Mobile e desktop compartilham hooks e regra de negócio.** Quando a marcação muda de verdade (carrinho em cards × tabela, login em tela cheia × modal), a rota escolhe o layout com `useMediaQuery` e renderiza só um, sem controles duplicados escondidos por CSS. Quando muda só o arranjo, são classes `md:`/`lg:` (mobile first, 768 e 1024 px).

```
src/api         contratos (zod) + funções HTTP + cliente Axios + socket
src/features    hooks e componentes por feature (catalog, nft, cart, checkout, order, auth, account, favorite, realtime)
src/components  ui/ (shadcn adaptado ao Figma) e layout/ (header, footer, tab bar, modais de rota)
src/routes      telas (TanStack Router)
src/mocks       MSW: handlers, socket, db, cenários, controles e painel
src/lib         utilitários puros (ETH em bigint, datas, media query, foco)
```

## 2. Contratos REST

Base `/api`. Corpo JSON. Valores em ETH trafegam como **string decimal** (`"1.19"`) e são calculados em `bigint` (wei, 18 casas, `src/lib/eth.ts`); quantidades são inteiras.

Cabeçalhos: `Authorization: Bearer <token>` com sessão; `X-Guest-Id: <uuid>` sempre (dono do carrinho do visitante); `Idempotency-Key` em `POST /orders`.

| Recurso | Operação | Entrada | Resposta |
| --- | --- | --- | --- |
| Sessão | `POST /auth/register` | `{ username, email, password, confirmPassword }` | `Session` (já autenticado) · 422 · 409 por campo |
| | `POST /auth/login` | `{ email, password }` | `Session` · 401 `invalid_credentials` |
| | `GET /session` | — | `Session` (`{ token, expiresAt, user }`) · 401 |
| | `POST /auth/logout` | — | 204 (invalida o token) |
| NFTs | `GET /nfts` | `search, categories, networks, minPrice, maxPrice, sort, page, pageSize` | `{ items: Nft[], page, pageSize, total }` · 422 filtros inválidos |
| | `GET /nfts/:id` | — | `Nft` · 404 |
| Favoritos | `GET /favorites` | — | `{ items: Nft[] }` da sessão · 401 |
| | `POST /favorites` | `{ nftId }` | lista atualizada · 401 · 404 |
| | `DELETE /favorites/:nftId` | — | lista atualizada · 401 · 404 |
| Carrinho | `GET /cart/items` | — | `{ items: CartItem[], couponCode }` do usuário ou do visitante |
| | `POST /cart/items` | `{ nftId, editionId, quantity }` | carrinho · 404 · 409 acima do estoque |
| | `PATCH /cart/items/:id` | `{ quantity }` | carrinho · 404 · 409 acima do estoque |
| | `DELETE /cart/items/:id` | — | carrinho · 404 |
| Cotação | `POST /quote` | `{ couponCode?: string \| null }` | `Quote { id, subtotal, discount, networkFee, total, coupon, issues[], expiresAt }` · 422 cupom inválido/expirado no campo |
| Pedidos | `POST /orders` | `{ buyerName, buyerEmail, walletId, walletProvider, network, quoteId }` + `Idempotency-Key` | `Order` (`pending`) · 409 cotação/estoque/carteira desconectada/chave com outro payload · 422 |
| | `GET /orders/:id` | — | `Order` (`pending`, `confirmed` com `transactionHash`, `rejected` com `rejectionReason`) · 404 (também para pedido de outro usuário) |
| Perfil | `GET /profile` · `PATCH /profile` | `{ displayName, username, email, ensName, avatarUrl }` | `User` · 422 · 409 por campo |
| | `POST /profile/password` | `{ currentPassword, newPassword, confirmPassword }` | 204 · 422 (senha atual errada é 422 no campo, não 401) |
| Carteiras | `GET /wallets` | — | `{ items: Wallet[] }` (principal primeiro) |
| | `POST /wallets` · `PATCH /wallets/:id` | `{ slot?, nickname, address, ensName?, network, provider }` | `Wallet` · 422 · 409 slot ocupado/endereço repetido/ENS de outro usuário |
| | `POST /wallets/:id/connect` · `/disconnect` | — | `Wallet` com `connected` · 403 no cenário `wallet-rejected` |

**Erros:** todo erro tem o corpo `{ code, message, fieldErrors? }` e sai do Axios como `ApiError { status, code, message, fieldErrors? }`. Códigos: `validation_error` (422), `invalid_credentials` (401 do login), `unauthorized` (401, sessão inválida ou expirada), `forbidden` (403), `not_found` (404), `conflict` (409), `server_error` (5xx), `network_error` e `timeout` (sem resposta, `status: 0`). Cancelamento do TanStack Query não vira `ApiError`.

## 3. Eventos Socket.IO

| Evento | Quando | Destino | `data` |
| --- | --- | --- | --- |
| `nft.updated` | preço ou estoque de um NFT mudou no servidor | todos os clientes | `{ price, previousPrice, editions }` |
| `order.updated` | o pedido mudou de status (pendente → confirmado/recusado) | só o dono do pedido | `Order` completo |

Envelope comum, validado com zod antes de aplicar:

```ts
{ eventId: 'nft:amber-ape-117:v4', resource: 'nft' | 'order', id: string, version: number, data }
```

- `eventId` deriva do recurso e da versão: a mesma mudança reenviada tem o mesmo id.
- O cliente descarta `eventId` já visto e `version` menor ou igual à última vista, e ainda compara com a versão que está no cache: um evento atrasado nunca sobrescreve um dado mais novo vindo do REST.
- O mock altera o dado, passa a responder diferente no REST e emite o evento. A interface nunca simula evento no cache.

**Transporte e limitações (`@mswjs/socket.io-binding`):** só `websocket` (o MSW não intercepta o long-polling HTTP que o Socket.IO tenta primeiro). Limitações resolvidas no mock: o binding não envia o ping do Engine.IO (o mock envia a cada 25 s, senão o cliente cairia a cada ~30 s); o MSW tira `/socket.io/` da URL antes de comparar, então o link é a origem, e o WebSocket do HMR do Vite, que cai no mesmo link, é repassado ao servidor real; não há salas, namespaces nem leitura do `auth` do handshake, então o isolamento por usuário é feito no mock, que lê o token do pacote CONNECT e confere a sessão (e a expiração) a cada envio. O app só carrega depois do MSW iniciar, porque o `socket.io-client` guarda a referência do `WebSocket` ao ser importado.

## 4. Política de sessão

- Token opaco em `localStorage` (`kurio:session-token`), enviado como Bearer pelo interceptor do Axios. O mock guarda só token, `userId` e expiração de 8 h; `GET /session` devolve o usuário público, nunca salt/hash.
- Sessão recuperada no refresh por `GET /session`. Rotas privadas (checkout, pedido, favoritos, `/conta/*`) checam a sessão no `beforeLoad`; sem sessão vão para `/login?redirect=<caminho completo>` com `replace`. O `redirect` só aceita caminho interno (sem open redirect).
- Qualquer 401 `unauthorized` (navegação ou checkout) remove o token, limpa todo o Query Client, desconecta o socket e manda ao login com o contexto atual; depois de entrar, a pessoa volta exatamente para onde estava (inclusive `?etapa=revisao`).
- Login, cadastro e logout limpam o cache antes de ativar a nova identidade; o socket reconecta com o token novo (para receber os eventos privados) ou desconecta no logout. Query keys de dados privados incluem o `userId`.

## 5. Estado do carrinho

- O carrinho mora no servidor simulado, também para o visitante (identificado pelo `X-Guest-Id`, um UUID estável em `kurio:guest-id`). Com Bearer válido, o usuário sempre prevalece; token inválido responde 401 em vez de cair no carrinho anônimo.
- Query key com dono explícito: `['cart', 'user:<id>' | 'guest:<id>']`. Com token salvo, a tela espera a sessão responder antes de escolher o dono (sem piscar o carrinho do visitante).
- No login/cadastro o servidor faz o merge: mesma edição soma quantidades até o estoque atual, itens diferentes são preservados, o cupom do visitante só entra se o usuário não tiver um; depois o carrinho visitante é apagado.
- Os totais nunca são calculados na tela: vêm de `POST /quote`, calculados em `bigint` no handler. O cupom pertence ao carrinho (sobrevive ao refresh). Enquanto uma nova cotação não chega, os valores anteriores ficam visíveis e o avanço fica bloqueado; sem cotação válida ou com `issues`, não dá para seguir.
- Pedido confirmado remove do carrinho só as quantidades compradas; recusa preserva tudo.

## 6. Estratégia de cache

- `staleTime` de 30 s (navegar não refaz a mesma consulta); sessão com `staleTime` 0. `refetchOnWindowFocus` no padrão.
- Retry só em falha transitória (rede, timeout, 5xx), até 2 vezes com backoff; 4xx nunca repete. Mutations não repetem sozinhas; o pedido tem recuperação própria com a mesma chave de idempotência.
- Query keys por feature incluem todos os parâmetros (cada combinação de busca/filtro/página tem seu cache) e o `AbortSignal` do Query vai até o Axios: troca rápida cancela a consulta anterior, e uma resposta atrasada cai em outra chave, nunca na tela atual.
- Catálogo com `keepPreviousData` (lista anterior esmaecida em vez de skeleton a cada filtro); detalhe abre na hora com o NFT que já está em alguma página em cache e atualiza por trás.
- Favoritos com atualização otimista e rollback do snapshot em caso de erro (aviso acessível), reconciliados com a API ao terminar.
- Mutations atualizam o cache com a resposta (carrinho, perfil, carteiras) e invalidam o que depende delas (cotação, sessão, listas).

## 7. Reconciliação REST × Socket.IO

- O REST é a fonte da verdade; o evento só acelera. `nft.updated` atualiza detalhe e listas em cache e, se o NFT está no carrinho, busca carrinho e cotação de novo e mostra um aviso (`role="status"`) com o que mudou.
- No checkout, a confirmação fica bloqueada enquanto carrinho ou cotação recarregam. Se mesmo assim um valor velho for enviado, `POST /orders` recalcula preço, estoque, cupom e taxa e responde 409; a tela busca a nova cotação e exige outro clique explícito.
- Ao perder o socket, a próxima conexão invalida todas as queries ativas: a tela reconcilia pelo REST sem depender dos eventos perdidos. Desconexão causada pelo próprio app (logout) não dispara isso.
- Pedido pendente: polling de `GET /orders/:id` a cada 5 s com socket conectado (rede de segurança) e a cada 0,5 s sem ele, só enquanto estiver pendente. Refresh ou reconexão recuperam o mesmo pedido. Confirmado e recusado são terminais.
- **Idempotência:** a chave é gerada uma vez por tentativa e guardada (com o payload enviado) por usuário até o pedido chegar a um estado final. Mesma chave + mesmo payload = mesmo pedido; payload diferente = 409. Sem resposta (timeout de 8 s, rede), "Recuperar pedido" reenvia o payload salvo com a mesma chave.

## 8. Mocks

- Banco em memória semeado pelas fixtures (cópia profunda) e salvo no `localStorage` a cada escrita; formato versionado (banco antigo volta ao seed). 40 NFTs em 9 coleções e 3 redes (4 páginas de 12), 2 usuários, carteiras e cupons.
- Cenários determinísticos (`?scenario=` ou painel), um handler de rede antes dos recursos para lentidão/instabilidade/offline/5xx e regras por recurso para os demais. Reset apaga todas as chaves `kurio:*` e recarrega com o seed.
- `window.__kurioMock` (`updateNft`, `setScenario`, `resetMocks`, `replayEvent`, `disconnectAll`) existe só com os mocks ligados e é o que os testes e o painel usam: muda o dado no mock, que responde no REST e emite no socket.

## 9. Acessibilidade

Navegação por teclado com "Pular para o conteúdo", foco visível (anel nos componentes e contorno padrão como rede de segurança), diálogos e gavetas do Radix com foco preso e devolvido a quem abriu (inclusive os abertos por rota ou estado), labels e erros associados por `aria-describedby` com foco no primeiro erro, `role="status"`/`role="alert"` para mutations, cotação e eventos em tempo real, estados que não dependem só de cor (sublinhado, ícone, texto, `aria-pressed`/`aria-current`), alvos de toque de 24 px, skeletons que respeitam `prefers-reduced-motion` e nenhuma rolagem horizontal de 320 a 1440 px (coberto por `tests/e2e/a11y.spec.ts`). Contraste: Lighthouse Accessibility 100 nas quatro auditorias.

## 10. Performance (Lighthouse)

Mediana de 3 medições, build de produção com os mocks no cenário padrão (detalhes, versões e ambiente em `lighthouse/reports/summary.md`):

| Perfil | Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | início | 70 | 100 | 100 | 100 | 5,15 s | 0,021 | 443 ms |
| mobile | detalhe | 73 | 100 | 100 | 100 | 4,89 s | 0,000 | 389 ms |
| desktop | início | 96 | 100 | 100 | 100 | 1,40 s | 0,000 | 19 ms |
| desktop | detalhe | 97 | 100 | 100 | 100 | 1,30 s | 0,032 | 3 ms |

Ambiente da rodada entregue: Linux, Xeon 2,1 GHz × 2 vCPUs, 8 GB, Chrome headless 153, Lighthouse 13.5.0. O throttling do Lighthouse é simulado sobre a CPU real, então a nota varia com a máquina: numa estação Windows mais rápida, a mesma base de código (com o preload descrito abaixo, depois removido) mediu 77 no mobile e 98 no desktop.

**Abaixo da meta: Performance mobile.** A causa dominante é a API simulada rodar no navegador. Antes do primeiro dado, o chunk do MSW com banco, handlers e Socket.IO simulado (~173 KB gzip) precisa carregar, executar e registrar o service worker; só depois a rota consulta a API simulada e descobre a imagem do LCP. No perfil mobile (4G lento e CPU 4x mais lenta) essa cadeia mantém o LCP perto de 5 s e concentra o TBT. Com backend real, esse chunk e a sua inicialização no cliente não existiriam. O enunciado exige a auditoria com os mocks e as funcionalidades reais, então eles não foram desligados nem simplificados para a medição.

O que foi otimizado: o bundle da interface baixa e executa em paralelo à inicialização do MSW, e o `socket.io-client` é importado sob demanda só depois de o WebSocket estar interceptado (a conexão continua 100% pelo cliente Socket.IO); o painel de cenários carrega quando o navegador fica ocioso; code splitting por rota; fonte local só com o subset latin e 3 pesos; WebP com dimensões declaradas; primeira linha do grid sem `lazy` e a primeira imagem com prioridade alta; skeletons com as mesmas medidas (CLS ≤ 0,032); marca já no HTML enquanto o MSW inicia. Um `preload` fixo da imagem do primeiro NFT no `index.html` foi testado e descartado: ela vem da API, então antecipá-la no HTML só serviria às duas páginas auditadas (e o LCP não melhorou). A meta mobile de 90 não foi alcançada sem violar as condições do enunciado.

## 11. Limitações

- Não há backend: tudo (inclusive sessão, pagamento e blockchain) é simulado no navegador; dados ficam no `localStorage` de cada navegador e não são compartilhados entre dispositivos.
- Senhas no mock usam SHA-256 com salt (suficiente para não guardar texto puro; produção usaria Argon2/bcrypt).
- Endereços e ENS são validados só no formato (sem checksum EIP-55); hashes de transação e links de explorador são simulados.
- O Socket.IO simulado usa só o transporte `websocket` e não tem salas nem namespaces (ver §3).
- Avatar é guardado como data URL (até 300 KB) no banco simulado.

## 12. Decisões de UX

- Busca roda ao enviar (cada busca é um passo do histórico); filtros só aplicam ao confirmar (uma consulta por combinação); busca e filtro novos voltam à página 1; tudo na URL (`?busca=&categoria=&rede=&min=&max=&ordem=&pagina=`) e restaurado pelo voltar/avançar.
- Abas do Início ("Todos os NFTs", "Novos lançamentos", "Em alta") são atalhos de ordenação (botões com `aria-pressed`).
- Checkout em duas etapas (pagamento → revisão) com confirmação explícita; mudança de preço/estoque exige nova confirmação.
- Login, cadastro e resultado do pedido são rotas reais; a partir de 768 px aparecem como modal (fechar volta à página de origem); no celular, tela cheia.
- Perfil e senha no mesmo formulário (como no Figma), salvos em duas chamadas; se a senha falhar, o perfil já salvo é informado e os campos de senha continuam preenchidos.
- Ações fora do escopo (social login, esqueceu a senha, newsletter, blog, Criadores/Aprenda, Atividade/Ofertas/Downloads/Suporte, redes sociais, botão central da tab bar) aparecem desabilitadas com "indisponível na demo", nunca simulando sucesso.
- O hero do Início troca de slide a cada 6 s. Pausa enquanto o ponteiro está em cima ou o foco está dentro, e não roda para quem pediu menos animação no sistema (`prefers-reduced-motion`). Os projetos de regressão visual rodam com `reducedMotion: 'reduce'`, então a captura nunca pega o carrossel no meio da troca.
- O rodapé institucional (destaques, newsletter, links da KURIO) não aparece em `/conta/*` nem em `/favoritos`: é porta de entrada para quem navega no site, não para quem já está dentro da conta. Em troca, essas telas ganham o "voltar" no mobile, onde a tab bar leva às telas principais mas não desfaz o caminho de onde se chegou.
- Na barra de compra do detalhe, o total (preço × quantidade) só aparece a partir de 2 unidades no tablet/desktop: com 1 unidade ele repetiria o preço que está logo acima. No celular aparece sempre, porque a barra é fixa no rodapé e o preço do topo já saiu da tela.

## 13. Desvios do Figma

- **Pagamento:** segue o frame mobile (carteiras cadastradas + provedor + rede + dados do colecionador); no desktop, formulário à esquerda e "Seus NFTs" à direita. O formulário desktop do Figma repetia a tela de Carteiras.
- **Revisão do pedido** não existe no Figma: criada no mesmo padrão visual.
- **Perfil e Carteiras:** cada formulário fica só com os campos do seu contrato (no Figma os dois repetem campos um do outro); "Código de indicação" ficou de fora (sem regra no enunciado).
- **Header logado**, perfil/carteiras/confirmação no mobile, estados vazio/erro/skeleton e tablet: criados no padrão visual.
- **Modais de login/cadastro** abrem sobre o próprio site (header e rodapé), não sobre o Início.
- **Confirmação do pedido** usa o modal também para pendente e recusado. A ilustração "Thank you" exportada do Figma veio com os nomes das camadas no lugar do desenho (`<path d="Vector" />`), ou seja, não renderizava nada: foi trocada por um selo de confirmação, no mesmo padrão dos status pendente e recusado. Os dados da transação ficam em quatro blocos iguais (2 × 2) e o recibo mostra, por item, edição, quantidade × preço unitário e subtotal, além da linha "Subtotal dos itens" — o Figma mostrava só o valor da linha.
- **"NFT em destaque"** da sidebar: só o título e a arte, sem nome, preço nem moldura em volta (quem clica vai para o detalhe, que já mostra os dois). "Oferta limitada" fica centralizado abaixo do título e só aparece se o NFT está mesmo com desconto.
- **Sidebar de filtros:** sem as contagens por coleção/rede (a API não devolve facetas). A faixa de preço é o slider de duas pontas do Figma, em centésimos de ETH (0,02 a 12,30, os limites do catálogo): valor inválido deixa de existir, funciona por teclado (setas, PageUp/PageDown, Home/End) e uma ponta no limite não vai para a URL. Título em branco e negrito; opções recuadas em tom suave, com laranja + check quando selecionadas
- **Detalhe:** as abas mostram só dados do contrato (os textos de contrato inteligente e royalties do Figma não existem na API); avaliações mostram nota média e total, sem comentários individuais; sem a lupa de zoom.
- **Carrinho desktop:** coluna "Edições" virou "Quantidade" e a linha mostra a edição; "Resumo da carteira" virou "Resumo da compra".
- **Grid do catálogo** alinhado (o Figma mobile desloca a coluna da direita, que ficava torta com selos e nomes reais).
- **Redes sociais** do rodapé como siglas (o lucide 1.x não tem ícones de marca e os links estão desabilitados).
- **Cor de erro** (`#E5604D`) criada no tom quente da paleta; não existe no Figma.
- Números, textos de exemplo e inconsistências de dado do Figma (IDs repetidos, edição duplicada) foram tratados como placeholder e corrigidos nas fixtures.
