# Decisões técnicas e desvios do Figma

## Decisões técnicas

- **ETH sem float:** string decimal no transporte; cálculos em `bigint` (wei, 18 casas) em `src/lib/eth.ts`.
- **Edição é variante com estoque próprio:** `Nft { editions: { id, label, supply, available }[] }`. Item do carrinho = `nftId + editionId + quantity`.
- **Pedido idempotente:** chave gerada uma vez por tentativa de checkout e guardada até estado terminal. Mesma chave + mesmo payload = mesmo pedido; payload diferente = 409.
- **Eventos Socket.IO:** `{ eventId, resource, id, version, data }`. O cliente ignora `version <= versão atual` e `eventId` já visto. Na reconexão, invalida as queries ativas (REST é a verdade).
- **Isolamento por usuário:** no logout/troca de usuário, `queryClient.clear()` + desconectar o socket.
- **Tema escuro fixo:** `<html class="dark">` e variante `dark` presa à classe. Sem isso o Tailwind v4 usa o tema do sistema operacional e os ajustes `dark:` do shadcn apareceriam só pra quem usa o SO no modo escuro.
- **Tokens em duas camadas** (`src/index.css`): `--kurio-*` com os valores do Figma (único lugar com hex) → variáveis do shadcn apontando pra eles. Componentes só usam os nomes do shadcn + `highlight` e `border-soft`.
- **Fonte:** `@fontsource/roboto-mono` só com o subset `latin` (cobre o português) e os pesos 400/500/700.
- **Erros da API:** todo erro sai do Axios como `ApiError { status, code, message, fieldErrors? }` (`src/api/error.ts`). O `code` é um enum do contrato; `status: 0` = sem resposta (`network_error` ou `timeout`). Cancelamento do Query não vira `ApiError` (o Query precisa reconhecê-lo). Login com senha errada é `invalid_credentials`, não `unauthorized`, para não disparar o fluxo de sessão expirada.
- **401:** o interceptor chama um handler registrado por `setUnauthorizedHandler` (o cliente HTTP não conhece router nem cache; quem registra é a camada de sessão).
- **Timeout do Axios: 8s.** Sem limite, um servidor travado prende o checkout; o cenário `order-timeout` depende disso.
- **Cache e retry (`src/lib/queryClient.ts`):** `staleTime` 30s (navegar não refaz a mesma consulta; socket e mutations invalidam o que mudou). Retry só em falha transitória (rede, timeout, 5xx), até 2 vezes com backoff; 4xx nunca repete. Mutations não repetem sozinhas (POST repetido duplica operação); o pedido tem retry próprio com chave de idempotência. `refetchOnWindowFocus` fica no padrão (ligado).
- **Router + Query:** o `queryClient` vai no contexto do router (rotas privadas checam a sessão no `beforeLoad`) e `defaultPreloadStaleTime: 0` deixa o cache só com o Query.
- **Mocks ligados por padrão** (`VITE_ENABLE_MOCKS !== 'false'`): a entrega não tem backend real, então o build de demonstração (Vercel) funciona sem configurar variável. O app só renderiza depois do worker pronto, e o MSW vem por import dinâmico (chunk separado).
- **MSW fixado na v2** (`^2.15`): a v3 já saiu, mas o `@mswjs/socket.io-binding` (indicado no enunciado) só aceita `msw ^2.10`.
- **`@hookform/resolvers` na v5:** a v6 tem conflito de peer dependency no npm; a v5 já suporta zod 4.
- **Playwright fixado em versão exata** (`1.63.0`): a imagem Docker das baselines de regressão visual precisa ter a mesma versão do pacote.
- **Cenários MSW:** selecionados por `?scenario=` ou pelo painel, persistidos em localStorage. O parâmetro sai da URL assim que é lido (senão venceria o painel e o reset no próximo reload). Cenários de rede (`slow`, `flaky`, `offline`, `error-5xx`) valem para toda chamada `/api` num handler único que roda antes dos recursos; os de um recurso (`empty`, `session-expired`, `payment-rejected`, `order-timeout`, `price-change`) entram com o handler dele. Todos determinísticos: o `flaky` usa um ciclo fixo de latências, não aleatório.
- **Banco do mock (`src/mocks/db.ts`):** um objeto em memória semeado pelas fixtures (cópia profunda: o seed nunca muda) e salvo no localStorage a cada escrita. Tem um número de formato: banco salvo num formato antigo é descartado e volta o seed. Reset = apagar todas as chaves `kurio:*` e recarregar.
- **Convenção de storage:** toda chave do app e dos mocks começa com `kurio:` (é o que permite o reset limpar tudo, inclusive a sessão).
- **Controles do mock para testes (`window.__kurioMock`):** `updateNft`, `setScenario`, `resetMocks`, `replayEvent`, `disconnectAll`. Mudam o dado NO MOCK, que responde no REST e emite pelo Socket.IO. Existe só com os mocks ligados; o painel usa as mesmas funções.
- **Painel de cenários:** montado numa raiz React separada pelo `src/mocks/browser.ts` (o app não sabe que ele existe). Botão discreto na borda esquerda, destacado quando o cenário não é o padrão.
- **App carregado só depois do MSW (`main.tsx` → `import('./App')`):** o `socket.io-client` guarda a referência do `WebSocket` quando o módulo é carregado. Se o app carregasse junto com o `main`, o Socket.IO ficaria com o `WebSocket` nativo e escaparia do mock.
- **Transporte Socket.IO (documentar no ARCHITECTURE.md):** só `websocket` (o MSW não intercepta o long-polling HTTP que o Socket.IO tenta primeiro). Limitações do `@mswjs/socket.io-binding`, resolvidas no mock: (1) não manda o ping do Engine.IO, e sem ele o cliente cai a cada ~30 s, então o mock envia o ping a cada 25 s; (2) o MSW tira o `/socket.io/` da URL antes de comparar, então o link é a raiz da origem, e o WebSocket do HMR do Vite, que cai no mesmo link, é repassado ao servidor real; (3) não tem salas nem namespaces e ignora o `auth` do handshake, então o isolamento por usuário é feito no mock (bloco 2.4/2.9).
- **Eventos:** `eventId` derivado do recurso e da versão (`nft:<id>:v<versão>`). A mesma mudança reenviada tem o mesmo id, então duplicata e evento antigo caem na mesma regra. `Order` ganhou `version` (sobe a cada mudança de status).
- **Socket conectado pelo layout raiz** (`__root.tsx`): tempo real vale para o app inteiro; desconecta ao desmontar.
- **Vercel (`vercel.json`):** rewrite de tudo para `index.html` (arquivos estáticos têm prioridade, então o `mockServiceWorker.js` é servido) e `no-cache` no worker, para não ficar preso a uma versão velha do MSW.
- **URL do catálogo legível:** o router usa `parseSearch`/`stringifySearch` próprios (texto puro via `URLSearchParams`), e cada rota converte com zod. O padrão do TanStack Router serializa em JSON e deixaria `?min=%220.5%22`. Listas vão separadas por vírgula (`?rede=ethereum,polygon`), e valor inválido na URL é descartado (`.catch`).
- **Busca ao enviar, não a cada tecla:** cada busca vira um passo do histórico e o voltar desfaz uma por vez. Filtros só mudam a lista ao "Aplicar" (uma consulta por combinação, não uma por clique). Busca e filtro novos voltam para a página 1.
- **Abas do Início = atalhos de ordenação** (Todos = padrão, Novos lançamentos = mais recentes, Em alta = mais favoritados), no mesmo parâmetro `ordem` da gaveta. Ordenar por preço deixa nenhuma aba marcada.
- **Respostas obsoletas:** a query key inclui todos os parâmetros, e o `AbortSignal` do Query vai até o Axios. Na troca rápida de página o Query cancela a requisição anterior; e mesmo que uma resposta velha chegasse, ela cairia em outra chave e nunca na tela atual (teste `catalog.spec.ts`).
- **Lista anterior na tela ao trocar filtro/página** (`keepPreviousData`, esmaecida): sem voltar ao skeleton nem deslocar o layout a cada clique. Skeleton só na primeira carga. Falha numa atualização por trás mantém a lista e mostra um aviso com "Tentar de novo".
- **Detalhe abre na hora vindo do catálogo:** `placeholderData` procura o NFT nas páginas em cache e a consulta do detalhe atualiza por trás. Acesso direto mostra o skeleton. 404 da API vira a tela "NFT não encontrado".
- **Resposta fora do contrato vira `ApiError`** (`parseResponse` em `src/api/client.ts`): toda resposta é validada com o schema zod do contrato, e o app continua lidando com um único tipo de erro.
- **Paginação com links de verdade** (`?pagina=2`) e `scrollRestoration` do router: voltar do detalhe devolve a rolagem do catálogo.
- **Página além do fim** responde vazia com o total certo, e a tela oferece ir para a primeira página.
- **Sessão:** o token opaco fica em `kurio:session-token` no `localStorage` e segue como Bearer pelo interceptor do Axios. O mock guarda apenas token, `userId` e expiração de 8 horas no banco persistido; `GET /session` devolve o usuário público, nunca salt/hash. Cadastro autentica imediatamente.
- **Rotas privadas:** checkout, pedido, favoritos e toda `/conta` verificam `GET /session` no `beforeLoad`. Sem sessão, vão para `/login?redirect=<caminho completo>`; login e cadastro usam `href` interno validado para retomar inclusive search params.
- **Expiração e troca de identidade:** qualquer `unauthorized` remove o token, limpa todo o Query Client, desconecta o Socket.IO e manda para o login com o contexto atual. Login/cadastro também limpam o cache antes de ativar a nova identidade; logout local acontece mesmo se a chamada REST falhar.
- **Senhas no mock:** fixtures e cadastros guardam somente `SHA-256(salt + senha)` em hexadecimal. SHA-256 não seria adequado para produção (seria Argon2/bcrypt), mas evita senha legível na simulação inteiramente local.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Início (catálogo) |
| `/nft/$nftId` | Detalhe do NFT |
| `/carrinho` | Carrinho |
| `/checkout` | Pagamento → revisão (etapa via search param) |
| `/pedido/$orderId` | Confirmação / estado do pedido |
| `/login?redirect=` | Login |
| `/cadastro?redirect=` | Cadastro |
| `/conta/perfil` | Perfil do colecionador |
| `/conta/carteiras` | Carteiras |
| `/favoritos` | Lista de interesse (favoritos) |

## Desvios do Figma (documentar no ARCHITECTURE.md)

- **Pagamento:** segue o frame **mobile** (carteiras cadastradas + provedor + rede), não o formulário desktop que repete a tela de Carteiras. Dados do colecionador: nome e e-mail.
- **Revisão do pedido:** não existe no Figma; criar etapa de revisão antes de confirmar, no mesmo padrão visual.
- **Login, cadastro e confirmação** são rotas reais. Desktop renderiza como modal sobre a página; mobile, como tela cheia.
- **Fora do escopo visível no Figma** (social login, esqueceu a senha, newsletter, blog, Criadores/Aprenda, Atividade/Ofertas/Downloads/Suporte, botão central da tab bar): aparece desabilitado com aviso "indisponível na demo". Nunca simula sucesso.
- **Header logado**, perfil/carteiras/confirmação mobile, vazio, erro e skeletons: criados seguindo o padrão.
- **Grid do catálogo alinhado:** o Figma mobile desloca a coluna da direita para baixo; com selos (RARO, Esgotado) e nomes reais o efeito parecia desalinhado. As duas colunas ficam alinhadas.
- **Cor de erro** (`--kurio-danger: #E5604D`) não existe no Figma: criada no tom quente da paleta para validação de formulário.
- **Formulários de Perfil e Carteiras:** no Figma os dois repetem campos um do outro (carteira pede nome de exibição, e-mail e ENS do perfil; perfil pede apelido da carteira). Cada contrato fica só com o que é dele: `User` (nome, usuário, e-mail, ENS, avatar) e `Wallet` (apelido, endereço, ENS opcional, rede, tipo). "Código de indicação" fica fora (sem regra no enunciado).
- Inconsistências de dado do Figma (token IDs diferentes, edição duplicada) são corrigidas nas fixtures.
