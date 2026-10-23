import { http, HttpResponse } from 'msw'
import { addCartItemInputSchema, updateCartItemInputSchema } from '@/api/cart'
import { cartForOwner, cartResponse } from '../cartStore'
import { db, saveDb } from '../db'
import { errorResponse } from '../http'
import { cartOwnerFromRequest } from './cartIdentity'

function unauthorized() {
  return errorResponse(401, { code: 'unauthorized', message: 'Sua sessão expirou. Entre novamente.' })
}

export const cartHandlers = [
  http.get('/api/cart/items', ({ request }) => {
    const ownerId = cartOwnerFromRequest(request)
    return ownerId ? HttpResponse.json(cartResponse(ownerId)) : unauthorized()
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const ownerId = cartOwnerFromRequest(request)
    if (!ownerId) return unauthorized()
    const parsed = addCartItemInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse(422, { code: 'validation_error', message: 'Item do carrinho inválido.' })

    const nft = db.nfts.find((item) => item.id === parsed.data.nftId)
    const edition = nft?.editions.find((item) => item.id === parsed.data.editionId)
    if (!nft || !edition) return errorResponse(404, { code: 'not_found', message: 'NFT ou edição não encontrado.' })

    const items = cartForOwner(ownerId)
    const existing = items.find((item) => item.nftId === nft.id && item.editionId === edition.id)
    const nextQuantity = (existing?.quantity ?? 0) + parsed.data.quantity
    if (nextQuantity > edition.available) {
      return errorResponse(409, { code: 'conflict', message: `Só há ${edition.available} unidades disponíveis nesta edição.` })
    }

    if (existing) existing.quantity = nextQuantity
    else items.push({ id: `cart-${crypto.randomUUID()}`, ...parsed.data, unitPriceAtAdd: nft.price })
    saveDb()
    return HttpResponse.json(cartResponse(ownerId), { status: 201 })
  }),

  http.patch('/api/cart/items/:itemId', async ({ request, params }) => {
    const ownerId = cartOwnerFromRequest(request)
    if (!ownerId) return unauthorized()
    const parsed = updateCartItemInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse(422, { code: 'validation_error', message: 'Quantidade inválida.' })

    const item = cartForOwner(ownerId).find((candidate) => candidate.id === params.itemId)
    if (!item) return errorResponse(404, { code: 'not_found', message: 'Item não encontrado no carrinho.' })
    const nft = db.nfts.find((candidate) => candidate.id === item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
    if (!edition) return errorResponse(404, { code: 'not_found', message: 'Edição não encontrada.' })
    if (parsed.data.quantity > edition.available) {
      return errorResponse(409, { code: 'conflict', message: `Só há ${edition.available} unidades disponíveis nesta edição.` })
    }

    item.quantity = parsed.data.quantity
    saveDb()
    return HttpResponse.json(cartResponse(ownerId))
  }),

  http.delete('/api/cart/items/:itemId', ({ request, params }) => {
    const ownerId = cartOwnerFromRequest(request)
    if (!ownerId) return unauthorized()
    const items = cartForOwner(ownerId)
    const index = items.findIndex((item) => item.id === params.itemId)
    if (index < 0) return errorResponse(404, { code: 'not_found', message: 'Item não encontrado no carrinho.' })
    items.splice(index, 1)
    saveDb()
    return HttpResponse.json(cartResponse(ownerId))
  }),
]
