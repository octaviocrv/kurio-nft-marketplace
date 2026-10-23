# Fase 1 — Mobile visual

**Objetivo:** todas as telas mobile navegáveis e fiéis ao Figma (390px), com dados vindos das fixtures. Sem API ainda.

**Regra da fase:** componentes recebem dados **só por props**. Quem importa fixture é o arquivo da **rota**, temporariamente (na fase 2 essa linha vira um hook).

Referência visual: `docs/figma/mobile-*.png` e `docs/figma/tokens.md`.

## Tarefas

### 1.1 Setup do projeto
- [x] Vite + React + TypeScript na raiz, alias `@/` → `src/`
- [x] Tailwind + shadcn/ui inicializados
- [x] TanStack Router (file-based, plugin do Vite) com rota `/` funcionando
- [x] ESLint + scripts: `dev`, `build`, `preview`, `typecheck`, `lint`
- [x] `.gitattributes` com `* text=auto eol=lf` (padroniza quebra de linha no Windows)

### 1.2 Tema
- [x] Tokens de `tokens.md` como variáveis CSS, ligados ao tema do shadcn
- [x] Roboto Mono local via `@fontsource/roboto-mono` (400, 500, 700)
- [x] Componentes shadcn base adaptados: Button, Input, Label, Badge, Tabs, Dialog, Sheet, Select, RadioGroup, Skeleton

### 1.3 Contratos e utilitários
- [x] Tipos + schemas zod em `src/api`: Nft, Edition, User, Session, Wallet, Cart, CartItem, Quote, Coupon, Order
- [x] `src/lib/eth.ts`: parse/format/soma/multiplicação com `bigint`

### 1.4 Fixtures
- [ ] ~40 NFTs combinando coleções, redes, preços e edições (variedade para filtros e paginação)
- [ ] 2 usuários com carteiras (principal e secundária)
- [ ] Cupons: válido, inválido, expirado
- [ ] IDs e token IDs consistentes (corrigir os erros do Figma)

### 1.5 Imagens
- [ ] Exportar as imagens dos NFTs do Figma para `public/images/` (em WebP, tamanhos adequados)

### 1.6 Layout mobile
- [ ] `AppShell` com tab bar inferior: início, favoritos, (botão central desabilitado), carrinho, perfil
- [ ] Header de página com botão voltar + título

### 1.7 Telas
- [ ] Início `/` — busca, hero, abas (Todos / Novos / Em alta), grid de `NftCard`, botão de filtros (abre Sheet)
- [ ] Detalhe `/nft/$nftId` — imagem, info, `EditionPicker`, `QuantityStepper`, favoritar, barra de compra
- [ ] Login `/login` e Cadastro `/cadastro`
- [ ] Carrinho `/carrinho` — itens, cupom, `SummaryRow`s, total
- [ ] Pagamento `/checkout` — carteiras cadastradas, provedor, total
- [ ] Revisão (etapa do `/checkout`) — sem frame, seguir o padrão
- [ ] Confirmação `/pedido/$orderId` — sem frame mobile, adaptar o modal desktop
- [ ] Perfil `/conta/perfil` e Carteiras `/conta/carteiras` — sem frame mobile, adaptar o desktop
- [ ] Favoritos `/favoritos` — reaproveita o grid do início
- [ ] 404 para rota inexistente

## Critério de pronto

- Todas as telas acima abrem em 390px parecidas com o Figma e navegam entre si.
- Nenhum componente importa de `src/mocks` (só arquivos de rota).
- `npm run typecheck`, `lint` e `build` passam.

## Homologação

Problemas reportados pelo Octavio (ver `docs/projeto/homologacao.md`).

| Tarefa | Problema reportado | Status |
| --- | --- | --- |

## Registro

| Data | O que foi feito | Commit |
| --- | --- | --- |
| 2026-10-23 | 1.1 Setup: Vite 8 + React 19 + TS 6, alias `@/`, Tailwind v4, shadcn (init manual, compatível com o CLI), TanStack Router file-based, ESLint, `.gitattributes` | Configuração do projeto base |
| 2026-10-23 | 1.2 Tema: tokens do Figma em `--kurio-*` ligados ao shadcn, tema escuro fixo, Roboto Mono local (latin), 10 componentes shadcn adaptados, vitrine temporária na `/` | Implementação do tema e componentes base |
| 2026-10-23 | 1.3 Contratos: schemas zod + tipos por recurso em `src/api` (pedido como união por status, cotação como fonte dos valores, recibo como snapshot) e `src/lib/eth.ts` com bigint | Implementação dos contratos e utilitário de ETH |
