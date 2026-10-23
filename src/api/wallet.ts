import { z } from 'zod'
import { apiClient, parseResponse } from './client'
import { ensNameSchema, idSchema, networkSchema, walletAddressSchema, walletProviderSchema } from './shared'

/** O enunciado prevê exatamente duas carteiras por usuário: principal e secundária. */
export const walletSlotSchema = z.enum(['primary', 'secondary'])
export type WalletSlot = z.infer<typeof walletSlotSchema>

export const walletSchema = z.object({
  id: idSchema,
  slot: walletSlotSchema,
  nickname: z.string().min(1), // "Reserva", "Principal"
  address: walletAddressSchema,
  ensName: ensNameSchema.nullable(), // quando existe, aparece no lugar do endereço
  network: networkSchema,
  provider: walletProviderSchema, // "Tipo de carteira" no Figma
})
export type Wallet = z.infer<typeof walletSchema>

export const walletListSchema = z.object({ items: z.array(walletSchema) })
export type WalletList = z.infer<typeof walletListSchema>

export async function fetchWallets(signal?: AbortSignal): Promise<WalletList> {
  const { data } = await apiClient.get('/wallets', { signal })
  return parseResponse(walletListSchema, data)
}
