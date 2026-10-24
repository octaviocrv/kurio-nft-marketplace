import { Link } from '@tanstack/react-router'
import { ChartLine, CircleAlert, Download, Heart, LogOut, ShoppingCart, User, Wallet, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface AccountSidebarProps {
  onLogout: () => void
  isLoggingOut: boolean
}

const itemClass =
  'flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm text-highlight outline-none transition-colors hover:bg-secondary/50 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50'

/**
 * Menu lateral da conta (Figma desktop). Só Dados do perfil, Carteiras e Lista de interesse
 * existem no escopo; Atividade, Ofertas, Arquivos baixados e Suporte aparecem desabilitados.
 */
export function AccountSidebar({ onLogout, isLoggingOut }: AccountSidebarProps) {
  return (
    <aside className="flex flex-col rounded-lg bg-card py-3">
      <h1 className="px-4 pb-2 text-lg font-bold">Meu perfil</h1>
      <nav aria-label="Conta">
        <ul>
          <SidebarLink to="/conta/perfil" icon={User}>Dados do perfil</SidebarLink>
          <SidebarLink to="/conta/carteiras" icon={Wallet}>Carteiras</SidebarLink>
          <SidebarUnavailable icon={ShoppingCart}>Atividade</SidebarUnavailable>
          <SidebarLink to="/favoritos" icon={Heart}>Lista de interesse</SidebarLink>
          <SidebarUnavailable icon={ChartLine}>Ofertas</SidebarUnavailable>
          <SidebarUnavailable icon={Download}>Arquivos baixados</SidebarUnavailable>
          <SidebarUnavailable icon={CircleAlert}>Suporte</SidebarUnavailable>
        </ul>
      </nav>
      <div className="mt-1 border-t">
        <button type="button" onClick={onLogout} disabled={isLoggingOut} className={`${itemClass} cursor-pointer font-bold disabled:cursor-wait`}>
          <LogOut aria-hidden className="size-4" /> {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon: Icon, children }: { to: '/conta/perfil' | '/conta/carteiras' | '/favoritos'; icon: LucideIcon; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className={`${itemClass} data-[status=active]:border-primary data-[status=active]:bg-secondary/40 data-[status=active]:font-bold`}>
        <Icon aria-hidden className="size-4" /> {children}
      </Link>
    </li>
  )
}

function SidebarUnavailable({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li aria-disabled="true" title="Indisponível na demo" className={`${itemClass} cursor-not-allowed hover:bg-transparent`}>
      <Icon aria-hidden className="size-4" /> {children}
      <span className="sr-only"> (indisponível na demo)</span>
    </li>
  )
}
