import { useLocation, useNavigate } from '@tanstack/react-router'
import { favoriteIds as toFavoriteIds } from '@/api/favorite'
import type { Nft } from '@/api/nft'
import { useOptionalSession } from '@/features/auth/queries'
import { useFavorites, useToggleFavorite } from './queries'

/** Favoritar de qualquer vitrine: sem sessão, leva ao login e volta para a mesma página. */
export function useFavoriteActions() {
  const navigate = useNavigate()
  const currentHref = useLocation({ select: (location) => location.href })
  const session = useOptionalSession()
  const userId = session.data?.user.id
  const favorites = useFavorites(userId)
  const toggleFavorite = useToggleFavorite(userId)
  const favoriteIds = toFavoriteIds(favorites.data)

  function toggle(nft: Nft) {
    if (!userId) {
      void navigate({ to: '/login', search: { redirect: currentHref } })
      return
    }
    toggleFavorite.mutate({ nft, isFavorite: favoriteIds.has(nft.id) })
  }

  return {
    favoriteIds,
    disabled: session.fetchStatus === 'fetching' || favorites.isFetching || toggleFavorite.isPending,
    toggle,
    error: toggleFavorite.error,
  }
}
