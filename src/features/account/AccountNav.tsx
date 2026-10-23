import { Link } from '@tanstack/react-router'

const links = [
  { to: '/conta/perfil', label: 'Dados do perfil' },
  { to: '/conta/carteiras', label: 'Carteiras' },
] as const

// No mobile só as duas páginas do escopo. Os outros itens da sidebar desktop (Atividade, Ofertas...)
// estão fora do escopo e entram desabilitados na fase 3, junto com a sidebar.
export function AccountNav() {
  return (
    <nav aria-label="Conta" className="-ml-2 flex gap-2">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          // Mesmo visual das abas (sublinhado laranja), mas são links: cada uma é uma página com URL própria
          className="relative rounded-md px-2 pt-1.5 pb-2.5 text-sm font-bold text-foreground transition-colors outline-none hover:text-highlight focus-visible:bg-accent/70 data-[status=active]:text-highlight after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-highlight after:transition-transform after:duration-300 data-[status=active]:after:scale-x-100 motion-reduce:after:transition-none"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
