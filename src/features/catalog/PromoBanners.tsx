import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

/**
 * Promos do Início (desktop/tablet). Conteúdo editorial fixo, mas o "Explorar" leva a um recorte
 * real do catálogo (ordenação ou coleção), nunca a uma página que não existe.
 */
export function PromoBanners() {
  return (
    <section aria-label="Destaques do mercado" className="grid gap-6 lg:grid-cols-2">
      <PromoCard
        image="/images/nfts/emerald-ape.webp"
        title="Lançamentos gênesis de edição limitada"
        text="Colecione edições escassas diretamente dos criadores antes da revelação pública."
        link={<Link to="/" search={{ ordem: 'recentes' }} hash="catalogo" className={exploreClass}>Explorar <span className="sr-only">lançamentos</span><ArrowRight className="size-4" /></Link>}
      />
      <PromoCard
        image="/images/nfts/ivory-baron.webp"
        title="Arte digital selecionada e muito mais"
        text="Explore novos artistas, coleções verificadas e obras digitais que definem a cultura."
        link={<Link to="/" search={{ categoria: 'arte-digital' }} hash="catalogo" className={exploreClass}>Explorar <span className="sr-only">arte digital</span><ArrowRight className="size-4" /></Link>}
      />
    </section>
  )
}

const exploreClass =
  'inline-flex h-9 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50'

function PromoCard({ image, title, text, link }: { image: string; title: string; text: string; link: React.ReactNode }) {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-4 overflow-hidden rounded-lg bg-card">
      <img src={image} alt="" width={260} height={220} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      <div className="flex flex-col items-end gap-3 py-6 pr-6 text-right">
        <h2 className="font-bold">{title}</h2>
        <p className="text-xs leading-5 text-muted-foreground">{text}</p>
        {link}
      </div>
    </article>
  )
}
