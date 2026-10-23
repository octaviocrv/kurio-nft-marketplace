import type { Nft } from '@/api/nft'
import { NftCard } from './NftCard'

interface NftGridProps {
  nfts: Nft[]
  favoriteIds: Set<string>
  onFavoriteToggle: (nftId: string) => void
}

export function NftGrid({ nfts, favoriteIds, onFavoriteToggle }: NftGridProps) {
  return (
    // Grid alinhado: o Figma desloca a coluna da direita, mas com selos e nomes reais ficava torto (ver decisoes.md)
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6">
      {nfts.map((nft) => (
        <li key={nft.id}>
          <NftCard nft={nft} isFavorite={favoriteIds.has(nft.id)} onFavoriteToggle={onFavoriteToggle} />
        </li>
      ))}
    </ul>
  )
}
