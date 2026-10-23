import { http, HttpResponse } from 'msw'
import { quoteInputSchema, quoteSchema, type QuoteIssue } from '@/api/quote'
import { multiplyWei, parseEth, percentOfWei, sumWei, toEthString } from '@/lib/eth'
import { cartForOwner } from '../cartStore'
import { db, saveDb } from '../db'
import { errorResponse } from '../http'
import { cartOwnerFromRequest } from './cartIdentity'

const NETWORK_FEE = '0.016'
const QUOTE_DURATION_MS = 5 * 60 * 1000

export const quoteHandlers = [
  http.post('/api/quote', async ({ request }) => {
    const ownerId = cartOwnerFromRequest(request)
    if (!ownerId) return errorResponse(401, { code: 'unauthorized', message: 'Sua sessão expirou. Entre novamente.' })
    const parsed = quoteInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Código promocional inválido.', fieldErrors: { couponCode: 'Revise o código informado' } })
    }

    const couponCode = parsed.data.couponCode === undefined ? (db.cartCouponByOwnerId[ownerId] ?? null) : parsed.data.couponCode?.toUpperCase() ?? null
    const coupon = couponCode ? db.coupons.find((item) => item.code === couponCode) : undefined
    if (couponCode && !coupon) {
      return errorResponse(422, { code: 'validation_error', message: 'Cupom inválido.', fieldErrors: { couponCode: 'Este cupom não existe' } })
    }
    if (coupon && Date.parse(coupon.expiresAt) <= Date.now()) {
      return errorResponse(422, { code: 'validation_error', message: 'Cupom expirado.', fieldErrors: { couponCode: 'Este cupom expirou' } })
    }

    if (parsed.data.couponCode !== undefined) {
      db.cartCouponByOwnerId[ownerId] = couponCode
      saveDb()
    }

    const issues: QuoteIssue[] = []
    const lineTotals = cartForOwner(ownerId).map((item) => {
      const nft = db.nfts.find((candidate) => candidate.id === item.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
      if (!nft || !edition || edition.available === 0) {
        issues.push({ cartItemId: item.id, type: 'sold_out' })
        return 0n
      }
      if (item.unitPriceAtAdd !== nft.price) issues.push({ cartItemId: item.id, type: 'price_changed' })
      const quantity = Math.min(item.quantity, edition.available)
      if (quantity < item.quantity) issues.push({ cartItemId: item.id, type: 'quantity_reduced' })
      return multiplyWei(parseEth(nft.price), quantity)
    })

    const subtotalWei = sumWei(lineTotals)
    const discountWei = coupon ? percentOfWei(subtotalWei, coupon.discountPercent) : 0n
    const feeWei = lineTotals.some((total) => total > 0n) ? parseEth(NETWORK_FEE) : 0n
    const quote = quoteSchema.parse({
      id: `quote-${crypto.randomUUID()}`,
      subtotal: toEthString(subtotalWei),
      discount: toEthString(discountWei),
      networkFee: toEthString(feeWei),
      total: toEthString(subtotalWei - discountWei + feeWei),
      coupon: coupon ?? null,
      issues,
      expiresAt: new Date(Date.now() + QUOTE_DURATION_MS).toISOString(),
    })
    return HttpResponse.json(quote)
  }),
]
