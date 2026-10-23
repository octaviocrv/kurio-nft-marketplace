import { z } from 'zod'
import { parseEth } from '@/lib/eth'
import { apiClient, parseResponse } from './client'
import { dateTimeSchema, ethAmountSchema, idSchema, networkSchema } from './shared'

/** Categorias da sidebar do Figma. Valores em português porque vão para a URL (?categoria=). */
export const nftCategorySchema = z.enum([
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativa',
  'jogos',
  'assinaturas',
  'utilidade',
])
export type NftCategory = z.infer<typeof nftCategorySchema>

/**
 * Edição é uma variante do NFT com estoque próprio (1/10, 1/50, aberta).
 * O carrinho guarda nftId + editionId, e a disponibilidade é checada por edição.
 */
export const editionSchema = z.object({
  id: idSchema,
  label: z.string(), // "1/10", "1/50", "Aberta"
  supply: z.number().int().positive().nullable(), // null = edição aberta (sem tiragem fixa)
  available: z.number().int().nonnegative(),
})
export type Edition = z.infer<typeof editionSchema>

export const nftSchema = z.object({
  id: idSchema,
  tokenId: z.string().regex(/^\d+$/), // exibido como "#0042"
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()).min(1), // galeria do detalhe; a primeira é a capa (card, carrinho, recibo)
  collection: z.string(), // "Kurio Apes"
  category: nftCategorySchema,
  network: networkSchema,
  price: ethAmountSchema,
  previousPrice: ethAmountSchema.nullable(), // preço riscado no card do Figma
  isRare: z.boolean(),
  attributes: z.array(z.string()),
  rating: z.object({ average: z.number().min(0).max(5), count: z.number().int().nonnegative() }),
  favoriteCount: z.number().int().nonnegative(), // base da aba "Em alta"
  editions: z.array(editionSchema).min(1),
  listedAt: dateTimeSchema, // base da aba "Novos lançamentos"
  // Incrementa a cada mudança de preço/estoque. Eventos do Socket.IO com versão menor ou igual são ignorados.
  version: z.number().int().nonnegative(),
})
export type Nft = z.infer<typeof nftSchema>

export const nftPageSchema = z.object({
  items: z.array(nftSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type NftPage = z.infer<typeof nftPageSchema>

/** Ordenações do catálogo. Valores em português porque vão para a URL (?ordem=). */
export const nftSortSchema = z.enum(['padrao', 'recentes', 'populares', 'menor-preco', 'maior-preco'])
export type NftSort = z.infer<typeof nftSortSchema>

export const NFT_PAGE_SIZE = 12

/** Faixa de preço: o formulário de filtros e o handler do mock usam esta mesma regra. */
export function isValidPriceRange(range: { minPrice?: string; maxPrice?: string }): boolean {
  if (!range.minPrice || !range.maxPrice) return true
  return parseEth(range.minPrice) <= parseEth(range.maxPrice)
}
export const PRICE_RANGE_MESSAGE = 'O preço máximo precisa ser maior ou igual ao mínimo'

/**
 * Parâmetros de GET /nfts. Busca, filtros (combináveis: categorias E redes E faixa de preço),
 * ordenação e paginação. Listas vão na query string separadas por vírgula.
 */
export const nftListParamsSchema = z
  .object({
    search: z.string().trim().min(1).max(80).optional(),
    categories: z.array(nftCategorySchema).optional(),
    networks: z.array(networkSchema).optional(),
    minPrice: ethAmountSchema.optional(),
    maxPrice: ethAmountSchema.optional(),
    sort: nftSortSchema.default('padrao'),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(48).default(NFT_PAGE_SIZE),
  })
  .refine(isValidPriceRange, { path: ['maxPrice'], message: PRICE_RANGE_MESSAGE })
export type NftListParams = z.input<typeof nftListParamsSchema>

/** Query string do contrato: listas viram "a,b" e o que está vazio nem vai. */
function toQueryParams(params: NftListParams) {
  return {
    search: params.search,
    categories: params.categories?.length ? params.categories.join(',') : undefined,
    networks: params.networks?.length ? params.networks.join(',') : undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  }
}

/** GET /nfts. O signal vem do TanStack Query: consulta que ficou obsoleta é cancelada no meio. */
export async function fetchNfts(params: NftListParams, signal?: AbortSignal): Promise<NftPage> {
  const { data } = await apiClient.get('/nfts', { params: toQueryParams(params), signal })
  return parseResponse(nftPageSchema, data)
}

/** GET /nfts/:id — 404 (not_found) quando o NFT não existe. */
export async function fetchNft(nftId: string, signal?: AbortSignal): Promise<Nft> {
  const { data } = await apiClient.get(`/nfts/${encodeURIComponent(nftId)}`, { signal })
  return parseResponse(nftSchema, data)
}
