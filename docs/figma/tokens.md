# Figma — mapa de telas e tokens

Fonte: cópia do arquivo em `figma.com/design/MbcMcTu7rFzfepJsiXkplC` (página "Marketplace de NFTs GreenMint").
Extraído via Figma MCP para não gastar leituras de novo (o plano Starter limita as chamadas).

## Frames

| Tela | Desktop (1440) | Mobile (414) |
| --- | --- | --- |
| Início | `2:2` — Top (header + hero), Products, Promos, Blog, Footer | `14:5226` — Search Bar, Hero Banner, Tabs, Product Grid, Tab Bar |
| Detalhes do NFT | `10:244` — Top, Description, Related Products, Footer | `15:5536` — Hero, Details Sheet, Buy Bar |
| Carrinho | `11:1278` — Top, Related Products, Footer | `16:360` — Content, Payment Summary |
| Pagamento | `11:2862` — Checkout Page, Footer | `16:748` — Content |
| Confirmação | `11:4385` — Checkout Page + **Order Confirmation Modal** (578×821) | — |
| Login | `9:115` — Marketplace Page + **Sign In Modal** (500×600) | `16:1022` — página inteira |
| Cadastro | `9:1022` — Marketplace Page + **Sign Up Modal** (500×656) | `16:1228` — página inteira |
| Perfil | `9:1238` — Top | — |
| Carteiras | `9:1670` — Top | — |

Observações:
- Desktop: conteúdo em container de **1200px** centralizado (margem de 120px em 1440).
- No desktop, Login, Cadastro e Confirmação são **modais** sobre a página. No mobile, Login e Cadastro são telas cheias.
- Mobile usa **tab bar** inferior e **bottom sheet** no detalhe do NFT.
- Perfil, carteiras e confirmação no mobile não têm frame: adaptar seguindo o padrão.

## Cores

| Token | Hex | Uso provável |
| --- | --- | --- |
| `ink` | `#140D0A` | fundo da página |
| `surface-card` | `#241612` | cards |
| `surface-dark` | `#38220F` | superfícies escuras / destaque |
| `border` | `#3F2319` | bordas |
| `border-soft` | `#55321F` | bordas suaves |
| `primary` | `#D28A4C` | botões / CTA |
| `secondary` | `#B39463` | secundário |
| `text-primary` | `#F7F3EC` | texto principal |
| `foreground` | `#F5F1EB` | texto sobre primary |
| `text-secondary` | `#CFB28C` | texto secundário |
| `text-accent` | `#E89B55` | destaque / preço |
| `background-elevated` | `#FBFBFB` | fundo claro (modais / inputs?) |

## Tipografia

Família única: **Roboto Mono** (400, 500, 700). `lineHeight 100` = auto (100%); `letterSpacing 10` provavelmente é **10%**, conferir no frame.

| Estilo | Tamanho / peso / line-height |
| --- | --- |
| Display | 43 / 700 / 70 |
| Heading | 24 / 700 / auto |
| Body Large | 16–18 / 400·500·700 / 16·20·24·auto |
| Body | 14–15 / 400·500·700 / 16·20·22·24·30·40 |
| Caption | 12 / 700 / 14 · 13 / 400 / 22 |
| Tiny | 9 / 700 · 10 / 500 |
