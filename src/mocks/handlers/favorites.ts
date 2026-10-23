import { delay, http, HttpResponse } from 'msw'
import { favoriteInputSchema, favoriteListSchema, type FavoriteList } from '@/api/favorite'
import { db, saveDb } from '../db'
import { errorResponse } from '../http'
import { getScenario } from '../scenarios'
import { sessionFromRequest } from './auth'

function listForUser(userId: string): FavoriteList {
  const ids = db.favoriteIdsByUserId[userId] ?? []
  return favoriteListSchema.parse({ items: ids.flatMap((id) => db.nfts.find((nft) => nft.id === id) ?? []) })
}

function userIdFrom(request: Request) {
  return sessionFromRequest(request)?.userId ?? null
}

async function mutationFailure() {
  // Janela determinística para a UI exibir a mudança otimista antes do rollback.
  await delay(600)
  return errorResponse(503, { code: 'server_error', message: 'Não foi possível atualizar seus favoritos. Tente novamente.' })
}

export const favoriteHandlers = [
  http.get('/api/favorites', ({ request }) => {
    const userId = userIdFrom(request)
    if (!userId) return errorResponse(401, { code: 'unauthorized', message: 'Entre para ver seus favoritos.' })
    return HttpResponse.json(listForUser(userId))
  }),

  http.post('/api/favorites', async ({ request }) => {
    const userId = userIdFrom(request)
    if (!userId) return errorResponse(401, { code: 'unauthorized', message: 'Entre para favoritar NFTs.' })
    if (getScenario() === 'favorite-error') return mutationFailure()

    const parsed = favoriteInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse(422, { code: 'validation_error', message: 'NFT inválido.' })
    const nft = db.nfts.find((item) => item.id === parsed.data.nftId)
    if (!nft) return errorResponse(404, { code: 'not_found', message: 'NFT não encontrado.' })

    const ids = (db.favoriteIdsByUserId[userId] ??= [])
    if (!ids.includes(nft.id)) {
      ids.push(nft.id)
      nft.favoriteCount += 1
      saveDb()
    }
    return HttpResponse.json(listForUser(userId), { status: 201 })
  }),

  http.delete('/api/favorites/:nftId', ({ request, params }) => {
    const userId = userIdFrom(request)
    if (!userId) return errorResponse(401, { code: 'unauthorized', message: 'Entre para alterar seus favoritos.' })
    if (getScenario() === 'favorite-error') return mutationFailure()

    const nft = db.nfts.find((item) => item.id === params.nftId)
    if (!nft) return errorResponse(404, { code: 'not_found', message: 'NFT não encontrado.' })

    const ids = (db.favoriteIdsByUserId[userId] ??= [])
    const index = ids.indexOf(nft.id)
    if (index >= 0) {
      ids.splice(index, 1)
      nft.favoriteCount = Math.max(0, nft.favoriteCount - 1)
      saveDb()
    }
    return HttpResponse.json(listForUser(userId))
  }),
]
