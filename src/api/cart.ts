import { z } from 'zod'
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
