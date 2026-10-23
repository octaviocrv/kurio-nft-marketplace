import { http, HttpResponse } from 'msw'
import { quoteInputSchema } from '@/api/quote'
import { createStoredQuote } from '../quoteStore'
import { errorResponse } from '../http'
import { cartOwnerFromRequest } from './cartIdentity'

export const quoteHandlers = [
  http.post('/api/quote', async ({ request }) => {
    const ownerId = cartOwnerFromRequest(request)
    if (!ownerId) return errorResponse(401, { code: 'unauthorized', message: 'Sua sessão expirou. Entre novamente.' })
    const parsed = quoteInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorResponse(422, { code: 'validation_error', message: 'Código promocional inválido.', fieldErrors: { couponCode: 'Revise o código informado' } })
    }

    const result = createStoredQuote(ownerId, parsed.data.couponCode)
    if (!result.ok) {
      const expired = result.reason === 'expired_coupon'
      return errorResponse(422, {
        code: 'validation_error',
        message: expired ? 'Cupom expirado.' : 'Cupom inválido.',
        fieldErrors: { couponCode: expired ? 'Este cupom expirou' : 'Este cupom não existe' },
      })
    }
    return HttpResponse.json(result.quote)
  }),
]
