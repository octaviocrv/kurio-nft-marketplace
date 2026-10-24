import type { Nft } from '@/api/nft'
import { NftCard } from '@/features/catalog/NftCard'

interface RelatedNftsProps {
  title: string
  nfts: Nft[]
  favoriteIds: Set<string>
  favoriteDisabled?: boolean
  onFavoriteToggle: (nft: Nft) => void
}

/** Vitrine de outros NFTs ("Mais desta coleção", "Colecionadores também viram"): 3 no tablet, 5 no desktop. */
export function RelatedNfts({ title, nfts, favoriteIds, favoriteDisabled, onFavoriteToggle }: RelatedNftsProps) {
  if (nfts.length === 0) return null

  return (
    <section aria-labelledby="related-nfts-title" className="flex flex-col gap-6">
      <h2 id="related-nfts-title" className="border-b pb-3 font-bold text-highlight">
        {title}
      </h2>
      <ul className="grid grid-cols-3 gap-6 lg:grid-cols-5 [&>li:nth-child(n+4)]:hidden lg:[&>li:nth-child(n+4)]:block">
        {nfts.map((nft) => (
          <li key={nft.id}>
            <NftCard nft={nft} isFavorite={favoriteIds.has(nft.id)} favoriteDisabled={favoriteDisabled} onFavoriteToggle={onFavoriteToggle} />
          </li>
        ))}
      </ul>
    </section>
  )
}
