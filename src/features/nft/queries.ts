import { keepPreviousData, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { fetchNft, fetchNfts, type Nft, type NftListParams, type NftPage } from '@/api/nft'

/**
 * Query keys de NFT. Catálogo é público: não leva userId.
 * Os parâmetros fazem parte da chave, então cada combinação de busca/filtro/página tem seu cache
 * e uma resposta atrasada nunca cai no lugar de outra (resposta fora de ordem é descartada).
 */
export const nftKeys = {
  all: ['nfts'] as const,
  lists: () => [...nftKeys.all, 'list'] as const,
  list: (params: NftListParams) => [...nftKeys.lists(), params] as const,
  detail: (nftId: string) => [...nftKeys.all, 'detail', nftId] as const,
}

export function useNftList(params: NftListParams) {
  return useQuery({
    queryKey: nftKeys.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal),
    // Ao trocar filtro/página, a lista anterior continua na tela (esmaecida) até a nova chegar:
    // sem pular para o skeleton nem deslocar o layout a cada clique
    placeholderData: keepPreviousData,
  })
}

export function useNftDetail(nftId: string) {
  const queryClient = useQueryClient()
  // Tipo explícito: com placeholderData em função, o TypeScript não consegue inferir o dado sozinho
  return useQuery<Nft>({
    queryKey: nftKeys.detail(nftId),
    queryFn: ({ signal }) => fetchNft(nftId, signal),
    // Vindo do catálogo, o NFT já está em alguma página em cache: abre na hora com esse dado
    // e a consulta do detalhe atualiza por trás. Acesso direto (link, refresh) mostra o skeleton.
    placeholderData: () => findInCachedLists(queryClient, nftId),
  })
}

function findInCachedLists(queryClient: QueryClient, nftId: string): Nft | undefined {
  for (const [, page] of queryClient.getQueriesData<NftPage>({ queryKey: nftKeys.lists() })) {
    const nft = page?.items.find((item) => item.id === nftId)
    if (nft) return nft
  }
  return undefined
}
