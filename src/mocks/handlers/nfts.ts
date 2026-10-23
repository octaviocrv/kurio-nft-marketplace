import { http, HttpResponse } from 'msw'
import { nftListParamsSchema, type Nft, type NftPage, type NftSort } from '@/api/nft'
import { parseEth } from '@/lib/eth'
import { db } from '../db'
import { errorResponse } from '../http'
import { getScenario } from '../scenarios'

/** Lê a query string no formato do contrato e valida com o MESMO schema que o cliente usa. */
function readListParams(url: URL) {
  const query = url.searchParams
  const list = (name: string) => query.get(name)?.split(',').filter(Boolean)
  const number = (name: string) => (query.has(name) ? Number(query.get(name)) : undefined)

  return nftListParamsSchema.safeParse({
    search: query.get('search') ?? undefined,
    categories: list('categories'),
    networks: list('networks'),
    minPrice: query.get('minPrice') ?? undefined,
    maxPrice: query.get('maxPrice') ?? undefined,
    sort: query.get('sort') ?? undefined,
    page: number('page'),
    pageSize: number('pageSize'),
  })
}

// Comparação de preço em bigint (wei): com float, "0.1" e "0.10000000000000001" empatariam.
function comparePrice(a: Nft, b: Nft): number {
  const difference = parseEth(a.price) - parseEth(b.price)
  return difference === 0n ? 0 : difference < 0n ? -1 : 1
}

const sorters: Record<NftSort, ((a: Nft, b: Nft) => number) | null> = {
  padrao: null, // ordem do catálogo (curadoria do seed)
  recentes: (a, b) => b.listedAt.localeCompare(a.listedAt),
  populares: (a, b) => b.favoriteCount - a.favoriteCount,
  'menor-preco': comparePrice,
  'maior-preco': (a, b) => comparePrice(b, a),
}

export const nftHandlers = [
  http.get('/api/nfts', ({ request }) => {
    const parsed = readListParams(new URL(request.url))
    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]))
      return errorResponse(422, { code: 'validation_error', message: 'Filtros inválidos.', fieldErrors })
    }
    const params = parsed.data

    // Cenário "empty": o catálogo responde com sucesso, mas sem nenhum NFT
    const catalog = getScenario() === 'empty' ? [] : db.nfts
    const search = params.search?.toLowerCase()
    const minWei = params.minPrice ? parseEth(params.minPrice) : null
    const maxWei = params.maxPrice ? parseEth(params.maxPrice) : null

    // Filtros combinados com E; dentro de uma lista (ex.: duas redes), qualquer uma serve
    const matches = catalog.filter((nft) => {
      const priceWei = parseEth(nft.price)
      return (
        (!search || nft.name.toLowerCase().includes(search) || nft.collection.toLowerCase().includes(search)) &&
        (!params.categories?.length || params.categories.includes(nft.category)) &&
        (!params.networks?.length || params.networks.includes(nft.network)) &&
        (minWei === null || priceWei >= minWei) &&
        (maxWei === null || priceWei <= maxWei)
      )
    })

    const sorter = sorters[params.sort]
    const sorted = sorter ? [...matches].sort(sorter) : matches
    const start = (params.page - 1) * params.pageSize

    // Página além do fim responde vazia (com o total certo): a tela oferece voltar ao início
    return HttpResponse.json({
      items: sorted.slice(start, start + params.pageSize),
      page: params.page,
      pageSize: params.pageSize,
      total: sorted.length,
    } satisfies NftPage)
  }),

  http.get('/api/nfts/:nftId', ({ params }) => {
    const nft = db.nfts.find((item) => item.id === params.nftId)
    if (!nft) return errorResponse(404, { code: 'not_found', message: 'NFT não encontrado.' })
    return HttpResponse.json(nft satisfies Nft)
  }),
]
