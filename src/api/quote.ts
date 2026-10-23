import { z } from 'zod'
import { apiClient, parseResponse } from './client'
import { dateTimeSchema, ethAmountSchema, idSchema } from './shared'

export const couponSchema = z.object({
  code: z.string().min(1),
  description: z.string(), // "Desconto do lançamento"
  discountPercent: z.number().int().min(1).max(100),
  expiresAt: dateTimeSchema,
})
export type Coupon = z.infer<typeof couponSchema>

/** O que mudou desde que o item entrou no carrinho. Qualquer issue exige nova confirmação do usuário. */
export const quoteIssueSchema = z.object({
  cartItemId: idSchema,
  type: z.enum(['price_changed', 'sold_out', 'quantity_reduced']),
})
export type QuoteIssue = z.infer<typeof quoteIssueSchema>

/**
 * Cotação: fonte da verdade dos valores (o enunciado diz que é ela que vale para fechar o pedido).
 * O pedido é criado com o quoteId; se a cotação mudou, a API recusa e o cliente pede nova confirmação.
 */
export const quoteSchema = z.object({
  id: idSchema,
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  coupon: couponSchema.nullable(),
  issues: z.array(quoteIssueSchema),
  expiresAt: dateTimeSchema,
})
export type Quote = z.infer<typeof quoteSchema>

export const quoteInputSchema = z.object({
  couponCode: z.string().trim().min(1).max(32).nullable().optional(),
})
export type QuoteInput = z.infer<typeof quoteInputSchema>

export async function createQuote(input: QuoteInput = {}, signal?: AbortSignal): Promise<Quote> {
  const { data } = await apiClient.post('/quote', input, { signal })
  return parseResponse(quoteSchema, data)
}
