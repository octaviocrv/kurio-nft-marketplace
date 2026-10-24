import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SnapCarouselProps {
  label: string // nome do carrossel para leitor de tela
  slides: ReactNode[]
  className?: string
  dotsClassName?: string
  /** Avança sozinho a cada N ms. Sem a prop, o carrossel só anda no toque ou no clique. */
  autoAdvanceMs?: number
}

/**
 * Carrossel só com CSS (scroll-snap): o arraste nativo do celular funciona sem biblioteca.
 * O JS só acompanha o slide visível para os pontos e permite pular para um slide.
 * Usado no hero do Início e na galeria do detalhe.
 */
export function SnapCarousel({ label, slides, className, dotsClassName, autoAdvanceMs }: SnapCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  // Pausa enquanto o mouse está em cima ou o foco está dentro: ninguém perde o slide que está lendo
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!autoAdvanceMs || slides.length < 2 || isPaused) return
    // Quem pediu menos animação no sistema não recebe troca automática (WCAG 2.3.3)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = setInterval(() => {
      const track = trackRef.current
      if (!track) return
      // A posição vem do scroll, não de um contador: se o usuário arrastou, segue de onde ele parou
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % slides.length
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    }, autoAdvanceMs)
    return () => clearInterval(timer)
  }, [autoAdvanceMs, slides.length, isPaused])

  function handleScroll() {
    const track = trackRef.current
    if (track) setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  function goTo(index: number) {
    const track = trackRef.current
    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
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
        <div className={cn('absolute inset-x-0 bottom-1 flex justify-center', dotsClassName)}>
          {slides.map((_, index) => (
            // Alvo de toque de 24 px (WCAG 2.5.8) com o ponto de 8 px desenhado dentro
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir para ${index + 1} de ${slides.length}`}
              aria-current={index === activeIndex}
              className="group flex size-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span aria-hidden className={cn('size-2 rounded-full bg-muted-foreground/40 transition-colors', index === activeIndex && 'bg-highlight')} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
