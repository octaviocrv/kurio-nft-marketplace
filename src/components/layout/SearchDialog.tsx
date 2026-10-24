import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface SearchDialogProps {
  onSearch: (search: string | undefined) => void
}

/**
 * No desktop do Figma a busca é só o ícone do header. Ele abre este diálogo (o Radix prende o foco
 * e devolve ao ícone ao fechar) e a busca vai para a URL do catálogo, como no campo do mobile.
 */
export function SearchDialog({ onSearch }: SearchDialogProps) {
  const [open, setOpen] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('busca')?.toString().trim()
    onSearch(value || undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Buscar NFTs">
          <Search className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-24 translate-y-0 sm:max-w-xl">
        <DialogTitle>Buscar NFTs</DialogTitle>
        <DialogDescription>Procure pelo nome do NFT.</DialogDescription>
        <form role="search" className="flex gap-3" onSubmit={handleSubmit}>
          <label htmlFor="header-search" className="sr-only">
            Buscar NFTs
          </label>
          <input
            id="header-search"
            name="busca"
            type="search"
            enterKeyHint="search"
            placeholder="Explorar coleções"
            className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Button type="submit">Buscar</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
