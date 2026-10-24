import { createFileRoute } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { favoriteIds as toFavoriteIds } from '@/api/favorite'
import type { Nft } from '@/api/nft'
import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useSession } from '@/features/auth/queries'
import { NftGridSkeleton } from '@/features/catalog/CatalogSkeletons'
import { NftGrid } from '@/features/catalog/NftGrid'
import { FavoriteFeedback } from '@/features/favorite/FavoriteFeedback'
import { useFavorites, useToggleFavorite } from '@/features/favorite/queries'
import { requireSession } from '@/features/auth/queries'

export const Route = createFileRoute('/_tabs/favoritos')({
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: FavoritesPage,
})

function FavoritesPage() {
  const session = useSession()
  const userId = session.data?.user.id
  const favorites = useFavorites(userId)
  const toggleFavorite = useToggleFavorite(userId)
  const ids = toFavoriteIds(favorites.data)

  function removeFavorite(nft: Nft) {
    toggleFavorite.mutate({ nft, isFavorite: true })
  }

  return (
    // Altura da tela menos a tab bar: o estado vazio centraliza no espaço que sobra (no desktop, só o conteúdo)
    <main className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-md flex-col gap-6 px-6 pt-8 md:page-container md:min-h-[50vh]">
      {/* No mobile a tab bar leva às telas principais, mas não desfaz o caminho de onde se chegou aqui */}
      <div className="flex items-center gap-3">
        <BackButton className="md:hidden" />
        <h1 className="text-xl font-bold">Favoritos</h1>
      </div>
      <FavoriteFeedback error={toggleFavorite.error} />
      {favorites.isPending ? (
        <NftGridSkeleton count={4} />
      ) : favorites.isError ? (
        <ErrorState
          title="Não foi possível carregar seus favoritos"
          description={favorites.error.message}
          onRetry={() => favorites.refetch()}
          isRetrying={favorites.isFetching}
        />
      ) : favorites.data.items.length > 0 ? (
        // Mesmo grid do Início (o plano da fase 1 pede reaproveitar)
        <NftGrid
          nfts={favorites.data.items}
          favoriteIds={ids}
          favoriteDisabled={toggleFavorite.isPending}
          onFavoriteToggle={removeFavorite}
        />
      ) : (
        <EmptyState
          icon={<Heart />}
          title="Nenhum favorito ainda"
          description="Toque no coração de um NFT para guardá-lo aqui."
          action={{ label: 'Explorar NFTs', to: '/' }}
        />
      )}
    </main>
  )
}
