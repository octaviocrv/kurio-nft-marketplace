import { Check } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { nftCategorySchema } from '@/api/nft'
import { networkSchema } from '@/api/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { categoryLabels, networkLabels, sortOptions } from './labels'

interface FiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Sem frame mobile no Figma: mesmo conteúdo da sidebar desktop (coleções, preço, rede) + ordenação,
// em ordem de uso. Fase 1 é só visual; na fase 2 os valores passam a viver na URL.
export function FiltersSheet({ open, onOpenChange }: FiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false} className="gap-0">
        {/* Alça: indica que a gaveta pode ser arrastada/fechada para baixo */}
        <div aria-hidden className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-soft" />

        <SheetHeader className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <SheetTitle className="text-lg">Filtros</SheetTitle>
          <SheetDescription className="sr-only">Combine ordenação, rede, coleção e faixa de preço.</SheetDescription>
          <Button variant="link" className="h-auto p-0">
            Limpar
          </Button>
        </SheetHeader>

        <div className="flex flex-col divide-y divide-border overflow-y-auto px-6">
          <FilterSection title="Ordenar por">
            <Select defaultValue="recentes">
              <SelectTrigger aria-label="Ordenar por" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          <FilterSection title="Rede">
            <div className="grid grid-cols-3 gap-2">
              {networkSchema.options.map((network) => (
                <FilterOption key={network} label={networkLabels[network]} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Coleções">
            <div className="grid grid-cols-2 gap-2">
              {nftCategorySchema.options.map((category) => (
                <FilterOption key={category} label={categoryLabels[category]} />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Faixa de preço">
            <div className="flex items-center gap-3">
              <PriceInput label="Preço mínimo" placeholder="Mín." />
              <span className="text-sm text-muted-foreground">até</span>
              <PriceInput label="Preço máximo" placeholder="Máx." />
            </div>
          </FilterSection>
        </div>

        <SheetFooter className="border-t border-border px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button size="lg" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Aplicar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  const titleId = useId()
  return (
    // Grupo com título (em vez de fieldset/legend, que tem posicionamento especial e briga com flex)
    <section role="group" aria-labelledby={titleId} className="flex flex-col gap-3 py-5">
      <h3 id={titleId} className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

/** Opção liga/desliga (aria-pressed): filtros são combináveis, então cada uma é independente. */
function FilterOption({ label }: { label: string }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => setPressed(!pressed)}
      className={cn(
        'flex h-10 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors outline-none',
        'hover:border-border-soft hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-highlight',
      )}
    >
      <span className="truncate">{label}</span>
      {pressed && <Check aria-hidden className="size-4 shrink-0" />}
    </button>
  )
}

function PriceInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="relative flex-1">
      <Input aria-label={label} inputMode="decimal" placeholder={placeholder} className="pr-12" />
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted-foreground">
        ETH
      </span>
    </div>
  )
}
