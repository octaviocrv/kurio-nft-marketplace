import { z } from 'zod'
import { apiClient, parseResponse } from './client'
import { ethAmountSchema, idSchema, quantitySchema } from './shared'

/**
 * Item já vem "montado" pela API (nome, imagem, preço atual e estoque),
 * para a tela do carrinho não precisar buscar cada NFT separadamente.
 * Os totais NÃO ficam aqui: quem calcula é a cotação (Quote).
 */
export const cartItemSchema = z.object({
  id: idSchema,
  nftId: idSchema,
  editionId: idSchema,
  quantity: quantitySchema,
  name: z.string(),
  image: z.string(),
  editionLabel: z.string(),
  unitPrice: ethAmountSchema,
  available: z.number().int().nonnegative(), // limite do QuantityStepper
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  couponCode: z.string().nullable(),
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemInputSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  quantity: quantitySchema,
})
export type AddCartItemInput = z.infer<typeof addCartItemInputSchema>

export const updateCartItemInputSchema = z.object({ quantity: quantitySchema })
export type UpdateCartItemInput = z.infer<typeof updateCartItemInputSchema>

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  const { data } = await apiClient.get('/cart/items', { signal })
  return parseResponse(cartSchema, data)
}

export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
  const { data } = await apiClient.post('/cart/items', input)
  return parseResponse(cartSchema, data)
}

export async function updateCartItem(itemId: string, input: UpdateCartItemInput): Promise<Cart> {
  const { data } = await apiClient.patch(`/cart/items/${itemId}`, input)
  return parseResponse(cartSchema, data)
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await apiClient.delete(`/cart/items/${itemId}`)
  return parseResponse(cartSchema, data)
}
