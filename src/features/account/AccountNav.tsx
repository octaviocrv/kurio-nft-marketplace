import { Link } from '@tanstack/react-router'

const links = [
  { to: '/conta/perfil', label: 'Dados do perfil' },
  { to: '/conta/carteiras', label: 'Carteiras' },
] as const

// Seletor segmentado entre as duas páginas da conta. São links (não abas): cada uma tem URL própria.
// Os outros itens da sidebar desktop (Atividade, Ofertas...) estão fora do escopo e entram desabilitados na fase 3.
export function AccountNav() {
  return (
    <nav aria-label="Conta" className="grid grid-cols-2 gap-1 rounded-xl bg-card p-1">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="rounded-lg py-2.5 text-center text-sm font-bold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:bg-secondary data-[status=active]:text-highlight"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
