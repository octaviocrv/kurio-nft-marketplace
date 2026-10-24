import { Link } from '@tanstack/react-router'
import type { Nft } from '@/api/nft'

/**
 * Card "NFT em destaque" da sidebar: só o título e a arte, como no Figma.
 * Nome e preço ficam de fora — quem clica vai para o detalhe, que já mostra os dois.
 * "Oferta limitada" só aparece se o NFT está mesmo com desconto.
 */
export function FeaturedOffer({ nft }: { nft: Nft }) {
  const onSale = nft.previousPrice !== null

  return (
    // overflow-hidden: a arte encosta nas bordas arredondadas, sem moldura nem respiro em volta
    <section aria-labelledby="featured-offer-title" className="overflow-hidden rounded-xl bg-card">
      <div className="flex flex-col gap-1 px-4 py-3">
        <h2 id="featured-offer-title" className="text-lg font-bold text-highlight uppercase">
          NFT em destaque
        </h2>
        {onSale && <p className="text-center text-sm font-bold uppercase">Oferta limitada</p>}
      </div>
      {/* O alt da imagem é o nome acessível do link: o leitor de tela anuncia qual NFT é */}
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="block outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <img
          src={nft.images[0]}
          alt={nft.name}
          width={280}
          height={280}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-cover transition-opacity hover:opacity-90"
        />
      </Link>
    </section>
  )
}
