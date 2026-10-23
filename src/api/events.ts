import { z } from 'zod'
import { nftSchema } from './nft'
import { orderSchema } from './order'
import { idSchema } from './shared'

/** Nomes dos eventos Socket.IO (contrato do enunciado). */
export const realtimeEventNames = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
} as const

/**
 * Envelope comum: identidade estável (eventId), recurso afetado (resource + id) e versão.
 * eventId é derivado do recurso e da versão ("nft:emerald-ape-042:v3"): a mesma mudança
 * reenviada chega com o mesmo id, então duplicata e evento antigo são descartados pela mesma regra.
 */
function realtimeEventSchema<Resource extends string, Data extends z.ZodType>(resource: Resource, data: Data) {
  return z.object({
    eventId: z.string().min(1),
    resource: z.literal(resource),
    id: idSchema,
    version: z.number().int().nonnegative(),
    data,
  })
}

/** Só o que muda no catálogo em tempo real: preço e estoque por edição. */
export const nftUpdatedEventSchema = realtimeEventSchema(
  'nft',
  nftSchema.pick({ price: true, previousPrice: true, editions: true }),
)
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>

/** O pedido vai inteiro: a tela de confirmação precisa do snapshot completo no novo status. */
export const orderUpdatedEventSchema = realtimeEventSchema('order', orderSchema)
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>

export function buildEventId(resource: string, id: string, version: number): string {
  return `${resource}:${id}:v${version}`
}
