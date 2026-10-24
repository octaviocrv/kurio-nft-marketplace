import { Check } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { isValidPriceRange, nftCategorySchema, nftSortSchema, PRICE_RANGE_MESSAGE, type NftSort } from '@/api/nft'
import { ethAmountSchema, networkSchema } from '@/api/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useReturnFocus } from '@/lib/useReturnFocus'
import { cn } from '@/lib/utils'
import type { CatalogFilters } from './catalogSearch'
import { categoryLabels, networkLabels, sortLabels } from './labels'

interface FiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CatalogFilters // o que está aplicado agora (vem da URL)
  onApply: (filters: CatalogFilters) => void
}

const emptyFilters: CatalogFilters = { categories: [], networks: [], sort: 'padrao' }

// Sem frame mobile no Figma: mesmo conteúdo da sidebar desktop (coleções, preço, rede) + ordenação,
// em ordem de uso. Nada muda na lista até "Aplicar": combinar vários filtros faz uma consulta só.
// Mobile e tablet usam a gaveta; o desktop usa a sidebar (FiltersSidebar), com o mesmo formulário.
export function FiltersSheet({ open, onOpenChange, filters, onApply }: FiltersSheetProps) {
  // Aberta por estado (sem DialogTrigger): o foco volta ao botão "Abrir filtros" ao fechar
  const returnFocus = useReturnFocus()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false} className="gap-0" {...returnFocus}>
        {/* O conteúdo desmonta ao fechar: cada abertura começa do que está aplicado na URL */}
        <FiltersForm
          variant="sheet"
          initialFilters={filters}
          onApply={(nextFilters) => {
            onApply(nextFilters)
            onOpenChange(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}

interface FiltersSidebarProps {
  filters: CatalogFilters
  onApply: (filters: CatalogFilters) => void
}

/** Filtros fixos na lateral do catálogo (desktop do Figma). A ordenação fica no select acima do grid. */
export function FiltersSidebar({ filters, onApply }: FiltersSidebarProps) {
  return (
    <section aria-labelledby="sidebar-filters-title" className="rounded-lg bg-card px-5 py-2">
      <h2 id="sidebar-filters-title" className="sr-only">
        Filtros
      </h2>
      {/* key: filtro aplicado por outro caminho (aba, ordenação, voltar do navegador) recomeça o rascunho */}
      <FiltersForm key={JSON.stringify(filters)} variant="sidebar" initialFilters={filters} onApply={onApply} />
    </section>
  )
}

/** Valor digitado → ETH do contrato ("0,5" vira "0.5"; o teclado decimal do celular usa vírgula). */
function normalizePrice(value: string): string {
  return value.trim().replace(',', '.')
}

interface FiltersFormProps {
  variant: 'sheet' | 'sidebar'
  initialFilters: CatalogFilters
  onApply: (filters: CatalogFilters) => void
}

function FiltersForm({ variant, initialFilters, onApply }: FiltersFormProps) {
  const [draft, setDraft] = useState(initialFilters)
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice ?? '')
  const [priceError, setPriceError] = useState<string | null>(null)
  const priceErrorId = useId()

  function toggle<Value extends string>(list: Value[], value: Value): Value[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  function clearAll() {
    // Na sidebar a ordenação não faz parte do formulário: limpar não mexe nela
    setDraft(variant === 'sheet' ? emptyFilters : { ...emptyFilters, sort: initialFilters.sort })
    setMinPrice('')
    setMaxPrice('')
    setPriceError(null)
  }

  function apply() {
    const min = normalizePrice(minPrice) || undefined
    const max = normalizePrice(maxPrice) || undefined
    // Mesmas regras do contrato (ethAmountSchema e faixa) que o handler da API valida
    if ((min && !ethAmountSchema.safeParse(min).success) || (max && !ethAmountSchema.safeParse(max).success)) {
      setPriceError('Use um valor em ETH, por exemplo 0.5')
      return
    }
    if (!isValidPriceRange({ minPrice: min, maxPrice: max })) {
      setPriceError(PRICE_RANGE_MESSAGE)
      return
    }
    onApply({ ...draft, minPrice: min, maxPrice: max })
  }

  const sortSection = (
    <FilterSection key="sort" title="Ordenar por">
      <Select value={draft.sort} onValueChange={(value) => setDraft({ ...draft, sort: value as NftSort })}>
        <SelectTrigger aria-label="Ordenar por" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {nftSortSchema.options.map((sort) => (
            <SelectItem key={sort} value={sort}>{sortLabels[sort]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterSection>
  )

  // Na sidebar (280 px) as opções ficam em lista, como no Figma; na gaveta, em grade
  const networkSection = (
    <FilterSection key="network" title="Rede">
      <div className={cn('grid gap-2', variant === 'sheet' ? 'grid-cols-3' : 'grid-cols-1')}>
        {networkSchema.options.map((network) => (
          <FilterOption
            key={network}
            label={networkLabels[network]}
            pressed={draft.networks.includes(network)}
            onToggle={() => setDraft({ ...draft, networks: toggle(draft.networks, network) })}
          />
        ))}
      </div>
    </FilterSection>
  )

  const categorySection = (
    <FilterSection key="category" title="Coleções">
      <div className={cn('grid gap-2', variant === 'sheet' ? 'grid-cols-2' : 'grid-cols-1')}>
        {nftCategorySchema.options.map((category) => (
          <FilterOption
            key={category}
            label={categoryLabels[category]}
            pressed={draft.categories.includes(category)}
            onToggle={() => setDraft({ ...draft, categories: toggle(draft.categories, category) })}
          />
        ))}
      </div>
    </FilterSection>
  )

  const priceSection = (
    <FilterSection key="price" title="Faixa de preço">
      <div className="flex items-center gap-3">
        <PriceInput label="Preço mínimo" placeholder="Mín." value={minPrice} onChange={setMinPrice} errorId={priceError ? priceErrorId : undefined} />
        <span className="text-sm text-muted-foreground">até</span>
        <PriceInput label="Preço máximo" placeholder="Máx." value={maxPrice} onChange={setMaxPrice} errorId={priceError ? priceErrorId : undefined} />
      </div>
      {priceError && (
        <p id={priceErrorId} role="alert" className="text-sm text-destructive">
          {priceError}
        </p>
      )}
    </FilterSection>
  )

  if (variant === 'sidebar') {
    // Ordem do Figma desktop: coleções, preço, rede
    return (
      <div className="flex flex-col divide-y divide-border">
        {categorySection}
        {priceSection}
        {networkSection}
        <div className="flex items-center justify-between gap-3 py-5">
          <Button onClick={apply}>Aplicar filtros</Button>
          <Button variant="link" className="h-auto p-0" onClick={clearAll}>
            Limpar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Alça: indica que a gaveta pode ser arrastada/fechada para baixo */}
      <div aria-hidden className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-soft" />

      <SheetHeader className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <SheetTitle className="text-lg">Filtros</SheetTitle>
        <SheetDescription className="sr-only">Combine ordenação, rede, coleção e faixa de preço.</SheetDescription>
        <Button variant="link" className="h-auto p-0" onClick={clearAll}>
          Limpar
        </Button>
      </SheetHeader>

      <div className="flex flex-col divide-y divide-border overflow-y-auto px-6">
        {sortSection}
        {networkSection}
        {categorySection}
        {priceSection}
      </div>

      <SheetFooter className="border-t border-border px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button size="lg" className="rounded-xl" onClick={apply}>
          Aplicar filtros
        </Button>
      </SheetFooter>
    </>
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
function FilterOption({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
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

interface PriceInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  errorId?: string
}

function PriceInput({ label, placeholder, value, onChange, errorId }: PriceInputProps) {
  return (
    <div className="relative flex-1">
      <Input
        aria-label={label}
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        className="pr-12"
      />
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted-foreground">
        ETH
      </span>
    </div>
  )
}
