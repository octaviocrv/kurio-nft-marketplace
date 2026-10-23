import { Link } from '@tanstack/react-router'
import { Heart, House, ScanLine, ShoppingCart, User, type LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

interface Tab {
  to: ComponentProps<typeof Link>['to']
  label: string
  icon: LucideIcon
}

const leftTabs: Tab[] = [
  { to: '/', label: 'Início', icon: House },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
]
const rightTabs: Tab[] = [
  { to: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
  { to: '/conta/perfil', label: 'Perfil', icon: User },
]

function TabLink({ to, label, icon: Icon }: Tab) {
  return (
    <Link
      to={to}
      // Só o Início precisa de match exato; senão "/" ficaria ativo em todas as rotas
      activeOptions={{ exact: to === '/' }}
      aria-label={label}
      className="flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:text-primary"
    >
      <Icon className="size-6" />
    </Link>
  )
}

export function TabBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid h-18 max-w-md grid-cols-[1fr_auto_1fr] items-center px-6">
        <div className="flex justify-around">{leftTabs.map((tab) => <TabLink key={tab.label} {...tab} />)}</div>

        {/* Botão central do Figma: sem função no escopo, então fica desabilitado e diz por quê.
            O anel na cor do fundo "recorta" a barra, imitando o encaixe do layout. */}
        <button
          type="button"
          disabled
          aria-label="Escanear NFT (indisponível na demo)"
          title="Indisponível na demo"
          className="-mt-10 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground ring-8 ring-background disabled:cursor-not-allowed"
        >
          <ScanLine className="size-7" />
        </button>

        <div className="flex justify-around">{rightTabs.map((tab) => <TabLink key={tab.label} {...tab} />)}</div>
      </div>
    </nav>
  )
}
