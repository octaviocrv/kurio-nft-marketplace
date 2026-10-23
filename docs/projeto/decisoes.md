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
- **Cor de erro** (`--kurio-danger: #E5604D`) não existe no Figma: criada no tom quente da paleta para validação de formulário.
- Inconsistências de dado do Figma (token IDs diferentes, edição duplicada) são corrigidas nas fixtures.
