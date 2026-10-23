import { createFileRoute } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import type { NftSort } from '@/api/nft'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { catalogSearchSchema, countActiveFilters, filtersFromSearch, searchFromFilters, toNftListParams, type CatalogFilters } from '@/features/catalog/catalogSearch'
import { HeroSkeleton, NftGridSkeleton } from '@/features/catalog/CatalogSkeletons'
import { FiltersSheet } from '@/features/catalog/FiltersSheet'
import { HeroCarousel } from '@/features/catalog/HeroCarousel'
import { NftGrid } from '@/features/catalog/NftGrid'
import { Pagination } from '@/features/catalog/Pagination'
import { SearchBar } from '@/features/catalog/SearchBar'
import { useNftList } from '@/features/nft/queries'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_tabs/')({
  validateSearch: catalogSearchSchema,
  component: HomePage,
})

// As abas do Figma são atalhos de ordenação. Ordenar por preço (na gaveta) deixa nenhuma aba marcada.
const tabSorts: { sort: NftSort; label: string }[] = [
  { sort: 'padrao', label: 'Todos os NFTs' },
  { sort: 'recentes', label: 'Novos lançamentos' },
  { sort: 'populares', label: 'Em alta' },
]

const FEATURED_PARAMS = { sort: 'populares', page: 1, pageSize: 3 } as const

function HomePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Fase 2.5: favoritos passam a vir da API (por usuário)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const filters = filtersFromSearch(search)
  const catalog = useNftList(toNftListParams(search))
  const featured = useNftList(FEATURED_PARAMS)

  function applyFilters(nextFilters: CatalogFilters) {
    navigate({ search: (previous) => ({ ...previous, ...searchFromFilters(nextFilters) }) })
  }

  function toggleFavorite(nftId: string) {
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (next.has(nftId)) next.delete(nftId)
      else next.add(nftId)
      return next
    })
  }

  const activeTab = tabSorts.some((tab) => tab.sort === filters.sort) ? filters.sort : ''

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-6">
      <h1 className="sr-only">Kurio — marketplace de NFTs</h1>
      <SearchBar
        search={search.busca}
        activeFilterCount={countActiveFilters(filters)}
        // Nova busca volta para a página 1
        onSearch={(busca) => navigate({ search: (previous) => ({ ...previous, busca, pagina: undefined }) })}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      {featured.isPending ? <HeroSkeleton /> : featured.data && featured.data.items.length > 0 && <HeroCarousel nfts={featured.data.items} />}

      <Tabs value={activeTab} onValueChange={(sort) => applyFilters({ ...filters, sort: sort as NftSort })}>
        {/* Rolagem lateral: em telas de 360px as três abas não cabem */}
        <div className="-mx-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* -ml-2 compensa o respiro interno da aba, alinhando o texto com o resto da página */}
          <TabsList className="-ml-2">
            {tabSorts.map((tab) => (
              <TabsTrigger key={tab.sort} value={tab.sort}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <section aria-label="Resultados" aria-busy={catalog.isFetching} className="flex flex-col gap-6">
        {/* Anuncia o resultado de cada busca/filtro para leitor de tela */}
        <p role="status" className="sr-only">
          {catalog.data && `${catalog.data.total} ${catalog.data.total === 1 ? 'NFT encontrado' : 'NFTs encontrados'}`}
        </p>

        <CatalogResults catalog={catalog} favoriteIds={favoriteIds} onFavoriteToggle={toggleFavorite} />
      </section>

      <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} filters={filters} onApply={applyFilters} />
    </main>
  )
}

interface CatalogResultsProps {
  catalog: ReturnType<typeof useNftList>
  favoriteIds: Set<string>
  onFavoriteToggle: (nftId: string) => void
}

/** Os estados da lista, um por vez: carregando, erro, vazio, sucesso (e atualizando por trás). */
function CatalogResults({ catalog, favoriteIds, onFavoriteToggle }: CatalogResultsProps) {
  if (catalog.isPending) return <NftGridSkeleton count={6} />

  if (catalog.isError && !catalog.data) {
    // 4xx não melhora tentando de novo (ex.: faixa de preço inválida digitada na URL)
    if (catalog.error.isClientError) {
      return <EmptyState icon={<SearchX />} title="Filtros inválidos" description={catalog.error.message} action={{ label: 'Limpar filtros', to: '/' }} />
    }
    return (
      <ErrorState
        title="Não foi possível carregar o catálogo"
        description={catalog.error.message}
        onRetry={() => catalog.refetch()}
        isRetrying={catalog.isFetching}
      />
    )
  }

  if (!catalog.data) return null
  const { items, total, page, pageSize } = catalog.data

  if (items.length === 0) {
    const pageBeyondEnd = total > 0
    return (
      <EmptyState
        icon={<SearchX />}
        title={pageBeyondEnd ? 'Esta página não existe' : 'Nenhum NFT encontrado'}
        description={pageBeyondEnd ? 'O catálogo tem menos páginas agora.' : 'Tente outra busca ou remova alguns filtros.'}
        action={{ label: pageBeyondEnd ? 'Ir para a primeira página' : 'Limpar filtros', to: '/' }}
      />
    )
  }

  return (
    <>
      {/* Falhou só a atualização em segundo plano: a lista anterior continua útil */}
      {catalog.isError && (
        <p role="alert" className="flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 text-sm">
          Não foi possível atualizar a lista.
          <button type="button" onClick={() => catalog.refetch()} className="shrink-0 cursor-pointer font-bold text-highlight">
            Tentar de novo
          </button>
        </p>
      )}
      {/* Esmaecida enquanto a próxima página/filtro carrega: a anterior fica no lugar, sem pular layout */}
      <div className={cn('transition-opacity', catalog.isPlaceholderData && 'opacity-50')}>
        <NftGrid nfts={items} favoriteIds={favoriteIds} onFavoriteToggle={onFavoriteToggle} />
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / pageSize)} />
    </>
  )
}
