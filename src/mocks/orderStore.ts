import { buildEventId, realtimeEventNames, type NftUpdatedEvent, type OrderUpdatedEvent } from '@/api/events'
import type { Order } from '@/api/order'
import { userCartOwner } from './cartStore'
import { db, saveDb } from './db'
import { broadcast, emitToUser } from './socket/server'

const scheduledOrders = new Set<string>()

function transactionHash(): string {
  return `0x${crypto.randomUUID().replaceAll('-', '').padEnd(64, '0')}`
}

function finishOrder(orderId: string): Order | null {
  const order = db.ordersById[orderId]
  const meta = db.orderMetaById[orderId]
  if (!order || order.status !== 'pending' || !meta) return order ?? null
  scheduledOrders.delete(orderId)

  if (meta.outcome === 'rejected') {
    const rejected: Order = {
      ...order,
      status: 'rejected',
      rejectionReason: 'Transação recusada pela carteira.',
      version: order.version + 1,
    }
    db.ordersById[orderId] = rejected
    saveDb()
    emitOrder(rejected, meta.userId)
    return rejected
  }

  const ownerId = userCartOwner(meta.userId)
  const cart = db.cartItemsByOwnerId[ownerId] ?? []
  for (const purchased of meta.purchasedItems) {
    const nft = db.nfts.find((item) => item.id === purchased.nftId)
    const edition = nft?.editions.find((item) => item.id === purchased.editionId)
    if (nft && edition) {
      edition.available = Math.max(0, edition.available - purchased.quantity)
      nft.version += 1
      const event: NftUpdatedEvent = {
        eventId: buildEventId('nft', nft.id, nft.version),
        resource: 'nft',
        id: nft.id,
        version: nft.version,
        data: { price: nft.price, previousPrice: nft.previousPrice, editions: nft.editions },
      }
      broadcast(realtimeEventNames.nftUpdated, event)
    }

    const cartItem = cart.find((item) => item.id === purchased.cartItemId)
    if (cartItem) cartItem.quantity -= purchased.quantity
  }
  db.cartItemsByOwnerId[ownerId] = cart.filter((item) => item.quantity > 0)
  if (db.cartItemsByOwnerId[ownerId].length === 0) db.cartCouponByOwnerId[ownerId] = null

  const confirmed: Order = {
    ...order,
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    transactionHash: transactionHash(),
    version: order.version + 1,
  }
  db.ordersById[orderId] = confirmed
  saveDb()
  emitOrder(confirmed, meta.userId)
  return confirmed
}

/** Pedido é dado privado: só as conexões do dono recebem (diferente do catálogo, que é público). */
function emitOrder(order: Order, userId: string) {
  const event: OrderUpdatedEvent = {
    eventId: buildEventId('order', order.id, order.version),
    resource: 'order',
    id: order.id,
    version: order.version,
    data: order,
  }
  emitToUser(userId, realtimeEventNames.orderUpdated, event)
}

export function ensureOrderResolution(orderId: string): Order | null {
  const order = db.ordersById[orderId]
  const meta = db.orderMetaById[orderId]
  if (!order || order.status !== 'pending' || !meta) return order ?? null

  const remaining = Date.parse(meta.resolveAt) - Date.now()
  if (remaining <= 0) return finishOrder(orderId)
  if (!scheduledOrders.has(orderId)) {
    scheduledOrders.add(orderId)
    setTimeout(() => finishOrder(orderId), remaining)
  }
  return order
}
