import type { RequestHandler } from 'msw'
import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { favoriteHandlers } from './favorites'
import { networkConditionsHandler } from './network'
import { nftHandlers } from './nfts'
import { quoteHandlers } from './quote'

/**
 * Handlers REST de todos os recursos, um arquivo por recurso nesta pasta.
 * A condição de rede vem primeiro: atrasa ou derruba a requisição antes de qualquer recurso.
 */
export const handlers: RequestHandler[] = [networkConditionsHandler, ...authHandlers, ...nftHandlers, ...favoriteHandlers, ...cartHandlers, ...quoteHandlers]
