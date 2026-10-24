import { Link } from '@tanstack/react-router'

/** Trilha do Figma desktop ("Início / Mercado / ..."). O último item é a página atual. */
export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Trilha de navegação" className="hidden text-sm font-bold md:block">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="rounded-sm outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50">
            Início
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link to="/" hash="catalogo" className="rounded-sm outline-none hover:text-highlight focus-visible:ring-[3px] focus-visible:ring-ring/50">
            Mercado
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="truncate text-muted-foreground">
          {current}
        </li>
      </ol>
    </nav>
  )
}
