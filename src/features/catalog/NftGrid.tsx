import type { Nft } from '@/api/nft'
import { NftCard } from './NftCard'

interface NftGridProps {
  nfts: Nft[]
  favoriteIds: Set<string>
  favoriteDisabled?: boolean
  onFavoriteToggle: (nft: Nft) => void
}

export function NftGrid({ nfts, favoriteIds, favoriteDisabled, onFavoriteToggle }: NftGridProps) {
  return (
    // Grid alinhado: o Figma desloca a coluna da direita, mas com selos e nomes reais ficava torto (ver decisoes.md)
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-6 md:gap-y-8">
      {nfts.map((nft, index) => (
        <li key={nft.id}>
          {/* Primeira linha acima da dobra (no celular é o maior elemento da tela): carrega sem lazy */}
          <NftCard
            nft={nft}
            eager={index < 3}
            highPriority={index === 0}
            isFavorite={favoriteIds.has(nft.id)}
            favoriteDisabled={favoriteDisabled}
            onFavoriteToggle={onFavoriteToggle}
          />
        </li>
      ))}
    </ul>
  )
}
