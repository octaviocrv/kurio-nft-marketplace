import { createFileRoute } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { NftGrid } from '@/features/catalog/NftGrid'
import { requireSession } from '@/features/auth/queries'
// fase 1: viram hook de Query (favoritos do usuário logado) na fase 2
import { favoriteIdsByUserId } from '@/mocks/fixtures/favorites'
import { nfts } from '@/mocks/fixtures/nfts'

export const Route = createFileRoute('/_tabs/favoritos')({
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location.href),
  component: FavoritesPage,
})

function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(favoriteIdsByUserId['user-nova']))
  const favoriteNfts = nfts.filter((nft) => favoriteIds.has(nft.id))

  // Aqui o coração só remove: desfavoritar tira o card da lista na hora
  function removeFavorite(nftId: string) {
    setFavoriteIds((current) => {
      const next = new Set(current)
      next.delete(nftId)
      return next
    })
  }

  return (
    // Altura da tela menos a tab bar: o estado vazio centraliza no espaço que sobra
    <main className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-md flex-col gap-6 px-6 pt-8">
      <h1 className="text-xl font-bold">Favoritos</h1>
      {favoriteNfts.length > 0 ? (
        // Mesmo grid do Início (o plano da fase 1 pede reaproveitar)
        <NftGrid nfts={favoriteNfts} favoriteIds={favoriteIds} onFavoriteToggle={removeFavorite} />
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
