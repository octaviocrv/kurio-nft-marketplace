import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { Nft } from '@/api/nft'
import { EthAmount } from '@/components/EthAmount'
import { isSoldOut } from '@/lib/nft'
import { cn } from '@/lib/utils'

interface NftCardProps {
  nft: Nft
  isFavorite: boolean
  favoriteDisabled?: boolean
  onFavoriteToggle: (nft: Nft) => void
  /** Imagem acima da dobra: carrega sem lazy. */
  eager?: boolean
  /** Candidata a LCP: somente a primeira imagem disputa prioridade alta. */
  highPriority?: boolean
}

export function NftCard({ nft, isFavorite, favoriteDisabled, onFavoriteToggle, eager = false, highPriority = false }: NftCardProps) {
  const soldOut = isSoldOut(nft)

  return (
    // O favoritar fica FORA do link: botão dentro de <a> é HTML inválido e confunde leitor de tela
    <article className="relative">
      <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <div className="rounded-2xl bg-card p-1 pb-5">
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={nft.images[0]}
              alt={nft.name}
              width={400}
              height={400}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={highPriority ? 'high' : 'auto'}
              decoding="async"
              className={cn('aspect-square w-full object-cover', soldOut && 'opacity-50 grayscale')}
            />
            {nft.isRare && (
              <span className="absolute top-3 left-0 rounded-r-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                RARO
              </span>
            )}
            {soldOut && (
              <span className="absolute inset-x-0 bottom-0 bg-background/80 py-1 text-center text-xs font-bold">
                Esgotado
              </span>
            )}
          </div>
        </div>
        <h3 className="mt-3 truncate text-sm">{nft.name}</h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <EthAmount value={nft.price} className="font-bold text-highlight" />
          {nft.previousPrice && (
            <EthAmount value={nft.previousPrice} className="text-xs text-muted-foreground line-through" />
          )}
        </p>
      </Link>

      <button
        type="button"
        onClick={() => onFavoriteToggle(nft)}
        disabled={favoriteDisabled}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`}
        className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border-soft bg-background/70 text-muted-foreground backdrop-blur-sm transition-colors outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-60 aria-pressed:text-highlight"
      >
        <Heart className={cn('size-4', isFavorite && 'fill-current')} />
      </button>
    </article>
  )
}
