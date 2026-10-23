import { Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SearchBar({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className="flex gap-3">
      <form role="search" className="relative flex-1" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="catalog-search" className="sr-only">
          Buscar NFTs
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          id="catalog-search"
          type="search"
          placeholder="Explorar coleções"
          className="h-12 w-full rounded-lg bg-card pr-4 pl-12 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </form>
      <Button size="icon-lg" onClick={onOpenFilters} aria-label="Abrir filtros">
        <SlidersHorizontal className="size-5" />
      </Button>
    </div>
  )
}
