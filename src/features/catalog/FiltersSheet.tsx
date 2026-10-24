import { Check } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { nftCategorySchema, nftSortSchema, type NftSort } from '@/api/nft'
import { networkSchema } from '@/api/shared'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { toEthString } from '@/lib/eth'
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
      <SheetContent side="bottom" showCloseButton={false} className="gap-0 rounded-t-3xl" {...returnFocus}>
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
    <section aria-labelledby="sidebar-filters-title" className="rounded-xl border border-border bg-card px-5 py-3">
      <h2 id="sidebar-filters-title" className="sr-only">
        Filtros
      </h2>
      {/* key: filtro aplicado por outro caminho (aba, ordenação, voltar do navegador) recomeça o rascunho */}
      <FiltersForm key={JSON.stringify(filters)} variant="sidebar" initialFilters={filters} onApply={onApply} />
    </section>
  )
}

// O slider trabalha em centésimos de ETH (inteiros): sem erro de ponto flutuante e sem valor inválido possível.
// Limites = menor e maior preço do catálogo (a API não devolve faixa); passo de 0,01 ETH.
const PRICE_MIN_CENTS = 2
const PRICE_MAX_CENTS = 1230
const WEI_PER_CENT = 10n ** 16n

type PriceRange = [min: number, max: number]

/** ETH da URL ("1.2") → posição do slider, presa aos limites. Sem valor, a ponta fica no limite. */
function ethToCents(eth: string | undefined, fallback: number): number {
  if (!eth) return fallback
  return Math.min(PRICE_MAX_CENTS, Math.max(PRICE_MIN_CENTS, Math.round(Number(eth) * 100)))
}

/** Posição do slider → ETH do contrato ("120" vira "1.2"). */
function centsToEth(cents: number): string {
  return toEthString(BigInt(cents) * WEI_PER_CENT)
}

/** Para a tela, com vírgula e duas casas, como no Figma ("0,02"). */
function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

interface FiltersFormProps {
  variant: 'sheet' | 'sidebar'
  initialFilters: CatalogFilters
  onApply: (filters: CatalogFilters) => void
}

function FiltersForm({ variant, initialFilters, onApply }: FiltersFormProps) {
  const [draft, setDraft] = useState(initialFilters)
  const [priceRange, setPriceRange] = useState<PriceRange>([
    ethToCents(initialFilters.minPrice, PRICE_MIN_CENTS),
    ethToCents(initialFilters.maxPrice, PRICE_MAX_CENTS),
  ])

  function toggle<Value extends string>(list: Value[], value: Value): Value[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  function clearAll() {
    // Na sidebar a ordenação não faz parte do formulário: limpar não mexe nela
    setDraft(variant === 'sheet' ? emptyFilters : { ...emptyFilters, sort: initialFilters.sort })
    setPriceRange([PRICE_MIN_CENTS, PRICE_MAX_CENTS])
  }

  function apply() {
    const [minCents, maxCents] = priceRange
    // Ponta no limite = sem filtro naquele lado (a URL só guarda o que o usuário restringiu)
    onApply({
      ...draft,
      minPrice: minCents > PRICE_MIN_CENTS ? centsToEth(minCents) : undefined,
      maxPrice: maxCents < PRICE_MAX_CENTS ? centsToEth(maxCents) : undefined,
    })
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
      <Slider
        min={PRICE_MIN_CENTS}
        max={PRICE_MAX_CENTS}
        step={1}
        value={priceRange}
        onValueChange={(value) => setPriceRange(value as PriceRange)}
        thumbLabels={['Preço mínimo', 'Preço máximo']}
        getValueText={(cents) => `${formatCents(cents)} ETH`}
      />
      <p className="text-sm text-muted-foreground">
        Preço: {formatCents(priceRange[0])} - {formatCents(priceRange[1])} ETH
      </p>
    </FilterSection>
  )

  if (variant === 'sidebar') {
    // Ordem do Figma desktop: coleções, preço, rede
    return (
      <div className="flex flex-col">
        {categorySection}
        {priceSection}
        {networkSection}
        <div className="flex items-center justify-between gap-3 pt-3 pb-4">
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

      <div className="flex flex-col overflow-y-auto px-6">
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
    <section role="group" aria-labelledby={titleId} className="flex flex-col gap-2 py-4">
      {/* Título branco e em negrito; as opções ficam em tom mais suave e recuadas: a hierarquia do Figma */}
      <h3 id={titleId} className="text-base font-bold text-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * Opção liga/desliga (aria-pressed): filtros são combináveis, então cada uma é independente.
 * Selecionada = laranja + check (a cor sozinha não basta para quem não distingue cores).
 */
function FilterOption({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'flex h-9 cursor-pointer items-center justify-between gap-2 rounded-md px-2 text-left text-sm text-muted-foreground transition-colors outline-none',
        'hover:bg-secondary/60 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-pressed:font-medium aria-pressed:text-highlight',
      )}
    >
      <span className="truncate">{label}</span>
      {pressed && <Check aria-hidden className="size-4 shrink-0" />}
    </button>
  )
}
