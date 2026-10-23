# Fase 1 — Mobile visual

**Objetivo:** todas as telas mobile navegáveis e fiéis ao Figma (390px), com dados vindos das fixtures. Sem API ainda.

**Regra da fase:** componentes recebem dados **só por props**. Quem importa fixture é o arquivo da **rota**, temporariamente (na fase 2 essa linha vira um hook).

Referência visual: `docs/figma/mobile-*.png` e `docs/figma/tokens.md`.

## Tarefas

### 1.1 Setup do projeto
- [ ] Vite + React + TypeScript na raiz, alias `@/` → `src/`
- [ ] Tailwind + shadcn/ui inicializados
- [ ] TanStack Router (file-based, plugin do Vite) com rota `/` funcionando
- [ ] ESLint + scripts: `dev`, `build`, `preview`, `typecheck`, `lint`
- [ ] `.gitignore` e primeiro commit

### 1.2 Tema
- [ ] Tokens de `tokens.md` como variáveis CSS, ligados ao tema do shadcn
- [ ] Roboto Mono local via `@fontsource/roboto-mono` (400, 500, 700)
- [ ] Componentes shadcn base adaptados: Button, Input, Label, Badge, Tabs, Dialog, Sheet, Select, RadioGroup, Skeleton

### 1.3 Contratos e utilitários
- [ ] Tipos + schemas zod em `src/api`: Nft, Edition, User, Session, Wallet, Cart, CartItem, Quote, Coupon, Order
- [ ] `src/lib/eth.ts`: parse/format/soma/multiplicação com `bigint` + testes rápidos dos casos de borda

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

## Registro

| Data | O que foi feito | Commit |
| --- | --- | --- |
