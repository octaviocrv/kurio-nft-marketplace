import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { Nft } from '@/api/nft'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FiltersSheet } from '@/features/catalog/FiltersSheet'
import { HeroCarousel } from '@/features/catalog/HeroCarousel'
import { NftGrid } from '@/features/catalog/NftGrid'
import { SearchBar } from '@/features/catalog/SearchBar'
import { nfts } from '@/mocks/fixtures/nfts' // fase 1: vira hook de Query na fase 2

export const Route = createFileRoute('/_tabs/')({
  component: HomePage,
})

type CatalogTab = 'todos' | 'novos' | 'em-alta'

const PAGE_SIZE = 12

// Fase 1: ordenação feita aqui só para as abas terem efeito visível. Na fase 2 vira parâmetro da API.
function sortForTab(list: Nft[], tab: CatalogTab): Nft[] {
  if (tab === 'novos') return [...list].sort((a, b) => b.listedAt.localeCompare(a.listedAt))
  if (tab === 'em-alta') return [...list].sort((a, b) => b.favoriteCount - a.favoriteCount)
  return list
}

function HomePage() {
  const [tab, setTab] = useState<CatalogTab>('todos')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const featured = sortForTab(nfts, 'em-alta').slice(0, 3)
  const visibleNfts = sortForTab(nfts, tab).slice(0, PAGE_SIZE)

  function toggleFavorite(nftId: string) {
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (next.has(nftId)) next.delete(nftId)
      else next.add(nftId)
      return next
    })
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 pt-6">
      <h1 className="sr-only">Kurio — marketplace de NFTs</h1>
      <SearchBar onOpenFilters={() => setFiltersOpen(true)} />
      <HeroCarousel nfts={featured} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as CatalogTab)}>
        {/* Rolagem lateral: em telas de 360px as três abas não cabem */}
        <div className="-mx-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* -ml-2 compensa o respiro interno da aba, alinhando o texto com o resto da página */}
          <TabsList className="-ml-2">
            <TabsTrigger value="todos">Todos os NFTs</TabsTrigger>
            <TabsTrigger value="novos">Novos lançamentos</TabsTrigger>
            <TabsTrigger value="em-alta">Em alta</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <NftGrid nfts={visibleNfts} favoriteIds={favoriteIds} onFavoriteToggle={toggleFavorite} />
      <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </main>
  )
}
