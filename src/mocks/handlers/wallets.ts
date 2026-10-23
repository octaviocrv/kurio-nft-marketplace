import { http, HttpResponse } from 'msw'
import { walletListSchema } from '@/api/wallet'
import { db } from '../db'
import { errorResponse } from '../http'
import { sessionFromRequest } from './auth'

export const walletHandlers = [
  http.get('/api/wallets', ({ request }) => {
    const session = sessionFromRequest(request)
    if (!session) return errorResponse(401, { code: 'unauthorized', message: 'Entre para acessar suas carteiras.' })
    return HttpResponse.json(walletListSchema.parse({ items: db.walletsByUserId[session.userId] ?? [] }))
  }),
]
