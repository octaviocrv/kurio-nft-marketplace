import { useState } from 'react'
import { nftCategorySchema } from '@/api/nft'
import { networkSchema } from '@/api/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { categoryLabels, networkLabels, sortOptions } from './labels'

interface FiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Sem frame mobile no Figma: segue o conteúdo da sidebar desktop (coleções, preço, rede) + ordenação.
// Fase 1 é só visual; na fase 2 os valores passam a viver na URL.
export function FiltersSheet({ open, onOpenChange }: FiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle className="text-lg">Filtros</SheetTitle>
          <SheetDescription>Combine coleção, rede, preço e ordenação.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
          <FilterGroup title="Coleções" options={nftCategorySchema.options.map((value) => ({ value, label: categoryLabels[value] }))} />
          <FilterGroup title="Rede" options={networkSchema.options.map((value) => ({ value, label: networkLabels[value] }))} />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">Faixa de preço (ETH)</legend>
            <div className="flex items-center gap-3">
              <Label htmlFor="price-min" className="sr-only">Preço mínimo</Label>
              <Input id="price-min" inputMode="decimal" placeholder="Mín." />
              <span aria-hidden className="text-muted-foreground">–</span>
              <Label htmlFor="price-max" className="sr-only">Preço máximo</Label>
              <Input id="price-max" inputMode="decimal" placeholder="Máx." />
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sort" className="font-bold">Ordenar por</Label>
            <Select defaultValue="recentes">
              <SelectTrigger id="sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row border-t border-border">
          <Button variant="outline" className="flex-1">Limpar</Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>Aplicar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FilterGroup({ title, options }: { title: string; options: { value: string; label: string }[] }) {
  return (
    <fieldset>
      <legend className="mb-3 font-bold">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          // Botão "liga/desliga" (aria-pressed): filtros são combináveis, então cada um é independente
          <FilterChip key={option.value} label={option.label} />
        ))}
      </div>
    </fieldset>
  )
}

function FilterChip({ label }: { label: string }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => setPressed(!pressed)}
      className="cursor-pointer rounded-full border border-border-soft px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:text-highlight"
    >
      {label}
    </button>
  )
}
