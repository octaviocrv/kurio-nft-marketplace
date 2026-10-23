import { z } from 'zod'
import {
  dateTimeSchema,
  ethAmountSchema,
  idSchema,
  networkSchema,
  quantitySchema,
  walletAddressSchema,
  walletProviderSchema,
} from './shared'

/**
 * Snapshot do item no momento da compra. Copia nome, imagem e preço em vez de referenciar
 * o NFT: o recibo não pode mudar se o catálogo mudar depois (regra do enunciado).
 */
export const orderItemSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  name: z.string(),
  tokenId: z.string(),
  image: z.string(),
  editionLabel: z.string(),
  quantity: quantitySchema,
  unitPrice: ethAmountSchema,
  subtotal: ethAmountSchema,
})
export type OrderItem = z.infer<typeof orderItemSchema>

const orderBaseSchema = z.object({
  id: idSchema,
  createdAt: dateTimeSchema,
  items: z.array(orderItemSchema).min(1),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  couponCode: z.string().nullable(),
  walletAddress: walletAddressSchema,
  walletProvider: walletProviderSchema,
  network: networkSchema,
  // Incrementa a cada mudança de status. Evento order.updated com versão menor ou igual é ignorado.
  version: z.number().int().positive(),
})

/**
 * União por status: cada estado só tem os campos que fazem sentido nele.
 * Assim o TypeScript impede, por exemplo, mostrar hash de transação de um pedido pendente.
 */
export const orderSchema = z.discriminatedUnion('status', [
  orderBaseSchema.extend({ status: z.literal('pending') }),
  orderBaseSchema.extend({
    status: z.literal('confirmed'),
    confirmedAt: dateTimeSchema,
    transactionHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  }),
  orderBaseSchema.extend({
    status: z.literal('rejected'),
    rejectionReason: z.string(),
  }),
])
export type Order = z.infer<typeof orderSchema>
export type OrderStatus = Order['status']
