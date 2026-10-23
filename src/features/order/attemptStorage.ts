import type { CreateOrderInput } from '@/api/order'

const KEY_PREFIX = 'kurio:order-attempt:'

/**
 * Tentativa de compra em aberto. Guarda o payload junto com a chave: a cotação é
 * renovada sozinha (novo quoteId), e reenviar a mesma chave com outro payload daria 409
 * em vez de recuperar o pedido já criado.
 */
export type OrderAttempt = { key: string; input: CreateOrderInput }

export function getOrderAttempt(userId: string): OrderAttempt | null {
  const saved = localStorage.getItem(KEY_PREFIX + userId)
  if (!saved) return null
  try {
    return JSON.parse(saved) as OrderAttempt
  } catch {
    // Valor corrompido não pode travar a compra: descarta e começa uma tentativa nova
    clearOrderAttempt(userId)
    return null
  }
}

export function startOrderAttempt(userId: string, input: CreateOrderInput): OrderAttempt {
  const attempt: OrderAttempt = { key: crypto.randomUUID(), input }
  localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(attempt))
  return attempt
}

export function clearOrderAttempt(userId: string) {
  localStorage.removeItem(KEY_PREFIX + userId)
}
