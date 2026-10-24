import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { NftCategory } from '@/api/nft'
import { categoryLabels } from '@/features/catalog/labels'

const highlights = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
]

const footerCategories: NftCategory[] = ['arte-digital', 'fotografia', 'musica', 'arte-3d', 'utilidade']

// Sem ícones de marca no lucide 1.x: as redes viram siglas (e estão fora do escopo, então desabilitadas)
const socialNetworks = [
  { short: 'f', name: 'Facebook' },
  { short: 'ig', name: 'Instagram' },
  { short: 'X', name: 'X (Twitter)' },
  { short: 'in', name: 'LinkedIn' },
  { short: 'yt', name: 'YouTube' },
]

/** Rodapé de tablet e desktop. Só leva a telas que existem; o resto aparece desabilitado. */
export function SiteFooter() {
  return (
    <footer className="mt-20 hidden pb-8 md:block">
      <div className="page-container">
        <div className="grid gap-8 bg-card px-8 py-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
          {highlights.map(({ letter, title, text }) => (
            <div key={title} className="flex flex-col gap-3 lg:border-r lg:border-primary lg:pr-6">
              <span aria-hidden className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {letter}
              </span>
              <h2 className="font-bold">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold">Antecipe-se ao próximo lançamento</h2>
            {/* Newsletter fora do escopo: desabilitada para não aparentar inscrição */}
            <div className="flex">
              <label htmlFor="newsletter-email" className="sr-only">
                Newsletter (indisponível na demo)
              </label>
              <input
                id="newsletter-email"
                type="email"
                disabled
                placeholder="digite seu e-mail..."
                className="h-10 min-w-0 flex-1 rounded-l-md bg-secondary px-3 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
              />
              <button type="button" disabled title="Indisponível na demo" className="rounded-r-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed">
                Enviar<span className="sr-only"> (indisponível na demo)</span>
              </button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 items-center gap-6 bg-secondary px-8 py-6 text-sm lg:grid-cols-4">
          <span className="font-bold tracking-[0.1em]">KURIO</span>
          <span>Feito para colecionadores, criadores e cultura</span>
          <a href="mailto:contato@email.com" className="w-fit rounded-sm outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50">
            contato@email.com
          </a>
          <a href="tel:+551140028922" className="w-fit rounded-sm outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50">
            +55 11 4002 8922
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 bg-card px-8 py-8 lg:grid-cols-4">
          <FooterColumn title="Meu perfil">
            <FooterLink to="/conta/perfil">Meu perfil</FooterLink>
            <Unavailable>Minha coleção</Unavailable>
            <Unavailable>Atividade</Unavailable>
            <Unavailable>Estúdio do criador</Unavailable>
            <FooterLink to="/favoritos">Lista de interesse</FooterLink>
          </FooterColumn>
          <FooterColumn title="Central de ajuda">
            {['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'].map((label) => (
              <Unavailable key={label}>{label}</Unavailable>
            ))}
          </FooterColumn>
          <FooterColumn title="Coleções">
            {footerCategories.map((category) => (
              <li key={category}>
                <Link to="/" search={{ categoria: category }} className={footerLinkClass}>
                  {categoryLabels[category]}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <div className="flex flex-col gap-6">
            <FooterColumn title="Redes sociais">
              <li className="flex gap-2">
                {socialNetworks.map(({ short, name }) => (
                  <span
                    key={name}
                    aria-disabled="true"
                    title={`${name} (indisponível na demo)`}
                    className="flex size-8 cursor-not-allowed items-center justify-center rounded-sm border border-primary text-xs font-bold text-highlight"
                  >
                    <span aria-hidden>{short}</span>
                    <span className="sr-only">{name} (indisponível na demo)</span>
                  </span>
                ))}
              </li>
            </FooterColumn>
            <div className="flex flex-col gap-2">
              <h2 className="font-bold">Carteiras compatíveis</h2>
              <p className="w-fit rounded-sm border border-border-soft bg-secondary px-3 py-1 text-[10px] font-bold tracking-wide text-highlight">
                METAMASK · WALLETCONNECT · COINBASE
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm">© 2026 Kurio. Propriedade digital para todos.</p>
      </div>
    </footer>
  )
}

const footerLinkClass = 'rounded-sm text-sm outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50'

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }: { to: '/conta/perfil' | '/favoritos'; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className={footerLinkClass}>
        {children}
      </Link>
    </li>
  )
}

/** Item fora do escopo: mesmo visual do link, mas sem destino e anunciado como indisponível. */
function Unavailable({ children }: { children: ReactNode }) {
  return (
    <li aria-disabled="true" title="Indisponível na demo" className="w-fit cursor-not-allowed text-sm">
      {children}
      <span className="sr-only"> (indisponível na demo)</span>
    </li>
  )
}
