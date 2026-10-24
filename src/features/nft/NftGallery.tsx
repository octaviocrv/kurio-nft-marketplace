import { useState } from 'react'
import { SnapCarousel } from '@/components/SnapCarousel'
import { cn } from '@/lib/utils'

const viewNames = ['obra completa', 'close no rosto', 'detalhe']

function imageAlt(name: string, index: number) {
  return `${name} — ${viewNames[index] ?? `imagem ${index + 1}`}`
}

/**
 * Galeria do detalhe. Mobile: arrasta para o lado e os pontos mostram a posição.
 * Tablet/desktop (Figma): miniaturas na lateral trocam a imagem grande.
 */
export function NftGallery({ name, images }: { name: string; images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <>
      <div className="md:hidden">
        <SnapCarousel
          label={`Imagens de ${name}`}
          className="rounded-3xl"
          slides={images.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={imageAlt(name, index)}
              width={800}
              height={800}
              // Primeira imagem é o LCP da página; as outras só carregam quando o usuário arrasta
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className="aspect-square w-full object-cover"
            />
          ))}
          dotsClassName="bottom-12"
        />
      </div>

      <div className="hidden grid-cols-[4rem_minmax(0,1fr)] gap-4 md:grid lg:grid-cols-[5.5rem_minmax(0,1fr)] lg:gap-5">
        <ul aria-label={`Imagens de ${name}`} className="flex flex-col gap-3">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-pressed={index === selectedIndex}
                aria-label={`Ver ${viewNames[index] ?? `imagem ${index + 1}`}`}
                className={cn(
                  'block w-full cursor-pointer overflow-hidden rounded-md border-2 border-transparent outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  index === selectedIndex ? 'border-primary' : 'opacity-70 hover:opacity-100',
                )}
              >
                <img src={src} alt="" width={88} height={88} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <div className="rounded-lg bg-card p-3 lg:p-4">
          <img
            src={images[selectedIndex]}
            alt={imageAlt(name, selectedIndex)}
            width={800}
            height={800}
            fetchPriority="high"
            className="aspect-square w-full rounded-lg object-cover"
          />
        </div>
      </div>
    </>
  )
}
