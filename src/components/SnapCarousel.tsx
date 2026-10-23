import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SnapCarouselProps {
  label: string // nome do carrossel para leitor de tela
  slides: ReactNode[]
  className?: string
  dotsClassName?: string
}

/**
 * Carrossel só com CSS (scroll-snap): o arraste nativo do celular funciona sem biblioteca.
 * O JS só acompanha o slide visível para os pontos e permite pular para um slide.
 * Usado no hero do Início e na galeria do detalhe.
 */
export function SnapCarousel({ label, slides, className, dotsClassName }: SnapCarouselProps) {
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
    <section aria-roledescription="carrossel" aria-label={label} className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className={cn('flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
            className="w-full shrink-0 snap-center"
          >
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className={cn('absolute inset-x-0 bottom-3 flex justify-center gap-1.5', dotsClassName)}>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir para ${index + 1} de ${slides.length}`}
              aria-current={index === activeIndex}
              className={cn(
                'size-2 cursor-pointer rounded-full bg-muted-foreground/40 transition-colors',
                index === activeIndex && 'bg-highlight',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
