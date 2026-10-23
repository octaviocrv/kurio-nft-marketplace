import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { Nft } from '@/api/nft'
import { SnapCarousel } from '@/components/SnapCarousel'

/** Destaques do Início: um slide por NFT em destaque. */
export function HeroCarousel({ nfts }: { nfts: Nft[] }) {
  return (
    <SnapCarousel
      label="NFTs em destaque"
      className="rounded-3xl"
      slides={nfts.map((nft, index) => (
        <HeroSlide
          key={nft.id}
          nft={nft}
          // Miniatura sobreposta do Figma: mostra o próximo destaque
          nextNft={nfts[(index + 1) % nfts.length] ?? nft}
          isFirst={index === 0}
        />
      ))}
    />
  )
}

function HeroSlide({ nft, nextNft, isFirst }: { nft: Nft; nextNft: Nft; isFirst: boolean }) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden bg-card p-4 pb-8">
      {/* Círculo decorativo do fundo, como no Figma */}
      <div aria-hidden className="absolute -top-16 left-1/3 size-64 rounded-full bg-secondary/40" />

      <div className="relative flex flex-1 flex-col gap-2">
        <p className="text-xs font-bold">Bem-vindo à Kurio</p>
        <h2 className="text-lg leading-snug font-bold uppercase">Seja dono da cultura digital</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">Descubra NFTs selecionados de criadores do mundo todo.</p>
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-sm text-xs font-bold text-highlight uppercase outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Explorar <span className="sr-only">{nft.name}</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="relative w-[42%] shrink-0">
        <img
          src={nft.images[0]}
          alt={nft.name}
          width={300}
          height={300}
          // O primeiro slide é o maior elemento acima da dobra (LCP): carrega já, com prioridade
          loading={isFirst ? 'eager' : 'lazy'}
          fetchPriority={isFirst ? 'high' : 'auto'}
          className="aspect-square w-full rounded-2xl object-cover"
        />
        <img
          src={nextNft.images[0]}
          alt=""
          width={120}
          height={120}
          loading="lazy"
          className="absolute -bottom-3 -left-3 aspect-square w-[45%] rounded-xl border-2 border-card object-cover"
        />
      </div>
    </div>
  )
}
