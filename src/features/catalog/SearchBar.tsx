import { Search, SlidersHorizontal } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  search: string | undefined
  activeFilterCount: number
  onSearch: (search: string | undefined) => void
  onOpenFilters: () => void
}

/**
 * A busca roda ao enviar (Enter / tecla "buscar" do teclado do celular), não a cada letra:
 * cada busca vira um passo do histórico e o voltar do navegador desfaz uma busca por vez.
 */
export function SearchBar({ search, activeFilterCount, onSearch, onOpenFilters }: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('busca')?.toString().trim()
    onSearch(value || undefined)
  }

  return (
    <div className="flex gap-3">
      <form role="search" className="relative flex-1" onSubmit={handleSubmit}>
        <label htmlFor="catalog-search" className="sr-only">
          Buscar NFTs
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          // key: quando a URL muda por fora (voltar do navegador, limpar filtros), o campo acompanha
          key={search ?? ''}
          id="catalog-search"
          name="busca"
          type="search"
          enterKeyHint="search"
          defaultValue={search}
          placeholder="Explorar coleções"
          className="h-12 w-full rounded-lg bg-card pr-4 pl-12 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </form>
      <Button
        size="icon-lg"
        onClick={onOpenFilters}
        aria-label={activeFilterCount > 0 ? `Abrir filtros (${activeFilterCount} ativos)` : 'Abrir filtros'}
        className="relative"
      >
        <SlidersHorizontal className="size-5" />
        {activeFilterCount > 0 && (
          <span aria-hidden className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  )
}
