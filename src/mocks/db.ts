import type { Nft } from '@/api/nft'
import type { Coupon } from '@/api/quote'
import type { Wallet } from '@/api/wallet'
import { coupons } from './fixtures/coupons'
import { favoriteIdsByUserId } from './fixtures/favorites'
import { nfts } from './fixtures/nfts'
import { users, walletsByUserId, type UserRecord } from './fixtures/users'
import { readStorage, writeStorage } from './storage'

/**
 * "Banco" da API simulada: um objeto em memória, semeado pelas fixtures e salvo no localStorage
 * a cada escrita (o refresh não perde nada). Catálogo, favoritos, carrinho, carteiras e pedidos
 * moram aqui juntos, então uma mudança aparece igual em todo recurso que a lê.
 * Carrinhos, sessões e pedidos entram nos blocos de cada recurso.
 */
export interface MockDb {
  format: number
  nfts: Nft[]
  users: UserRecord[]
  walletsByUserId: Record<string, Wallet[]>
  favoriteIdsByUserId: Record<string, string[]>
  coupons: Coupon[]
  sessions: Record<string, { userId: string; expiresAt: string }>
  cartItemsByOwnerId: Record<string, StoredCartItem[]>
  cartCouponByOwnerId: Record<string, string | null>
}

export interface StoredCartItem {
  id: string
  nftId: string
  editionId: string
  quantity: number
  unitPriceAtAdd: string
}

const STORAGE_KEY = 'mock-db'
// Sobe quando o formato do banco muda: um banco salvo no formato antigo é descartado e o seed volta
const DB_FORMAT = 3

function createSeed(): MockDb {
  // Cópia profunda: o seed (fixtures) nunca é alterado, por isso o reset sempre volta ao mesmo estado
  return structuredClone({
    format: DB_FORMAT,
    nfts,
    users,
    walletsByUserId,
    favoriteIdsByUserId,
    coupons,
    sessions: {},
    cartItemsByOwnerId: {},
    cartCouponByOwnerId: {},
  })
}

function loadDb(): MockDb {
  const saved = readStorage<MockDb>(STORAGE_KEY)
  return saved?.format === DB_FORMAT ? saved : createSeed()
}

export const db: MockDb = loadDb()

/** Handlers chamam depois de cada escrita. */
export function saveDb() {
  writeStorage(STORAGE_KEY, db)
}
