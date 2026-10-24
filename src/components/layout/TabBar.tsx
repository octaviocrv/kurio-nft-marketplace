import { Link, useLocation } from '@tanstack/react-router'
import { Heart, House, ScanLine, ShoppingCart, User, type LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

interface Tab {
  to: ComponentProps<typeof Link>['to']
  label: string
  icon: LucideIcon
  filled: boolean // ícones sólidos como no Figma; o carrinho fica vazado porque preenchido vira um borrão
  section?: string // aba fica ativa em todo esse trecho de URL (ex.: Perfil em /conta/perfil e /conta/carteiras)
}

const leftTabs: Tab[] = [
  { to: '/', label: 'Início', icon: House, filled: true },
  { to: '/favoritos', label: 'Favoritos', icon: Heart, filled: true },
]
const rightTabs: Tab[] = [
  { to: '/carrinho', label: 'Carrinho', icon: ShoppingCart, filled: false },
  { to: '/conta/perfil', label: 'Perfil', icon: User, filled: true, section: '/conta' },
]

function TabLink({ to, label, icon: Icon, filled, section }: Tab) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const inSection = section !== undefined && pathname.startsWith(section)

  return (
    <Link
      to={to}
      // Só o Início precisa de match exato; senão "/" ficaria ativo em todas as rotas
      activeOptions={{ exact: to === '/' }}
      aria-label={label}
      // Fora da URL exata o Link não se marca ativo; aqui forçamos o mesmo visual e o aria-current
      {...(inSection && { 'data-status': 'active', 'aria-current': 'page' as const })}
      className="flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:text-primary"
    >
      <Icon className={filled ? 'size-5 fill-current' : 'size-5'} />
    </Link>
  )
}

export function TabBar() {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      {/* Fundo da barra com um recorte em meia-lua no topo (máscara CSS), onde o botão central encaixa.
          Fica numa camada separada porque a máscara cortaria também o botão. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-t-3xl bg-card [mask-image:radial-gradient(circle_at_50%_0,transparent_40px,black_41px)]"
      />

      <div className="relative mx-auto grid h-18 max-w-md grid-cols-[1fr_auto_1fr] items-center px-6 pb-[env(safe-area-inset-bottom)] box-content">
        <div className="flex justify-around">{leftTabs.map((tab) => <TabLink key={tab.label} {...tab} />)}</div>

        {/* Botão central do Figma: sem função no escopo, então fica desabilitado e diz por quê */}
        <button
          type="button"
          disabled
          aria-label="Escanear NFT (indisponível na demo)"
          title="Indisponível na demo"
          className="-mt-18 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-highlight to-primary text-primary-foreground shadow-lg disabled:cursor-not-allowed"
        >
          <ScanLine className="size-7" />
        </button>

        <div className="flex justify-around">{rightTabs.map((tab) => <TabLink key={tab.label} {...tab} />)}</div>
      </div>
    </nav>
  )
}
