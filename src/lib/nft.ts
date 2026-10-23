import type { Nft } from '@/api/nft'

export function isSoldOut(nft: Nft): boolean {
  return nft.editions.every((edition) => edition.available === 0)
}
