import { Link } from '@tanstack/react-router'
import { Heart, LogIn, ShoppingCart } from 'lucide-react'
import type { User } from '@/api/user'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SearchDialog } from './SearchDialog'

interface SiteHeaderProps {
  pathname: string
  /** undefined = sessão ainda carregando; null = visitante. */
  user: User | null | undefined
  cartItemCount: number | undefined
  /** Caminho atual, para o login devolver a pessoa para onde ela estava. */
  loginRedirect: string | undefined
  onSearch: (search: string | undefined) => void
}

const navLinkClass =
  'relative py-2 text-sm transition-colors outline-none hover:text-highlight focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50'
// Traço laranja embaixo do item ativo, como no Figma
const activeNavLinkClass = 'text-highlight after:absolute after:inset-x-0 after:-bottom-[1.1rem] after:h-0.5 after:bg-primary'

/** Header de tablet e desktop (a partir de 768 px). No mobile a navegação é a tab bar. */
export function SiteHeader({ pathname, user, cartItemCount, loginRedirect, onSearch }: SiteHeaderProps) {
  const isHome = pathname === '/'
  // "Mercado" é a vitrine: fica marcado no detalhe, no carrinho e no pagamento (breadcrumb "Início / Mercado / ...")
  const isMarket = ['/nft/', '/carrinho', '/checkout'].some((section) => pathname.startsWith(section))

  return (
    <header className="hidden border-b md:block">
      <div className="page-container flex h-17 items-center gap-4">
        <Link to="/" className="rounded-sm text-sm font-bold tracking-[0.1em] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          KURIO
        </Link>

        <nav aria-label="Navegação principal" className="mx-auto flex items-center gap-6 lg:gap-10">
          <Link to="/" aria-current={isHome ? 'page' : undefined} className={cn(navLinkClass, isHome && activeNavLinkClass)}>
            Início
          </Link>
          <Link
            to="/"
            hash="catalogo"
            aria-current={isMarket ? 'page' : undefined}
            className={cn(navLinkClass, isMarket && activeNavLinkClass)}
          >
            Mercado
          </Link>
          {/* Páginas editoriais estão fora do escopo: aparecem, mas não fingem funcionar */}
          {['Criadores', 'Aprenda'].map((label) => (
            <button key={label} type="button" disabled title="Indisponível na demo" className="py-2 text-sm disabled:cursor-not-allowed">
              {label}
              <span className="sr-only"> (indisponível na demo)</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SearchDialog onSearch={onSearch} />
          <Button variant="ghost" size="icon" asChild>
            <Link
              to="/carrinho"
              aria-label={cartItemCount ? `Carrinho, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'itens'}` : 'Carrinho'}
              className="relative"
            >
              <ShoppingCart className="size-5" />
              {!!cartItemCount && (
                <span aria-hidden className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          </Button>
          <AccountArea user={user} loginRedirect={loginRedirect} />
        </div>
      </div>
    </header>
  )
}

function AccountArea({ user, loginRedirect }: Pick<SiteHeaderProps, 'user' | 'loginRedirect'>) {
  // Reserva o espaço enquanto a sessão carrega: nem "Entrar" piscando para quem já está logado
  if (user === undefined) return <div aria-hidden className="ml-2 h-9 w-24" />

  if (user === null) {
    return (
      <Button size="sm" asChild className="ml-2">
        <Link to="/login" search={{ redirect: loginRedirect }}>
          <LogIn className="size-4" /> Entrar
        </Link>
      </Button>
    )
  }

  // Header logado não existe no Figma: favoritos e avatar (link da conta) no lugar do "Entrar"
  return (
    <>
      <Button variant="ghost" size="icon" asChild>
        <Link to="/favoritos" aria-label="Favoritos">
          <Heart className="size-5" />
        </Link>
      </Button>
      <Link
        to="/conta/perfil"
        aria-label={`Minha conta (${user.displayName})`}
        title={user.displayName}
        className="ml-2 rounded-full outline-none hover:ring-2 hover:ring-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-secondary font-bold">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </Link>
    </>
  )
}
