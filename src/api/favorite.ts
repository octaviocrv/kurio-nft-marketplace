import { z } from 'zod'
import { apiClient, parseResponse } from './client'
import { nftSchema } from './nft'
import { idSchema } from './shared'

export const favoriteListSchema = z.object({
  items: z.array(nftSchema),
})
export type FavoriteList = z.infer<typeof favoriteListSchema>

export const favoriteInputSchema = z.object({
  nftId: idSchema,
})

export async function fetchFavorites(signal?: AbortSignal): Promise<FavoriteList> {
  const { data } = await apiClient.get('/favorites', { signal })
  return parseResponse(favoriteListSchema, data)
}

export async function addFavorite(nftId: string): Promise<FavoriteList> {
  const { data } = await apiClient.post('/favorites', favoriteInputSchema.parse({ nftId }))
  return parseResponse(favoriteListSchema, data)
}

export async function removeFavorite(nftId: string): Promise<FavoriteList> {
  const { data } = await apiClient.delete(`/favorites/${encodeURIComponent(nftId)}`)
  return parseResponse(favoriteListSchema, data)
}

export function favoriteIds(list: FavoriteList | undefined): Set<string> {
  return new Set(list?.items.map((nft) => nft.id) ?? [])
}
