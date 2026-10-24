import { Link } from '@tanstack/react-router'
import type { Nft } from '@/api/nft'
import { EthAmount } from '@/components/EthAmount'

/** Card "NFT em destaque" da sidebar. "Oferta limitada" só aparece se o NFT está mesmo com desconto. */
export function FeaturedOffer({ nft }: { nft: Nft }) {
  const onSale = nft.previousPrice !== null

  return (
    <section aria-labelledby="featured-offer-title" className="flex flex-col gap-3 rounded-lg bg-card p-4">
      <div>
        <h2 id="featured-offer-title" className="text-lg font-bold text-highlight uppercase">
          NFT em destaque
        </h2>
        {onSale && <p className="text-sm font-bold uppercase">Oferta limitada</p>}
      </div>
      <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <img src={nft.images[0]} alt={nft.name} width={280} height={280} loading="lazy" decoding="async" className="aspect-square w-full rounded-xl object-cover" />
        <span className="text-sm group-hover:text-highlight">{nft.name}</span>
        <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <EthAmount value={nft.price} className="font-bold text-highlight" />
          {nft.previousPrice && <EthAmount value={nft.previousPrice} className="text-xs text-muted-foreground line-through" />}
        </span>
      </Link>
    </section>
  )
}
