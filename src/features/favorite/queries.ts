import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, fetchFavorites, removeFavorite, type FavoriteList } from '@/api/favorite'
import type { Nft } from '@/api/nft'
import { nftKeys } from '@/features/nft/queries'

export const favoriteKeys = {
  all: (userId: string) => ['favorites', userId] as const,
}

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: favoriteKeys.all(userId ?? 'anonymous'),
    queryFn: ({ signal }) => fetchFavorites(signal),
    enabled: userId !== undefined,
  })
}

interface ToggleFavoriteInput {
  nft: Nft
  isFavorite: boolean
}

export function useToggleFavorite(userId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = favoriteKeys.all(userId ?? 'anonymous')

  return useMutation({
    mutationFn: ({ nft, isFavorite }: ToggleFavoriteInput) => (isFavorite ? removeFavorite(nft.id) : addFavorite(nft.id)),
    onMutate: async ({ nft, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoriteList>(queryKey)
      queryClient.setQueryData<FavoriteList>(queryKey, (current = { items: [] }) => ({
        items: isFavorite ? current.items.filter((item) => item.id !== nft.id) : [...current.items, nft],
      }))
      return { previous }
    },
    onError: (_error, _input, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSuccess: (favorites) => queryClient.setQueryData(queryKey, favorites),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        // O mock também altera favoriteCount, usado pela ordenação "Em alta".
        queryClient.invalidateQueries({ queryKey: nftKeys.all }),
      ])
    },
  })
}
