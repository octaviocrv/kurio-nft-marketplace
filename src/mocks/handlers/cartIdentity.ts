import { guestCartOwner, userCartOwner } from '../cartStore'
import { sessionFromRequest } from './auth'

export function guestIdFromRequest(request: Request): string | null {
  const guestId = request.headers.get('X-Guest-Id')?.trim()
  return guestId && guestId.length <= 100 ? guestId : null
}

/** Com token, nunca cai silenciosamente no carrinho anônimo: sessão inválida é 401. */
export function cartOwnerFromRequest(request: Request): string | null {
  if (request.headers.has('Authorization')) {
    const session = sessionFromRequest(request)
    return session ? userCartOwner(session.userId) : null
  }
  const guestId = guestIdFromRequest(request)
  return guestId ? guestCartOwner(guestId) : null
}
