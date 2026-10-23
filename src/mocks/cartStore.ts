import type { Cart, CartItem } from '@/api/cart'
import { cartSchema } from '@/api/cart'
import { db, saveDb, type StoredCartItem } from './db'

export function userCartOwner(userId: string): string {
  return `user:${userId}`
}

export function guestCartOwner(guestId: string): string {
  return `guest:${guestId}`
}

export function cartForOwner(ownerId: string): StoredCartItem[] {
  return (db.cartItemsByOwnerId[ownerId] ??= [])
}

export function cartResponse(ownerId: string): Cart {
  const items = cartForOwner(ownerId).flatMap<CartItem>((stored) => {
    const nft = db.nfts.find((item) => item.id === stored.nftId)
    const edition = nft?.editions.find((item) => item.id === stored.editionId)
    if (!nft || !edition) return []
    return [{
      id: stored.id,
      nftId: nft.id,
      editionId: edition.id,
      quantity: stored.quantity,
      name: nft.name,
      image: nft.images[0]!,
      editionLabel: edition.label,
      unitPrice: nft.price,
      available: edition.available,
    }]
  })
  return cartSchema.parse({ items, couponCode: db.cartCouponByOwnerId[ownerId] ?? null })
}

export function mergeGuestCart(guestId: string | null, userId: string) {
  if (!guestId) return
  const guestOwner = guestCartOwner(guestId)
  const userOwner = userCartOwner(userId)
  const guestItems = db.cartItemsByOwnerId[guestOwner] ?? []
  const guestCoupon = db.cartCouponByOwnerId[guestOwner]
  if (guestItems.length === 0 && !guestCoupon) return

  const userItems = cartForOwner(userOwner)
  for (const guestItem of guestItems) {
    const edition = db.nfts.find((nft) => nft.id === guestItem.nftId)?.editions.find((item) => item.id === guestItem.editionId)
    if (!edition || edition.available === 0) continue
    const existing = userItems.find((item) => item.nftId === guestItem.nftId && item.editionId === guestItem.editionId)
    if (existing) existing.quantity = Math.min(existing.quantity + guestItem.quantity, edition.available)
    else userItems.push({ ...guestItem, quantity: Math.min(guestItem.quantity, edition.available) })
  }

  if (!db.cartCouponByOwnerId[userOwner] && guestCoupon) {
    db.cartCouponByOwnerId[userOwner] = guestCoupon
  }
  delete db.cartItemsByOwnerId[guestOwner]
  delete db.cartCouponByOwnerId[guestOwner]
  saveDb()
}
