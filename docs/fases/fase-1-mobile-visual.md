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
- [x] ~40 NFTs combinando coleções, redes, preços e edições (variedade para filtros e paginação)
- [x] 2 usuários com carteiras (principal e secundária)
- [x] Cupons: válido, inválido, expirado
- [x] IDs e token IDs consistentes (corrigir os erros do Figma)

### 1.5 Imagens
- [x] Exportar as imagens dos NFTs do Figma para `public/images/` (em WebP, tamanhos adequados)

### 1.6 Layout mobile
- [x] `AppShell` com tab bar inferior: início, favoritos, (botão central desabilitado), carrinho, perfil
- [x] Header de página com botão voltar + título

### 1.7 Telas
- [x] Início `/` — busca, hero, abas (Todos / Novos / Em alta), grid de `NftCard`, botão de filtros (abre Sheet)
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
| 2026-10-23 | 1.4 Fixtures: 40 NFTs (4 coleções, 9 categorias, 3 redes, casos de esgotado/estoque baixo/1-1/promoção), 2 usuários com senha em hash e carteiras, cupons válido/expirado; `Nft.image` → `images[]` (galeria) | Criação das fixtures do catálogo, usuários e cupons |
| 2026-10-23 | 1.5 Imagens: 4 artes originais do Figma em WebP (máx. 800px), 3 vistas por arte para a galeria (capa, rosto, detalhe), 476KB no total | Criação das imagens dos NFTs |
| 2026-10-23 | 1.6 Layout mobile: rota de layout `_tabs` com AppShell + TabBar (botão central desabilitado), PageHeader com voltar seguro (fallback sem histórico), placeholders de favoritos/carrinho/perfil | Implementação do layout mobile e da navegação |
| 2026-10-23 | 1.7 Início: busca + gaveta de filtros, hero de destaques (carrossel com scroll-snap), abas com sublinhado animado, grid de `NftCard` alinhado; tab bar com recorte real (máscara CSS) | Criação da página inicial e do catálogo mobile |
