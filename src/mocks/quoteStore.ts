import { quoteSchema, type Quote, type QuoteIssue } from '@/api/quote'
import { multiplyWei, parseEth, percentOfWei, sumWei, toEthString } from '@/lib/eth'
import { cartForOwner } from './cartStore'
import { db, saveDb, type StoredQuotedItem } from './db'

const NETWORK_FEE = '0.016'
const QUOTE_DURATION_MS = 5 * 60 * 1000

type QuoteValues = Omit<Quote, 'id' | 'expiresAt'>
type QuoteCalculation =
  | { ok: false; reason: 'invalid_coupon' | 'expired_coupon' }
  | { ok: true; values: QuoteValues; cartSnapshot: StoredQuotedItem[] }

export function calculateQuote(ownerId: string, couponCode: string | null): QuoteCalculation {
  const coupon = couponCode ? db.coupons.find((item) => item.code === couponCode) : undefined
  if (couponCode && !coupon) return { ok: false, reason: 'invalid_coupon' }
  if (coupon && Date.parse(coupon.expiresAt) <= Date.now()) return { ok: false, reason: 'expired_coupon' }

  const issues: QuoteIssue[] = []
  const cartSnapshot: StoredQuotedItem[] = []
  const lineTotals = cartForOwner(ownerId).map((item) => {
    const nft = db.nfts.find((candidate) => candidate.id === item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
    const quotedQuantity = Math.min(item.quantity, edition?.available ?? 0)
    const unitPrice = nft?.price ?? item.unitPriceAtAdd
    cartSnapshot.push({
      cartItemId: item.id,
      nftId: item.nftId,
      editionId: item.editionId,
      quantity: item.quantity,
      quotedQuantity,
      unitPrice,
    })
    if (!nft || !edition || edition.available === 0) {
      issues.push({ cartItemId: item.id, type: 'sold_out' })
      return 0n
    }
    if (item.unitPriceAtAdd !== nft.price) issues.push({ cartItemId: item.id, type: 'price_changed' })
    if (quotedQuantity < item.quantity) issues.push({ cartItemId: item.id, type: 'quantity_reduced' })
    return multiplyWei(parseEth(nft.price), quotedQuantity)
  })

  const subtotalWei = sumWei(lineTotals)
  const discountWei = coupon ? percentOfWei(subtotalWei, coupon.discountPercent) : 0n
  const feeWei = lineTotals.some((total) => total > 0n) ? parseEth(NETWORK_FEE) : 0n
  return {
    ok: true,
    cartSnapshot,
    values: {
      subtotal: toEthString(subtotalWei),
      discount: toEthString(discountWei),
      networkFee: toEthString(feeWei),
      total: toEthString(subtotalWei - discountWei + feeWei),
      coupon: coupon ?? null,
      issues,
    },
  }
}

export function createStoredQuote(ownerId: string, requestedCouponCode: string | null | undefined): QuoteCalculation & { quote?: Quote } {
  const couponCode = requestedCouponCode === undefined
    ? (db.cartCouponByOwnerId[ownerId] ?? null)
    : requestedCouponCode?.toUpperCase() ?? null
  const calculation = calculateQuote(ownerId, couponCode)
  if (!calculation.ok) return calculation

  if (requestedCouponCode !== undefined) db.cartCouponByOwnerId[ownerId] = couponCode
  const quote = quoteSchema.parse({
    id: `quote-${crypto.randomUUID()}`,
    ...calculation.values,
    expiresAt: new Date(Date.now() + QUOTE_DURATION_MS).toISOString(),
  })
  for (const [quoteId, stored] of Object.entries(db.quotesById)) {
    if (Date.parse(stored.quote.expiresAt) <= Date.now()) delete db.quotesById[quoteId]
  }
  db.quotesById[quote.id] = { ownerId, quote, cartSnapshot: calculation.cartSnapshot }
  saveDb()
  return { ...calculation, quote }
}

export function sameQuote(stored: { quote: Quote; cartSnapshot: StoredQuotedItem[] }, current: QuoteCalculation): boolean {
  if (!current.ok) return false
  const storedValues: QuoteValues = {
    subtotal: stored.quote.subtotal,
    discount: stored.quote.discount,
    networkFee: stored.quote.networkFee,
    total: stored.quote.total,
    coupon: stored.quote.coupon,
    issues: stored.quote.issues,
  }
  return JSON.stringify(storedValues) === JSON.stringify(current.values)
    && JSON.stringify(stored.cartSnapshot) === JSON.stringify(current.cartSnapshot)
}
