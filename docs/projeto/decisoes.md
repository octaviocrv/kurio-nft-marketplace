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
- **Cenários MSW:** selecionados por `?scenario=` (persistido em localStorage), com reset que restaura o seed.

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
