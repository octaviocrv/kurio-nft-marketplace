import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
}

const itemClasses =
  'flex size-9 items-center justify-center rounded-md border border-border text-sm outline-none transition-colors hover:border-border-soft focus-visible:ring-[3px] focus-visible:ring-ring/50'

/**
 * Paginação do catálogo (Figma desktop: números + seta). São links de verdade: cada página
 * é uma URL (?pagina=2), então dá para abrir em outra aba e o voltar do navegador funciona.
 * Mantém busca e filtros da URL atual e troca só a página.
 */
export function Pagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav aria-label="Paginação do catálogo" className="flex justify-center md:justify-end">
      <ul className="flex items-center gap-2">
        <li>
          <PageArrow page={page - 1} disabled={page === 1} label="Página anterior">
            <ChevronLeft className="size-4" />
          </PageArrow>
        </li>
        {pages.map((number) => (
          <li key={number}>
            <Link
              to="/"
              search={(previous) => ({ ...previous, pagina: number === 1 ? undefined : number })}
              aria-label={`Página ${number}`}
              aria-current={number === page ? 'page' : undefined}
              className={cn(itemClasses, number === page && 'border-primary bg-primary font-bold text-primary-foreground hover:border-primary')}
            >
              {number}
            </Link>
          </li>
        ))}
        <li>
          <PageArrow page={page + 1} disabled={page === totalPages} label="Próxima página">
            <ChevronRight className="size-4" />
          </PageArrow>
        </li>
      </ul>
    </nav>
  )
}

function PageArrow({ page, disabled, label, children }: { page: number; disabled: boolean; label: string; children: React.ReactNode }) {
  // Na primeira/última página a seta não leva a lugar nenhum: vira texto desabilitado, não um link morto
  if (disabled) {
    return (
      <span aria-hidden className={cn(itemClasses, 'cursor-not-allowed opacity-40 hover:border-border')}>
        {children}
      </span>
    )
  }
  return (
    <Link to="/" search={(previous) => ({ ...previous, pagina: page === 1 ? undefined : page })} aria-label={label} className={itemClasses}>
      {children}
    </Link>
  )
}
