# Arquitetura

## Stack

Obrigatória: Vite + React + TypeScript · TanStack Router (file-based) · TanStack Query · Axios · Tailwind · shadcn/ui · MSW (REST + `@mswjs/socket.io-binding`) · socket.io-client · Playwright · Lighthouse. Deploy na Vercel.

Complementares (aprovadas): `zod` + `react-hook-form` (formulários) · `@fontsource/roboto-mono` (fonte local) · `lucide-react` (ícones, já vem com o shadcn).

Proibido: Redux, Zustand, lib de decimais, Storybook, CSS-in-JS.

## Estrutura de pastas

```
src/
  api/              # cliente Axios + funções por recurso + tipos/schemas de contrato (fonte única da verdade)
  main.tsx          # liga o MSW (se ativo) e só então carrega o App
  App.tsx           # QueryClient + Router
  mocks/
    browser.ts      # worker do MSW, controles de teste e painel de cenários
    db.ts           # banco em memória (seed das fixtures, salvo no localStorage)
    scenarios.ts    # cenários (?scenario=)
    control.ts      # mudanças "de fora" (painel/testes): mudam o banco e emitem o evento
    fixtures/       # dados seed: NFTs, usuários, carteiras, cupons
    handlers/       # handlers REST do MSW, um arquivo por recurso (network.ts aplica o cenário de rede)
    socket/         # servidor Socket.IO simulado via @mswjs/socket.io-binding
    panel/          # painel de cenários (só com mocks ligados)
  features/         # catalog, nft, cart, checkout, auth, account — hooks de Query + componentes da feature
  components/
    ui/             # shadcn adaptado ao Figma
    layout/         # header, footer, tab bar, containers
  routes/           # TanStack Router (file-based)
  lib/              # utilitários puros (ex.: eth.ts)
public/images/      # imagens dos NFTs
tests/e2e/          # Playwright
lighthouse/         # config versionada + relatórios
docs/               # figma/, projeto/, fases/, ARCHITECTURE.md
```

## Camadas

O fluxo é sempre de cima pra baixo e nunca pula camada:

```
rota  →  componente  →  hook da feature  →  função da api  →  Axios  →  (MSW intercepta)
         (só desenha)   (Query/mutation)     (HTTP tipado)
```

- **Rota** busca os dados (via hook) e passa por props. **Componente** só recebe props e desenha.
- Componente **nunca** importa Axios, função de `src/api` nem fixture.
- Hook **não sabe** que o MSW existe. Nenhum dado fictício fora de `src/mocks`.
- Tipos e schemas zod do contrato vivem em `src/api/<recurso>.ts`. Os **mesmos schemas** validam o formulário e o handler do MSW.
- Erros: interceptor do Axios normaliza tudo em `ApiError { status, code, message, fieldErrors? }`. 401 dispara o fluxo de sessão expirada.

## Onde mora cada estado

| Estado | Onde |
| --- | --- |
| Dados do servidor (NFTs, carrinho, pedido, perfil) | TanStack Query |
| Busca, filtros, ordenação, página | search params do Router, validados com zod |
| UI local (modal, input, aba) | `useState` |
| Sessão | Query (`/session`) + token no localStorage |

- O carrinho do visitante também vive no "servidor" (MSW, por `guestId`). No login, o servidor faz o merge.
- **Query keys:** uma factory por feature. Dados privados **sempre** incluem `userId`; o carrinho usa o dono explícito (`user:<userId>` ou `guest:<guestId>`), pois também existe antes do login.

## Lógica separada do layout

Quando mobile e desktop têm estrutura diferente (carrinho em cards × tabela, filtros em drawer × sidebar), os dois layouts usam o **mesmo hook**. A regra de negócio nunca fica dentro do componente visual.

## Design system

- shadcn/ui é a base. Tokens do Figma (`docs/figma/tokens.md`) viram variáveis CSS e o shadcn herda.
- Componentes próprios só para o que se repete: `NftCard`, `EthAmount`, `QuantityStepper`, `EditionPicker`, `SummaryRow`, skeletons.
- Tailwind mobile first: classe base = mobile, `md:` = tablet, `lg:` = desktop. Validar em 390 / 768 / 1440.
- Skeleton com shimmer em tudo que depende de dado, com as mesmas dimensões do conteúdo. Respeitar `prefers-reduced-motion`.

## Convenções de nome

- Código (variáveis, funções, componentes, arquivos) em **inglês**. Textos da interface e URLs em **português**, como no Figma.
- Componentes em PascalCase (`NftCard.tsx`), hooks com `use` (`useCart.ts`), utilitários em camelCase.
