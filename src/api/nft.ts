import { z } from 'zod'
import { dateTimeSchema, ethAmountSchema, idSchema, networkSchema } from './shared'

/** Categorias da sidebar do Figma. Valores em português porque vão para a URL (?categoria=). */
export const nftCategorySchema = z.enum([
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativa',
  'jogos',
  'assinaturas',
  'utilidade',
])
export type NftCategory = z.infer<typeof nftCategorySchema>

/**
 * Edição é uma variante do NFT com estoque próprio (1/10, 1/50, aberta).
 * O carrinho guarda nftId + editionId, e a disponibilidade é checada por edição.
 */
export const editionSchema = z.object({
  id: idSchema,
  label: z.string(), // "1/10", "1/50", "Aberta"
  supply: z.number().int().positive().nullable(), // null = edição aberta (sem tiragem fixa)
  available: z.number().int().nonnegative(),
})
export type Edition = z.infer<typeof editionSchema>

export const nftSchema = z.object({
  id: idSchema,
  tokenId: z.string().regex(/^\d+$/), // exibido como "#0042"
  name: z.string(),
  description: z.string(),
  image: z.string(),
  collection: z.string(), // "Kurio Apes"
  category: nftCategorySchema,
  network: networkSchema,
  price: ethAmountSchema,
  previousPrice: ethAmountSchema.nullable(), // preço riscado no card do Figma
  isRare: z.boolean(),
  attributes: z.array(z.string()),
  rating: z.object({ average: z.number().min(0).max(5), count: z.number().int().nonnegative() }),
  favoriteCount: z.number().int().nonnegative(), // base da aba "Em alta"
  editions: z.array(editionSchema).min(1),
  listedAt: dateTimeSchema, // base da aba "Novos lançamentos"
  // Incrementa a cada mudança de preço/estoque. Eventos do Socket.IO com versão menor ou igual são ignorados.
  version: z.number().int().nonnegative(),
})
export type Nft = z.infer<typeof nftSchema>

export const nftPageSchema = z.object({
  items: z.array(nftSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type NftPage = z.infer<typeof nftPageSchema>
