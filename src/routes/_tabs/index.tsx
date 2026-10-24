import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { favoriteIds as toFavoriteIds } from '@/api/favorite'
import type { Nft } from '@/api/nft'
import type { NftSort } from '@/api/nft'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useOptionalSession } from '@/features/auth/queries'
import { catalogSearchSchema, countActiveFilters, filtersFromSearch, searchFromFilters, toNftListParams, type CatalogFilters } from '@/features/catalog/catalogSearch'
import { BlogTeaser } from '@/features/catalog/BlogTeaser'
import { HeroSkeleton, NftGridSkeleton } from '@/features/catalog/CatalogSkeletons'
import { FeaturedOffer } from '@/features/catalog/FeaturedOffer'
import { FiltersSheet, FiltersSidebar } from '@/features/catalog/FiltersSheet'
import { HeroCarousel } from '@/features/catalog/HeroCarousel'
import { NftGrid } from '@/features/catalog/NftGrid'
import { Pagination } from '@/features/catalog/Pagination'
import { PromoBanners } from '@/features/catalog/PromoBanners'
import { SearchBar } from '@/features/catalog/SearchBar'
import { SortSelect } from '@/features/catalog/SortSelect'
import { SortShortcuts } from '@/features/catalog/SortShortcuts'
import { FavoriteFeedback } from '@/features/favorite/FavoriteFeedback'
import { useFavorites, useToggleFavorite } from '@/features/favorite/queries'
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
  const currentHref = useLocation({ select: (location) => location.href })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const session = useOptionalSession()
  const userId = session.data?.user.id
  const favorites = useFavorites(userId)
  const toggleFavorite = useToggleFavorite(userId)
  const favoriteIds = toFavoriteIds(favorites.data)

  const filters = filtersFromSearch(search)
  const catalog = useNftList(toNftListParams(search))
  const featured = useNftList(FEATURED_PARAMS)

  function applyFilters(nextFilters: CatalogFilters) {
    navigate({ search: (previous) => ({ ...previous, ...searchFromFilters(nextFilters) }) })
  }

  function handleFavoriteToggle(nft: Nft) {
    if (!userId) {
      void navigate({ to: '/login', search: { redirect: currentHref } })
      return
    }
    toggleFavorite.mutate({ nft, isFavorite: favoriteIds.has(nft.id) })
  }

  // Card da sidebar: prefere um destaque com desconto, para o "Oferta limitada" ser verdade
  const featuredOffer = featured.data?.items.find((nft) => nft.previousPrice !== null) ?? featured.data?.items[0]

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-6 md:page-container md:gap-12 md:pt-10">
      <h1 className="sr-only">Kurio — marketplace de NFTs</h1>
      {/* Desktop busca pelo header e filtra pela sidebar; mobile e tablet usam a barra com a gaveta */}
      <div className="lg:hidden">
        <SearchBar
          search={search.busca}
          activeFilterCount={countActiveFilters(filters)}
          // Nova busca volta para a página 1
          onSearch={(busca) => navigate({ search: (previous) => ({ ...previous, busca, pagina: undefined }) })}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>

      {featured.isPending ? <HeroSkeleton /> : featured.data && featured.data.items.length > 0 && <HeroCarousel nfts={featured.data.items} />}

      {/* Âncora do "Mercado" do header */}
      <div id="catalogo" className="flex scroll-mt-6 flex-col gap-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside aria-label="Filtros e destaque" className="hidden flex-col gap-8 lg:flex">
          <FiltersSidebar filters={filters} onApply={applyFilters} />
          {featuredOffer && <FeaturedOffer nft={featuredOffer} />}
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Sem campo de busca no desktop: mostra o termo aplicado e como desfazer */}
          {search.busca && (
            <p className="hidden items-center gap-3 text-sm lg:flex">
              Resultados para “{search.busca}”
              <Link
                to="/"
                search={(previous) => ({ ...previous, busca: undefined, pagina: undefined })}
                className="rounded-sm font-bold text-highlight outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Limpar busca
              </Link>
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            {/* Rolagem lateral: em telas de 360px os três atalhos não cabem */}
            <div className="-mx-6 min-w-0 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
              <SortShortcuts shortcuts={tabSorts} activeSort={filters.sort} onSortChange={(sort) => applyFilters({ ...filters, sort })} />
            </div>
            <div className="hidden lg:block">
              <SortSelect sort={filters.sort} onSortChange={(sort) => applyFilters({ ...filters, sort })} />
            </div>
          </div>

          <section aria-label="Resultados" aria-busy={catalog.isFetching} className="flex flex-col gap-6 md:gap-8">
            {/* Anuncia o resultado de cada busca/filtro para leitor de tela */}
            <p role="status" className="sr-only">
              {catalog.data && `${catalog.data.total} ${catalog.data.total === 1 ? 'NFT encontrado' : 'NFTs encontrados'}`}
            </p>

            <FavoriteFeedback error={toggleFavorite.error} />
            <CatalogResults
              catalog={catalog}
              favoriteIds={favoriteIds}
              favoriteDisabled={session.fetchStatus === 'fetching' || favorites.isFetching || toggleFavorite.isPending}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </section>
        </div>
      </div>

      {/* Promos e blog só existem no Figma desktop; no mobile o Início termina no catálogo */}
      <div className="hidden flex-col gap-16 md:flex">
        <PromoBanners />
        <BlogTeaser />
      </div>

      <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} filters={filters} onApply={applyFilters} />
    </main>
  )
}

interface CatalogResultsProps {
  catalog: ReturnType<typeof useNftList>
  favoriteIds: Set<string>
  favoriteDisabled: boolean
  onFavoriteToggle: (nft: Nft) => void
}

/** Os estados da lista, um por vez: carregando, erro, vazio, sucesso (e atualizando por trás). */
function CatalogResults({ catalog, favoriteIds, favoriteDisabled, onFavoriteToggle }: CatalogResultsProps) {
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
        <NftGrid nfts={items} favoriteIds={favoriteIds} favoriteDisabled={favoriteDisabled} onFavoriteToggle={onFavoriteToggle} />
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / pageSize)} />
    </>
  )
}
