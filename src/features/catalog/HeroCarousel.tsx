import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Nft } from '@/api/nft'
import { cn } from '@/lib/utils'

/**
 * Destaques do Início. Carrossel só com CSS (scroll-snap): o arraste nativo do celular
 * funciona sem biblioteca, e os pontos apenas leem/ajustam a posição do scroll.
 */
export function HeroCarousel({ nfts }: { nfts: Nft[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll() {
    const track = trackRef.current
    if (track) setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  function goTo(index: number) {
    const track = trackRef.current
    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <section aria-roledescription="carrossel" aria-label="NFTs em destaque" className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {nfts.map((nft, index) => (
          <HeroSlide
            key={nft.id}
            nft={nft}
            // Miniatura sobreposta do Figma: mostra o próximo destaque
            nextNft={nfts[(index + 1) % nfts.length] ?? nft}
            isFirst={index === 0}
            label={`${index + 1} de ${nfts.length}`}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {nfts.map((nft, index) => (
          <button
            key={nft.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Ir para o destaque ${index + 1}`}
            aria-current={index === activeIndex}
            className={cn(
              'size-2 cursor-pointer rounded-full bg-muted-foreground/40 transition-colors',
              index === activeIndex && 'bg-highlight',
            )}
          />
        ))}
      </div>
    </section>
  )
}

interface HeroSlideProps {
  nft: Nft
  nextNft: Nft
  isFirst: boolean
  label: string
}

function HeroSlide({ nft, nextNft, isFirst, label }: HeroSlideProps) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      className="relative flex w-full shrink-0 snap-center items-center gap-3 overflow-hidden bg-card p-4 pb-8"
    >
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
