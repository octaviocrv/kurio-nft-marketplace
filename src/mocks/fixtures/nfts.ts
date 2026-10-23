import type { Edition, Nft, NftCategory } from '@/api/nft'
import type { Network } from '@/api/shared'

/*
 * Catálogo seed: 40 NFTs.
 *
 * Cada linha descreve só o que varia; id, tokenId, coleção, imagens e edições são derivados
 * aqui embaixo. Assim os IDs nunca ficam inconsistentes (no Figma, "#042" aparecia como token "#0042"
 * e a edição 1/10 aparecia duplicada).
 *
 * Casos de borda propositais (para filtros, detalhe e carrinho):
 *   - esgotado por completo: Onyx Ape #518, Granite Duke #905
 *   - edição esgotada (outras disponíveis): Emerald Ape #042 (1/10), Sage Nomad #009 (1/50)
 *   - estoque baixo (limite de quantidade): Ivory Baron #088 (2 na 1/10), Golden Beat #207 (1 na 1/50)
 *   - peça única 1/1: Neon Vessel #552, Violet Nomad #314, Opal Ape #956
 *   - preço promocional (preço riscado): Neon Vessel #552, Lilac Drifter #389, Honey Pulse #649
 */

/** As 4 artes do Figma. Cada uma define coleção, atributos base e as imagens da galeria. */
const artworks = {
  'emerald-ape': { collection: 'Kurio Apes', attributes: ['Óculos', 'Jaqueta varsity'] },
  'sage-nomad': { collection: 'Kurio Nomads', attributes: ['Chapéu bucket', 'Moletom'] },
  'ivory-baron': { collection: 'Kurio Barons', attributes: ['Blazer', 'Gola alta'] },
  'golden-beat': { collection: 'Kurio Beats', attributes: ['Fones', 'Jaqueta bomber'] },
} as const
type Artwork = keyof typeof artworks

const networkLabels: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

/** Disponível por edição. Ausente = a edição não existe para esse NFT. */
interface EditionStock {
  unique?: number // 1/1
  of10?: number // 1/10
  of50?: number // 1/50
  open?: number // aberta (sem tiragem fixa; o número é o limite por compra)
}

interface NftRow {
  name: string // "Emerald Ape #042" — o número vira o tokenId
  artwork: Artwork
  category: NftCategory
  network: Network
  price: string
  previousPrice?: string
  rare?: boolean
  editions: EditionStock
  listedAt: string // AAAA-MM-DD
  favorites: number
  rating: [average: number, count: number]
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/#/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function buildEditions(nftId: string, stock: EditionStock): Edition[] {
  const editions: Edition[] = []
  if (stock.unique !== undefined) editions.push({ id: `${nftId}-1-1`, label: '1/1', supply: 1, available: stock.unique })
  if (stock.of10 !== undefined) editions.push({ id: `${nftId}-1-10`, label: '1/10', supply: 10, available: stock.of10 })
  if (stock.of50 !== undefined) editions.push({ id: `${nftId}-1-50`, label: '1/50', supply: 50, available: stock.of50 })
  if (stock.open !== undefined) editions.push({ id: `${nftId}-aberta`, label: 'Aberta', supply: null, available: stock.open })
  return editions
}

function buildNft(row: NftRow): Nft {
  const id = toSlug(row.name) // "emerald-ape-042" → /nft/emerald-ape-042
  const tokenNumber = row.name.split('#')[1] ?? ''
  const { collection, attributes } = artworks[row.artwork]
  const network = networkLabels[row.network]

  return {
    id,
    tokenId: tokenNumber.padStart(4, '0'), // "042" → "0042"
    name: row.name,
    description: `Um colecionável digital da coleção ${collection}, finalizado à mão e verificado na ${network}.`,
    images: [`/images/nfts/${row.artwork}.webp`],
    collection,
    category: row.category,
    network: row.network,
    price: row.price,
    previousPrice: row.previousPrice ?? null,
    isRare: row.rare ?? false,
    attributes: row.rare ? [...attributes, 'Raro'] : [...attributes],
    rating: { average: row.rating[0], count: row.rating[1] },
    favoriteCount: row.favorites,
    editions: buildEditions(id, row.editions),
    listedAt: `${row.listedAt}T12:00:00.000Z`,
    version: 1,
  }
}

const rows: NftRow[] = [
  // Kurio Apes
  { name: 'Emerald Ape #042', artwork: 'emerald-ape', category: 'arte-digital', network: 'ethereum', price: '1.19', rare: true, editions: { of10: 0, of50: 37, open: 20 }, listedAt: '2026-07-29', favorites: 312, rating: [4.8, 19] },
  { name: 'Amber Ape #117', artwork: 'emerald-ape', category: 'colecionaveis', network: 'polygon', price: '0.45', editions: { of50: 41, open: 50 }, listedAt: '2026-08-14', favorites: 88, rating: [4.3, 12] },
  { name: 'Copper Ape #233', artwork: 'emerald-ape', category: 'generativa', network: 'ethereum', price: '2.75', editions: { of10: 6, of50: 22 }, listedAt: '2026-05-03', favorites: 145, rating: [4.6, 27] },
  { name: 'Jade Ape #305', artwork: 'emerald-ape', category: 'arte-3d', network: 'solana', price: '0.88', editions: { of50: 30, open: 30 }, listedAt: '2026-09-21', favorites: 64, rating: [4.1, 8] },
  { name: 'Bronze Ape #412', artwork: 'emerald-ape', category: 'jogos', network: 'polygon', price: '0.12', editions: { open: 100 }, listedAt: '2026-10-02', favorites: 23, rating: [3.9, 5] },
  { name: 'Onyx Ape #518', artwork: 'emerald-ape', category: 'arte-digital', network: 'ethereum', price: '4.20', rare: true, editions: { of10: 0, of50: 0 }, listedAt: '2026-04-11', favorites: 401, rating: [4.9, 44] },
  { name: 'Ruby Ape #624', artwork: 'emerald-ape', category: 'assinaturas', network: 'ethereum', price: '0.66', editions: { of50: 18, open: 25 }, listedAt: '2026-08-30', favorites: 57, rating: [4.2, 9] },
  { name: 'Topaz Ape #731', artwork: 'emerald-ape', category: 'utilidade', network: 'polygon', price: '0.32', editions: { open: 60 }, listedAt: '2026-10-15', favorites: 19, rating: [4.0, 3] },
  { name: 'Garnet Ape #847', artwork: 'emerald-ape', category: 'fotografia', network: 'solana', price: '1.55', editions: { of10: 5, of50: 40 }, listedAt: '2026-06-18', favorites: 133, rating: [4.5, 21] },
  { name: 'Opal Ape #956', artwork: 'emerald-ape', category: 'arte-digital', network: 'ethereum', price: '12.30', rare: true, editions: { unique: 1 }, listedAt: '2026-03-07', favorites: 520, rating: [5.0, 31] },

  // Kurio Nomads
  { name: 'Sage Nomad #009', artwork: 'sage-nomad', category: 'arte-digital', network: 'ethereum', price: '1.69', editions: { of10: 3, of50: 0, open: 15 }, listedAt: '2026-07-12', favorites: 276, rating: [4.7, 33] },
  { name: 'Violet Nomad #314', artwork: 'sage-nomad', category: 'musica', network: 'polygon', price: '1.39', editions: { unique: 1 }, listedAt: '2026-08-05', favorites: 198, rating: [4.6, 15] },
  { name: 'Cosmic Bloom #118', artwork: 'sage-nomad', category: 'generativa', network: 'ethereum', price: '1.29', editions: { of10: 7, of50: 29 }, listedAt: '2026-09-09', favorites: 167, rating: [4.4, 18] },
  { name: 'Misty Nomad #276', artwork: 'sage-nomad', category: 'fotografia', network: 'solana', price: '0.54', editions: { of50: 44, open: 40 }, listedAt: '2026-06-01', favorites: 72, rating: [4.0, 10] },
  { name: 'Lilac Drifter #389', artwork: 'sage-nomad', category: 'colecionaveis', network: 'polygon', price: '0.79', previousPrice: '0.99', editions: { of10: 8, open: 35 }, listedAt: '2026-10-08', favorites: 91, rating: [4.3, 14] },
  { name: 'Velvet Bloom #445', artwork: 'sage-nomad', category: 'arte-3d', network: 'ethereum', price: '3.10', rare: true, editions: { of10: 2, of50: 12 }, listedAt: '2026-05-22', favorites: 244, rating: [4.8, 26] },
  { name: 'Dusk Wanderer #561', artwork: 'sage-nomad', category: 'jogos', network: 'solana', price: '0.21', editions: { open: 80 }, listedAt: '2026-10-19', favorites: 12, rating: [3.8, 4] },
  { name: 'Lavender Nomad #672', artwork: 'sage-nomad', category: 'musica', network: 'polygon', price: '0.95', editions: { of50: 33, open: 20 }, listedAt: '2026-07-25', favorites: 104, rating: [4.4, 11] },
  { name: 'Moss Bloom #783', artwork: 'sage-nomad', category: 'utilidade', network: 'ethereum', price: '0.05', editions: { open: 200 }, listedAt: '2026-09-30', favorites: 8, rating: [3.7, 2] },
  { name: 'Twilight Drifter #894', artwork: 'sage-nomad', category: 'assinaturas', network: 'polygon', price: '2.05', editions: { of10: 4, of50: 27 }, listedAt: '2026-04-28', favorites: 159, rating: [4.5, 20] },

  // Kurio Barons
  { name: 'Ivory Baron #088', artwork: 'ivory-baron', category: 'arte-digital', network: 'ethereum', price: '1.79', editions: { of10: 2, of50: 19, open: 10 }, listedAt: '2026-08-21', favorites: 233, rating: [4.7, 24] },
  { name: 'Neon Vessel #552', artwork: 'ivory-baron', category: 'arte-3d', network: 'ethereum', price: '1.99', previousPrice: '2.29', rare: true, editions: { unique: 1 }, listedAt: '2026-09-14', favorites: 287, rating: [4.9, 22] },
  { name: 'Ebony Baron #163', artwork: 'ivory-baron', category: 'fotografia', network: 'polygon', price: '0.72', editions: { of50: 38, open: 30 }, listedAt: '2026-06-27', favorites: 81, rating: [4.2, 13] },
  { name: 'Shadow Duke #247', artwork: 'ivory-baron', category: 'colecionaveis', network: 'solana', price: '2.40', editions: { of10: 9, of50: 31 }, listedAt: '2026-05-15', favorites: 176, rating: [4.6, 29] },
  { name: 'Iron Count #358', artwork: 'ivory-baron', category: 'jogos', network: 'ethereum', price: '0.38', editions: { open: 70 }, listedAt: '2026-10-11', favorites: 34, rating: [4.0, 6] },
  { name: 'Velvet Baron #469', artwork: 'ivory-baron', category: 'assinaturas', network: 'polygon', price: '1.10', editions: { of10: 5, open: 25 }, listedAt: '2026-07-04', favorites: 97, rating: [4.3, 16] },
  { name: 'Midnight Duke #571', artwork: 'ivory-baron', category: 'generativa', network: 'solana', price: '0.64', editions: { of50: 47 }, listedAt: '2026-09-02', favorites: 59, rating: [4.1, 7] },
  { name: 'Obsidian Vessel #682', artwork: 'ivory-baron', category: 'arte-digital', network: 'ethereum', price: '6.80', rare: true, editions: { of10: 1, of50: 9 }, listedAt: '2026-03-19', favorites: 455, rating: [4.9, 38] },
  { name: 'Silent Baron #793', artwork: 'ivory-baron', category: 'musica', network: 'polygon', price: '0.27', editions: { open: 90 }, listedAt: '2026-10-21', favorites: 15, rating: [3.9, 3] },
  { name: 'Granite Duke #905', artwork: 'ivory-baron', category: 'utilidade', network: 'ethereum', price: '1.45', editions: { of10: 0, open: 0 }, listedAt: '2026-04-02', favorites: 122, rating: [4.4, 17] },

  // Kurio Beats
  { name: 'Golden Beat #207', artwork: 'golden-beat', category: 'musica', network: 'ethereum', price: '0.99', editions: { of10: 6, of50: 1, open: 30 }, listedAt: '2026-08-11', favorites: 211, rating: [4.6, 23] },
  { name: 'Golden Frequency #071', artwork: 'golden-beat', category: 'musica', network: 'polygon', price: '0.59', editions: { of50: 35, open: 40 }, listedAt: '2026-09-17', favorites: 143, rating: [4.4, 12] },
  { name: 'Golden Signal #160', artwork: 'golden-beat', category: 'arte-digital', network: 'solana', price: '0.39', editions: { open: 75 }, listedAt: '2026-10-05', favorites: 77, rating: [4.2, 9] },
  { name: 'Solar Rhythm #284', artwork: 'golden-beat', category: 'generativa', network: 'ethereum', price: '2.20', rare: true, editions: { of10: 3, of50: 15 }, listedAt: '2026-06-09', favorites: 264, rating: [4.8, 30] },
  { name: 'Amber Tempo #396', artwork: 'golden-beat', category: 'jogos', network: 'polygon', price: '0.15', editions: { open: 150 }, listedAt: '2026-10-17', favorites: 21, rating: [3.8, 5] },
  { name: 'Sunset Groove #417', artwork: 'golden-beat', category: 'fotografia', network: 'ethereum', price: '1.05', editions: { of10: 7, of50: 26 }, listedAt: '2026-05-30', favorites: 118, rating: [4.3, 19] },
  { name: 'Citrus Wave #538', artwork: 'golden-beat', category: 'arte-3d', network: 'solana', price: '0.48', editions: { of50: 42, open: 45 }, listedAt: '2026-07-19', favorites: 66, rating: [4.1, 8] },
  { name: 'Honey Pulse #649', artwork: 'golden-beat', category: 'assinaturas', network: 'polygon', price: '0.83', previousPrice: '1.10', editions: { of10: 8, open: 30 }, listedAt: '2026-09-25', favorites: 102, rating: [4.4, 14] },
  { name: 'Blaze Melody #761', artwork: 'golden-beat', category: 'colecionaveis', network: 'ethereum', price: '3.65', rare: true, editions: { of10: 2, of50: 11 }, listedAt: '2026-04-16', favorites: 338, rating: [4.9, 35] },
  { name: 'Saffron Echo #872', artwork: 'golden-beat', category: 'utilidade', network: 'solana', price: '0.02', editions: { open: 300 }, listedAt: '2026-10-20', favorites: 5, rating: [3.6, 2] },
]

export const nfts: Nft[] = rows.map(buildNft)
