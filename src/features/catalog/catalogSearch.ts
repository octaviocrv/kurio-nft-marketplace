import { z } from 'zod'
import { nftCategorySchema, nftSortSchema, NFT_PAGE_SIZE, type NftCategory, type NftListParams, type NftSort } from '@/api/nft'
import { ethAmountSchema, networkSchema, type Network } from '@/api/shared'

/*
 * Estado do catálogo na URL (?busca=ape&rede=ethereum,polygon&ordem=menor-preco&pagina=2).
 * Busca, filtros, ordenação e página moram aqui, não em useState: sobrevivem ao refresh,
 * viram link compartilhável e o voltar/avançar do navegador restaura cada passo.
 * Valor inválido na URL é descartado (.catch) em vez de quebrar a página.
 */
export const catalogSearchSchema = z.object({
  busca: z.string().trim().min(1).max(80).optional().catch(undefined),
  categoria: z.string().optional().catch(undefined), // lista "a,b"
  rede: z.string().optional().catch(undefined), // lista "a,b"
  min: ethAmountSchema.optional().catch(undefined),
  max: ethAmountSchema.optional().catch(undefined),
  ordem: nftSortSchema.optional().catch(undefined),
  pagina: z.coerce.number().int().positive().optional().catch(undefined),
})
export type CatalogSearch = z.infer<typeof catalogSearchSchema>

/** O que a gaveta de filtros edita (a busca e a página ficam de fora). */
export interface CatalogFilters {
  categories: NftCategory[]
  networks: Network[]
  minPrice?: string
  maxPrice?: string
  sort: NftSort
}

// Lista da URL → só os valores válidos ("musica,xyz" vira ["musica"])
function parseList<Value extends string>(raw: string | undefined, schema: z.ZodType<Value>): Value[] {
  return (raw ?? '').split(',').flatMap((item) => {
    const parsed = schema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

export function filtersFromSearch(search: CatalogSearch): CatalogFilters {
  return {
    categories: parseList(search.categoria, nftCategorySchema),
    networks: parseList(search.rede, networkSchema),
    minPrice: search.min,
    maxPrice: search.max,
    sort: search.ordem ?? 'padrao',
  }
}

/** Filtros → URL. Valor padrão some da URL; trocar filtro sempre volta para a página 1. */
export function searchFromFilters(filters: CatalogFilters): Partial<CatalogSearch> {
  return {
    categoria: filters.categories.join(',') || undefined,
    rede: filters.networks.join(',') || undefined,
    min: filters.minPrice,
    max: filters.maxPrice,
    ordem: filters.sort === 'padrao' ? undefined : filters.sort,
    pagina: undefined,
  }
}

export function countActiveFilters(filters: CatalogFilters): number {
  return filters.categories.length + filters.networks.length + (filters.minPrice || filters.maxPrice ? 1 : 0)
}

export function toNftListParams(search: CatalogSearch): NftListParams {
  const filters = filtersFromSearch(search)
  return {
    search: search.busca,
    categories: filters.categories,
    networks: filters.networks,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    page: search.pagina ?? 1,
    pageSize: NFT_PAGE_SIZE,
  }
}
