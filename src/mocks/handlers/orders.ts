import { delay, http, HttpResponse } from 'msw'
import { createOrderInputSchema, orderSchema, type OrderItem } from '@/api/order'
import { multiplyWei, parseEth, toEthString } from '@/lib/eth'
import { userCartOwner } from '../cartStore'
import { db, saveDb } from '../db'
import { errorResponse } from '../http'
import { ensureOrderResolution } from '../orderStore'
import { calculateQuote, sameQuote } from '../quoteStore'
import { getScenario } from '../scenarios'
import { sessionFromRequest } from './auth'

const ORDER_RESOLUTION_MS = 1_500
const TIMEOUT_RESPONSE_MS = 8_500

function payloadHash(input: unknown): string {
  return JSON.stringify(input)
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const session = sessionFromRequest(request)
    if (!session) return errorResponse(401, { code: 'unauthorized', message: 'Entre para confirmar a compra.' })
    const parsed = createOrderInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse(422, { code: 'validation_error', message: 'Revise os dados do pedido.' })

    const key = request.headers.get('Idempotency-Key')?.trim()
    if (!key || key.length > 128) return errorResponse(422, { code: 'validation_error', message: 'Chave de idempotência inválida.' })
    const userKeys = (db.idempotencyByUserId[session.userId] ??= {})
    const existing = userKeys[key]
    const hash = payloadHash(parsed.data)
    if (existing) {
      if (existing.payloadHash !== hash) {
        return errorResponse(409, { code: 'conflict', message: 'Esta tentativa de compra já foi usada com outros dados.' })
      }
      const order = ensureOrderResolution(existing.orderId)
      return order ? HttpResponse.json(order) : errorResponse(404, { code: 'not_found', message: 'Pedido não encontrado.' })
    }

    const ownerId = userCartOwner(session.userId)
    const storedQuote = db.quotesById[parsed.data.quoteId]
    if (!storedQuote || storedQuote.ownerId !== ownerId || Date.parse(storedQuote.quote.expiresAt) <= Date.now()) {
      return errorResponse(409, { code: 'conflict', message: 'A cotação expirou. Revise os valores atualizados.' })
    }
    const current = calculateQuote(ownerId, storedQuote.quote.coupon?.code ?? null)
    if (!sameQuote(storedQuote, current)) {
      return errorResponse(409, { code: 'conflict', message: 'Preço, estoque, cupom ou taxa mudou. Revise a nova cotação.' })
    }
    const quotedItems = storedQuote.cartSnapshot.filter((item) => item.quotedQuantity > 0)
    if (quotedItems.length === 0) return errorResponse(409, { code: 'conflict', message: 'Seu carrinho não tem itens disponíveis.' })

    const wallet = db.walletsByUserId[session.userId]?.find((item) => item.id === parsed.data.walletId)
    if (!wallet) return errorResponse(404, { code: 'not_found', message: 'Carteira não encontrada.' })
    if (!wallet.connected) return errorResponse(409, { code: 'conflict', message: 'Conecte a carteira para finalizar a compra.' })

    const items = quotedItems.flatMap<OrderItem>((quoted) => {
      const nft = db.nfts.find((item) => item.id === quoted.nftId)
      const edition = nft?.editions.find((item) => item.id === quoted.editionId)
      if (!nft || !edition) return []
      return [{
        nftId: nft.id,
        editionId: edition.id,
        name: nft.name,
        tokenId: nft.tokenId,
        image: nft.images[0]!,
        editionLabel: edition.label,
        quantity: quoted.quotedQuantity,
        unitPrice: quoted.unitPrice,
        subtotal: toEthString(multiplyWei(parseEth(quoted.unitPrice), quoted.quotedQuantity)),
      }]
    })
    const order = orderSchema.parse({
      id: `ord-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      items,
      subtotal: storedQuote.quote.subtotal,
      discount: storedQuote.quote.discount,
      networkFee: storedQuote.quote.networkFee,
      total: storedQuote.quote.total,
      couponCode: storedQuote.quote.coupon?.code ?? null,
      walletAddress: wallet.address,
      walletProvider: parsed.data.walletProvider,
      network: parsed.data.network,
      version: 1,
      status: 'pending',
    })
    db.ordersById[order.id] = order
    db.orderMetaById[order.id] = {
      userId: session.userId,
      resolveAt: new Date(Date.now() + ORDER_RESOLUTION_MS).toISOString(),
      outcome: getScenario() === 'payment-rejected' ? 'rejected' : 'confirmed',
      purchasedItems: quotedItems.map((item) => ({
        cartItemId: item.cartItemId,
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quotedQuantity,
      })),
    }
    userKeys[key] = { payloadHash: hash, orderId: order.id }
    saveDb()
    ensureOrderResolution(order.id)

    if (getScenario() === 'order-timeout') await delay(TIMEOUT_RESPONSE_MS)
    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/orders/:orderId', ({ request, params }) => {
    const session = sessionFromRequest(request)
    if (!session) return errorResponse(401, { code: 'unauthorized', message: 'Entre para acompanhar o pedido.' })
    const orderId = String(params.orderId)
    const meta = db.orderMetaById[orderId]
    if (!meta || meta.userId !== session.userId) return errorResponse(404, { code: 'not_found', message: 'Pedido não encontrado.' })
    const order = ensureOrderResolution(orderId)
    return order ? HttpResponse.json(order) : errorResponse(404, { code: 'not_found', message: 'Pedido não encontrado.' })
  }),
]
