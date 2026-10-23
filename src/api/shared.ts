import { z } from 'zod'
import { ETH_DECIMAL_PATTERN } from '@/lib/eth'

// Peças reaproveitadas pelos contratos de todos os recursos.

/** ETH sempre como string decimal no transporte; cálculo em bigint via src/lib/eth.ts */
export const ethAmountSchema = z.string().regex(ETH_DECIMAL_PATTERN, 'Valor em ETH inválido')

export const idSchema = z.string().min(1)

export const dateTimeSchema = z.iso.datetime()

export const quantitySchema = z.number().int().positive()

/** Redes listadas nos filtros do Figma */
export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

/** Provedores da tela de pagamento */
export const walletProviderSchema = z.enum(['metamask', 'walletconnect', 'coinbase'])
export type WalletProvider = z.infer<typeof walletProviderSchema>

export const walletAddressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Endereço de carteira inválido')

export const ensNameSchema = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/, 'Nome ENS inválido (ex.: nome.eth)')
