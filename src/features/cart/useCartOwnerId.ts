import { useOptionalSession } from '@/features/auth/queries'
import { getSessionToken } from '@/features/auth/sessionStorage'
import { cartOwnerId } from './guestIdentity'

/**
 * Dono do carrinho da tela atual: o usuário logado ou o visitante.
 * Com token salvo, espera a sessão responder (undefined): senão o carrinho do visitante
 * apareceria por um instante antes do carrinho do usuário.
 */
export function useCartOwnerId(): string | undefined {
  const session = useOptionalSession()
  const userId = session.data?.user.id
  if (userId) return cartOwnerId(userId)
  if (getSessionToken() !== null && session.isPending) return undefined
  return cartOwnerId()
}
