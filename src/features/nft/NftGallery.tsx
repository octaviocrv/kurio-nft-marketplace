import { SnapCarousel } from '@/components/SnapCarousel'

const viewNames = ['obra completa', 'close no rosto', 'detalhe']

/** Galeria do detalhe: arrasta para o lado no celular; os pontos mostram em qual imagem está. */
export function NftGallery({ name, images }: { name: string; images: string[] }) {
  return (
    <SnapCarousel
      label={`Imagens de ${name}`}
      className="rounded-3xl"
      slides={images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`${name} — ${viewNames[index] ?? `imagem ${index + 1}`}`}
          width={800}
          height={800}
          // Primeira imagem é o LCP da página; as outras só carregam quando o usuário arrasta
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          className="aspect-square w-full object-cover"
        />
      ))}
      dotsClassName="bottom-14"
    />
  )
}
