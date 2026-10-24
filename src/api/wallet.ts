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

/** Campos editáveis da carteira. O slot (principal/secundária) é definido na criação e não muda. */
export const walletInputSchema = z.object({
  nickname: z.string().trim().min(1, 'Informe um apelido').max(24, 'Use no máximo 24 caracteres'),
  address: walletAddressSchema,
  ensName: ensNameSchema.nullable(),
  network: networkSchema,
  provider: walletProviderSchema,
})
export type WalletInput = z.infer<typeof walletInputSchema>

export const createWalletInputSchema = walletInputSchema.extend({ slot: walletSlotSchema })
export type CreateWalletInput = z.infer<typeof createWalletInputSchema>

export async function createWallet(input: CreateWalletInput): Promise<Wallet> {
  const { data } = await apiClient.post('/wallets', input)
  return parseResponse(walletSchema, data)
}

export async function updateWallet(walletId: string, input: WalletInput): Promise<Wallet> {
  const { data } = await apiClient.patch(`/wallets/${walletId}`, input)
  return parseResponse(walletSchema, data)
}
