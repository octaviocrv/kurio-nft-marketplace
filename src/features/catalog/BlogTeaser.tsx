const posts = [
  { date: '2026-09-12', label: '12 de setembro', minutes: 6, image: '/images/nfts/ivory-baron.webp', title: 'Como funciona a propriedade de NFTs', text: 'Aprenda a colecionar, negociar e verificar ativos digitais.' },
  { date: '2026-09-15', label: '15 de setembro', minutes: 2, image: '/images/nfts/emerald-ape.webp', title: '10 artistas digitais para acompanhar', text: 'Conheça criadores que moldam a cultura digital.' },
  { date: '2026-09-15', label: '15 de setembro', minutes: 3, image: '/images/nfts/sage-nomad.webp', title: 'Raridade, atributos e procedência', text: 'Entenda raridade, procedência, direitos autorais e utilidade.' },
  { date: '2026-09-15', label: '15 de setembro', minutes: 2, image: '/images/nfts/golden-beat.webp', title: 'Como proteger sua carteira', text: 'Proteja sua carteira, seus ativos e sua identidade.' },
]

/**
 * "Diário da Cunhagem" do Figma desktop. O blog está fora do escopo: os cards são estáticos
 * e o "Ler mais" aparece desabilitado, sem fingir que abre um artigo.
 */
export function BlogTeaser() {
  return (
    <section aria-labelledby="blog-title" className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 id="blog-title" className="text-2xl font-bold">
          Diário da Cunhagem
        </h2>
        <p className="text-sm text-muted-foreground">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </div>
      <ul className="grid w-full grid-cols-2 gap-6 lg:grid-cols-4">
        {posts.map((post) => (
          <li key={post.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-lg bg-card">
              <img src={post.image} alt="" width={280} height={180} loading="lazy" decoding="async" className="aspect-[3/2] w-full object-cover" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs text-muted-foreground">
                  <time dateTime={post.date}>{post.label}</time> | Leitura de {post.minutes} min
                </p>
                <h3 className="text-sm font-bold">{post.title}</h3>
                <p className="flex-1 text-xs leading-5 text-muted-foreground">{post.text}</p>
                <span aria-disabled="true" title="Indisponível na demo" className="w-fit cursor-not-allowed text-xs text-highlight">
                  Ler mais →<span className="sr-only"> (indisponível na demo)</span>
                </span>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
